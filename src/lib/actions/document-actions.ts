"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query, transaction } from "@/lib/db";
import { nextDocumentNumber } from "@/lib/numbering";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function cents(valueText: string) {
  const value = Number(valueText.replace(",", "."));
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

function calcLine(quantityText: string, priceText: string, tvaText: string) {
  const quantity = Number(quantityText.replace(",", ".")) || 0;
  const unit = cents(priceText);
  const tvaBps = Math.round((Number(tvaText.replace(",", ".")) || 0) * 100);
  const totalHt = Math.round(quantity * unit);
  const totalTva = Math.round((totalHt * tvaBps) / 10000);
  return { quantity, unit, tvaBps, totalHt, totalTva, totalTtc: totalHt + totalTva };
}

async function snapshots(entrepriseId: string, clientId: string) {
  const entreprise = await query("SELECT * FROM entreprises WHERE id = $1", [entrepriseId]);
  const client = await query("SELECT * FROM clients WHERE id = $1 AND entreprise_id = $2", [clientId, entrepriseId]);
  return { entreprise: entreprise.rows[0], client: client.rows[0] };
}

export async function createDevisAction(formData: FormData) {
  const user = await requireUser();
  const clientId = value(formData, "client_id");
  const { entreprise, client } = await snapshots(user.entreprise_id, clientId);
  const rows = [0, 1, 2].map((index) => ({
    designation: value(formData, `designation_${index}`),
    quantite: value(formData, `quantite_${index}`),
    unite: value(formData, `unite_${index}`) || "forfait",
    prix: value(formData, `prix_${index}`),
    tva: value(formData, `tva_${index}`) || "20"
  })).filter((row) => row.designation);

  if (!rows.length) throw new Error("Ajoutez au moins une ligne de prestation.");

  const calculated = rows.map((row) => ({ ...row, ...calcLine(row.quantite, row.prix, row.tva) }));
  const totalHt = calculated.reduce((sum, row) => sum + row.totalHt, 0);
  const totalTva = calculated.reduce((sum, row) => sum + row.totalTva, 0);
  const numero = await nextDocumentNumber(user.entreprise_id, "devis", "DEV");

  const devisId = await transaction(async (db) => {
    const quote = await db.query(
      `INSERT INTO devis (
        entreprise_id, client_id, numero, statut, date_emission, date_validite, lieu_execution,
        description_travaux, frais_deplacement_cents, total_ht_cents, total_tva_cents, total_ttc_cents,
        snapshot_entreprise_json, snapshot_client_json
      ) VALUES ($1,$2,$3,'brouillon',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING id`,
      [
        user.entreprise_id,
        clientId,
        numero,
        value(formData, "date_emission"),
        value(formData, "date_validite"),
        value(formData, "lieu_execution"),
        value(formData, "description_travaux"),
        cents(value(formData, "frais_deplacement")),
        totalHt,
        totalTva,
        totalHt + totalTva,
        entreprise,
        client
      ]
    );
    for (const [index, row] of calculated.entries()) {
      await db.query(
        `INSERT INTO lignes_devis (
          devis_id, ordre, designation, quantite, unite, prix_unitaire_ht_cents,
          taux_tva_bps, total_ht_cents, total_tva_cents, total_ttc_cents
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [quote.rows[0].id, index + 1, row.designation, row.quantity, row.unite, row.unit, row.tvaBps, row.totalHt, row.totalTva, row.totalTtc]
      );
    }
    return quote.rows[0].id as string;
  });

  revalidatePath("/app/devis");
  redirect(`/app/devis/${devisId}`);
}

export async function setDevisStatusAction(formData: FormData) {
  const user = await requireUser();
  const status = value(formData, "statut");
  await query(
    "UPDATE devis SET statut = $1, accepte_le = CASE WHEN $1 = 'accepte' THEN CURRENT_DATE ELSE accepte_le END WHERE id = $2 AND entreprise_id = $3",
    [status, value(formData, "id"), user.entreprise_id]
  );
  revalidatePath("/app/devis");
}

export async function convertDevisToFactureAction(formData: FormData) {
  const user = await requireUser();
  const devisId = value(formData, "id");
  const existing = await query<{ id: string }>("SELECT id FROM factures WHERE devis_id = $1 AND entreprise_id = $2 LIMIT 1", [devisId, user.entreprise_id]);
  if (existing.rows[0]) redirect(`/app/factures/${existing.rows[0].id}`);

  const quote = await query("SELECT * FROM devis WHERE id = $1 AND entreprise_id = $2", [devisId, user.entreprise_id]);
  const devis = quote.rows[0];
  const company = await query("SELECT * FROM entreprises WHERE id = $1", [user.entreprise_id]);
  const numero = await nextDocumentNumber(user.entreprise_id, "factures", "FAC");

  const factureId = await transaction(async (db) => {
    const invoice = await db.query(
      `INSERT INTO factures (
        entreprise_id, client_id, devis_id, numero, statut, date_emission, date_prestation, date_echeance,
        total_ht_cents, total_tva_cents, total_ttc_cents, conditions_escompte, taux_penalites_retard,
        indemnite_recouvrement_cents, adresse_livraison_ou_service_json, snapshot_entreprise_json, snapshot_client_json,
        electronic_metadata_json
      ) VALUES ($1,$2,$3,$4,'emise',CURRENT_DATE,CURRENT_DATE,CURRENT_DATE + ($5::int * INTERVAL '1 day'),$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING id`,
      [
        user.entreprise_id,
        devis.client_id,
        devis.id,
        numero,
        company.rows[0].delai_paiement_jours,
        devis.total_ht_cents,
        devis.total_tva_cents,
        devis.total_ttc_cents,
        company.rows[0].conditions_escompte,
        company.rows[0].taux_penalites_retard,
        company.rows[0].indemnite_recouvrement_cents,
        { lieu_execution: devis.lieu_execution },
        devis.snapshot_entreprise_json,
        devis.snapshot_client_json,
        { profil: "Factur-X EN16931", pdp: "a_prevoir", source: "conversion_devis" }
      ]
    );
    const lines = await db.query("SELECT * FROM lignes_devis WHERE devis_id = $1 ORDER BY ordre", [devis.id]);
    for (const line of lines.rows) {
      await db.query(
        `INSERT INTO lignes_facture (
          facture_id, ordre, designation, quantite, unite, prix_unitaire_ht_cents, taux_tva_bps,
          total_ht_cents, total_tva_cents, total_ttc_cents
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [invoice.rows[0].id, line.ordre, line.designation, line.quantite, line.unite, line.prix_unitaire_ht_cents, line.taux_tva_bps, line.total_ht_cents, line.total_tva_cents, line.total_ttc_cents]
      );
    }
    await db.query("UPDATE devis SET statut = 'accepte', accepte_le = COALESCE(accepte_le, CURRENT_DATE) WHERE id = $1", [devis.id]);
    return invoice.rows[0].id as string;
  });

  revalidatePath("/app/factures");
  redirect(`/app/factures/${factureId}`);
}

export async function markInvoicePaidAction(formData: FormData) {
  const user = await requireUser();
  const invoice = await query<{ total_ttc_cents: number }>("SELECT total_ttc_cents FROM factures WHERE id = $1 AND entreprise_id = $2", [value(formData, "id"), user.entreprise_id]);
  const total = invoice.rows[0]?.total_ttc_cents ?? 0;
  await transaction(async (db) => {
    await db.query("UPDATE factures SET statut = 'payee', montant_paye_cents = total_ttc_cents WHERE id = $1 AND entreprise_id = $2", [value(formData, "id"), user.entreprise_id]);
    await db.query("INSERT INTO paiements (facture_id, date_paiement, montant_cents, mode, reference) VALUES ($1,CURRENT_DATE,$2,$3,$4)", [
      value(formData, "id"),
      total,
      value(formData, "mode") || "virement",
      value(formData, "reference") || null
    ]);
  });
  revalidatePath("/app/factures");
}
