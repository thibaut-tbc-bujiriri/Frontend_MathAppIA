# Configuration Vercel pour Math Assistant App

## ⚠️ IMPORTANT : Configuration de la variable d'environnement

Pour que l'application fonctionne correctement sur Vercel, vous devez configurer la variable d'environnement `VITE_API_URL`.

### Étapes de configuration :

1. **Allez sur le Dashboard Vercel**
   - Connectez-vous à [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Sélectionnez votre projet : `mathassistant-app-ia`

2. **Configurez la variable d'environnement**
   - Allez dans **Settings** → **Environment Variables**
   - Cliquez sur **Add New**
   - Remplissez les champs :
     - **Name**: `VITE_API_URL`
     - **Value**: `https://backendmathassistantia-production.up.railway.app`
     - **Environments**: Cochez **Production**, **Preview**, et **Development**
   - Cliquez sur **Save**

3. **Redéployez l'application**
   - Allez dans **Deployments**
   - Cliquez sur les trois points (⋯) du dernier déploiement
   - Sélectionnez **Redeploy**
   - Ou attendez que Vercel redéploie automatiquement après le push Git

## 🔍 Vérification

Après le redéploiement, vérifiez que :

1. L'application se charge correctement
2. Ouvrez la console du navigateur (F12)
3. Vous devriez voir un log : `🔧 API Configuration:` avec l'URL configurée
4. Les appels API devraient pointer vers : `https://backendmathassistantia-production.up.railway.app/api/...`

## 🐛 Dépannage

Si vous voyez toujours l'erreur "XAMPP (Apache) est démarré sur le port 8080" :

1. **Vérifiez que la variable d'environnement est bien configurée** sur Vercel
2. **Videz le cache du navigateur** (Ctrl+Shift+R ou Cmd+Shift+R)
3. **Vérifiez les logs de déploiement** sur Vercel pour voir s'il y a des erreurs
4. **Vérifiez la console du navigateur** pour voir l'URL utilisée

## 📝 URLs importantes

- **Frontend (Vercel)**: https://mathassistant-app-ia.vercel.app
- **Backend (Railway)**: https://backendmathassistantia-production.up.railway.app

