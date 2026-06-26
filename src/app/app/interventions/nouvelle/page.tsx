import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { createInterventionAction } from "@/lib/actions/intervention-actions";
import { FormField, FormSelect, FormTextarea } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";

type Option = { id: string; label: string };

export default async function NewInterventionPage() {
  const user = await requireUser();
  const clients = await query<Option>("SELECT id, nom AS label FROM clients WHERE entreprise_id = $1 ORDER BY nom", [user.entreprise_id]);
  const techniciens = await query<Option>("SELECT id, nom AS label FROM techniciens WHERE entreprise_id = $1 AND actif = true ORDER BY nom", [user.entreprise_id]);

  return (
    <>
      <PageHeader title="Nouvelle intervention" description="Creez une visite terrain ou un chantier a planifier." />
      <form action={createInterventionAction} className="panel grid gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Client" name="client_id" required>
            <option value="">Choisir un client</option>
            {clients.rows.map((client) => <option key={client.id} value={client.id}>{client.label}</option>)}
          </FormSelect>
          <FormSelect label="Technicien" name="technicien_id">
            <option value="">A assigner plus tard</option>
            {techniciens.rows.map((technicien) => <option key={technicien.id} value={technicien.id}>{technicien.label}</option>)}
          </FormSelect>
          <FormField label="Titre" name="titre" placeholder="Depannage chauffe-eau" required />
          <FormSelect label="Statut" name="statut" defaultValue="a_planifier">
            <option value="a_planifier">A planifier</option>
            <option value="planifiee">Planifiee</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminee</option>
          </FormSelect>
          <FormField label="Debut" name="date_debut" type="datetime-local" />
          <FormField label="Fin" name="date_fin" type="datetime-local" />
          <FormField label="Adresse d'intervention" name="adresse_intervention_ligne1" placeholder="Laisser vide pour reprendre l'adresse client" />
          <FormField label="Complement" name="adresse_intervention_ligne2" />
          <FormField label="Code postal" name="code_postal" />
          <FormField label="Ville" name="ville" />
        </div>
        <FormTextarea label="Description" name="description" placeholder="Details utiles pour le technicien" />
        <SubmitButton label="Creer l'intervention" />
      </form>
    </>
  );
}
