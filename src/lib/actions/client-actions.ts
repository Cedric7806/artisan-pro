"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createClientAction(formData: FormData) {
  const user = await requireUser();
  const result = await query<{ id: string }>(
    `INSERT INTO clients (
      entreprise_id, type_client, nom, raison_sociale, siren, siret, numero_tva, email, telephone,
      adresse_ligne1, adresse_ligne2, code_postal, ville, notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING id`,
    [
      user.entreprise_id,
      value(formData, "type_client") || "particulier",
      value(formData, "nom"),
      value(formData, "raison_sociale") || null,
      value(formData, "siren") || null,
      value(formData, "siret") || null,
      value(formData, "numero_tva") || null,
      value(formData, "email") || null,
      value(formData, "telephone") || null,
      value(formData, "adresse_ligne1"),
      value(formData, "adresse_ligne2") || null,
      value(formData, "code_postal"),
      value(formData, "ville"),
      value(formData, "notes") || null
    ]
  );
  revalidatePath("/app/clients");
  redirect(`/app/clients/${result.rows[0].id}`);
}
