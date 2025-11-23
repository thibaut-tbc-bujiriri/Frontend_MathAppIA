# Configuration des Variables d'Environnement

## Développement Local

1. Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
VITE_API_URL=https://backendmathassistantia-production.up.railway.app
```

2. Redémarrez le serveur de développement Vite pour que les changements prennent effet.

## Production sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `mathassistant-app-ia`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez une nouvelle variable :
   - **Name**: `VITE_API_URL`
   - **Value**: `https://backendmathassistantia-production.up.railway.app`
   - **Environment**: Production (et Preview si nécessaire)
5. Redéployez votre application

## Note

Le fichier `.env.local` est ignoré par Git (dans `.gitignore`) pour des raisons de sécurité.
En production, utilisez toujours les Environment Variables de Vercel.

