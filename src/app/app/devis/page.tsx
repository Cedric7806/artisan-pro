import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateFr, formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, TableEmpty } from "@/components/ui/DataTable";

type Quote = {
  id: string;
  numero: string;
  statut: string;
  date_emission: string;
  total_ttc_cents: number;
  client_nom: string;
};

export default async function QuotesPage() {
  const user = await requireUser();
  const quotes = await query<Quote>(
    `SELECT d.id, d.numero, d.statut, d.date_emission, d.total_ttc_cents, c.nom AS client_nom
     FROM devis d
     JOIN clients c ON c.id = d.client_id
     WHERE d.entreprise_id = $1
     ORDER BY d.created_at DESC`,
    [user.entreprise_id]
  );
  return (
    <>
      <PageHeader title="Devis" description="Creez, envoyez et transformez les devis acceptes en factures." actionHref="/app/devis/nouveau" actionLabel="Nouveau devis" actionIcon={Plus} />
      <DataTable>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr><th className="px-5 py-3">Numero</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Montant</th><th className="px-5 py-3">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quotes.rows.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><Link className="font-semibold text-brand-800" href={`/app/devis/${quote.id}`}>{quote.numero}</Link></td>
                  <td className="px-5 py-4">{quote.client_nom}</td>
                  <td className="px-5 py-4">{formatDateFr(quote.date_emission)}</td>
                  <td className="px-5 py-4">{formatMoney(quote.total_ttc_cents)}</td>
                  <td className="px-5 py-4"><StatusBadge value={quote.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!quotes.rows.length ? <TableEmpty>Aucun devis cree.</TableEmpty> : null}
      </DataTable>
    </>
  );
}
