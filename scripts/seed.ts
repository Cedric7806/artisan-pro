import bcrypt from "bcryptjs";
import { Client } from "pg";

const colors = ["#059669", "#2563eb", "#d97706", "#7c3aed"];

function cents(amount: number) {
  return Math.round(amount * 100);
}

function line(designation: string, quantite: number, unite: string, prix: number, tvaBps = 2000) {
  const totalHt = cents(quantite * prix);
  const totalTva = Math.round((totalHt * tvaBps) / 10000);
  return {
    designation,
    quantite,
    unite,
    prix_unitaire_ht_cents: cents(prix),
    taux_tva_bps: tvaBps,
    total_ht_cents: totalHt,
    total_tva_cents: totalTva,
    total_ttc_cents: totalHt + totalTva
  };
}

async function insertCompany(client: Client, data: Record<string, unknown>) {
  const result = await client.query(
    `INSERT INTO entreprises (
      nom_commercial, raison_sociale, forme_juridique, capital_social_cents, siren, siret,
      numero_tva, adresse_ligne1, code_postal, ville, telephone, email, iban, bic,
      regime_tva, taux_penalites_retard, delai_paiement_jours
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING *`,
    [
      data.nom_commercial,
      data.raison_sociale,
      data.forme_juridique,
      data.capital_social_cents,
      data.siren,
      data.siret,
      data.numero_tva,
      data.adresse_ligne1,
      data.code_postal,
      data.ville,
      data.telephone,
      data.email,
      data.iban,
      data.bic,
      data.regime_tva,
      data.taux_penalites_retard,
      data.delai_paiement_jours
    ]
  );
  return result.rows[0];
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL est requis pour charger les donnees de demonstration.");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query("BEGIN");
  await client.query("TRUNCATE documents_pdf, paiements, interventions, lignes_facture, factures, lignes_devis, devis, clients, techniciens, sessions, utilisateurs, entreprises RESTART IDENTITY CASCADE");

  const companies = [
    {
      nom_commercial: "Martin Plomberie",
      raison_sociale: "MARTIN PLOMBERIE SARL",
      forme_juridique: "SARL",
      capital_social_cents: cents(12000),
      siren: "812345678",
      siret: "81234567800019",
      numero_tva: "FR12812345678",
      adresse_ligne1: "18 rue des Artisans",
      code_postal: "69003",
      ville: "Lyon",
      telephone: "04 72 34 56 78",
      email: "contact@martin-plomberie.fr",
      iban: "FR7612345987650123456789014",
      bic: "AGRIFRPP",
      regime_tva: "reel",
      taux_penalites_retard: 12,
      delai_paiement_jours: 30
    },
    {
      nom_commercial: "Elec Atlantique",
      raison_sociale: "ELEC ATLANTIQUE SAS",
      forme_juridique: "SAS",
      capital_social_cents: cents(20000),
      siren: "823456789",
      siret: "82345678900024",
      numero_tva: "FR23823456789",
      adresse_ligne1: "7 avenue de la Gare",
      code_postal: "44000",
      ville: "Nantes",
      telephone: "02 40 11 22 33",
      email: "bonjour@elec-atlantique.fr",
      iban: "FR7611111222233334444555566",
      bic: "BNPAFRPP",
      regime_tva: "reel",
      taux_penalites_retard: 10,
      delai_paiement_jours: 30
    },
    {
      nom_commercial: "Jardin & Cloture",
      raison_sociale: "JARDIN ET CLOTURE EURL",
      forme_juridique: "EURL",
      capital_social_cents: cents(6000),
      siren: "834567890",
      siret: "83456789000017",
      numero_tva: "FR34834567890",
      adresse_ligne1: "3 chemin des Peupliers",
      code_postal: "31000",
      ville: "Toulouse",
      telephone: "05 61 24 68 10",
      email: "contact@jardinetcloture.fr",
      iban: "FR7622222333344445555666677",
      bic: "SOGEFRPP",
      regime_tva: "reel",
      taux_penalites_retard: 11,
      delai_paiement_jours: 30
    },
    {
      nom_commercial: "Nettoyage Lumiere",
      raison_sociale: "NETTOYAGE LUMIERE SASU",
      forme_juridique: "SASU",
      capital_social_cents: cents(4000),
      siren: "845678901",
      siret: "84567890100031",
      numero_tva: "FR45845678901",
      adresse_ligne1: "22 boulevard Voltaire",
      code_postal: "75011",
      ville: "Paris",
      telephone: "01 48 55 66 77",
      email: "contact@nettoyage-lumiere.fr",
      iban: "FR7633333444455556666777788",
      bic: "CMCIFRPP",
      regime_tva: "reel",
      taux_penalites_retard: 12,
      delai_paiement_jours: 30
    }
  ];

  const inserted = [];
  for (const company of companies) {
    inserted.push(await insertCompany(client, company));
  }

  const hash = await bcrypt.hash("motdepasse", 10);
  await client.query(
    "INSERT INTO utilisateurs (entreprise_id, nom, email, mot_de_passe_hash, role) VALUES ($1,$2,$3,$4,'gerant')",
    [inserted[0].id, "Claire Martin", "demo@artisanpro.fr", hash]
  );

  for (const [companyIndex, company] of inserted.entries()) {
    const techs = ["Karim Benali", "Sophie Leroy", "Thomas Vidal"].slice(0, companyIndex === 0 ? 3 : 2);
    const techRows = [];
    for (const [index, name] of techs.entries()) {
      const result = await client.query(
        "INSERT INTO techniciens (entreprise_id, nom, telephone, email, couleur_planning) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [company.id, name, `06 12 34 5${index} 0${index}`, `${name.toLowerCase().replaceAll(" ", ".")}@demo.fr`, colors[index]]
      );
      techRows.push(result.rows[0]);
    }

    const clientRows = [];
    const demoClients = [
      ["particulier", "Mme Dupont", null, "13 rue Garibaldi", "69006", "Lyon", "06 45 12 78 90"],
      ["professionnel", "Cabinet Les Cedres", "SCI LES CEDRES", "4 place Bellecour", "69002", "Lyon", "04 78 12 09 34"],
      ["particulier", "M. Laurent Petit", null, "29 cours Lafayette", "69003", "Lyon", "06 20 30 40 50"]
    ];
    for (const row of demoClients) {
      const result = await client.query(
        `INSERT INTO clients (
          entreprise_id, type_client, nom, raison_sociale, email, telephone, adresse_ligne1, code_postal, ville, notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [company.id, row[0], row[1], row[2], `${String(row[1]).toLowerCase().replaceAll(" ", ".").replace("mme.", "mme").replace("m.", "m")}@exemple.fr`, row[6], row[3], row[4], row[5], "Client de demonstration"]
      );
      clientRows.push(result.rows[0]);
    }

    const devisLines = [
      line("Recherche de fuite et diagnostic", 1, "forfait", 145, 1000),
      line("Remplacement robinet thermostatique", 2, "piece", 89, 1000),
      line("Main d'oeuvre qualifiee", 2.5, "heure", 58, 1000)
    ];
    const totalHt = devisLines.reduce((sum, item) => sum + item.total_ht_cents, 0);
    const totalTva = devisLines.reduce((sum, item) => sum + item.total_tva_cents, 0);
    const quote = await client.query(
      `INSERT INTO devis (
        entreprise_id, client_id, numero, statut, date_emission, date_validite, lieu_execution,
        description_travaux, total_ht_cents, total_tva_cents, total_ttc_cents,
        snapshot_entreprise_json, snapshot_client_json
      ) VALUES ($1,$2,$3,$4,CURRENT_DATE,CURRENT_DATE + INTERVAL '30 days',$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        company.id,
        clientRows[0].id,
        `DEV-2026-${String(companyIndex + 1).padStart(3, "0")}`,
        companyIndex === 0 ? "accepte" : "envoye",
        `${clientRows[0].adresse_ligne1}, ${clientRows[0].code_postal} ${clientRows[0].ville}`,
        "Intervention plomberie avec fourniture et pose.",
        totalHt,
        totalTva,
        totalHt + totalTva,
        company,
        clientRows[0]
      ]
    );
    for (const [index, item] of devisLines.entries()) {
      await client.query(
        `INSERT INTO lignes_devis (
          devis_id, ordre, designation, quantite, unite, prix_unitaire_ht_cents,
          taux_tva_bps, total_ht_cents, total_tva_cents, total_ttc_cents
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [quote.rows[0].id, index + 1, item.designation, item.quantite, item.unite, item.prix_unitaire_ht_cents, item.taux_tva_bps, item.total_ht_cents, item.total_tva_cents, item.total_ttc_cents]
      );
    }

    let invoiceId = null;
    if (companyIndex === 0) {
      const invoice = await client.query(
        `INSERT INTO factures (
          entreprise_id, client_id, devis_id, numero, statut, date_emission, date_prestation, date_echeance,
          total_ht_cents, total_tva_cents, total_ttc_cents, conditions_escompte, taux_penalites_retard,
          indemnite_recouvrement_cents, adresse_livraison_ou_service_json, snapshot_entreprise_json, snapshot_client_json,
          electronic_metadata_json
        ) VALUES ($1,$2,$3,$4,'emise',CURRENT_DATE,CURRENT_DATE,CURRENT_DATE + INTERVAL '30 days',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING *`,
        [
          company.id,
          clientRows[0].id,
          quote.rows[0].id,
          "FAC-2026-001",
          totalHt,
          totalTva,
          totalHt + totalTva,
          company.conditions_escompte,
          company.taux_penalites_retard,
          company.indemnite_recouvrement_cents,
          { adresse: `${clientRows[0].adresse_ligne1}, ${clientRows[0].code_postal} ${clientRows[0].ville}` },
          company,
          clientRows[0],
          { profil: "Factur-X EN16931", pdp: "a_prevoir" }
        ]
      );
      invoiceId = invoice.rows[0].id;
      for (const [index, item] of devisLines.entries()) {
        await client.query(
          `INSERT INTO lignes_facture (
            facture_id, ordre, designation, quantite, unite, prix_unitaire_ht_cents,
            taux_tva_bps, total_ht_cents, total_tva_cents, total_ttc_cents
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [invoiceId, index + 1, item.designation, item.quantite, item.unite, item.prix_unitaire_ht_cents, item.taux_tva_bps, item.total_ht_cents, item.total_tva_cents, item.total_ttc_cents]
        );
      }
    }

    const today = new Date();
    const entries = [
      ["Depannage fuite cuisine", "planifiee", 1, 9, 11],
      ["Entretien chaudiere annuel", "en_cours", 2, 14, 16],
      ["Visite avant devis salle de bain", "a_planifier", 3, null, null],
      ["Remise en service apres travaux", "terminee", -2, 10, 12]
    ];
    for (const [index, entry] of entries.entries()) {
      const start = new Date(today);
      start.setDate(today.getDate() + Number(entry[2]));
      start.setHours(Number(entry[3] ?? 8), 0, 0, 0);
      const end = new Date(start);
      end.setHours(Number(entry[4] ?? 9), 0, 0, 0);
      await client.query(
        `INSERT INTO interventions (
          entreprise_id, client_id, technicien_id, titre, description,
          adresse_intervention_ligne1, code_postal, ville, date_debut, date_fin, statut, devis_id, facture_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          company.id,
          clientRows[index % clientRows.length].id,
          techRows[index % techRows.length]?.id ?? null,
          entry[0],
          "Intervention de demonstration pour tester le planning et le suivi client.",
          clientRows[index % clientRows.length].adresse_ligne1,
          clientRows[index % clientRows.length].code_postal,
          clientRows[index % clientRows.length].ville,
          entry[3] === null ? null : start,
          entry[4] === null ? null : end,
          entry[1],
          quote.rows[0].id,
          invoiceId
        ]
      );
    }
  }

  await client.query("COMMIT");
  await client.end();
  console.log("Donnees de demonstration chargees. Connexion: demo@artisanpro.fr / motdepasse");
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
