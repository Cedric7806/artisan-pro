import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateTimeFr } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, TableEmpty } from "@/components/ui/DataTable";

type InterventionRow = {
  id: string;
  titre: string;
  statut: string;
  date_debut: string | null;
  date_fin: string | null;
  client_nom: string;
  technicien_nom: string | null;
  ville: string;
};

export default async function InterventionsPage() {
  const user = await requireUser();
  const rows = await query<InterventionRow>(
    `SELECT i.id, i.titre, i.statut, i.date_debut, i.date_fin, i.ville, c.nom AS client_nom, t.nom AS technicien_nom
     FROM interventions i
     JOIN clients c ON c.id = i.client_id
     LEFT JOIN techniciens t ON t.id = i.technicien_id
     WHERE i.entreprise_id = $1
     ORDER BY i.date_debut NULLS LAST, i.created_at DESC`,
    [user.entreprise_id]
  );

  return (
    <>
      <PageHeader title="Interventions" description="Suivez les demandes, les chantiers et les visites terrain." actionHref="/app/interventions/nouvelle" actionLabel="Nouvelle intervention" actionIcon={Plus} />
      <DataTable>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-5 py-3">Intervention</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Technicien</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link className="font-semibold text-brand-800" href={`/app/interventions/${row.id}`}>{row.titre}</Link>
                    <p className="text-sm text-slate-600">{row.ville}</p>
                  </td>
                  <td className="px-5 py-4">{row.client_nom}</td>
                  <td className="px-5 py-4">{row.technicien_nom ?? "Non assigne"}</td>
                  <td className="px-5 py-4">{formatDateTimeFr(row.date_debut)}</td>
                  <td className="px-5 py-4"><StatusBadge value={row.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.rows.length ? <TableEmpty>Aucune intervention creee.</TableEmpty> : null}
      </DataTable>
    </>
  );
}
