# Socle visuel de H‑Immo Vitrine

Le design system de la vitrine reprend les bons principes d’organisation utilisés dans H‑Immo, avec ses propres composants et une palette adaptée à un site public. Il ne copie pas les pages ni l’ensemble de la bibliothèque de l’application de gestion.

## Thèmes et couleurs

Les variables sémantiques sont centralisées dans assets/react/styles/base/_tokens.scss. Le thème clair utilise des surfaces blanc cassé légèrement teintées de vert et un accent vert canard profond. Le thème sombre utilise des surfaces anthracite verdies et un accent menthe adouci. Les composants consomment les rôles sémantiques (surface, texte, bordure, accent, focus), pas les valeurs de couleur directement.

Le thème suit la préférence système au premier accès, peut être basculé dans l’en-tête et mémorise le choix dans localStorage. Le provider met à jour l’attribut data-theme et la couleur de la barre du navigateur.

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

Tous les contrôles doivent avoir un libellé associé, fonctionner au clavier, afficher un focus net et conserver un contraste suffisant dans les deux thèmes. Les contrôles natifs restent privilégiés pour les formulaires simples. Le service global assets/react/services/device.ts est la source de vérité TypeScript pour les seuils et les media queries. Les hooks globaux assets/react/hooks/useMediaQuery.ts et useDevice.ts exposent ces informations aux parcours React. Les seuils SCSS de base/_breakpoints.scss en sont le miroir et doivent rester synchronisés : mobile 480 px, navigation mobile 600 px, tablette 768 px, bureau 1024 px, bureau intermédiaire 1200 px, grand écran 1440 px et très grand écran 1920 px. Les surcharges visuelles sont regroupées dans responsive/ : _mobile.scss, _tablet.scss, _desktop.scss, _portrait.scss et _landscape.scss. Cet index est importé après les styles de base. Les ajustements propres à un composant peuvent rester dans son SCSS central. Respecter prefers-reduced-motion et vérifier chaque orientation avant d’étendre la bibliothèque.
