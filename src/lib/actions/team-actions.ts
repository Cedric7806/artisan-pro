"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createTechnicienAction(formData: FormData) {
  const user = await requireUser();
  await query(
    "INSERT INTO techniciens (entreprise_id, nom, telephone, email, couleur_planning) VALUES ($1,$2,$3,$4,$5)",
    [user.entreprise_id, value(formData, "nom"), value(formData, "telephone") || null, value(formData, "email") || null, value(formData, "couleur_planning") || "#059669"]
  );
  revalidatePath("/app/equipe");
}
