# 🔗 Guide détaillé : Connexion Frontend Vercel ↔ Backend Railway

## ✅ Étape 1 : Obtenir l'URL de votre backend Railway

1. Allez sur [railway.app](https://railway.app)
2. Ouvrez votre projet `backend_mathassistantIA`
3. Cliquez sur le service `backend_mathassistantIA`
4. Allez dans l'onglet **Settings**
5. Cherchez **"Public Domain"** ou **"Networking"**
6. Copiez l'URL publique (ex: `https://backend-mathassistantia-production.up.railway.app`)
   - Elle ressemble à : `https://[nom-du-service].up.railway.app`

⚠️ **IMPORTANT** : Notez cette URL, vous en aurez besoin pour les étapes suivantes !

## 🔧 Étape 2 : Modifier `src/config.js`

### Option A : Utiliser les variables d'environnement (RECOMMANDÉ)

1. **Créer le fichier `.env.production`** à la racine du projet Frontend :

```env
VITE_API_URL=https://VOTRE-URL-RAILWAY.app
```

**Exemple :**
```env
VITE_API_URL=https://backend-mathassistantia-production.up.railway.app
```

2. **Modifier `src/config.js`** pour utiliser la variable d'environnement :

```javascript
// Configuration de l'API
// Utilise le proxy Vite en développement, l'URL Railway en production
const isDevelopment = import.meta.env.DEV

// URL de base de l'API
export const API_BASE_URL = isDevelopment 
  ? '/api'  // Utilise le proxy Vite en développement
  : (import.meta.env.VITE_API_URL || 'https://VOTRE-URL-RAILWAY.app')  // Production : Railway

// Fonction helper pour faire des requêtes API
export async function apiRequest(endpoint, options = {}) {
  // Supprimer le slash initial de l'endpoint s'il existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  // Construire l'URL complète
  const url = API_BASE_URL.endsWith('/') 
    ? `${API_BASE_URL}${cleanEndpoint}`
    : `${API_BASE_URL}/${cleanEndpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  }
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  }
  
  console.log('API Request:', url, config)
  
  try {
    const response = await fetch(url, config)
    console.log('API Response:', response.status, response.statusText)
    
    const text = await response.text()
    console.log('API Response text:', text)
    
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
    }
    
    return { response, data }
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}
```

### Option B : Modifier directement dans `config.js` (plus simple)

Remplacez le contenu de `src/config.js` par :

```javascript
// Configuration de l'API
const isDevelopment = import.meta.env.DEV

// ⚠️ REMPLACEZ CETTE URL PAR VOTRE URL RAILWAY !
const RAILWAY_URL = 'https://VOTRE-URL-RAILWAY.app'

export const API_BASE_URL = isDevelopment 
  ? '/api'  // Utilise le proxy Vite en développement
  : RAILWAY_URL  // Production : Railway

export async function apiRequest(endpoint, options = {}) {
  // Supprimer le slash initial de l'endpoint s'il existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  // Construire l'URL complète
  const url = API_BASE_URL.endsWith('/') 
    ? `${API_BASE_URL}${cleanEndpoint}`
    : `${API_BASE_URL}/${cleanEndpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  }
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  }
  
  console.log('API Request:', url, config)
  
  try {
    const response = await fetch(url, config)
    console.log('API Response:', response.status, response.statusText)
    
    const text = await response.text()
    console.log('API Response text:', text)
    
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`)
    }
    
    return { response, data }
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}
```

## 🔧 Étape 3 : Modifier `src/MathSolver.jsx`

Dans `MathSolver.jsx`, la fonction `handleSolve` utilise `fetch('/api/solve_math.php', ...)` directement. Il faut la modifier pour utiliser l'URL de base correcte.

**Cherchez cette ligne (vers la ligne 204) :**
```javascript
const response = await fetch('/api/solve_math.php', {
```

**Remplacez-la par :**
```javascript
import { API_BASE_URL } from './config'

// Puis dans handleSolve :
const response = await fetch(`${API_BASE_URL}/solve_math.php`, {
```

**Code complet modifié :**

```javascript
// En haut du fichier, ajouter l'import :
import { apiRequest, API_BASE_URL } from './config'

// Puis modifier la fonction handleSolve (vers la ligne 189) :
const handleSolve = async () => {
  if (!image) {
    setError('Veuillez sélectionner une image')
    return
  }

  setLoading(true)
  setError(null)
  setResult(null)

  try {
    const formData = new FormData()
    formData.append('image', image)

    // Utiliser API_BASE_URL au lieu de '/api'
    const apiUrl = isDevelopment 
      ? '/api/solve_math.php'  // En développement, utilise le proxy
      : `${API_BASE_URL}/solve_math.php`  // En production, utilise Railway

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de la résolution du problème')
    }

    // ... reste du code inchangé ...
  } catch (err) {
    console.error('Erreur:', err)
    setError(err.message || 'Une erreur est survenue')
  } finally {
    setLoading(false)
  }
}
```

**OU plus simplement, utilisez directement :**

```javascript
// Dans handleSolve, remplacer :
const response = await fetch('/api/solve_math.php', {
  
// Par :
const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment 
  ? '/api'  
  : 'https://VOTRE-URL-RAILWAY.app'

const response = await fetch(`${API_BASE_URL}/solve_math.php`, {
```

## 📝 Étape 4 : Ajouter `.env.production` (si Option A)

À la racine de votre projet Frontend, créez `.env.production` :

```env
VITE_API_URL=https://VOTRE-URL-RAILWAY.app
```

**Exemple concret :**
```env
VITE_API_URL=https://backend-mathassistantia-production.up.railway.app
```

## 🚀 Étape 5 : Redéployer sur Vercel

1. **Vérifier que tous les fichiers sont sauvegardés**
2. **Committer les changements :**
```bash
cd Frontend
git add .
git commit -m "Configure Railway backend URL"
git push
```

3. **Vercel redéploiera automatiquement**

## ✅ Étape 6 : Tester la connexion

1. Une fois redéployé, allez sur `https://mathassistant-app-ia.vercel.app`
2. Ouvrez la console du navigateur (F12)
3. Essayez de vous connecter ou de résoudre un problème mathématique
4. Dans l'onglet **Network**, vérifiez que les requêtes vont vers votre URL Railway
5. Vérifiez qu'il n'y a pas d'erreurs CORS

## 🐛 Dépannage

### Erreur CORS
- Vérifiez que l'URL Railway est correcte dans `config.js`
- Vérifiez que le domaine Vercel est dans la liste CORS du backend (déjà fait)

### 404 Not Found
- Vérifiez que l'URL Railway est complète (avec `https://`)
- Vérifiez que les endpoints utilisent le bon format (`/solve_math.php` et non `/api/solve_math.php` en production)

### Erreur de connexion
- Vérifiez que Railway est en ligne (regardez les logs Railway)
- Vérifiez que l'URL est accessible (ouvrez-la dans un navigateur, vous devriez voir l'API JSON)

## 📋 Résumé des changements

1. ✅ Modifier `src/config.js` pour utiliser l'URL Railway
2. ✅ Modifier `src/MathSolver.jsx` pour utiliser l'URL correcte
3. ✅ (Optionnel) Créer `.env.production` avec l'URL Railway
4. ✅ Commiter et pousser
5. ✅ Tester sur Vercel

