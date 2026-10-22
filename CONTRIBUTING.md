# Contribuer à H‑Immo Vitrine

Ce guide décrit les conventions du dépôt actuel. H‑Immo Vitrine est un client web public de l’API Symfony H‑Immo ; les règles métier, l’authentification de gestion et la persistance restent dans le projet H‑Immo.

## Avant de modifier

1. Lire README.md et les guides pertinents dans docs/.
2. Vérifier le statut Git et préserver les changements déjà présents.
3. Lire la fonctionnalité concernée et le contrat de l’API avant de changer son comportement.
4. Vérifier que le besoin appartient bien à la vitrine. Un changement de publication, de disponibilité, de prix ou d’autorisation relève du backend H‑Immo.

## Organisation du code

- Démarrage et composition de l’application : assets/react/app.
- Fonctionnalités autonomes : assets/react/features/nom-de-fonctionnalite.
- Composants React : assets/react/components, classés par UI, Form, Navigation et Feedback ; chaque composant a un fichier .tsx et un index.ts.
- Styles : assets/react/styles, centralisés dans base/, components/famille/ et pages/. Les composants ne contiennent pas de fichier CSS ou SCSS.
- Détection d’appareil et media queries : assets/react/services/device.ts est la source de vérité, consommée par les hooks globaux assets/react/hooks/useMediaQuery.ts et useDevice.ts.
- Responsive visuel : assets/react/styles/responsive, séparé par mobile, tablette, ordinateur, portrait et paysage ; base/_breakpoints.scss reprend les mêmes seuils Sass et doit rester synchronisé avec le service TypeScript.
- Accès HTTP et contrats de transport : assets/react/services/api.

Garder la recherche, les détails d’annonce, les pages organisation et les demandes dans leurs fonctionnalités respectives. Extraire un composant partagé lorsqu’il a un rôle de présentation commun et stable ; éviter les abstractions génériques qui ajoutent des conditions sans clarifier le code.

Ne pas créer une seconde source de données ou de logique métier dans le navigateur. Ne pas ajouter de base de données à ce dépôt.

## TypeScript et interface

- Respecter le mode strict de TypeScript et typer les données reçues de l’API.
- Traiter les réponses réseau comme des données externes : gérer les erreurs, les valeurs nulles et les états de chargement.
- Garder les montants en chaînes décimales et afficher la devise reçue. Ne pas convertir les montants en nombres flottants pour les calculs métier.
- Concevoir les vues pour mobile, tablette et ordinateur.
- Utiliser des libellés explicites, une navigation clavier, un focus visible et des alternatives textuelles pour les images utiles.
- Afficher les données distantes comme du texte React ; ne pas injecter du HTML reçu depuis l’API.
- Ne pas ajouter de secret dans le code ou dans une variable VITE_.

## API

- Utiliser les routes publiques documentées dans docs/api-h-immo.md.
- Centraliser les appels réseau dans assets/react/services/api.
- Construire les paramètres avec URLSearchParams et encoder chaque segment d’URL dynamique.
- Ne pas envoyer de jeton de gestion ni appeler une route de gestion depuis la vitrine.
- Ne pas créer un formulaire qui prétend enregistrer une demande tant qu’un endpoint H‑Immo public, validé et protégé contre les abus n’existe pas.
- En cas de changement du contrat, documenter les champs, les statuts et les erreurs. Les vérifications d’organisation, de publication et de disponibilité doivent rester côté serveur.

## Vérification avant livraison

Exécuter les vérifications pertinentes après les changements :

    yarn type-check
    yarn lint
    yarn build

Aucun framework de test n’est encore configuré. Ajouter des tests avec une fonctionnalité réelle et choisir une solution cohérente avant d’en faire une dépendance de production.

## Changements de dépendances

Limiter les dépendances aux besoins concrets. Toute dépendance ajoutée doit être justifiée dans la revue, ajoutée avec Yarn et conservée dans yarn.lock. Ne pas éditer le fichier de verrouillage à la main.

## Documentation

Mettre à jour les guides lorsque la structure, les commandes, les variables de configuration ou les contrats d’API changent. Distinguer les fonctionnalités déjà disponibles des propositions et du travail restant.
