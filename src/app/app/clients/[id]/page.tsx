import Link from "next/link";
import { CalendarPlus, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateTimeFr, formatMoney, formatPhone } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Client = {
  id: string;
  nom: string;
  raison_sociale: string | null;
  telephone: string | null;
  email: string | null;
  adresse_ligne1: string;
  adresse_ligne2: string | null;
  code_postal: string;
  ville: string;
  notes: string | null;
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const client = await query<Client>("SELECT * FROM clients WHERE id = $1 AND entreprise_id = $2", [id, user.entreprise_id]);
  if (!client.rows[0]) notFound();

  const interventions = await query<{ id: string; titre: string; statut: string; date_debut: string | null }>(
    "SELECT id, titre, statut, date_debut FROM interventions WHERE client_id = $1 AND entreprise_id = $2 ORDER BY date_debut DESC NULLS LAST LIMIT 8",
    [id, user.entreprise_id]
  );
  const devis = await query<{ id: string; numero: string; statut: string; total_ttc_cents: number }>(
    "SELECT id, numero, statut, total_ttc_cents FROM devis WHERE client_id = $1 AND entreprise_id = $2 ORDER BY created_at DESC LIMIT 8",
    [id, user.entreprise_id]
  );
  const c = client.rows[0];

  return (
    <>
      <PageHeader title={c.nom} description={c.raison_sociale ?? "Fiche client"} />
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="panel p-5">
          <h2 className="text-xl font-bold text-slate-950">Coordonnees</h2>
          <dl className="mt-4 grid gap-3 text-base">
            <div><dt className="font-semibold text-slate-700">Telephone</dt><dd>{formatPhone(c.telephone) || "-"}</dd></div>
            <div><dt className="font-semibold text-slate-700">Email</dt><dd>{c.email ?? "-"}</dd></div>
            <div><dt className="font-semibold text-slate-700">Adresse</dt><dd>{c.adresse_ligne1}<br />{c.adresse_ligne2 ? <>{c.adresse_ligne2}<br /></> : null}{c.code_postal} {c.ville}</dd></div>
            <div><dt className="font-semibold text-slate-700">Notes</dt><dd>{c.notes ?? "-"}</dd></div>
          </dl>
        </section>
        <section className="grid gap-5">
          <div className="panel">
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="text-xl font-bold text-slate-950">Historique interventions</h2>
              <Link className="btn-secondary h-10 px-3 text-sm" href="/app/interventions/nouvelle"><CalendarPlus size={18} />Ajouter</Link>
            </div>
            <div className="divide-y divide-line">
              {interventions.rows.map((item) => (
                <Link key={item.id} href={`/app/interventions/${item.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50">
                  <div>
                    <p className="font-semibold">{item.titre}</p>
                    <p className="text-sm text-slate-600">{formatDateTimeFr(item.date_debut)}</p>
                  </div>
                  <StatusBadge value={item.statut} />
                </Link>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="text-xl font-bold text-slate-950">Devis</h2>
              <Link className="btn-secondary h-10 px-3 text-sm" href="/app/devis/nouveau"><FileText size={18} />Nouveau</Link>
            </div>
            <div className="divide-y divide-line">
              {devis.rows.map((item) => (
                <Link key={item.id} href={`/app/devis/${item.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50">
                  <div>
                    <p className="font-semibold">{item.numero}</p>
                    <p className="text-sm text-slate-600">{formatMoney(item.total_ttc_cents)}</p>
                  </div>
                  <StatusBadge value={item.statut} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
