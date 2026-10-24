# API publique H‑Immo

Ce document décrit les routes vérifiées dans le contrôleur PublicShowcase de H‑Immo. Elles sont publiques et ne demandent pas de jeton. Elles ne donnent accès qu’aux champs de vitrine et d’annonces publiés.

Base locale via Vite : /api, relayée vers Symfony. Les routes backend elles-mêmes commencent par /api/public.

## Enveloppe

Les réponses métier utilisent l’enveloppe Feedback :

    {
      "flush": "…",
      "flushDescription": "…",
      "status": 200,
      "errors": {},
      "warnings": {},
      "data": {}
    }

Les champs de données sont dans data. Une erreur HTTP peut aussi être rendue sous forme d’un objet d’erreur API ; le client doit utiliser le code HTTP et traiter prudemment les réponses qui ne sont pas du JSON.

## Présentation d’une organisation

    GET /api/public/organizations/{slug}/showcase

Retourne data avec les champs publics suivants :

- name : nom de l’organisation
- logo : URL ou null
- description : texte ou null
- address, city, country : coordonnées de présentation, chacune nullable
- email et phone : coordonnées publiques
- availableUnitsCount : nombre d’unités actuellement disponibles

Une organisation inconnue ou dont la vitrine n’est pas publiée renvoie 404.

## Liste d’annonces

    GET /api/public/organizations/{slug}/listings

Paramètres facultatifs :

| Paramètre | Type et sens |
| --- | --- |
| city | code de ville |
| type | valeurs de `UnitType` : apartment, house, shop, office, restaurant, room, warehouse, workshop, storage, parking ou other |
| bedrooms | nombre minimum de chambres |
| offerType | `rent` (location), `sale` (vente), ou absent pour les deux |
| minPrice, maxPrice | bornes de prix décimal, à utiliser avec une devise |
| minRent, maxRent | anciens alias des bornes de loyer ; conservés pour compatibilité |
| currency | USD ou CDF |
| page | page indexée à partir de 1, valeur par défaut 1 |
| limit | taille de page, valeur par défaut 20, maximum 100 |

La réponse place dans data un objet avec items, total, page et pages. Chaque élément expose :

- unitId et listingId : UUID publics de l’unité et de l’annonce
- title, offerType (`rent` ou `sale`), price et currency : données commerciales de l’annonce
- reference, type, floor, description
- monthlyRent : alias décimal historique du prix de location, `null` pour une vente
- surface, bedrooms, rooms, bathrooms
- city, buildingName
- photos : tableau de url et position

L’API limite les résultats à l’organisation demandée, aux unités publiées et sans bail actif. Une annonce louée est retirée automatiquement des résultats. Un code de ville inconnu ou inactif produit zéro résultat. Les bornes de prix exigent une devise ; sans type d’offre elles s’appliquent aux offres de cette devise, et avec `offerType` elles sont limitées à ce type. Les paramètres de filtre ne sont pas une garantie de disponibilité.

## Détail d’une annonce

    GET /api/public/organizations/{slug}/listings/{uuid}

Retourne la même représentation publique de l’annonce. 404 signifie notamment que l’organisation ou l’annonce est inconnue, masquée, non publiée, occupée, ou que l’annonce n’appartient pas à cette organisation. Le frontend ne doit pas tenter d’en déduire la raison ni exposer l’existence d’autres ressources.

## Demandes client

Le contrat de demande client est décrit plus bas dans cette page. La demande publique concerne une annonce précise et ne réserve pas le bien, ne crée pas de bail et ne change pas sa disponibilité.

## Règles d’intégration

- N’utiliser que les champs publics documentés.
- Construire les filtres avec URLSearchParams ; encoder slug et UUID dans les segments d’URL.
- Respecter le code HTTP : 404 n’est pas une liste vide si l’organisation ou l’annonce n’existe pas.
- Les valeurs de l’API sont externes : prévoir absence de photos, textes facultatifs, résultats vides et erreurs réseau.
- Garder les montants décimaux comme chaînes et afficher la devise fournie.


## Catalogue public global

    GET /api/public/listings

Cette route alimente l’accueil de MaVitrine et la page `/annonces` sans demander de code d’agence. Les paramètres de recherche sont facultatifs :

