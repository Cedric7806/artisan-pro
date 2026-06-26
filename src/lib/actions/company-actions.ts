"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function required(formData: FormData, key: string) {
  const fieldValue = value(formData, key);
  if (!fieldValue) throw new Error(`Champ obligatoire: ${key}`);
  return fieldValue;
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
  const siret = required(formData, "siret");
  const siren = required(formData, "siren");
  const regimeTva = required(formData, "regime_tva");
  const vatNumber = value(formData, "numero_tva");
  if (regimeTva === "reel" && !vatNumber) {
    throw new Error("Le numero de TVA est obligatoire pour une entreprise assujettie a la TVA.");
  }

  await query(
    `UPDATE entreprises SET
      nom_commercial = $1,
      raison_sociale = $2,
      forme_juridique = $3,
      capital_social_cents = $4,
      siren = $5,
      siret = $6,
      adresse_ligne1 = $7,
      adresse_ligne2 = $8,
      code_postal = $9,
      ville = $10,
      pays = $11,
      telephone = $12,
      email = $13,
      regime_tva = $14,
      numero_tva = $15,
      taux_penalites_retard = $16,
      indemnite_recouvrement_cents = $17,
      delai_paiement_jours = $18,
      conditions_escompte = $19
    WHERE id = $20`,
    [
      required(formData, "nom_commercial"),
      required(formData, "raison_sociale"),
      required(formData, "forme_juridique"),
      cents(value(formData, "capital_social")),
      siren,
      siret,
      required(formData, "adresse_ligne1"),
      value(formData, "adresse_ligne2") || null,
      required(formData, "code_postal"),
      required(formData, "ville"),
      value(formData, "pays") || "France",
      required(formData, "telephone"),
      required(formData, "email"),
      regimeTva,
      vatNumber || null,
      required(formData, "taux_penalites_retard").replace(",", "."),
      cents(required(formData, "indemnite_recouvrement")),
      positiveInteger(value(formData, "delai_paiement_jours"), 30),
      required(formData, "conditions_escompte"),
      user.entreprise_id
    ]
  );

  revalidatePath("/app/parametres/entreprise");
}
