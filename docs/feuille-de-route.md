# Feuille de route

Cette liste distingue les fonctionnalités disponibles des évolutions qui attendent une décision métier ou un contrat backend.

## Disponible dans Ma Vitrine

- Application React/Vite avec navigation accessible, menu mobile, thème clair/sombre et états de page.
- Présentation d’une organisation par son slug public, avec description, coordonnées publiques et nombre de biens disponibles.
- Catalogue paginé par organisation, avec filtres par type d’unité, chambres et fourchette de loyer dans une devise choisie.
- Filtres conservés dans l’URL, validation décimale sans calcul flottant, états de chargement, liste vide, erreur/réessai et page 404.
- Fiche d’annonce avec photos, loyer, caractéristiques, gestion de l’annonce devenue inaccessible et coordonnées disponibles via la vitrine.
- Page À propos avec des informations générales vérifiées, sans statistiques ni garanties inventées.

Ces parcours utilisent les trois routes publiques existantes de H‑Immo. Un slug public d’organisation doit être connu pour ouvrir sa vitrine.

## Prochaines étapes côté API et produit

1. **Catalogue global** : endpoint paginé multi-organisation, filtré et trié côté serveur, qui renvoie uniquement le minimum public et l’identité publique de l’organisation responsable. Ne pas agréger les pages d’organisations dans le navigateur.
2. **Localisation** : fournir des filtres pays/villes et les options disponibles, bornés aux annonces réellement publiées. Les routes actuelles ne retournent pas les codes de ville nécessaires à une sélection fiable.
3. **Annuaire d’agences** : route listant uniquement les organisations explicitement visibles avec leurs champs publics.
4. **Vente** : le modèle Unit expose un loyer mensuel, pas de prix de vente ni de type de transaction. Définir le modèle et le contrat métier avant d’afficher une option Vente.
5. **Favoris** : choisir une conservation locale ou un endpoint authentifié ; dans les deux cas, revalider la publication et la disponibilité avant de présenter une annonce comme accessible.
6. **Contact et visite** : créer côté H‑Immo un endpoint public avec validation, limitation de débit, protection contre les abus, consentement et durée de conservation. Pour l’instant, une vitrine expose seulement son courriel et son téléphone publics.
7. **Connexion** : définir l’URL d’entrée et le retour vers le back-office. Ne pas créer une seconde authentification ni inventer une destination.
8. **SEO** : évaluer le rendu serveur ou la génération statique pour les annonces, les liens canoniques, métadonnées sociales et sitemap. Vite SPA seule ne garantit pas l’indexation des contenus dynamiques.
9. **Vérifications navigateur** : ajouter un cadre de tests UI seulement lorsqu’il est choisi et configuré pour le dépôt ; pour le moment, les parcours critiques sont vérifiés au navigateur et les contrôles statiques sont `yarn type-check`, `yarn lint` et `yarn build`.

## Règles de livraison

- Ne pas créer de fausses annonces, coordonnées ou organisations.
- Ne pas déclarer un parcours de demande, favori synchronisé ou connexion terminé sans contrat serveur approprié.
- Garder H‑Immo comme source de vérité pour la publication et la disponibilité.
- Vérifier les états mobile, tablette, ordinateur, chargement, vide, erreur et retrait d’annonce à mesure que les parcours s’étendent.
