"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createInterventionAction(formData: FormData) {
  const user = await requireUser();
  const clientId = value(formData, "client_id");
  const client = await query<{ adresse_ligne1: string; adresse_ligne2: string | null; code_postal: string; ville: string }>(
    "SELECT adresse_ligne1, adresse_ligne2, code_postal, ville FROM clients WHERE id = $1 AND entreprise_id = $2",
    [clientId, user.entreprise_id]
  );
  const address = client.rows[0];
  const result = await query<{ id: string }>(
    `INSERT INTO interventions (
      entreprise_id, client_id, technicien_id, titre, description, adresse_intervention_ligne1,
      adresse_intervention_ligne2, code_postal, ville, date_debut, date_fin, statut
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING id`,
    [
      user.entreprise_id,
      clientId,
      value(formData, "technicien_id") || null,
      value(formData, "titre"),
      value(formData, "description") || null,
      value(formData, "adresse_intervention_ligne1") || address.adresse_ligne1,
      value(formData, "adresse_intervention_ligne2") || address.adresse_ligne2,
      value(formData, "code_postal") || address.code_postal,
      value(formData, "ville") || address.ville,
      value(formData, "date_debut") || null,
      value(formData, "date_fin") || null,
      value(formData, "statut") || "a_planifier"
    ]
  );
  revalidatePath("/app/interventions");
  revalidatePath("/app/planning");
  redirect(`/app/interventions/${result.rows[0].id}`);
}

export async function updateInterventionStatusAction(formData: FormData) {
  const user = await requireUser();
  await query("UPDATE interventions SET statut = $1 WHERE id = $2 AND entreprise_id = $3", [
    value(formData, "statut"),
    value(formData, "id"),
    user.entreprise_id
  ]);
  revalidatePath("/app/interventions");
  revalidatePath("/app/planning");
}
