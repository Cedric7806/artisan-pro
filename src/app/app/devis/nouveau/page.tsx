import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { isoDate } from "@/lib/format";
import { createDevisAction } from "@/lib/actions/document-actions";
import { FormField, FormSelect, FormTextarea } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalNotice } from "@/components/LegalNotice";

type Option = { id: string; label: string };

export default async function NewQuotePage() {
  const user = await requireUser();
  const clients = await query<Option>("SELECT id, nom AS label FROM clients WHERE entreprise_id = $1 ORDER BY nom", [user.entreprise_id]);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  return (
    <>
      <PageHeader title="Nouveau devis" description="Ajoutez jusqu'a trois lignes pour le MVP." />
      <form action={createDevisAction} className="grid gap-5">
        <section className="panel grid gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect label="Client" name="client_id" required>
              <option value="">Choisir un client</option>
              {clients.rows.map((client) => <option key={client.id} value={client.id}>{client.label}</option>)}
            </FormSelect>
            <FormField label="Lieu d'execution" name="lieu_execution" placeholder="Adresse du chantier" />
            <FormField label="Date d'emission" name="date_emission" type="date" defaultValue={isoDate()} required />
            <FormField label="Valable jusqu'au" name="date_validite" type="date" defaultValue={isoDate(validUntil)} required />
            <FormField label="Frais de deplacement EUR" name="frais_deplacement" inputMode="decimal" defaultValue="0" />
          </div>
          <FormTextarea label="Description des travaux" name="description_travaux" />
        </section>
        <section className="panel p-5">
          <h2 className="mb-4 text-xl font-bold text-slate-950">Prestations</h2>
          <div className="grid gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="grid gap-3 rounded-lg border border-line p-4 md:grid-cols-[1.5fr_0.6fr_0.7fr_0.8fr_0.6fr]">
                <FormField label="Designation" name={`designation_${index}`} placeholder={index === 0 ? "Main d'oeuvre" : ""} />
                <FormField label="Quantite" name={`quantite_${index}`} inputMode="decimal" defaultValue={index === 0 ? "1" : ""} />
                <FormSelect label="Unite" name={`unite_${index}`} defaultValue="forfait">
                  <option value="forfait">Forfait</option>
                  <option value="heure">Heure</option>
                  <option value="piece">Piece</option>
                  <option value="m2">m2</option>
                  <option value="ml">ml</option>
                </FormSelect>
                <FormField label="Prix HT EUR" name={`prix_${index}`} inputMode="decimal" />
                <FormField label="TVA %" name={`tva_${index}`} inputMode="decimal" defaultValue="20" />
              </div>
            ))}
          </div>
        </section>
        <LegalNotice />
        <SubmitButton label="Creer le devis" />
      </form>
    </>
  );
}
