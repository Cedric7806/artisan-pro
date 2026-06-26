import Link from "next/link";
import { CalendarCheck, Euro, FileClock, Plus, Wrench } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateTimeFr, formatMoney } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type DashboardStats = {
  ca_mois: number;
  interventions_en_cours: number;
  devis_en_attente: number;
};

type Upcoming = {
  id: string;
  titre: string;
  date_debut: string | null;
  statut: string;
  client_nom: string;
  technicien_nom: string | null;
};

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await query<DashboardStats>(
    `SELECT
      COALESCE(SUM(CASE WHEN f.statut IN ('emise','payee') AND date_trunc('month', f.date_emission) = date_trunc('month', CURRENT_DATE) THEN f.total_ttc_cents ELSE 0 END), 0)::int AS ca_mois,
      (SELECT count(*)::int FROM interventions WHERE entreprise_id = $1 AND statut IN ('planifiee','en_cours')) AS interventions_en_cours,
      (SELECT count(*)::int FROM devis WHERE entreprise_id = $1 AND statut IN ('brouillon','envoye')) AS devis_en_attente
     FROM factures f
     WHERE f.entreprise_id = $1`,
    [user.entreprise_id]
  );
  const upcoming = await query<Upcoming>(
    `SELECT i.id, i.titre, i.date_debut, i.statut, c.nom AS client_nom, t.nom AS technicien_nom
     FROM interventions i
     JOIN clients c ON c.id = i.client_id
     LEFT JOIN techniciens t ON t.id = i.technicien_id
     WHERE i.entreprise_id = $1
     ORDER BY i.date_debut NULLS LAST, i.created_at DESC
     LIMIT 6`,
    [user.entreprise_id]
  );
  const s = stats.rows[0] ?? { ca_mois: 0, interventions_en_cours: 0, devis_en_attente: 0 };

  return (
    <>
      <PageHeader title="Tableau de bord" description="Les chiffres utiles pour commencer la journee." actionHref="/app/interventions/nouvelle" actionLabel="Nouvelle intervention" actionIcon={Plus} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="CA du mois" value={formatMoney(s.ca_mois)} helper="Factures emises et payees" icon={Euro} tone="money" metric="Encaissement mensuel" />
        <StatCard label="Interventions actives" value={String(s.interventions_en_cours)} helper="Planifiees ou en cours" icon={CalendarCheck} tone="work" metric="Charge terrain" />
        <StatCard label="Devis a suivre" value={String(s.devis_en_attente)} helper="Brouillons et envoyes" icon={FileClock} tone="quote" metric="Relances commerciales" />
      </div>

      <section className="mt-6 panel">
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="text-xl font-bold text-slate-950">Prochaines interventions</h2>
          <Link className="btn-secondary h-10 px-3 text-sm" href="/app/planning">
            <Wrench size={18} />
            Ouvrir le planning
          </Link>
        </div>
        <div className="divide-y divide-line">
          {upcoming.rows.map((item) => (
            <Link key={item.id} href={`/app/interventions/${item.id}`} className="grid gap-2 p-5 hover:bg-slate-50 md:grid-cols-[1fr_180px_150px] md:items-center">
              <div>
                <p className="font-semibold text-slate-950">{item.titre}</p>
                <p className="text-sm text-slate-600">{item.client_nom} {item.technicien_nom ? `- ${item.technicien_nom}` : ""}</p>
              </div>
              <p className="text-sm text-slate-700">{formatDateTimeFr(item.date_debut)}</p>
              <StatusBadge value={item.statut} />
            </Link>
          ))}
          {!upcoming.rows.length ? <div className="p-8 text-center text-slate-600">Aucune intervention pour le moment.</div> : null}
        </div>
      </section>
    </>
  );
}
