# Vérifications

Le dépôt ne configure pas encore de framework de test. Les scripts actuellement disponibles sont :

    yarn type-check
    yarn lint
    yarn build

Les premières fonctionnalités doivent ajouter des tests ciblés pour le client API (enveloppe, erreurs HTTP, JSON invalide), les filtres/pagination et les états de page. Les parcours critiques devront ensuite vérifier les pages catalogue et détail avec des réponses de serveur contrôlées.

Les vérifications de contrat ne doivent pas dépendre d’une vraie organisation publiée ni envoyer de demandes réelles. Les tests d’API partagés avec H‑Immo doivent utiliser un environnement isolé.
