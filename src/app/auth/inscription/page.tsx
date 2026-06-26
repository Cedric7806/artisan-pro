import Link from "next/link";
import { registerAction } from "@/lib/actions/auth-actions";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";

export default function RegisterPage() {
  return (
    <section className="panel p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-950">Creer votre entreprise</h2>
      <p className="mt-2 text-slate-600">Quelques informations legales suffisent pour demarrer.</p>
      <form action={registerAction} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nom commercial" name="entreprise_nom" required />
          <FormField label="Raison sociale" name="raison_sociale" required />
          <FormField label="Forme juridique" name="forme_juridique" placeholder="SARL, SAS, EI..." required />
          <FormField label="Capital social en centimes" name="capital_social_cents" type="number" defaultValue="1000000" />
          <FormField label="SIRET" name="siret" required />
          <FormField label="Numero TVA" name="numero_tva" placeholder="FR..." />
          <FormField label="Telephone" name="telephone" required />
          <FormField label="Adresse" name="adresse_ligne1" required />
          <FormField label="Code postal" name="code_postal" required />
          <FormField label="Ville" name="ville" required />
        </div>
        <div className="border-t border-line pt-4">
          <h3 className="mb-4 text-lg font-bold text-slate-950">Compte gerant</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nom" name="nom" required />
            <FormField label="Email" name="email" type="email" required />
            <FormField label="Mot de passe" name="password" type="password" required />
          </div>
        </div>
        <SubmitButton label="Creer mon espace" />
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Deja inscrit ? <Link className="font-semibold text-brand-700" href="/auth/connexion">Se connecter</Link>
      </p>
    </section>
  );
}
