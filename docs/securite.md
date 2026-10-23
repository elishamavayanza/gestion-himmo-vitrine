# Sécurité et données personnelles

## Modèle de sécurité

La vitrine est un site public. Le squelette actuel n’implémente ni connexion visiteur, ni authentification JWT, ni enregistrement de commande. Ne pas ajouter le jeton d’administration H‑Immo au navigateur.

Les routes H‑Immo publiques sont l’autorité sur la visibilité des organisations, la publication des biens et leur disponibilité. Un lien, un UUID, un filtre ou un état local ne prouvent jamais qu’une annonce est visible ou disponible. Demander le détail au serveur et respecter sa réponse.

## Données d’API

- Consommer les routes publiques et leurs champs documentés seulement.
- Afficher les chaînes comme du texte. Éviter les insertions HTML non échappées.
- Vérifier qu’une URL de photo utilise un protocole attendu avant de la rendre comme lien ou source média.
- Ne pas exposer les erreurs internes du serveur, les traces ou les détails techniques au visiteur.
- Ne pas journaliser les coordonnées de contact ni le contenu d’un formulaire.
- Ne pas copier les annonces ou coordonnées dans une base locale.

## Demande de contact

La demande publique est envoyée à H‑Immo pour une annonce précise. Le backend valide les champs, vérifie à nouveau la publication et la disponibilité, limite les soumissions et applique l’idempotence. Le frontend bloque les doubles clics et affiche une confirmation uniquement après succès serveur. Une demande ne réserve pas le bien et ne crée aucun bail.

Une protection côté interface améliore l’expérience mais ne remplace jamais ces contrôles backend.

## Configuration et livraison

- Les variables VITE_ sont publiques après compilation.
- N’ajouter aucun secret, jeton privé ou mot de passe à .env.example, au code source ou au dépôt.
- En production, servir l’API derrière la même origine ou configurer explicitement CORS côté serveur.
- Garder les dépendances verrouillées et examiner les ajouts.
