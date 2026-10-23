# Vérifications

Les vérifications de contrat utilisent `node:test`, sans framework frontend ni base de données. Les scripts disponibles sont :

    yarn type-check
    yarn lint
    yarn build
    yarn test:public-listings

Le test `test:public-listings` vérifie les filtres et la pagination transmis au backend, l’annulation des requêtes, les formes JSON publiques, l’affichage selon le type d’offre, le classement des annonces par famille et la construction de demande. Les tests ne contactent pas une organisation réelle et n’envoient aucune demande.

Les vérifications de contrat ne doivent pas dépendre d’une vraie organisation publiée ni envoyer de demandes réelles. Les tests d’API partagés avec H‑Immo doivent utiliser un environnement isolé.
