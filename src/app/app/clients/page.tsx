import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatPhone } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, TableEmpty } from "@/components/ui/DataTable";

type ClientRow = {
  id: string;
  nom: string;
  type_client: string;
  raison_sociale: string | null;
  telephone: string | null;
  email: string | null;
  ville: string;
};

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const clients = await query<ClientRow>(
    `SELECT id, nom, type_client, raison_sociale, telephone, email, ville
     FROM clients
     WHERE entreprise_id = $1 AND ($2 = '' OR nom ILIKE '%' || $2 || '%' OR email ILIKE '%' || $2 || '%' OR telephone ILIKE '%' || $2 || '%')
     ORDER BY created_at DESC`,
    [user.entreprise_id, q]
  );

  return (
    <>
      <PageHeader title="Clients" description="Toutes les coordonnees et l'historique client." actionHref="/app/clients/nouveau" actionLabel="Nouveau client" actionIcon={Plus} />
      <form className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={20} />
          <input className="field-input pl-10" name="q" placeholder="Rechercher un client" defaultValue={q} />
        </div>
        <button className="btn-secondary" type="submit">Rechercher</button>
      </form>
      <DataTable>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Telephone</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Ville</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.rows.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link className="font-semibold text-brand-800" href={`/app/clients/${client.id}`}>{client.nom}</Link>
                    <p className="text-sm text-slate-600">{client.raison_sociale ?? (client.type_client === "professionnel" ? "Professionnel" : "Particulier")}</p>
                  </td>
                  <td className="px-5 py-4">{formatPhone(client.telephone)}</td>
                  <td className="px-5 py-4">{client.email ?? "-"}</td>
                  <td className="px-5 py-4">{client.ville}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!clients.rows.length ? <TableEmpty>Aucun client trouve.</TableEmpty> : null}
      </DataTable>
    </>
  );
}
