"use server";

import { redirect } from "next/navigation";
import { createSession, hashPassword, verifyPassword, clearSession } from "@/lib/auth";
import { query, transaction } from "@/lib/db";

function required(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`Champ requis: ${key}`);
  return value;
}

export async function registerAction(formData: FormData) {
  const entrepriseNom = required(formData, "entreprise_nom");
  const raisonSociale = required(formData, "raison_sociale");
  const siret = required(formData, "siret");
  const nom = required(formData, "nom");
  const email = required(formData, "email").toLowerCase();
  const password = required(formData, "password");

  const passwordHash = await hashPassword(password);

  const userId = await transaction(async (client) => {
    const company = await client.query(
      `INSERT INTO entreprises (
        nom_commercial, raison_sociale, forme_juridique, capital_social_cents, siren, siret,
        numero_tva, adresse_ligne1, code_postal, ville, telephone, email
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id`,
      [
        entrepriseNom,
        raisonSociale,
        required(formData, "forme_juridique"),
        Number(formData.get("capital_social_cents") ?? 0),
        siret.slice(0, 9),
        siret,
        String(formData.get("numero_tva") ?? "").trim(),
        required(formData, "adresse_ligne1"),
        required(formData, "code_postal"),
        required(formData, "ville"),
        required(formData, "telephone"),
        email
      ]
    );
    const user = await client.query(
      "INSERT INTO utilisateurs (entreprise_id, nom, email, mot_de_passe_hash, role) VALUES ($1,$2,$3,$4,'gerant') RETURNING id",
      [company.rows[0].id, nom, email, passwordHash]
    );
    return user.rows[0].id as string;
  });

  await createSession(userId);
  redirect("/app/tableau-de-bord");
}

export async function loginAction(formData: FormData) {
  const email = required(formData, "email").toLowerCase();
  const password = required(formData, "password");
  const result = await query<{ id: string; mot_de_passe_hash: string }>(
    "SELECT id, mot_de_passe_hash FROM utilisateurs WHERE email = $1 LIMIT 1",
    [email]
  );
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.mot_de_passe_hash))) {
    throw new Error("Identifiants incorrects.");
  }

  await createSession(user.id);
  redirect("/app/tableau-de-bord");
}

export async function logoutAction() {
  await clearSession();
  redirect("/auth/connexion");
}
