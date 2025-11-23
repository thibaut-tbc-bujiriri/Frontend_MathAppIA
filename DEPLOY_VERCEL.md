# Guide de déploiement Vercel - Correction erreur XAMPP

## 🔴 Problème
Le message d'erreur "XAMPP (Apache) est démarré sur le port 8080" apparaît encore sur Vercel.

## ✅ Solution

### 1. Vérifier que le code est à jour

Assurez-vous que tous les fichiers sont commités :

```bash
cd C:\xampp\htdocs\Frontend
git status
git add .
git commit -m "Fix: Update error messages to use Railway URL instead of XAMPP"
git push
```

### 2. Configurer la variable d'environnement sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `mathassistant-app-ia`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez/modifiez :
   - **Key**: `VITE_API_URL`
   - **Value**: `https://backendmathassistantia-production.up.railway.app`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Cliquez sur **Save**

### 3. Redéployer l'application

**Option A : Redéploiement automatique**
- Si vous avez poussé le code, Vercel devrait redéployer automatiquement
- Attendez quelques minutes

**Option B : Redéploiement manuel**
1. Dans Vercel Dashboard, allez dans **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Confirmez le redéploiement

### 4. Vider le cache du navigateur

Après le redéploiement :
1. Ouvrez votre site : `https://mathassistant-app-ia.vercel.app`
2. Appuyez sur **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac) pour vider le cache
3. Ou ouvrez en navigation privée

### 5. Vérifier dans la console

Ouvrez la console du navigateur (F12) et vérifiez :
- L'URL utilisée pour les requêtes API doit être : `https://backendmathassistantia-production.up.railway.app/api/...`
- Aucune erreur CORS
- Les requêtes aboutissent

## 📋 Fichiers modifiés

Les fichiers suivants ont été corrigés :
- `src/config.js` - Détection automatique de l'environnement
- `src/App.jsx` - Messages d'erreur mis à jour

## ⚠️ Important

Si le problème persiste après le redéploiement :
1. Vérifiez que `VITE_API_URL` est bien configurée sur Vercel
2. Vérifiez que le backend Railway est accessible : `https://backendmathassistantia-production.up.railway.app`
3. Vérifiez les logs de déploiement Vercel pour voir s'il y a des erreurs

