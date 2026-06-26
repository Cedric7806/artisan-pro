import { createTechnicienAction } from "@/lib/actions/team-actions";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatPhone } from "@/lib/format";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";

type Tech = { id: string; nom: string; telephone: string | null; email: string | null; couleur_planning: string };

export default async function TeamPage() {
  const user = await requireUser();
  const techniciens = await query<Tech>("SELECT id, nom, telephone, email, couleur_planning FROM techniciens WHERE entreprise_id = $1 ORDER BY nom", [user.entreprise_id]);

  return (
    <>
      <PageHeader title="Equipe" description="Techniciens visibles dans le planning." />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-3">
          {techniciens.rows.map((tech) => (
            <div key={tech.id} className="panel flex items-center gap-4 p-4">
              <span className="h-5 w-5 rounded-full" style={{ background: tech.couleur_planning }} />
              <div>
                <p className="font-semibold text-slate-950">{tech.nom}</p>
                <p className="text-sm text-slate-600">{formatPhone(tech.telephone)} {tech.email ? `- ${tech.email}` : ""}</p>
              </div>
            </div>
          ))}
        </section>
        <form action={createTechnicienAction} className="panel grid gap-4 p-5">
          <h2 className="text-xl font-bold text-slate-950">Ajouter un technicien</h2>
          <FormField label="Nom" name="nom" required />
          <FormField label="Telephone" name="telephone" />
          <FormField label="Email" name="email" type="email" />
          <FormField label="Couleur planning" name="couleur_planning" type="color" defaultValue="#059669" />
          <SubmitButton label="Ajouter" />
        </form>
      </div>
    </>
  );
}
