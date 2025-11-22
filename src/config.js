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
    return `${baseUrl}/api/${cleanEndpoint}`
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
  
  console.log('API Request (FormData):', url)
  
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

