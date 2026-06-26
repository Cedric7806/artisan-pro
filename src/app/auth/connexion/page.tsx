import Link from "next/link";
import { loginAction } from "@/lib/actions/auth-actions";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";

export default function LoginPage() {
  return (
    <section className="panel p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-slate-950">Connexion</h2>
      <p className="mt-2 text-slate-600">Connectez-vous pour retrouver votre activite.</p>
      <form action={loginAction} className="mt-6 grid gap-4">
        <FormField label="Email" name="email" type="email" autoComplete="email" required defaultValue="demo@artisanpro.fr" />
        <FormField label="Mot de passe" name="password" type="password" autoComplete="current-password" required defaultValue="motdepasse" />
        <SubmitButton label="Se connecter" />
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Pas encore de compte ? <Link className="font-semibold text-brand-700" href="/auth/inscription">Creer une entreprise</Link>
      </p>
    </section>
  );
}
