# AGENTS.md — H‑Immo Vitrine

Ce fichier donne les règles à suivre lorsqu’on modifie ce dépôt. Il décrit le rôle réel de la vitrine et l’organisation du code en place. Si l’implémentation évolue, vérifier les fichiers avant de recopier une structure décrite ici.

## 1. Rôle de l’application

H‑Immo Vitrine est l’interface publique de consultation des annonces publiées par H‑Immo. Elle consomme ses routes publiques et affiche les données renvoyées par l’API.

- H‑Immo reste la source de vérité pour les organisations, les biens, les prix, la disponibilité, les publications et les règles métier.
- La vitrine n’a pas de base de données métier et ne duplique pas l’authentification de gestion.
- L’interface ne décide jamais qu’une ressource est publique ou disponible : le serveur fait autorité.
- Ne pas présenter une action comme réussie tant que l’API ne l’a pas confirmée. Le contrat public de création de demandes doit exister avant d’activer leur envoi.

## 2. Vérifications avant toute modification

1. Lire ce fichier et les guides concernés dans `docs/`.
2. Vérifier `git status` et le diff avant de commencer. Préserver les changements présents, même s’ils ne sont pas liés à la tâche.
3. Examiner le code et les usages réels avant de créer, déplacer ou remplacer un fichier.
4. Vérifier le contrat de l’API dans `docs/api-h-immo.md` et dans le backend H‑Immo si nécessaire.
5. Après une modification, exécuter les vérifications pertinentes : `yarn type-check`, `yarn lint`, `yarn build`.
6. Ne créer aucun commit, sauf demande explicite de l’utilisateur.

## 3. Structure de l’application

Le code React est dans `assets/react/`. Il n’y a pas de dossier `src/` ni de backend métier dans ce dépôt.

```text
assets/react/
├── app/                    # démarrage, fournisseurs et composition globale
│   └── theme/              # thème global et son contexte
├── features/               # fonctionnalités indépendantes
│   ├── catalogue/
│   ├── annonces/
│   ├── organisations/
│   └── demandes/
├── components/             # composants réellement partagés entre fonctionnalités
│   ├── UI/
│   ├── Form/
│   ├── Navigation/
│   └── Feedback/
├── hooks/                  # hooks transversaux à l’application
├── services/               # services transversaux, dont device.ts et api/
└── styles/                 # SCSS centralisé
    ├── base/
    ├── components/<famille>/
    ├── pages/
    └── responsive/
```

Vite a sa propre racine sous `assets/app/`. Respecter les alias et la configuration existants au lieu d’introduire un second point d’entrée.

## 4. Frontières entre fonctionnalités

Chaque domaine reste propriétaire de ses pages, composants spécifiques, hooks, services et types. Les dossiers peuvent être ajoutés au besoin, sans créer de fichiers vides pour remplir un modèle.

```text
features/<nom>/
├── pages/       # écrans et composition de la fonctionnalité
├── components/  # éléments employés uniquement par cette fonctionnalité
├── hooks/       # état et interactions propres à cette fonctionnalité
├── services/    # orchestration et accès métier/API propres à cette fonctionnalité
└── types/       # contrats et modèles propres à cette fonctionnalité
```

Créer seulement les sous-dossiers nécessaires. Une fonctionnalité ne doit pas importer l’implémentation interne d’une autre fonctionnalité. Si un besoin est véritablement transversal, déplacer ou créer une API partagée dans `components/`, `hooks/` ou `services/`, avec un rôle clair et des consommateurs identifiés.

Responsabilités des fonctionnalités :

- `catalogue/` : recherche, filtres, tri, pagination d’interface et affichage des résultats publics ; les données et leur périmètre viennent de l’API.
- `annonces/` : présentation détaillée d’une annonce publiée, de ses caractéristiques et de ses photos ; traiter les réponses indiquant qu’elle n’est plus accessible ou disponible.
- `organisations/` : pages et informations de présentation publique renvoyées par H‑Immo.
- `demandes/` : parcours de contact ou de demande, uniquement lorsque l’API confirme qu’un endpoint public adapté existe.

Ne mélangez pas la recherche du catalogue, la présentation de la fiche, le contenu public d’une organisation et la soumission d’une demande dans une page ou un hook géant. Les pages orchestrent leur fonctionnalité ; elles ne deviennent pas un dépôt de logique partagé.

## 5. Réutilisation des composants et des hooks

Avant d’ajouter un composant :

