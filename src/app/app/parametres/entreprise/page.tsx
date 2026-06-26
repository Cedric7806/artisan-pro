import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatMoney, formatPhone } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalNotice } from "@/components/LegalNotice";

type Company = {
  nom_commercial: string;
  raison_sociale: string;
  forme_juridique: string;
  capital_social_cents: number | null;
  siret: string;
  numero_tva: string | null;
  adresse_ligne1: string;
  code_postal: string;
  ville: string;
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

  return (
    <>
      <PageHeader title="Parametres entreprise" description="Informations legales reprises sur les devis et factures." />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="panel p-5">
          <h2 className="text-xl font-bold text-slate-950">Identite legale</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="font-semibold text-slate-700">Nom commercial</dt><dd>{company.nom_commercial}</dd></div>
            <div><dt className="font-semibold text-slate-700">Raison sociale</dt><dd>{company.raison_sociale}</dd></div>
            <div><dt className="font-semibold text-slate-700">Forme juridique</dt><dd>{company.forme_juridique}</dd></div>
            <div><dt className="font-semibold text-slate-700">Capital social</dt><dd>{formatMoney(company.capital_social_cents ?? 0)}</dd></div>
            <div><dt className="font-semibold text-slate-700">SIRET</dt><dd>{company.siret}</dd></div>
            <div><dt className="font-semibold text-slate-700">TVA</dt><dd>{company.numero_tva ?? "-"}</dd></div>
            <div className="sm:col-span-2"><dt className="font-semibold text-slate-700">Adresse</dt><dd>{company.adresse_ligne1}, {company.code_postal} {company.ville}</dd></div>
            <div><dt className="font-semibold text-slate-700">Telephone</dt><dd>{formatPhone(company.telephone)}</dd></div>
            <div><dt className="font-semibold text-slate-700">Email</dt><dd>{company.email}</dd></div>
          </dl>
        </section>
        <aside className="grid gap-5">
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Paiement</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div><dt className="font-semibold text-slate-700">Delai</dt><dd>{company.delai_paiement_jours} jours</dd></div>
              <div><dt className="font-semibold text-slate-700">Penalites</dt><dd>{company.taux_penalites_retard} %</dd></div>
              <div><dt className="font-semibold text-slate-700">Indemnite recouvrement</dt><dd>{formatMoney(company.indemnite_recouvrement_cents)}</dd></div>
              <div><dt className="font-semibold text-slate-700">Escompte</dt><dd>{company.conditions_escompte}</dd></div>
            </dl>
          </section>
          <LegalNotice />
        </aside>
      </div>
    </>
  );
}
