import { query } from "@/lib/db";

export async function nextDocumentNumber(entrepriseId: string, table: "devis" | "factures", prefix: "DEV" | "FAC") {
  const year = new Date().getFullYear();
  const result = await query<{ count: string }>(
    `SELECT count(*)::text AS count FROM ${table} WHERE entreprise_id = $1 AND numero LIKE $2`,
    [entrepriseId, `${prefix}-${year}-%`]
  );
  const next = Number(result.rows[0]?.count ?? 0) + 1;
  return `${prefix}-${year}-${String(next).padStart(3, "0")}`;
}
