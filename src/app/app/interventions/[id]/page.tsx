import { notFound } from "next/navigation";
import { updateInterventionStatusAction } from "@/lib/actions/intervention-actions";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDateTimeFr } from "@/lib/format";
import { FormSelect } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Intervention = {
  id: string;
  titre: string;
  description: string | null;
  statut: string;
  date_debut: string | null;
  date_fin: string | null;
  adresse_intervention_ligne1: string;
  adresse_intervention_ligne2: string | null;
  code_postal: string;
  ville: string;
  client_nom: string;
  technicien_nom: string | null;
};

export default async function InterventionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const result = await query<Intervention>(
    `SELECT i.*, c.nom AS client_nom, t.nom AS technicien_nom
     FROM interventions i
     JOIN clients c ON c.id = i.client_id
     LEFT JOIN techniciens t ON t.id = i.technicien_id
     WHERE i.id = $1 AND i.entreprise_id = $2`,
    [id, user.entreprise_id]
  );
  const intervention = result.rows[0];
  if (!intervention) notFound();

  return (
    <>
      <PageHeader title={intervention.titre} description={`${intervention.client_nom} - ${intervention.ville}`} />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">Details</h2>
            <StatusBadge value={intervention.statut} />
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div><dt className="font-semibold text-slate-700">Client</dt><dd>{intervention.client_nom}</dd></div>
            <div><dt className="font-semibold text-slate-700">Technicien</dt><dd>{intervention.technicien_nom ?? "Non assigne"}</dd></div>
            <div><dt className="font-semibold text-slate-700">Debut</dt><dd>{formatDateTimeFr(intervention.date_debut)}</dd></div>
            <div><dt className="font-semibold text-slate-700">Fin</dt><dd>{formatDateTimeFr(intervention.date_fin)}</dd></div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-700">Adresse</dt>
              <dd>{intervention.adresse_intervention_ligne1}<br />{intervention.adresse_intervention_ligne2 ? <>{intervention.adresse_intervention_ligne2}<br /></> : null}{intervention.code_postal} {intervention.ville}</dd>
            </div>
            <div className="sm:col-span-2"><dt className="font-semibold text-slate-700">Description</dt><dd>{intervention.description ?? "-"}</dd></div>
          </dl>
        </section>
        <aside className="panel p-5">
          <h2 className="text-xl font-bold text-slate-950">Changer le statut</h2>
          <form action={updateInterventionStatusAction} className="mt-4 grid gap-4">
            <input type="hidden" name="id" value={intervention.id} />
            <FormSelect label="Statut" name="statut" defaultValue={intervention.statut}>
              <option value="a_planifier">A planifier</option>
              <option value="planifiee">Planifiee</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminee</option>
            </FormSelect>
            <SubmitButton label="Mettre a jour" />
          </form>
        </aside>
      </div>
    </>
  );
}
