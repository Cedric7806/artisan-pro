# Artisan Pro

MVP SaaS de gestion d'activité pour artisans et PME de services à domicile en France.

## Prérequis

- Node.js 22+
- pnpm
- PostgreSQL 16+

Il peut tourner en local, sur un VPS, ou chez un hébergeur Node/Docker classique.

## Démarrage local

1. Copier l'environnement :

```bash
cp .env.example .env
```

2. Démarrer PostgreSQL avec Docker :

```bash
docker compose up -d db
```

3. Installer les dépendances :

```bash
pnpm install
```

4. Créer le schéma PostgreSQL :

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

L'application est disponible sur `http://localhost:3000`.

Compte de démonstration :

- Email : `demo@artisanpro.fr`
- Mot de passe : `motdepasse`

## Démarrage avec Docker

Pour lancer PostgreSQL et l'application ensemble :

```bash
docker compose up --build
```

Dans un autre terminal, appliquer le schéma et les données de démonstration depuis la machine hôte :

```bash
pnpm db:schema
pnpm db:seed
```

Pour un serveur de production, définir une vraie variable `DATABASE_URL` vers PostgreSQL managé ou auto-hébergé, puis lancer :

```bash
pnpm build
pnpm start
```

## Déploiement conseillé

Options simples :

- VPS avec Docker Compose
- Render, Fly.io, Railway, Scalingo ou Clever Cloud
- PostgreSQL managé type Neon, Supabase, Crunchy Bridge ou base fournie par l'hébergeur

Variables d'environnement nécessaires :

```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Notes France

Les devis et factures incluent les champs nécessaires aux mentions françaises : SIRET, TVA, dates, numérotation, pénalités de retard, indemnité forfaitaire de recouvrement, échéance, escompte, adresse de prestation et préparation Factur-X / PDP.