| Paramètre | Type et sens |
| --- | --- |
| type | type d’unité parmi les valeurs documentées plus haut |
| bedrooms | nombre minimum de chambres |
| offerType | `rent` (location) ou `sale` (vente) |
| minPrice, maxPrice | bornes décimales utilisées avec une devise |
| currency | USD ou CDF |
| page | page indexée à partir de 1 |
| limit | taille de page, maximum 100 |

La réponse `data` utilise la pagination habituelle (`items`, `total`, `page`, `pages`). Chaque élément contient `organizationSlug`, `organizationName` et `listing`, dont les champs correspondent à `PublicListingResponse`. Le détail reste rattaché à la vitrine de l’agence : `/organisations/{organizationSlug}/annonces/{unitId}`.

Le serveur borne la requête aux organisations actives, visibles et dont la vitrine est activée, aux villes actives, aux annonces publiées et aux unités encore disponibles sans bail actif. La requête exclut également les ressources supprimées logiquement et les unités supplémentaires des baux actifs. Aucun filtrage client ne remplace ces contrôles. Le catalogue public de l’accueil est chargé immédiatement sans filtre préalable ; les catégories et la page `/annonces` servent ensuite à affiner la recherche.

Le workflow d’annonce fournit un type d’offre, un prix et une devise pour les locations comme pour les ventes. MaVitrine affiche ces champs et ne présente pas un prix de vente comme un loyer. Les favoris synchronisés et la réservation nécessitent un contrat serveur dédié.

## Demandes client

`POST /api/public/organizations/{slug}/listings/{unitUuid}/inquiries` accepte `type` (`information` ou `visit`), `name`, `phone`, `email` facultatif, `message` facultatif et `privacyConsent: true`. L’en-tête `Idempotency-Key` doit contenir un UUID. La première création renvoie 201 ; une répétition identique avec la même clé renvoie 200 et la même référence. Une clé réutilisée avec un autre contenu renvoie 409. Les champs invalides renvoient 422, une annonce inconnue ou devenue indisponible renvoie 404 et la limite de soumissions renvoie 429.

Le backend dérive l’organisation depuis le slug et l’annonce, et n’accepte que les annonces publiques encore disponibles. La réponse publique ne contient que la référence de la demande et sa date de réception.

Les routes de suivi sont authentifiées sous `/api/v1/organizations/{organizationUuid}/inquiries` : liste paginée et filtrée, détail, historique, prise en charge (`POST /{inquiryUuid}/take-ownership`) et transition (`POST /{inquiryUuid}/transition`). ADMIN_IMMOBILIER peut traiter les demandes de son organisation ; PATRON peut les lire ; ADMIN_VILLE ne reçoit pas de droit nouveau. Une clôture exige un motif. Les transitions vers conversion ou clôture sont terminales. La conversion ne crée pas de bail, de vente ni de réservation.

### Protection anti-robot des demandes

Avant une soumission, la vitrine récupère un jeton temporaire via `GET .../inquiries/challenge`. Le jeton est signé par le serveur, lié au slug et à l’unité, et valide de 3 secondes à 30 minutes. La création conserve l’en-tête UUID `Idempotency-Key` et transmet `challengeToken` ainsi que le champ leurre `website`, qui doit rester vide. Un jeton absent/invalide ou un leurre rempli est rejeté en 400. La limite serveur `public_customer_inquiries` est consommée par adresse IP et répond 429 lorsqu’elle est atteinte. La répétition avec la même clé reste idempotente.

La limite IP dépend de la configuration des proxys de confiance Symfony : en production, seuls les proxys réels doivent être déclarés, sinon l’API pourrait partager une seule limite entre visiteurs ou accepter une IP falsifiée. En déploiement multi-instance, le stockage du limiteur doit aussi utiliser un cache partagé pour conserver une limite commune entre instances. Le jeton n’est pas un CAPTCHA et ne prétend pas bloquer les robots capables d’exécuter le navigateur ; les journaux 400/429 et le volume de demandes doivent être surveillés. Un CAPTCHA tiers peut être ajouté si les abus persistent, avec vérification serveur obligatoire.
