# SEO et publication de MaVitrine

## Métadonnées

Les routes publiques définissent leur titre, description, URL canonique, image de partage et directive robots après le rendu React. Les pages catalogue filtrées gardent une canonique sans paramètres et reçoivent `noindex`; les pages de contact, inexistantes, non résolues ou en chargement ne sont pas indexables. Les pages d’annonce et vitrines publient des données structurées JSON-LD à partir des champs publics effectivement fournis par l’API. Les images de fiche portent un texte alternatif descriptif.

## Rendu serveur, sitemap et robots

La production doit utiliser le petit serveur Node inclus, et non servir `dist/` comme un dossier statique :

```sh
yarn build
PUBLIC_SITE_URL=https://vitrine.example \
PUBLIC_API_BASE_URL=https://api.example/api \
yarn start
```

Le serveur garde le routage React pour l’interactivité, mais renvoie d’abord un bloc HTML sémantique contenant les informations publiques récupérées en direct auprès de Symfony. Le bloc inclut titre, description, canonique, JSON-LD, lien de retour, titre du bien, prix, ville et photos avec texte alternatif. Il est visible sans JavaScript; le client React le masque quand JavaScript démarre. Les fiches et vitrines sont revalidées côté API avec un cache court de 20 secondes. Une annonce retirée/privée renvoie 404; une panne API renvoie 503 et `noindex`.

Le même serveur génère `/sitemap.xml` à la demande, à partir du catalogue des annonces publiées/disponibles et de `/api/public/organizations`, qui inclut les vitrines publiques même sans annonce. Le résultat est cache 60 secondes; une panne API n’est pas remplacée par une sitemap vide ou une version périmée lorsque le cache a expiré. `robots.txt` expose la sitemap et laisse les robots lire les directives `noindex` des filtres et pages de contact. Le serveur relaie uniquement `/api/public/*` et `/uploads/*`; il ne devient pas un proxy vers les routes privées H‑Immo.

Variables MaVitrine :

- `PUBLIC_SITE_URL` : origine canonique absolue en HTTPS.
- `PUBLIC_API_BASE_URL` : URL publique Symfony incluant `/api`.
- `PORT` : port du serveur Node (4173 par défaut).
- `VITE_TURNSTILE_SITE_KEY` : clé publique Turnstile intégrée au bundle. Elle peut être exposée au navigateur; ce n’est pas le secret.

Le serveur Node requiert l’API Symfony et un accès réseau à ses routes publiques. Le serveur web doit transmettre les routes de vitrine au processus Node et garder les routes/uploads sous le même domaine ou derrière le proxy Node. `yarn preview` reste un aperçu statique de Vite; il ne valide pas le rendu SEO dynamique.

`yarn generate:sitemap` reste disponible pour les hébergements strictement statiques, mais génère un instantané. Ce mode exige `PUBLIC_SITE_URL` et `PUBLIC_API_BASE_URL` et doit être relancé par cron après publication/dépublication. Il ne remplace pas le serveur Node recommandé.

## Limite de rendu initial

Le serveur Node construit la coquille HTML SEO à la demande depuis l’API, sans transformer l’application React en SSR complète. Les composants React restent client-side pour l’interaction. L’hébergement doit donc exécuter Node et transmettre les routes publiques à ce serveur; un hébergement purement statique ne peut pas fournir ce rendu ni un 404 fiable sans fonction serverless équivalente.

Les données structurées décrivent le bien et l’offre disponibles, sans garantir l’affichage d’un résultat enrichi par un moteur. Les valeurs et la disponibilité restent fournies par l’API H‑Immo.


## Contrôles après déploiement

1. Dans Google Search Console, ajouter et valider la propriété du domaine, soumettre `https://<domaine>/sitemap.xml`, puis inspecter une fiche publiée avec « Tester l’URL publiée ». Vérifier HTML exploré, canonique, indexabilité et éventuelle page 404 après dépublication.
2. Dans Bing Webmaster Tools, valider le même domaine, soumettre la sitemap, puis utiliser l’inspection d’URL pour une fiche et une vitrine publiques.
3. Après une publication ou un retrait, vérifier la sitemap après 60 secondes au plus, puis relancer l’inspection d’URL. Les moteurs peuvent garder leurs propres caches plus longtemps.
4. Tester une fiche sur mobile avec PageSpeed Insights ou Lighthouse après que Node et l’API soient déployés; les tests de build ne mesurent pas le LCP réel, les Core Web Vitals, ni la vitesse réseau des photos.
