# Artisan Pro

MVP SaaS de gestion d'activité pour artisans et PME de services à domicile en France.

## Démarrage

1. Créer une base PostgreSQL et définir `DATABASE_URL`.
2. Copier `.env.example` vers `.env` et renseigner la connexion PostgreSQL.
3. Installer les dépendances :

```bash
pnpm install
```

4. Créer le schéma :

```bash
pnpm db:schema
```

5. Charger les données de démonstration :

```bash
pnpm db:seed
```

6. Lancer l'application :

```bash
pnpm dev
```

Compte de démonstration :

- Email : `demo@artisanpro.fr`
- Mot de passe : `motdepasse`

## Notes France

Les devis et factures incluent les champs nécessaires aux mentions françaises : SIRET, TVA, dates, numérotation, pénalités de retard, indemnité forfaitaire de recouvrement, échéance, escompte, adresse de prestation et préparation Factur-X / PDP.
