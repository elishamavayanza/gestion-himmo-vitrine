# Socle visuel de H‑Immo Habitat

Le design system de la vitrine reprend les bons principes d’organisation utilisés dans H‑Immo, avec ses propres composants et une palette adaptée à un site public. Il ne copie pas les pages ni l’ensemble de la bibliothèque de l’application de gestion.

## Thèmes et couleurs

Les variables sémantiques sont centralisées dans assets/react/styles/base/_tokens.scss. Le thème clair utilise des surfaces blanc cassé légèrement teintées de vert et un accent vert canard profond. Le thème sombre utilise des surfaces anthracite verdies et un accent menthe adouci. Les états de succès, information, avertissement et erreur ainsi que l’accent secondaire ont leurs propres rôles. Les composants consomment les rôles sémantiques (surface, texte, bordure, accent, focus), pas les valeurs de couleur directement.

Le thème suit la préférence système au premier accès, peut être basculé dans l’en-tête et mémorise le choix dans localStorage. Le provider met à jour l’attribut data-theme et la couleur de la barre du navigateur.

La page d’accueil utilise un diaporama décoratif de photographies d’architecture résidentielle publiées sur Unsplash. Il n’illustre pas des annonces publiées dans H‑Immo. Les vues d’[immeuble végétalisé](https://unsplash.com/photos/modern-apartment-building-with-balconies-and-greenery-B9OMpxCdrlc) et de [façade contemporaine](https://unsplash.com/photos/exterior-of-a-modern-apartment-building-with-balconies-1iGG6k4Ci4E) sont publiées comme gratuites sous la licence Unsplash. L’illustration locale `public/hero-fallback.svg` prend le relais si les images distantes ne chargent pas. Les commandes permettent de choisir une image, de passer à la suivante ou précédente et de mettre le défilement automatique en pause. La préférence `prefers-reduced-motion` arrête le défilement et les transitions.

## Composants de base créés

- UI/Button : action principale, secondaire, discrète ou destructive ; trois tailles.
- UI/Card : surface de contenu et sous-composants d’en-tête, corps et pied.
- Form/TextField et Form/SelectField : champs natifs séparés, chacun avec un fichier .tsx et son index.ts ; libellé, aide, erreur et focus visible.
- UI/Badge : étiquette neutre, accentuée, succès ou avertissement pour des états de publication/disponibilité.
- UI/ThemeToggle : bascule accessible entre clair et sombre.
- Feedback/EmptyState : présentation cohérente d’un résultat de recherche vide.

Les composants React sont dans assets/react/components, classés par famille (UI, Form, Navigation, Feedback). Chaque composant possède son fichier .tsx et un index.ts. Tous les styles sont centralisés dans assets/react/styles/components/famille/_Composant.scss et chargés par styles/main.scss. Les tokens et les règles de base ont leurs propres partiels.

## À ajouter seulement avec un besoin de parcours

Pour le catalogue et la fiche, ajouter ensuite des composants de pagination, de galerie photo, de skeleton de chargement et d’état d’erreur si les écrans les nécessitent. Ne pas importer les DataTable, calendriers, arbres de patrimoine, formulaires de gestion, modales administratives ou composants de rapports de H‑Immo : ils répondent à des workflows différents.

## Accessibilité et responsive

Tous les contrôles doivent avoir un libellé associé, fonctionner au clavier, afficher un focus net et conserver un contraste suffisant dans les deux thèmes. Les contrôles natifs restent privilégiés pour les filtres simples : leur remplacement par un menu personnalisé n’apporte pas ici de gain fonctionnel et demanderait de reconstruire la navigation clavier et tactile du navigateur. Il n’y a pas de dialogue à afficher dans les parcours publics actuels ; aucun dialogue générique n’est donc ajouté. Le service global assets/react/services/device.ts est la source de vérité TypeScript pour les seuils et les media queries. Les hooks globaux assets/react/hooks/useMediaQuery.ts et useDevice.ts exposent ces informations aux parcours React. Les seuils SCSS de base/_breakpoints.scss en sont le miroir et doivent rester synchronisés : mobile 480 px, navigation mobile 600 px, tablette 768 px, bureau 1024 px, bureau intermédiaire 1200 px, grand écran 1440 px et très grand écran 1920 px. Les surcharges visuelles sont regroupées dans responsive/ : _mobile.scss, _tablet.scss, _desktop.scss, _portrait.scss et _landscape.scss. Cet index est importé après les styles de base. Les ajustements propres à un composant peuvent rester dans son SCSS central. Respecter prefers-reduced-motion et vérifier chaque orientation avant d’étendre la bibliothèque.