1. Chercher dans `assets/react/components/` et dans la fonctionnalité concernée.
2. Réutiliser le composant existant s’il couvre le même rôle visuel et comportemental. Étendre son API de façon typée si cela reste cohérent.
3. Ne pas copier un composant global dans une feature juste pour modifier légèrement son style ; fournir une variante explicite ou garder un composant local si le comportement est réellement différent.
4. Ne rendre partagé un composant de feature que lorsque plusieurs fonctionnalités ont le même besoin stable. Ne pas créer d’abstraction générique pour supprimer quelques lignes.
5. Garder les composants partagés présentatifs : ne pas leur transférer les règles de recherche, les contrats API ou les décisions propres à une feature.

Les composants React sont en `.tsx`, avec un `index.ts` pour leur export public. Leur comportement réutilisable se trouve dans un hook `.ts` dédié lorsqu’il existe un état, une interaction, une accessibilité ou une logique à isoler. Le hook reste près du composant ou de la feature qui en est propriétaire ; ne pas créer de hook vide ou global sans consommateur réel.

Les hooks globaux de `assets/react/hooks/` sont réservés aux besoins transversaux. La détection d’appareil et ses media queries ont leur source de vérité dans `assets/react/services/device.ts`, utilisée par `useMediaQuery.ts` et `useDevice.ts`. Ne redéfinissez pas les seuils dans chaque feature.

## 6. Services et API

- `assets/react/services/api/` contient le client HTTP commun, sa configuration et les types de transport partagés.
- Une fonctionnalité garde dans son propre `services/` l’orchestration de ses requêtes et les conversions qui ne servent qu’à elle.
- Ne faites pas d’appels HTTP directement dans les composants de présentation.
- Utiliser uniquement les routes publiques documentées ; ne pas envoyer de jeton de gestion et ne pas appeler une route réservée à l’application H‑Immo.
- Construire les query strings avec `URLSearchParams` et encoder chaque segment dynamique de route.
- Traiter les réponses comme des données externes : valider ou normaliser les valeurs nécessaires, gérer les champs absents, les états de chargement et les erreurs.
- Ne pas réimplémenter dans le navigateur la publication, la disponibilité, les permissions, les calculs métier ou l’isolation des organisations.
- Les filtres ou slugs de l’URL servent à la navigation et à la recherche ; ils ne constituent jamais une autorisation.
- Ne pas injecter de HTML fourni par l’API. Afficher les valeurs avec le rendu React normal.
- Les montants restent des chaînes décimales, accompagnés de leur devise. Pas de calcul métier en `float`.

## 7. Styles et responsive

- Tous les styles sont en SCSS dans `assets/react/styles/` ; pas de CSS/SCSS local dans les dossiers de composants ou de features.
- Les styles d’un composant partagé vont dans `styles/components/<famille>/_Nom.scss`, puis sont enregistrés dans l’index de la famille et chargés par `styles/main.scss`.
- Les styles propres à un écran vont dans `styles/pages/` ; les règles responsive partagées restent dans `styles/responsive/`.
- La source TypeScript des media queries est `services/device.ts`. Les seuils SCSS de `styles/base/_breakpoints.scss` doivent rester alignés sur elle.
- Couvrir mobile, tablette, ordinateur et orientations pertinentes. Préserver l’usage clavier, le focus visible, le contraste des deux thèmes et `prefers-reduced-motion`.
- Ne pas modifier un token global pour régler un défaut isolé sans vérifier ses effets sur toutes les fonctionnalités.

## 8. Organisation et lisibilité

- Garder le démarrage, les fournisseurs globaux et le routage dans `app/` ; ne pas y déplacer la logique de catalogue, d’annonce ou de demande.
- Préférer des types explicites et des contrats locaux à un composant ou service rempli de conditions sur le nom des fonctionnalités.
- Ne pas introduire de deuxième client HTTP, de deuxième système de thème, de seuils responsive concurrents ou de copie des données métier.
- N’ajouter une dépendance que pour un besoin concret ; conserver Yarn et mettre à jour le lockfile par Yarn.
- Les secrets ne doivent pas être ajoutés au dépôt ni à une variable `VITE_`, car celle-ci est visible dans le navigateur.
- Documenter les contrats et comportements nouveaux dans le guide concerné. Distinguer clairement ce qui est implémenté de ce qui est seulement prévu.

## 9. Vérification et livraison

Avant de terminer, examiner `git diff` et `git status`, puis lancer selon le changement :

```sh
yarn type-check
yarn lint
yarn build
```

Ne pas déclarer un parcours fonctionnel sur la seule base d’un build. Vérifier les écrans et les cas d’erreur concernés lorsque le navigateur ou les données de test sont disponibles. Signaler les vérifications impossibles et les limites restantes.
