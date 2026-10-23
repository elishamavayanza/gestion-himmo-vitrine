# Architecture de H‑Immo Vitrine

## Rôle de cette application

H‑Immo Vitrine est un frontend public séparé. Il consomme les informations publiées par l’API H‑Immo. Il ne possède ni base métier, ni copie des biens, ni logique d’autorisation concurrente.

Flux visé :

    Visiteur → application React → routes publiques H‑Immo → données publiées

H‑Immo décide si une organisation est visible et si une annonce est publiée et disponible. La vitrine présente le résultat fourni par le serveur.

## État du code

Le dépôt contient une entrée React/Vite, une navigation publique, un client HTTP basé sur fetch, une configuration de proxy locale et des parcours connectés aux routes publiques H‑Immo : présentation d’organisation, catalogue global paginé et filtré, catalogue par organisation, détail d’annonce et transmission d’une demande client. L’accueil affiche immédiatement les annonces publiques globales, sans filtre préalable ; le visiteur peut ensuite affiner sa recherche ou ouvrir la vitrine d’une organisation.

React Router gère les routes de l’interface et TanStack Query le chargement, la mise en cache et l’annulation des requêtes de lecture.

## Structure

    assets/react/
      app/                 initialisation et composition
      features/
        catalogue/         recherche et liste d’annonces
        annonces/          détail d’une annonce
        organisations/     accueil public par organisation
        demandes/           demande publique d’information ou de visite
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
- Demandes : transmettre une demande liée à l’unité par la route publique H‑Immo ; afficher le succès uniquement après confirmation du serveur. Ce parcours ne réserve pas le bien.
- Services API : seul endroit où centraliser le transport HTTP, les paramètres et l’interprétation commune des erreurs.
- Composants partagés : éléments visuels communs et simples, sans y déplacer les règles de filtrage ou d’accès propres à une fonctionnalité.

## Routes d’interface envisagées

Routes frontend implémentées ou prévues :

- / : accueil ou catalogue public
- /annonces : catalogue public global, paginé et filtrable
- /organisations/:slug : présentation d’une organisation et ses annonces
- /organisations/:slug/annonces/:uuid : détail d’une annonce
- Le formulaire de demande est intégré à la fiche `/organisations/:slug/annonces/:uuid`.

Ces URL de navigateur ne sont pas les routes backend. Le backend actuel est décrit dans docs/api-h-immo.md.

## Données et état

Les données de référence sont chargées depuis H‑Immo. Les filtres dans l’URL peuvent représenter une recherche partageable ; ils ne doivent jamais être utilisés comme preuve d’autorisation. Les états de cache, de chargement et d’erreur restent des détails d’interface.

Ne pas mettre en cache une disponibilité au-delà de ce que l’API garantit. Lorsqu’un utilisateur ouvre une annonce, le serveur doit être consulté pour vérifier qu’elle est encore visible.

## Déploiement

En développement, Vite transmet /api vers HIMMO_API_URL. En production, préférer une URL d’API de même origine ou un proxy/reverse proxy configuré explicitement. Le navigateur ne peut pas utiliser le proxy de développement Vite après compilation.


Le thème et les composants visuels de base sont décrits dans [Système visuel](design-system.md). Ils sont propres à la vitrine et limités aux besoins de catalogue public.
