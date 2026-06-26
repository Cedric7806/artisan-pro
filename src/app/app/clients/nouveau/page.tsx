import { createClientAction } from "@/lib/actions/client-actions";
import { FormField, FormSelect, FormTextarea } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="Nouveau client" description="Creez une fiche client simple et complete." />
      <form action={createClientAction} className="panel grid gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect label="Type" name="type_client" defaultValue="particulier">
            <option value="particulier">Particulier</option>
            <option value="professionnel">Professionnel</option>
          </FormSelect>
          <FormField label="Nom du client" name="nom" required />
          <FormField label="Raison sociale" name="raison_sociale" />
          <FormField label="SIRET" name="siret" />
          <FormField label="Numero TVA" name="numero_tva" />
          <FormField label="Telephone" name="telephone" />
          <FormField label="Email" name="email" type="email" />
          <FormField label="Adresse" name="adresse_ligne1" required />
          <FormField label="Complement d'adresse" name="adresse_ligne2" />
          <FormField label="Code postal" name="code_postal" required />
          <FormField label="Ville" name="ville" required />
        </div>
        <FormTextarea label="Notes" name="notes" />
        <SubmitButton label="Enregistrer le client" />
      </form>
    </>
  );
}
