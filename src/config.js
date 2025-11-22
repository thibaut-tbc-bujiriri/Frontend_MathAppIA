// Configuration de l'API
// Utilise le proxy Vite en développement, l'URL Railway en production
const isDevelopment = import.meta.env.DEV

// ⚠️ IMPORTANT : URL Railway configurée
// Vous pouvez aussi utiliser la variable d'environnement VITE_API_URL pour surcharger cette valeur
// L'URL doit être sans slash final
const RAILWAY_URL = import.meta.env.VITE_API_URL || 'https://web-production-0970f.up.railway.app'

export const API_BASE_URL = isDevelopment 
  ? '/api'  // Utilise le proxy Vite en développement
  : RAILWAY_URL  // Production : Railway

/**
 * Construit l'URL complète pour un endpoint API
 * @param {string} endpoint - L'endpoint (ex: 'login.php', 'solve_math.php')
 * @returns {string} L'URL complète
 */
function buildApiUrl(endpoint) {
  // Supprimer le slash initial de l'endpoint s'il existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  if (isDevelopment) {
    // En développement : /api/login.php (le proxy Vite gère le reste)
    return `${API_BASE_URL}/${cleanEndpoint}`
  } else {
    // En production : https://railway.app/api/login.php
    // Assurer qu'il n'y a pas de double slash
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    
    // Construire l'URL avec /api/ pour les endpoints PHP
    // Si l'endpoint contient déjà 'api/', ne pas le dupliquer
    if (cleanEndpoint.startsWith('api/')) {
      return `${baseUrl}/${cleanEndpoint}`
    } else {
      return `${baseUrl}/api/${cleanEndpoint}`
    }
  }
}

// Fonction helper pour faire des requêtes API (JSON)
export async function apiRequest(endpoint, options = {}) {
  const url = buildApiUrl(endpoint)
  
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
  
  console.log('🔗 API Request URL:', url)
  console.log('📤 API Request Config:', config)
  
  try {
    const response = await fetch(url, config)
    console.log('📥 API Response Status:', response.status, response.statusText)
    console.log('📥 API Response URL:', response.url)
    
    const text = await response.text()
    console.log('📥 API Response Text:', text.substring(0, 200))
    
    // Si la réponse n'est pas OK, afficher plus d'informations
    if (!response.ok) {
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        requestedUrl: url,
        responseText: text.substring(0, 500)
      }
      console.error('❌ API Error:', errorInfo)
      
      // Si c'est une erreur 404, afficher un message plus clair
      if (response.status === 404) {
        console.error('🔍 Endpoint non trouvé. URL utilisée:', url)
        console.error('🔍 Vérifiez que l\'endpoint existe sur le backend Railway')
      }
    }
    
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      const errorMsg = `Invalid JSON response from ${url}. Response: ${text.substring(0, 200)}`
      console.error('❌ JSON Parse Error:', errorMsg)
      throw new Error(errorMsg)
    }
    
    return { response, data }
  } catch (error) {
    console.error('❌ API Request Error:', {
      message: error.message,
      url: url,
      stack: error.stack
    })
    throw error
  }
}

/**
 * Fonction helper pour faire des requêtes API avec FormData
 * @param {string} endpoint - L'endpoint (ex: 'solve_math.php')
 * @param {FormData} formData - Les données FormData à envoyer
 * @param {object} options - Options supplémentaires pour fetch
 * @returns {Promise<{response: Response, data: any}>}
 */
export async function apiRequestFormData(endpoint, formData, options = {}) {
  const url = buildApiUrl(endpoint)
  
  const defaultOptions = {
    method: 'POST',
    body: formData,
    // Ne pas définir Content-Type, le navigateur le fera automatiquement avec le boundary
  }
  
  const config = {
    ...defaultOptions,
    ...options,
    // Merger les headers si présents, mais ne pas écraser body
    headers: options.headers || {},
  }
  
  console.log('🔗 API Request (FormData) URL:', url)
  
  try {
    const response = await fetch(url, config)
    console.log('📥 API Response Status:', response.status, response.statusText)
    console.log('📥 API Response URL:', response.url)
    
    const text = await response.text()
    console.log('📥 API Response Text:', text.substring(0, 200))
    
    // Si la réponse n'est pas OK, afficher plus d'informations
    if (!response.ok) {
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        requestedUrl: url,
        responseText: text.substring(0, 500)
      }
      console.error('❌ API Error:', errorInfo)
      
      // Si c'est une erreur 404, afficher un message plus clair
      if (response.status === 404) {
        console.error('🔍 Endpoint non trouvé. URL utilisée:', url)
        console.error('🔍 Vérifiez que l\'endpoint existe sur le backend Railway')
      }
    }
    
    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      const errorMsg = `Invalid JSON response from ${url}. Response: ${text.substring(0, 200)}`
      console.error('❌ JSON Parse Error:', errorMsg)
      throw new Error(errorMsg)
    }
    
    return { response, data }
  } catch (error) {
    console.error('❌ API Request Error:', {
      message: error.message,
      url: url,
      stack: error.stack
    })
    throw error
  }
}

