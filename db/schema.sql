CREATE TABLE IF NOT EXISTS entreprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_commercial TEXT NOT NULL,
  raison_sociale TEXT NOT NULL,
  forme_juridique TEXT NOT NULL,
  capital_social_cents INTEGER,
  siren TEXT NOT NULL,
  siret TEXT NOT NULL,
  numero_tva TEXT,
  adresse_ligne1 TEXT NOT NULL,
  adresse_ligne2 TEXT,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  pays TEXT NOT NULL DEFAULT 'France',
  telephone TEXT NOT NULL,
  email TEXT NOT NULL,
  iban TEXT,
  bic TEXT,
  regime_tva TEXT NOT NULL DEFAULT 'reel',
  mention_tva_franchise TEXT,
  taux_penalites_retard NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
  indemnite_recouvrement_cents INTEGER NOT NULL DEFAULT 4000,
  delai_paiement_jours INTEGER NOT NULL DEFAULT 30,
  conditions_escompte TEXT NOT NULL DEFAULT 'Aucun escompte pour paiement anticipe',
  option_tva_debits BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS utilisateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'gerant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS techniciens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  couleur_planning TEXT NOT NULL DEFAULT '#059669',
  actif BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  type_client TEXT NOT NULL DEFAULT 'particulier',
  nom TEXT NOT NULL,
  raison_sociale TEXT,
  siren TEXT,
  siret TEXT,
  numero_tva TEXT,
  email TEXT,
  telephone TEXT,
  adresse_ligne1 TEXT NOT NULL,
  adresse_ligne2 TEXT,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'brouillon',
  date_emission DATE NOT NULL,
  date_validite DATE NOT NULL,
  lieu_execution TEXT,
  description_travaux TEXT,
  devis_payant BOOLEAN NOT NULL DEFAULT false,
  cout_devis_cents INTEGER NOT NULL DEFAULT 0,
  frais_deplacement_cents INTEGER NOT NULL DEFAULT 0,
  taux_horaire_main_oeuvre_cents INTEGER,
  temps_estime_minutes INTEGER,
  total_ht_cents INTEGER NOT NULL DEFAULT 0,
  total_tva_cents INTEGER NOT NULL DEFAULT 0,
  total_ttc_cents INTEGER NOT NULL DEFAULT 0,
  mention_acceptation TEXT NOT NULL DEFAULT 'Bon pour accord',
  accepte_le DATE,
  snapshot_entreprise_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  snapshot_client_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entreprise_id, numero)
);

CREATE TABLE IF NOT EXISTS lignes_devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
  ordre INTEGER NOT NULL,
  designation TEXT NOT NULL,
  quantite NUMERIC(10, 2) NOT NULL,
  unite TEXT NOT NULL DEFAULT 'forfait',
  prix_unitaire_ht_cents INTEGER NOT NULL,
  taux_tva_bps INTEGER NOT NULL DEFAULT 2000,
  total_ht_cents INTEGER NOT NULL,
  total_tva_cents INTEGER NOT NULL,
  total_ttc_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  devis_id UUID REFERENCES devis(id) ON DELETE SET NULL,
  numero TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'emise',
  date_emission DATE NOT NULL,
  date_prestation DATE NOT NULL,
  date_echeance DATE NOT NULL,
  total_ht_cents INTEGER NOT NULL DEFAULT 0,
  total_tva_cents INTEGER NOT NULL DEFAULT 0,
  total_ttc_cents INTEGER NOT NULL DEFAULT 0,
  montant_paye_cents INTEGER NOT NULL DEFAULT 0,
  conditions_escompte TEXT NOT NULL,
  taux_penalites_retard NUMERIC(5, 2) NOT NULL,
  indemnite_recouvrement_cents INTEGER NOT NULL DEFAULT 4000,
  nature_operations TEXT NOT NULL DEFAULT 'services',
  adresse_livraison_ou_service_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  snapshot_entreprise_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  snapshot_client_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  electronic_format_target TEXT NOT NULL DEFAULT 'factur_x',
  electronic_status TEXT NOT NULL DEFAULT 'non_preparee',
  electronic_metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entreprise_id, numero)
);

CREATE TABLE IF NOT EXISTS lignes_facture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id UUID NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  ordre INTEGER NOT NULL,
  designation TEXT NOT NULL,
  quantite NUMERIC(10, 2) NOT NULL,
  unite TEXT NOT NULL DEFAULT 'forfait',
  prix_unitaire_ht_cents INTEGER NOT NULL,
  taux_tva_bps INTEGER NOT NULL DEFAULT 2000,
  total_ht_cents INTEGER NOT NULL,
  total_tva_cents INTEGER NOT NULL,
  total_ttc_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  technicien_id UUID REFERENCES techniciens(id) ON DELETE SET NULL,
  titre TEXT NOT NULL,
  description TEXT,
  adresse_intervention_ligne1 TEXT NOT NULL,
  adresse_intervention_ligne2 TEXT,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  date_debut TIMESTAMPTZ,
  date_fin TIMESTAMPTZ,
  statut TEXT NOT NULL DEFAULT 'a_planifier',
  devis_id UUID REFERENCES devis(id) ON DELETE SET NULL,
  facture_id UUID REFERENCES factures(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id UUID NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  date_paiement DATE NOT NULL,
  montant_cents INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'virement',
  reference TEXT
);

CREATE TABLE IF NOT EXISTS documents_pdf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entreprise_id UUID NOT NULL REFERENCES entreprises(id) ON DELETE CASCADE,
  type_document TEXT NOT NULL,
  devis_id UUID REFERENCES devis(id) ON DELETE CASCADE,
  facture_id UUID REFERENCES factures(id) ON DELETE CASCADE,
  chemin_fichier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_entreprise ON clients(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_interventions_entreprise_date ON interventions(entreprise_id, date_debut);
CREATE INDEX IF NOT EXISTS idx_devis_entreprise_statut ON devis(entreprise_id, statut);
CREATE INDEX IF NOT EXISTS idx_factures_entreprise_statut ON factures(entreprise_id, statut);
