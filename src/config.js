// Configuration de l'API
// Utilisez le proxy Vite pour éviter les problèmes CORS
// Le proxy redirige /api vers http://localhost:8080/Math_AssistantApp/api
const isDevelopment = import.meta.env.DEV
export const API_BASE_URL = isDevelopment 
  ? '/api'  // Utilise le proxy Vite en développement (nécessite redémarrage du serveur)
  : 'http://localhost:8080/Math_AssistantApp/Backend/api'  // URL complète en production

// Fonction helper pour faire des requêtes API
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}/${endpoint}`
  
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

