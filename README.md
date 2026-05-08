# Prospect

Prospect est un cockpit SaaS de lead generation et qualification pour le marché Airbnb, conciergeries et locations courte durée.

## Fonctionnalités V1

- Dashboard premium avec KPI, radar de leads et pipeline.
- Recherche multi-source mockée par ville, cible, volume et niveau d'agressivité.
- Campagnes avec détail, paramètres, prospects associés et statut.
- Base prospects avec scoring, signaux de douleur, données publiques et statut CRM.
- Fiche lead intelligence avec résumé IA, objections, opportunités, next best action et messages d'outreach.
- Mini CRM drag-and-drop côté client.
- Prospect Web Scanner avec runs, sources, insights, enrichissement prospect et rapport Concierge IA mocké.
- Pages intégrations, exports, settings et conformité.
- API routes mockées prêtes pour futurs connecteurs.
- Export CSV des prospects.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Framer Motion
- lucide-react
- Services mockés pour IA et web research

## Installation

```bash
npm install
npm run dev
```

Ouvre ensuite `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

## Routes principales

- `/login`
- `/dashboard`
- `/search`
- `/campaigns`
- `/campaigns/[id]`
- `/prospects`
- `/prospects/[id]`
- `/crm`
- `/scanner`
- `/scanner/new`
- `/scanner/runs`
- `/scanner/runs/[id]`
- `/scanner/sources`
- `/scanner/insights`
- `/scanner/settings`
- `/intelligence`
- `/settings`
- `/integrations`
- `/exports`

## API routes mockées

- `GET /api/dashboard`
- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/campaigns/[id]`
- `POST /api/search/run`
- `GET /api/prospects`
- `GET /api/prospects/[id]`
- `POST /api/prospects/[id]`
- `POST /api/prospects/analyze`
- `POST /api/outreach/generate`
- `GET /api/integrations`
- `GET /api/export/prospects.csv`
- `GET /api/scanner/runs`
- `POST /api/scanner/runs`
- `GET /api/scanner/runs/[id]`
- `POST /api/scanner/runs/[id]/start`
- `POST /api/scanner/runs/[id]/cancel`
- `GET /api/scanner/runs/[id]/sources`
- `GET /api/scanner/runs/[id]/insights`
- `POST /api/scanner/analyze-source`
- `POST /api/scanner/enrich-prospect`
- `POST /api/scanner/generate-report`
- `GET /api/scanner/insights`
- `PATCH /api/prospects/[id]/scanner-context`

## Prospect Web Scanner

Le scanner V1 est volontairement mocké et interne. Il simule des connecteurs publics, normalise des sources, détecte des pain points, infère le contexte logement/géographie, enrichit les prospects et prépare une configuration de futur espace Concierge IA.

Principes :

- Priorité aux API internes, services internes, mocks et cache applicatif.
- Aucune API externe appelée directement depuis l'interface.
- Les connecteurs externes futurs doivent passer par `lib/services/sourceConnectors.ts`.
- Les sources doivent rester publiques, utiles, traçables et conformes RGPD.
- Reddit, Google Search, Maps, Apify ou Playwright restent des connecteurs optionnels derrière adaptateur.

## Variables d'environnement

Copie `.env.example` vers `.env.local` et remplis uniquement les clés nécessaires.

```bash
cp .env.example .env.local
```

## Conformité et limites

Prospect V1 fonctionne avec des données mockées. En production, les connecteurs doivent uniquement utiliser des sources publiques ou autorisées, respecter le RGPD, les conditions d'utilisation des plateformes, les limites de volume et ne jamais stocker de données sensibles sans base légale claire.

## Architecture

```text
app/                  Pages App Router et API routes
components/           UI réutilisable et composants produit
components/ui/        Button, Card, Badge, Input
lib/types.ts          Types métier
lib/mock-data.ts      Données démo réalistes
lib/scanner-mock-data.ts Données scanner, sources, insights, contextes et rapports
lib/services/         Services IA et web research mockés
lib/utils.ts          Helpers UI et formatage
```
