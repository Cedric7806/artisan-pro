import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { buildBusinessPdf, type DocumentLine, type StoredDocumentData } from "@/lib/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Non autorise", { status: 401 });
  const { id } = await params;
  const documentResult = await query<StoredDocumentData>("SELECT * FROM factures WHERE id = $1 AND entreprise_id = $2", [id, user.entreprise_id]);
  const documentData = documentResult.rows[0];
  if (!documentData) return new NextResponse("Introuvable", { status: 404 });
  const lines = await query<DocumentLine>("SELECT * FROM lignes_facture WHERE facture_id = $1 ORDER BY ordre", [id]);
  const pdf = await buildBusinessPdf({ ...documentData, type: "facture" }, lines.rows);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${documentData.numero}.pdf"`
    }
  });
}
