# H‑Immo Vitrine

Application web publique destinée aux personnes qui recherchent un logement ou un local. Elle présentera les annonces publiées dans H‑Immo et, après mise en place du contrat serveur correspondant, permettra d’envoyer une demande à l’organisation.

H‑Immo reste la source de vérité pour les organisations, les biens, leur disponibilité, les loyers et les publications. Cette vitrine ne possède pas de base de données métier.

## État actuel

Le dépôt contient une vitrine React/Vite/TypeScript connectée aux routes publiques H‑Immo de présentation d’organisation, de catalogue paginé et de détail d’annonce. Le catalogue est actuellement consultable par slug d’organisation. La recherche multi-organisation, l’annuaire global et l’envoi de demandes restent à construire avec des endpoints backend dédiés.

L’API H‑Immo possède déjà des routes publiques de consultation pour une vitrine d’organisation et ses annonces. Il n’existe pas encore de route publique de création de demande client. La documentation décrit donc le contrat disponible et marque explicitement les parcours à venir.

## Technologies

- React 19 et TypeScript strict
- Vite 8
- React Router et TanStack Query sont installés pour les besoins des fonctionnalités à venir ; le squelette actuel ne les utilise pas encore.
- Yarn et un fichier de verrouillage yarn.lock

## Démarrage local

Pré-requis : Node.js compatible avec Vite 8 et Yarn. Utiliser le fichier yarn.lock pour conserver les mêmes versions de dépendances.

    yarn install
    cp .env.example .env.local
    yarn dev

Le serveur Vite écoute sur 127.0.0.1:5174. Son proxy transmet les requêtes /api au serveur Symfony défini par HIMMO_API_URL, par défaut http://127.0.0.1:8000.

## Vérifications disponibles

    yarn type-check
    yarn lint
    yarn build

Il n’y a pas encore de framework de tests automatisés configuré. Voir tests/README.md.

## Configuration

- VITE_HIMMO_API_BASE_URL est l’adresse utilisée par le navigateur. Sa valeur locale conseillée est /api.
- HIMMO_API_URL configure uniquement la destination du proxy de développement Vite.

Les variables préfixées VITE_ sont intégrées au bundle et visibles par les visiteurs. Elles ne doivent jamais contenir de secret. Les détails sont dans docs/configuration.md.

## Structure

    assets/react/
      app/                 démarrage et composition de l’application
      features/
        catalogue/         recherche, filtres et résultats
        annonces/          fiche d’une annonce
        organisations/     présentation publique d’une organisation
        demandes/           futur parcours de contact/demande
      components/           composants TSX avec index.ts, classés par famille
      services/api/         client HTTP et configuration API
      styles/               SCSS centralisé : base/, components/ et pages/
    public/                 ressources statiques
    tests/                  vérifications automatisées à venir
    docs/                   architecture, API, configuration, sécurité et feuille de route

Le code React vit dans assets/react ; il n’y a pas de dossier src/. L’alias TypeScript/Vite @ pointe vers assets/react.

## Guides

- [Architecture](docs/architecture.md)
- [Système visuel et composants](docs/design-system.md)
- [Contrat de l’API H‑Immo](docs/api-h-immo.md)
- [Configuration et déploiement](docs/configuration.md)
- [Sécurité et données personnelles](docs/securite.md)
- [Feuille de route](docs/feuille-de-route.md)
- [Contribution](CONTRIBUTING.md)

## Principes

- Ne pas recopier la base de données ni les règles métier de H‑Immo.
- N’afficher que les informations renvoyées par les routes publiques.
- Ne jamais considérer l’interface comme une frontière d’autorisation.
- Ne pas présenter un parcours comme disponible avant que l’API et l’interface soient toutes deux implémentées.
