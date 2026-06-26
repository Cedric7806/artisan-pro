import Link from "next/link";
import { Download } from "lucide-react";
import { notFound } from "next/navigation";
import { markInvoicePaidAction } from "@/lib/actions/document-actions";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateFr, formatMoney } from "@/lib/format";
import { FormField, FormSelect } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LegalNotice } from "@/components/LegalNotice";

type Invoice = {
  id: string;
  numero: string;
  statut: string;
  date_emission: string;
  date_prestation: string;
  date_echeance: string;
  total_ht_cents: number;
  total_tva_cents: number;
  total_ttc_cents: number;
  montant_paye_cents: number;
  electronic_format_target: string;
  electronic_status: string;
  client_nom: string;
};
type Line = { id: string; designation: string; quantite: string; unite: string; prix_unitaire_ht_cents: number; taux_tva_bps: number; total_ttc_cents: number };

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const invoiceResult = await query<Invoice>(
    `SELECT f.*, c.nom AS client_nom FROM factures f JOIN clients c ON c.id = f.client_id WHERE f.id = $1 AND f.entreprise_id = $2`,
    [id, user.entreprise_id]
  );
  const invoice = invoiceResult.rows[0];
  if (!invoice) notFound();
  const lines = await query<Line>("SELECT * FROM lignes_facture WHERE facture_id = $1 ORDER BY ordre", [id]);

  return (
    <>
      <PageHeader title={`Facture ${invoice.numero}`} description={invoice.client_nom} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
            <div>
              <StatusBadge value={invoice.statut} />
              <p className="mt-2 text-sm text-slate-600">Emise le {formatDateFr(invoice.date_emission)} - echeance {formatDateFr(invoice.date_echeance)}</p>
            </div>
            <Link className="btn-secondary h-10 px-3 text-sm" href={`/app/factures/${invoice.id}/pdf`} target="_blank"><Download size={18} />PDF</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr><th className="px-5 py-3">Designation</th><th className="px-5 py-3">Qte</th><th className="px-5 py-3">PU HT</th><th className="px-5 py-3">TVA</th><th className="px-5 py-3 text-right">Total TTC</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {lines.rows.map((line) => (
                  <tr key={line.id}>
                    <td className="px-5 py-4">{line.designation}</td>
                    <td className="px-5 py-4">{line.quantite} {line.unite}</td>
                    <td className="px-5 py-4">{formatMoney(line.prix_unitaire_ht_cents)}</td>
                    <td className="px-5 py-4">{line.taux_tva_bps / 100} %</td>
                    <td className="px-5 py-4 text-right font-semibold">{formatMoney(line.total_ttc_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line p-5 text-right">
            <p>Total HT : {formatMoney(invoice.total_ht_cents)}</p>
            <p>TVA : {formatMoney(invoice.total_tva_cents)}</p>
            <p className="text-xl font-bold text-slate-950">Total TTC : {formatMoney(invoice.total_ttc_cents)}</p>
            <p className="text-sm text-slate-600">Paye : {formatMoney(invoice.montant_paye_cents)}</p>
          </div>
        </section>
        <aside className="grid gap-5">
          <form action={markInvoicePaidAction} className="panel grid gap-4 p-5">
            <input type="hidden" name="id" value={invoice.id} />
            <FormSelect label="Mode de paiement" name="mode" defaultValue="virement">
              <option value="virement">Virement</option>
              <option value="cheque">Cheque</option>
              <option value="especes">Especes</option>
              <option value="carte">Carte</option>
              <option value="autre">Autre</option>
            </FormSelect>
            <FormField label="Reference" name="reference" />
            <SubmitButton label="Marquer payee" />
          </form>
          <div className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Facturation electronique</h2>
            <p className="mt-2 text-sm text-slate-600">Format cible : {invoice.electronic_format_target}</p>
            <p className="text-sm text-slate-600">Statut : {invoice.electronic_status}</p>
          </div>
          <LegalNotice />
        </aside>
      </div>
    </>
  );
}
