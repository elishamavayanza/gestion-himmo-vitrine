# Catalogue

Le catalogue est connecté à `GET /api/public/organizations/{slug}/listings`. Il offre pagination et filtres supportés par l’API : type réel de l’enum `UnitType`, chambres minimum et bornes de loyer avec devise. Les critères sont partageables dans l’URL.

Les filtres pays/ville et le catalogue global attendent des endpoints dédiés. Ne chargez pas plusieurs catalogues d’organisation dans le navigateur pour les agréger.
