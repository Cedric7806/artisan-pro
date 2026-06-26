"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function cents(valueText: string) {
  const normalized = valueText.replace(/\s/g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function positiveInteger(valueText: string, fallback: number) {
  const number = Number.parseInt(valueText, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

export async function updateCompanySettingsAction(formData: FormData) {
  const user = await requireUser();
  const siret = value(formData, "siret");
  const siren = value(formData, "siren") || siret.slice(0, 9);

  await query(
    `UPDATE entreprises SET
      nom_commercial = $1,
      raison_sociale = $2,
      forme_juridique = $3,
      capital_social_cents = $4,
      siren = $5,
      siret = $6,
      numero_tva = $7,
      adresse_ligne1 = $8,
      adresse_ligne2 = $9,
      code_postal = $10,
      ville = $11,
      pays = $12,
      telephone = $13,
      email = $14,
      taux_penalites_retard = $15,
      indemnite_recouvrement_cents = $16,
      delai_paiement_jours = $17,
      conditions_escompte = $18
    WHERE id = $19`,
    [
      value(formData, "nom_commercial"),
      value(formData, "raison_sociale"),
      value(formData, "forme_juridique"),
      cents(value(formData, "capital_social")),
      siren,
      siret,
      value(formData, "numero_tva") || null,
      value(formData, "adresse_ligne1"),
      value(formData, "adresse_ligne2") || null,
      value(formData, "code_postal"),
      value(formData, "ville"),
      value(formData, "pays") || "France",
      value(formData, "telephone"),
      value(formData, "email"),
      value(formData, "taux_penalites_retard").replace(",", ".") || "0",
      cents(value(formData, "indemnite_recouvrement")),
      positiveInteger(value(formData, "delai_paiement_jours"), 30),
      value(formData, "conditions_escompte") || "Aucun escompte pour paiement anticipe",
      user.entreprise_id
    ]
  );

  revalidatePath("/app/parametres/entreprise");
}
