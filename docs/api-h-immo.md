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
| type | apartment, office ou commercial |
| bedrooms | nombre minimum de chambres |
| minRent, maxRent | bornes de loyer décimal |
| currency | USD ou CDF |
| page | page indexée à partir de 1, valeur par défaut 1 |
| limit | taille de page, valeur par défaut 20, maximum 100 |

La réponse place dans data un objet avec items, total, page et pages. Chaque élément expose :

- unitId : UUID public
- reference, type, floor, description
- monthlyRent : montant décimal sous forme de chaîne
- currency, surface, bedrooms, rooms, bathrooms
- city, buildingName
- photos : tableau de url et position

L’API limite les résultats à l’organisation demandée, aux unités publiées et sans bail actif. Une annonce louée est retirée automatiquement des résultats. Les paramètres de filtre ne sont pas une garantie de disponibilité.

## Détail d’une annonce

    GET /api/public/organizations/{slug}/listings/{uuid}

Retourne la même représentation publique de l’annonce. 404 signifie notamment que l’organisation ou l’annonce est inconnue, masquée, non publiée, occupée, ou que l’annonce n’appartient pas à cette organisation. Le frontend ne doit pas tenter d’en déduire la raison ni exposer l’existence d’autres ressources.

## Demandes client : endpoint absent

Aucune route publique de création de demande ou de réservation n’a été trouvée dans le contrôleur public vérifié. L’interface ne doit donc pas encore annoncer qu’elle peut transmettre un formulaire.

Avant d’implémenter ce parcours, définir côté H‑Immo le contrat, la validation, la limitation de débit, la prévention des abus, les données personnelles conservées, la durée de conservation et les réponses de succès/erreur. La vitrine pourra ensuite appeler le nouvel endpoint public via le client API.

## Règles d’intégration

- N’utiliser que les champs publics documentés.
- Construire les filtres avec URLSearchParams ; encoder slug et UUID dans les segments d’URL.
- Respecter le code HTTP : 404 n’est pas une liste vide si l’organisation ou l’annonce n’existe pas.
- Les valeurs de l’API sont externes : prévoir absence de photos, textes facultatifs, résultats vides et erreurs réseau.
- Garder les montants décimaux comme chaînes et afficher la devise fournie.
