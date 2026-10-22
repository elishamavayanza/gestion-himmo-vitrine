# Feuille de route

Cette liste sépare le socle présent des fonctionnalités à réaliser. Elle ne constitue pas une promesse de livraison ni une description de fonctionnalités déjà disponibles.

## Socle en place

- Application React 19, TypeScript strict et Vite.
- Mise en page publique de démarrage.
- Client HTTP JSON basé sur fetch.
- Variables d’API et proxy local vers Symfony.
- Répertoires de fonctionnalités préparés.
- Commandes de type-check, lint et build.

## Étape 1 — Catalogue public

- Définir les URL de navigation et les états de page.
- Relier la vitrine d’organisation et la liste paginée aux routes publiques existantes.
- Mettre en place les filtres pris en charge par H‑Immo et conserver l’état partageable dans l’URL si cela améliore le parcours.
- Couvrir chargement, liste vide, erreur réseau, organisation non publiée et pagination.

## Étape 2 — Fiche d’annonce

- Charger le détail par slug et UUID.
- Présenter photos, caractéristiques, loyer et devise à partir des champs publics.
- Traiter une annonce devenue indisponible avec la réponse 404.
- Vérifier l’affichage mobile, l’accessibilité des galeries et les informations manquantes.

## Étape 3 — Pages organisation

- Présenter uniquement les coordonnées publiques et les annonces retournées par H‑Immo.
- Définir les comportements lorsqu’un logo ou une description n’existe pas.
- Ne pas permettre au visiteur de modifier les paramètres de publication.

## Étape 4 — Demande de contact

À commencer après la disponibilité d’une route publique côté H‑Immo. Définir contrat, validation, limitation de débit, lutte contre les abus, consentement et conservation des données. Ajouter ensuite le formulaire et ses états de confirmation/erreur.

## Étape 5 — Fiabilité

- Ajouter des tests de contrat client et de parcours critique.
- Ajouter une vérification de rendu responsive et d’accessibilité.
- Documenter la configuration de déploiement retenue et tester les routes frontend de production.

À chaque étape, garder H‑Immo comme source de vérité et exécuter yarn type-check, yarn lint et yarn build.
