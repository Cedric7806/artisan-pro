import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";
import { notFound } from "next/navigation";
import { convertDevisToFactureAction, setDevisStatusAction } from "@/lib/actions/document-actions";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateFr, formatMoney } from "@/lib/format";
import { FormSelect } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Quote = {
  id: string;
  numero: string;
  statut: string;
  date_emission: string;
  date_validite: string;
  total_ht_cents: number;
  total_tva_cents: number;
  total_ttc_cents: number;
  client_nom: string;
};
type Line = { id: string; designation: string; quantite: string; unite: string; prix_unitaire_ht_cents: number; taux_tva_bps: number; total_ttc_cents: number };

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const quoteResult = await query<Quote>(
    `SELECT d.*, c.nom AS client_nom FROM devis d JOIN clients c ON c.id = d.client_id WHERE d.id = $1 AND d.entreprise_id = $2`,
    [id, user.entreprise_id]
  );
  const quote = quoteResult.rows[0];
  if (!quote) notFound();
  const lines = await query<Line>("SELECT * FROM lignes_devis WHERE devis_id = $1 ORDER BY ordre", [id]);

  return (
    <>
      <PageHeader title={`Devis ${quote.numero}`} description={quote.client_nom} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
            <div>
              <StatusBadge value={quote.statut} />
              <p className="mt-2 text-sm text-slate-600">Emis le {formatDateFr(quote.date_emission)} - valable jusqu'au {formatDateFr(quote.date_validite)}</p>
            </div>
            <Link className="btn-secondary h-10 px-3 text-sm" href={`/app/devis/${quote.id}/pdf`} target="_blank"><Download size={18} />PDF</Link>
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
            <p>Total HT : {formatMoney(quote.total_ht_cents)}</p>
            <p>TVA : {formatMoney(quote.total_tva_cents)}</p>
            <p className="text-xl font-bold text-slate-950">Total TTC : {formatMoney(quote.total_ttc_cents)}</p>
          </div>
        </section>
        <aside className="grid gap-5">
          <form action={setDevisStatusAction} className="panel grid gap-4 p-5">
            <input type="hidden" name="id" value={quote.id} />
            <FormSelect label="Statut du devis" name="statut" defaultValue={quote.statut}>
              <option value="brouillon">Brouillon</option>
              <option value="envoye">Envoye</option>
              <option value="accepte">Accepte</option>
              <option value="refuse">Refuse</option>
              <option value="expire">Expire</option>
            </FormSelect>
            <SubmitButton label="Mettre a jour" />
          </form>
          <form action={convertDevisToFactureAction} className="panel grid gap-4 p-5">
            <input type="hidden" name="id" value={quote.id} />
            <p className="text-sm text-slate-600">Transforme le devis en facture avec les memes lignes et les mentions legales.</p>
            <button className="btn-primary" type="submit"><ReceiptText size={20} />Transformer en facture</button>
          </form>
        </aside>
      </div>
    </>
  );
}
