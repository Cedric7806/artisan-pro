import PDFDocument from "pdfkit";
import { formatDateFr, formatMoney } from "@/lib/format";

export type DocumentLine = {
  designation: string;
  quantite: string | number;
  unite: string;
  prix_unitaire_ht_cents: number;
  taux_tva_bps: number;
  total_ht_cents: number;
  total_tva_cents: number;
  total_ttc_cents: number;
};

export type StoredDocumentData = {
  numero: string;
  statut: string;
  date_emission: string;
  date_validite?: string;
  date_echeance?: string;
  date_prestation?: string;
  total_ht_cents: number;
  total_tva_cents: number;
  total_ttc_cents: number;
  snapshot_entreprise_json: Record<string, unknown>;
  snapshot_client_json: Record<string, unknown>;
  taux_penalites_retard?: string | number;
  indemnite_recouvrement_cents?: number;
  conditions_escompte?: string;
  electronic_format_target?: string;
  electronic_status?: string;
};

type DocumentData = StoredDocumentData & {
  type: "devis" | "facture";
};

function text(data: Record<string, unknown>, key: string) {
  return String(data[key] ?? "");
}

export async function buildBusinessPdf(documentData: DocumentData, lines: DocumentLine[]) {
  const doc = new PDFDocument({ size: "A4", margin: 42 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const company = documentData.snapshot_entreprise_json;
  const customer = documentData.snapshot_client_json;
  const title = documentData.type === "devis" ? "DEVIS" : "FACTURE";

  doc.fontSize(22).text(`${title} ${documentData.numero}`, { align: "right" });
  doc.moveDown();
  doc.fontSize(12).font("Helvetica-Bold").text(text(company, "raison_sociale") || text(company, "nom_commercial"));
  doc.font("Helvetica").text(`${text(company, "adresse_ligne1")}`);
  doc.text(`${text(company, "code_postal")} ${text(company, "ville")}`);
  doc.text(`SIRET : ${text(company, "siret")}`);
  if (text(company, "numero_tva")) doc.text(`TVA intracommunautaire : ${text(company, "numero_tva")}`);
  doc.text(`Email : ${text(company, "email")} - Tel : ${text(company, "telephone")}`);

  doc.moveDown();
  doc.font("Helvetica-Bold").text("Client", 340, 130);
  doc.font("Helvetica").text(text(customer, "raison_sociale") || text(customer, "nom"), 340);
  doc.text(text(customer, "adresse_ligne1"), 340);
  doc.text(`${text(customer, "code_postal")} ${text(customer, "ville")}`, 340);
  if (text(customer, "siret")) doc.text(`SIRET : ${text(customer, "siret")}`, 340);
  if (text(customer, "numero_tva")) doc.text(`TVA : ${text(customer, "numero_tva")}`, 340);

  doc.moveDown(2);
  doc.text(`Date d'emission : ${formatDateFr(documentData.date_emission)}`);
  if (documentData.date_validite) doc.text(`Valable jusqu'au : ${formatDateFr(documentData.date_validite)}`);
  if (documentData.date_prestation) doc.text(`Date de prestation : ${formatDateFr(documentData.date_prestation)}`);
  if (documentData.date_echeance) doc.text(`Date d'echeance : ${formatDateFr(documentData.date_echeance)}`);

  doc.moveDown();
  const y = doc.y;
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Designation", 42, y, { width: 220 });
  doc.text("Qte", 270, y, { width: 45, align: "right" });
  doc.text("PU HT", 320, y, { width: 65, align: "right" });
  doc.text("TVA", 390, y, { width: 45, align: "right" });
  doc.text("Total TTC", 455, y, { width: 90, align: "right" });
  doc.moveTo(42, y + 16).lineTo(550, y + 16).stroke();
  doc.font("Helvetica").fontSize(10);
  let rowY = y + 24;
  for (const line of lines) {
    doc.text(line.designation, 42, rowY, { width: 220 });
    doc.text(`${line.quantite} ${line.unite}`, 270, rowY, { width: 45, align: "right" });
    doc.text(formatMoney(line.prix_unitaire_ht_cents), 320, rowY, { width: 65, align: "right" });
    doc.text(`${line.taux_tva_bps / 100} %`, 390, rowY, { width: 45, align: "right" });
    doc.text(formatMoney(line.total_ttc_cents), 455, rowY, { width: 90, align: "right" });
    rowY += 26;
  }

  doc.moveTo(42, rowY).lineTo(550, rowY).stroke();
  rowY += 14;
  doc.font("Helvetica-Bold");
  doc.text(`Total HT : ${formatMoney(documentData.total_ht_cents)}`, 390, rowY, { width: 155, align: "right" });
  doc.text(`TVA : ${formatMoney(documentData.total_tva_cents)}`, 390, rowY + 18, { width: 155, align: "right" });
  doc.fontSize(13).text(`Total TTC : ${formatMoney(documentData.total_ttc_cents)}`, 390, rowY + 40, { width: 155, align: "right" });

  doc.font("Helvetica").fontSize(9).text(
    "Penalites de retard exigibles sans rappel au taux indique. Indemnite forfaitaire pour frais de recouvrement de 40 EUR due par tout professionnel en retard de paiement.",
    42,
    700,
    { width: 500 }
  );
  doc.text(`Escompte : ${documentData.conditions_escompte ?? text(company, "conditions_escompte") ?? "Aucun escompte pour paiement anticipe"}`, 42);
  doc.text(`Taux penalites : ${documentData.taux_penalites_retard ?? text(company, "taux_penalites_retard") ?? "12"} % - Indemnite : ${formatMoney(documentData.indemnite_recouvrement_cents ?? 4000)}`, 42);
  if (documentData.type === "facture") {
    doc.text(`Preparation facturation electronique : ${documentData.electronic_format_target ?? "factur_x"} / ${documentData.electronic_status ?? "non_preparee"}`, 42);
  }

  doc.end();
  return done;
}
