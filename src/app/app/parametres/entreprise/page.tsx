import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalNotice } from "@/components/LegalNotice";
import { FormField, FormTextarea } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { updateCompanySettingsAction } from "@/lib/actions/company-actions";

type Company = {
  nom_commercial: string;
  raison_sociale: string;
  forme_juridique: string;
  capital_social_cents: number | null;
  siret: string;
  numero_tva: string | null;
  adresse_ligne1: string;
  adresse_ligne2: string | null;
  code_postal: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  taux_penalites_retard: string;
  indemnite_recouvrement_cents: number;
  delai_paiement_jours: number;
  conditions_escompte: string;
};

export default async function CompanySettingsPage() {
  const user = await requireUser();
  const result = await query<Company>("SELECT * FROM entreprises WHERE id = $1", [user.entreprise_id]);
  const company = result.rows[0];
  const capitalSocial = ((company.capital_social_cents ?? 0) / 100).toFixed(2);
  const indemniteRecouvrement = (company.indemnite_recouvrement_cents / 100).toFixed(2);

  return (
    <>
      <PageHeader title="Parametres entreprise" description="Informations legales reprises sur les devis et factures." />
      <form action={updateCompanySettingsAction} className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="panel p-5">
          <h2 className="text-xl font-bold text-slate-950">Identite legale</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Nom commercial" name="nom_commercial" defaultValue={company.nom_commercial} required />
            <FormField label="Raison sociale" name="raison_sociale" defaultValue={company.raison_sociale} required />
            <FormField label="Forme juridique" name="forme_juridique" defaultValue={company.forme_juridique} required />
            <FormField label="Capital social (€)" name="capital_social" inputMode="decimal" defaultValue={capitalSocial} />
            <FormField label="SIREN" name="siren" defaultValue={company.siret.slice(0, 9)} required />
            <FormField label="SIRET" name="siret" defaultValue={company.siret} required />
            <FormField label="TVA intracommunautaire" name="numero_tva" defaultValue={company.numero_tva ?? ""} />
            <FormField label="Telephone" name="telephone" type="tel" defaultValue={company.telephone} required />
            <FormField label="Email" name="email" type="email" defaultValue={company.email} required />
            <FormField label="Adresse" name="adresse_ligne1" defaultValue={company.adresse_ligne1} required />
            <FormField label="Complement d'adresse" name="adresse_ligne2" defaultValue={company.adresse_ligne2 ?? ""} />
            <FormField label="Code postal" name="code_postal" defaultValue={company.code_postal} required />
            <FormField label="Ville" name="ville" defaultValue={company.ville} required />
            <FormField label="Pays" name="pays" defaultValue={company.pays} required />
          </div>
        </section>
        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Paiement</h2>
            <div className="mt-4 grid gap-4">
              <FormField label="Delai de paiement (jours)" name="delai_paiement_jours" type="number" min={1} defaultValue={company.delai_paiement_jours} required />
              <FormField label="Penalites de retard (%)" name="taux_penalites_retard" inputMode="decimal" defaultValue={company.taux_penalites_retard} required />
              <FormField label="Indemnite de recouvrement (€)" name="indemnite_recouvrement" inputMode="decimal" defaultValue={indemniteRecouvrement} required />
              <FormTextarea label="Escompte" name="conditions_escompte" defaultValue={company.conditions_escompte} rows={3} required />
            </div>
          </section>
          <LegalNotice />
          <section className="panel p-5">
            <SubmitButton label="Enregistrer les parametres" />
          </section>
        </aside>
      </form>
    </>
  );
}
