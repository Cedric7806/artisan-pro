import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateFr, formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, TableEmpty } from "@/components/ui/DataTable";

type Invoice = {
  id: string;
  numero: string;
  statut: string;
  date_emission: string;
  date_echeance: string;
  total_ttc_cents: number;
  client_nom: string;
};

export default async function InvoicesPage() {
  const user = await requireUser();
  const invoices = await query<Invoice>(
    `SELECT f.id, f.numero, f.statut, f.date_emission, f.date_echeance, f.total_ttc_cents, c.nom AS client_nom
     FROM factures f
     JOIN clients c ON c.id = f.client_id
     WHERE f.entreprise_id = $1
     ORDER BY f.created_at DESC`,
    [user.entreprise_id]
  );
  return (
    <>
      <PageHeader title="Factures" description="Suivez les factures emises, payees ou en retard." />
      <DataTable>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr><th className="px-5 py-3">Numero</th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Emission</th><th className="px-5 py-3">Echeance</th><th className="px-5 py-3">Montant</th><th className="px-5 py-3">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.rows.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><Link className="font-semibold text-brand-800" href={`/app/factures/${invoice.id}`}>{invoice.numero}</Link></td>
                  <td className="px-5 py-4">{invoice.client_nom}</td>
                  <td className="px-5 py-4">{formatDateFr(invoice.date_emission)}</td>
                  <td className="px-5 py-4">{formatDateFr(invoice.date_echeance)}</td>
                  <td className="px-5 py-4">{formatMoney(invoice.total_ttc_cents)}</td>
                  <td className="px-5 py-4"><StatusBadge value={invoice.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!invoices.rows.length ? <TableEmpty>Aucune facture pour le moment. Transformez un devis accepte en facture.</TableEmpty> : null}
      </DataTable>
    </>
  );
}
