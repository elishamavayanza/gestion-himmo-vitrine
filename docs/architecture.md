# Architecture de H‑Immo Vitrine

## Rôle de cette application

H‑Immo Vitrine est un frontend public séparé. Il consomme les informations publiées par l’API H‑Immo. Il ne possède ni base métier, ni copie des biens, ni logique d’autorisation concurrente.

Flux visé :

    Visiteur → application React → routes publiques H‑Immo → données publiées

H‑Immo décide si une organisation est visible et si une annonce est publiée et disponible. La vitrine présente le résultat fourni par le serveur.

## État du code

Le dépôt a déjà une entrée React/Vite, une page d’accueil de démarrage, des styles partagés, un client HTTP basé sur fetch et une configuration de proxy locale. Les répertoires catalogue, annonces, organisations et demandes sont préparés ; ils ne signifient pas que ces parcours sont déjà terminés.

React Router et TanStack Query figurent dans les dépendances, mais ne sont pas encore branchés au squelette. Les routes UI proposées ci-dessous sont des conventions de navigation possibles, pas des pages actuellement garanties.

## Structure

    assets/react/
      app/                 initialisation et composition
      features/
        catalogue/         recherche et liste d’annonces
        annonces/          détail d’une annonce
        organisations/     accueil public par organisation
        demandes/           demande de contact, après création de l’API
      components/           présentation réutilisable entre fonctionnalités
      services/api/         configuration, client HTTP et types de transport
      styles/               styles globaux
    public/                 fichiers statiques publiés tels quels
    tests/                  vérifications automatisées
    docs/                   documentation du projet

Vite utilise assets/app comme racine et l’alias @ désigne assets/react.

## Responsabilités par fonctionnalité

- Catalogue : paramètres de recherche, filtres et état de pagination côté interface ; les résultats et le périmètre proviennent de l’API.
- Annonces : rendu des informations et photos fournies par H‑Immo. Une annonce disparue ou non disponible doit être traitée comme telle, même si un lien ancien existe.
- Organisations : affichage des champs de présentation publique retournés par le serveur.
- Demandes : formulaire à réaliser uniquement après définition d’une route publique côté H‑Immo. La vitrine ne doit pas enregistrer localement ni laisser croire qu’une demande a été transmise si le serveur ne l’a pas confirmée.
- Services API : seul endroit où centraliser le transport HTTP, les paramètres et l’interprétation commune des erreurs.
- Composants partagés : éléments visuels communs et simples, sans y déplacer les règles de filtrage ou d’accès propres à une fonctionnalité.

## Routes d’interface envisagées

Les chemins suivants sont une proposition de routage frontend à valider pendant l’implémentation :

- / : accueil ou catalogue public
- /organisations/:slug : présentation d’une organisation et ses annonces
- /organisations/:slug/annonces/:uuid : détail d’une annonce
- /organisations/:slug/annonces/:uuid/demande : futur formulaire, après disponibilité du contrat API

Ces URL de navigateur ne sont pas les routes backend. Le backend actuel est décrit dans docs/api-h-immo.md.

## Données et état

Les données de référence sont chargées depuis H‑Immo. Les filtres dans l’URL peuvent représenter une recherche partageable ; ils ne doivent jamais être utilisés comme preuve d’autorisation. Les états de cache, de chargement et d’erreur restent des détails d’interface.

Ne pas mettre en cache une disponibilité au-delà de ce que l’API garantit. Lorsqu’un utilisateur ouvre une annonce, le serveur doit être consulté pour vérifier qu’elle est encore visible.

## Déploiement

En développement, Vite transmet /api vers HIMMO_API_URL. En production, préférer une URL d’API de même origine ou un proxy/reverse proxy configuré explicitement. Le navigateur ne peut pas utiliser le proxy de développement Vite après compilation.


Le thème et les composants visuels de base sont décrits dans [Système visuel](design-system.md). Ils sont propres à la vitrine et limités aux besoins de catalogue public.
