# Configuration et déploiement

## Variables

Le modèle de variables se trouve dans .env.example.

| Variable | Utilisée par | Valeur locale | Secret ? |
| --- | --- | --- | --- |
| VITE_HIMMO_API_BASE_URL | navigateur/client React après compilation | /api | non, valeur publique |
| HIMMO_API_URL | serveur de développement Vite pour le proxy /api | http://127.0.0.1:8000 | généralement non |

Créer un fichier local ignoré par Git, par exemple .env.local, à partir du modèle. Vite charge les variables d’environnement selon ses règles habituelles.

Toute variable VITE_ est exposée dans le JavaScript livré au navigateur. N’y mettre ni mot de passe, ni jeton privé, ni clé d’API secrète. HIMMO_API_URL est l’adresse côté serveur Vite et n’est pas injectée automatiquement dans le client.

## Développement

    yarn install
    yarn dev

Vite utilise le port 5174 avec strictPort et écoute sur 127.0.0.1. Les appels dont le chemin commence par /api sont relayés vers HIMMO_API_URL. Le backend Symfony doit être lancé séparément.

## Contrôles et production

    yarn type-check
    yarn lint
    yarn build
    yarn preview

Le build de production est écrit dans dist/. Le serveur de développement Vite et son proxy ne font pas partie du build.

Pour servir l’application, configurer le serveur web afin de renvoyer les routes frontend vers index.html, et fournir l’API publique sous la base configurée. Une API de même origine est le déploiement le plus simple. Si frontend et API ont des origines différentes, le serveur API doit autoriser explicitement l’origine du site et les méthodes nécessaires ; ne contourner pas cette politique par un proxy public ouvert.

## Dépendances

Le dépôt contient yarn.lock. Utiliser Yarn et conserver ce fichier à jour. Ne pas versionner node_modules, dist ou les fichiers d’environnement locaux.
