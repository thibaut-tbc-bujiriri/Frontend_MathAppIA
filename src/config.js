// Configuration de l'API
// Utilise toujours la variable d'environnement VITE_API_URL
// L'URL est chargée depuis la variable d'environnement VITE_API_URL
// En développement : utilise .env.local avec VITE_API_URL=http://localhost:8080
// En production sur Vercel : configurez VITE_API_URL dans les Environment Variables de Vercel
// L'URL doit être sans slash final
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://backendmathassistantia-production.up.railway.app' : 'http://localhost:8080')

export const API_BASE_URL = API_URL

/**
 * Construit l'URL complète pour un endpoint API
 * @param {string} endpoint - L'endpoint (ex: 'login.php', 'solve_math.php')
 * @returns {string} L'URL complète
 */
function buildApiUrl(endpoint) {
  // Supprimer le slash initial de l'endpoint s'il existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
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
      
      // Si le backend retourne success: false, logger l'information
      if (data && data.success === false) {
        console.warn('⚠️ Backend returned success: false', {
          message: data.message,
          url: url,
          data: data
        })
      }
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
      
      // Si le backend retourne success: false, logger l'information
      if (data && data.success === false) {
        console.warn('⚠️ Backend returned success: false', {
          message: data.message,
          url: url,
          data: data
        })
      }
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

