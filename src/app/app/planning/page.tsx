import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { dayLabel, formatDateTimeFr, weekDays } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Tech = { id: string; nom: string; couleur_planning: string };
type Intervention = {
  id: string;
  titre: string;
  statut: string;
  date_debut: string | null;
  technicien_id: string | null;
  client_nom: string;
};

export default async function PlanningPage() {
  const user = await requireUser();
  const days = weekDays();
  const start = days[0].toISOString();
  const end = new Date(days[6]);
  end.setDate(end.getDate() + 1);
  const techniciens = await query<Tech>("SELECT id, nom, couleur_planning FROM techniciens WHERE entreprise_id = $1 AND actif = true ORDER BY nom", [user.entreprise_id]);
  const interventions = await query<Intervention>(
    `SELECT i.id, i.titre, i.statut, i.date_debut, i.technicien_id, c.nom AS client_nom
     FROM interventions i
     JOIN clients c ON c.id = i.client_id
     WHERE i.entreprise_id = $1 AND i.date_debut >= $2 AND i.date_debut < $3
     ORDER BY i.date_debut`,
    [user.entreprise_id, start, end.toISOString()]
  );

  return (
    <>
      <PageHeader title="Planning semaine" description="Vue simple des interventions par technicien." />
      <div className="grid gap-5">
        {techniciens.rows.map((tech) => (
          <section key={tech.id} className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line p-4">
              <span className="h-4 w-4 rounded-full" style={{ background: tech.couleur_planning }} />
              <h2 className="text-lg font-bold text-slate-950">{tech.nom}</h2>
            </div>
            <div className="grid min-w-full grid-cols-1 divide-y divide-line md:grid-cols-7 md:divide-x md:divide-y-0">
              {days.map((day) => {
                const dayItems = interventions.rows.filter((item) => {
                  if (!item.date_debut || item.technicien_id !== tech.id) return false;
                  const d = new Date(item.date_debut);
                  return d.toDateString() === day.toDateString();
                });
                return (
                  <div key={day.toISOString()} className="min-h-36 p-3">
                    <p className="mb-3 text-sm font-bold text-slate-700">{dayLabel(day)}</p>
                    <div className="grid gap-2">
                      {dayItems.map((item) => (
                        <Link key={item.id} href={`/app/interventions/${item.id}`} className="rounded-lg border border-line bg-white p-3 text-sm shadow-sm hover:border-brand-600">
                          <p className="font-semibold text-slate-950">{item.titre}</p>
                          <p className="mt-1 text-slate-600">{item.client_nom}</p>
                          <p className="mt-1 text-slate-600">{formatDateTimeFr(item.date_debut)}</p>
                          <div className="mt-2"><StatusBadge value={item.statut} /></div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
