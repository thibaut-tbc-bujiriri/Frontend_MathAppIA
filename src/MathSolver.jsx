import { useState, useRef, useMemo } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import jsPDF from 'jspdf'
import { apiRequest, apiRequestFormData, API_BASE_URL } from './config'

function MathSolver({ theme, language, t, onProblemSolved }) {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  
  const fileInputRef = useRef(null)
  const cameraVideoRef = useRef(null)
  const cameraCanvasRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = async () => {
    try {
      setCameraReady(false) // Réinitialiser l'état
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Caméra arrière sur mobile
      })
      setCameraStream(stream)
      setShowCamera(true)
      
      // Attendre que le DOM soit mis à jour avant d'accéder à la vidéo
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream
          
          // Attendre que la vidéo soit prête
          cameraVideoRef.current.onloadedmetadata = () => {
            console.log('Vidéo chargée, dimensions:', cameraVideoRef.current.videoWidth, cameraVideoRef.current.videoHeight)
          }
          
          cameraVideoRef.current.oncanplay = () => {
            console.log('Vidéo prête à être jouée')
            setCameraReady(true) // Marquer la caméra comme prête
          }
          
          // Gérer les erreurs de la vidéo
          cameraVideoRef.current.onerror = (err) => {
            console.error('Erreur vidéo:', err)
            setCameraReady(false)
          }
        }
      }, 100)
    } catch (err) {
      console.error('Erreur accès caméra:', err)
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
      setShowCamera(false)
    }
  }

  const capturePhoto = () => {
    console.log('capturePhoto appelée')
    console.log('cameraVideoRef.current:', cameraVideoRef.current)
    console.log('cameraCanvasRef.current:', cameraCanvasRef.current)
    
    if (!cameraVideoRef.current || !cameraCanvasRef.current) {
      console.error('Références manquantes pour la caméra')
      alert('Erreur: La caméra n\'est pas prête. Veuillez réessayer.')
      return
    }
    
    const video = cameraVideoRef.current
    const canvas = cameraCanvasRef.current
    
    // Vérifier que la vidéo est prête
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.warn('La vidéo n\'est pas encore prête. État:', video.readyState)
      alert('Veuillez attendre que la caméra soit prête.')
      return
    }
    
    // Vérifier que la vidéo a des dimensions valides
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Dimensions de la vidéo invalides:', video.videoWidth, video.videoHeight)
      alert('Erreur: La caméra n\'a pas de dimensions valides. Veuillez réessayer.')
      return
    }
    
    try {
      const ctx = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      
      console.log('Image capturée, dimensions:', canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('Blob créé, taille:', blob.size)
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
          setImage(file)
          setImagePreview(URL.createObjectURL(blob))
          setResult(null)
          setError(null)
          closeCamera()
        } else {
          console.error('Erreur lors de la création du blob')
          alert('Erreur lors de la capture de la photo. Veuillez réessayer.')
        }
      }, 'image/jpeg', 0.9)
    } catch (err) {
      console.error('Erreur lors de la capture:', err)
      alert('Erreur lors de la capture de la photo: ' + err.message)
    }
  }

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    setCameraReady(false) // Réinitialiser l'état de la caméra
  }

  const sanitizeLatexExpression = (latex) => {
    if (!latex) return ''
    let cleaned = String(latex)
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleaned) return ''

    // Retirer les signes "=" isolés en début de ligne
    cleaned = cleaned.replace(/^\s*=\s*/, '')

    // Enlever les délimiteurs $ résiduels
    cleaned = cleaned.replace(/\$/g, '')

    // Nettoyer les espaces autour de \frac, \lim, etc.
    cleaned = cleaned.replace(/\s*\\frac\s*/g, '\\frac')
    cleaned = cleaned.replace(/\s*\\lim\s*/g, '\\lim ')
    cleaned = cleaned.replace(/\s*\\sqrt\s*/g, '\\sqrt')

    // Réparer les accolades mal fermées causées par des placeholders
    cleaned = cleaned.replace(/\{\s+/g, '{')
    cleaned = cleaned.replace(/\s+\}/g, '}')

    return cleaned
  }

  const extractLatexSegments = (latexString) => {
    if (!latexString) return []
    const normalized = String(latexString).replace(/\r\n/g, '\n').trim()
    if (!normalized) return []
    
    const paragraphSplit = normalized
      .split(/\n{2,}/)
      .map(segment => sanitizeLatexExpression(segment))
      .filter(Boolean)

    if (paragraphSplit.length > 1) {
      return paragraphSplit
    }
    
    const lineSplit = normalized
      .split('\n')
      .map(line => sanitizeLatexExpression(line))
      .filter(Boolean)
    
    return lineSplit
  }

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

      // Utiliser la fonction helper apiRequestFormData pour une URL cohérente
      const { response, data } = await apiRequestFormData('solve_math.php', formData)

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la résolution du problème')
      }

      // Nettoyer les placeholders LaTeX qui pourraient exister dans les données
      const cleanData = { ...data.data }
      if (cleanData.explanation) {
        cleanData.explanation = cleanPlaceholders(cleanData.explanation)
      }
      if (cleanData.wolfram_solution) {
        cleanData.wolfram_solution = cleanPlaceholders(cleanData.wolfram_solution)
      }
      if (cleanData.latex) {
        cleanData.latex = cleanPlaceholders(cleanData.latex)
      }

      const latexSegments = extractLatexSegments(cleanData.latex)
      setResult({
        ...cleanData,
        latexSegments
      })
      
      // Ajouter à l'historique si la fonction est fournie
      if (onProblemSolved && window.addToHistory) {
        window.addToHistory({
          problem: cleanPlaceholders(data.data.latex),
          solution: cleanPlaceholders(data.data.explanation || data.data.wolfram_solution),
          image: imagePreview
        })
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setImagePreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Fonction pour convertir les notations mathématiques en format texte pour PDF
  const convertMathForPDF = (text) => {
    if (!text) return text
    
    // Convertir les exposants en caractères Unicode supérieurs
    const superscripts = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ',
      'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'o': 'ᵒ',
      'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
    }
    
    // Convertir les indices en caractères Unicode inférieurs
    const subscripts = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'n': 'ₙ', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ',
      'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
      'v': 'ᵥ', 'x': 'ₓ'
    }
    
    // Fonction pour convertir une expression en exposant
    const convertExponent = (exp) => {
      // Si c'est un nombre simple, convertir directement
      if (/^[0-9]+$/.test(exp)) {
        return exp.split('').map(char => superscripts[char] || char).join('')
      }
      // Si c'est une variable simple, convertir directement
      if (/^[a-zA-Z]$/.test(exp)) {
        return superscripts[exp.toLowerCase()] || exp
      }
      // Si c'est une expression complexe comme (n-1), convertir chaque partie
      if (exp.includes('-')) {
        const parts = exp.split('-')
        return parts.map((part, idx) => {
          if (idx === 0) {
            return convertExponent(part.trim())
          } else {
            return '⁻' + convertExponent(part.trim())
          }
        }).join('')
      }
      if (exp.includes('+')) {
        const parts = exp.split('+')
        return parts.map((part, idx) => {
          if (idx === 0) {
            return convertExponent(part.trim())
          } else {
            return '⁺' + convertExponent(part.trim())
          }
        }).join('')
      }
      // Par défaut, essayer de convertir chaque caractère
      return exp.split('').map(char => superscripts[char.toLowerCase()] || char).join('')
    }
    
    // Convertir x^(n-1), x^(n+1), etc. en format avec exposants Unicode
    text = text.replace(/([a-zA-Z0-9]+)\^\(([^)]+)\)/g, (match, base, exp) => {
      const supExp = convertExponent(exp)
      return base + supExp
    })
    
    // Convertir x^n, x^2, etc. en xⁿ, x², etc.
    text = text.replace(/([a-zA-Z0-9]+)\^([0-9]+|[a-zA-Z]+)/g, (match, base, exp) => {
      const supExp = convertExponent(exp)
      return base + supExp
    })
    
    // Convertir n*x^(n-1), 2*x^2, etc.
    text = text.replace(/([a-zA-Z0-9]+)\*([a-zA-Z0-9]+)\^\(([^)]+)\)/g, (match, coeff, base, exp) => {
      const supExp = convertExponent(exp)
      return `${coeff}·${base}${supExp}`
    })
    
    text = text.replace(/([a-zA-Z0-9]+)\*([a-zA-Z0-9]+)\^([0-9]+|[a-zA-Z]+)/g, (match, coeff, base, exp) => {
      const supExp = convertExponent(exp)
      return `${coeff}·${base}${supExp}`
    })
    
    // Convertir x_2, x_i, etc. en x₂, xᵢ, etc.
    text = text.replace(/([a-zA-Z0-9]+)_([0-9]+|[a-zA-Z]+)/g, (match, base, sub) => {
      const subSub = sub.split('').map(char => subscripts[char.toLowerCase()] || char).join('')
      return base + subSub
    })
    
    // Convertir les fractions simples 1/2 en format texte
    text = text.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, (match, num, den) => {
      return `${num}∕${den}` // Utiliser le caractère division fraction
    })
    
    // Convertir sqrt(x) en √(x)
    text = text.replace(/sqrt\(([^)]+)\)/gi, (match, content) => {
      return `√(${content})`
    })
    
    // Nettoyer les balises LaTeX restantes
    text = text.replace(/\$([^$]+)\$/g, '$1') // Enlever les $ mais garder le contenu
    text = text.replace(/\\\[([^\]]+)\\\]/g, '$1')
    text = text.replace(/\\\(([^)]+)\\\)/g, '$1')
    
    // Nettoyer les commandes LaTeX simples
    text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1∕$2')
    text = text.replace(/\\sqrt\{([^}]+)\}/g, '√$1')
    text = text.replace(/\\lim_\{([^}]+)\}/g, 'lim $1')
    text = text.replace(/\\cdot/g, '·')
    text = text.replace(/\\to/g, '→')
    text = text.replace(/\\infty/g, '∞')
    text = text.replace(/\\pi/g, 'π')
    text = text.replace(/\\alpha/g, 'α')
    text = text.replace(/\\beta/g, 'β')
    text = text.replace(/\\gamma/g, 'γ')
    text = text.replace(/\\theta/g, 'θ')
    text = text.replace(/\\lambda/g, 'λ')
    text = text.replace(/\\mu/g, 'μ')
    text = text.replace(/\\sigma/g, 'σ')
    text = text.replace(/\\phi/g, 'φ')
    text = text.replace(/\\Delta/g, 'Δ')
    text = text.replace(/\\sum/g, 'Σ')
    text = text.replace(/\\int/g, '∫')
    text = text.replace(/\\prod/g, '∏')
    
    return text
  }

  const handleExportPDF = () => {
    if (!result) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // Titre
    doc.setFontSize(18)
    doc.text('Solution Mathématique', pageWidth / 2, yPos, { align: 'center' })
    yPos += 15

    // Fonction pour ajouter du texte avec conversion mathématique
    const addTextWithMath = (text, x, y, options = {}) => {
      const convertedText = convertMathForPDF(text)
      const lines = doc.splitTextToSize(convertedText, options.maxWidth || pageWidth - 40)
      doc.text(lines, x, y, options)
      return lines.length * (options.lineHeight || 5)
    }

    // Image si disponible
    if (imagePreview) {
      try {
        const img = new Image()
        img.src = imagePreview
        img.onload = () => {
          const imgWidth = 80
          const imgHeight = (img.height * imgWidth) / img.width
          doc.addImage(imagePreview, 'JPEG', (pageWidth - imgWidth) / 2, yPos, imgWidth, imgHeight)
          yPos += imgHeight + 10
          
          // Équation LaTeX
          doc.setFontSize(14)
          doc.text('Équation:', 20, yPos)
          yPos += 8
          doc.setFontSize(12)
          const latexConverted = convertMathForPDF(result.latex)
          const latexLines = doc.splitTextToSize(latexConverted, pageWidth - 40)
          doc.text(latexLines, 20, yPos)
          yPos += latexLines.length * 5 + 15

          // Solution WolframAlpha
          if (result.wolfram_solution) {
            doc.setFontSize(14)
            doc.text('Solution calculée:', 20, yPos)
            yPos += 8
            doc.setFontSize(11)
            const wolframConverted = convertMathForPDF(result.wolfram_solution)
            const wolframLines = doc.splitTextToSize(wolframConverted, pageWidth - 40)
            doc.text(wolframLines, 20, yPos)
            yPos += wolframLines.length * 5 + 10
          }

          // Explication étape par étape
          if (result.explanation) {
            doc.setFontSize(14)
            doc.text('Explication étape par étape:', 20, yPos)
            yPos += 8
            doc.setFontSize(11)
            const explanationConverted = convertMathForPDF(result.explanation)
            const explanationLines = doc.splitTextToSize(explanationConverted, pageWidth - 40)
            
            explanationLines.forEach(line => {
              if (yPos > pageHeight - 20) {
                doc.addPage()
                yPos = 20
              }
              doc.text(line, 20, yPos)
              yPos += 5
            })
          }

          doc.save('solution-mathematique.pdf')
        }
      } catch (err) {
        console.error('Erreur lors de l\'export PDF:', err)
        alert('Erreur lors de l\'export PDF')
      }
    } else {
      // Sans image
      doc.setFontSize(14)
      doc.text('Équation:', 20, yPos)
      yPos += 8
      doc.setFontSize(12)
      const latexConverted = convertMathForPDF(result.latex)
      const latexLines = doc.splitTextToSize(latexConverted, pageWidth - 40)
      doc.text(latexLines, 20, yPos)
      yPos += latexLines.length * 5 + 15

      if (result.wolfram_solution) {
        doc.setFontSize(14)
        doc.text('Solution calculée:', 20, yPos)
        yPos += 8
        doc.setFontSize(11)
        const wolframConverted = convertMathForPDF(result.wolfram_solution)
        const wolframLines = doc.splitTextToSize(wolframConverted, pageWidth - 40)
        doc.text(wolframLines, 20, yPos)
        yPos += wolframLines.length * 5 + 10
      }

      if (result.explanation) {
        doc.setFontSize(14)
        doc.text('Explication étape par étape:', 20, yPos)
        yPos += 8
        doc.setFontSize(11)
        const explanationConverted = convertMathForPDF(result.explanation)
        const explanationLines = doc.splitTextToSize(explanationConverted, pageWidth - 40)
        
        explanationLines.forEach(line => {
          if (yPos > pageHeight - 20) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 20, yPos)
          yPos += 5
        })
      }

      doc.save('solution-mathematique.pdf')
    }
  }

  // Fonction utilitaire pour nettoyer les placeholders du texte
  const cleanPlaceholders = (text) => {
    if (!text) return text
    
    let cleaned = String(text)
    
    cleaned = cleaned.replace(/__LATEX_BLOCK_\d+__/g, '')
    cleaned = cleaned.replace(/__LATEX_PROTECT_\d+__/g, '')
    cleaned = cleaned.replace(/__EXISTING_PLACEHOLDER_\d+__/g, '')
    cleaned = cleaned.replace(/__LATEX[_\w]*_\d+__/g, '')
    cleaned = cleaned.replace(/__\s*LATEX\s*[_\w]*\s*_\s*\d+\s*__/gi, '')
    cleaned = cleaned.replace(/__\s*\n\s*LATEX[\s\n]*[_\w]*[\s\n]*_\s*\d+[\s\n]*__/gi, '')
    cleaned = cleaned.replace(/__\s+[A-Z]+\s+[A-Z]+\s+_\s*\d+\s*__/gi, '')
    cleaned = cleaned.replace(/__[\s\n]*L[\s\n]*A[\s\n]*T[\s\n]*E[\s\n]*X[\s\n]*[_\w\s\n]*[\s\n]*_\s*\d+[\s\n]*__/gi, '')
    cleaned = cleaned.replace(/__[_\w\s\n]*__/g, '')
    cleaned = cleaned.replace(/__[\s\S]*?__/g, '')
    
    cleaned = cleaned.replace(/\r\n/g, '\n')
    cleaned = cleaned.replace(/[ \t]+\n/g, '\n')
    cleaned = cleaned.replace(/\n[ \t]+/g, '\n')
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ')
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
    
    return cleaned.trim()
  }

  // Fonction pour parser l'explication et extraire les étapes
  const parseExplanation = (text) => {
    if (!text) return []
    
    // Nettoyer d'abord les placeholders qui pourraient exister dans le texte
    text = cleanPlaceholders(text)
    
    // D'abord, essayer de diviser par les références d'équations (Équation 1:, Équation 2:, etc.)
    const equationPattern = /(Équation\s+\d+:|Equation\s+\d+:)\s*(.+?)(?=Équation\s+\d+:|Equation\s+\d+:|$)/gis
    const equationMatches = []
    let match
    
    while ((match = equationPattern.exec(text)) !== null) {
      const equationNum = match[1].match(/\d+/)?.[0] || '1'
      equationMatches.push({
        number: parseInt(equationNum),
        content: match[2]?.trim() || match[0].trim(),
        isEquation: true
      })
    }
    
    if (equationMatches.length > 0) {
      return equationMatches
    }
    
    // Ensuite, essayer de diviser par les numéros d'étapes (1., 2., etc.)
    const stepPattern = /(\d+)\.\s*(.+?)(?=\d+\.|$)/gs
    const steps = []
    
    while ((match = stepPattern.exec(text)) !== null) {
      steps.push({
        number: parseInt(match[1]),
        content: match[2].trim()
      })
    }
    
    // Si aucune étape numérotée trouvée, diviser par les sauts de ligne doubles
    if (steps.length === 0) {
      const paragraphs = text.split(/\n\s*\n+/).filter(p => p.trim().length > 0)
      if (paragraphs.length > 1) {
        paragraphs.forEach((paragraph, index) => {
          steps.push({
            number: index + 1,
            content: paragraph.trim()
          })
        })
      } else {
        // Dernier recours : diviser par les sauts de ligne simples
        const lines = text.split(/\n+/).filter(line => line.trim().length > 0)
        lines.forEach((line, index) => {
          steps.push({
            number: index + 1,
            content: line.trim()
          })
        })
      }
    }
    
    return steps
  }

  // Fonction pour convertir les notations mathématiques brutes en LaTeX
  const convertMathNotationToLatex = (text) => {
    if (!text) return text
    
    // Nettoyer d'abord tous les placeholders existants
    text = cleanPlaceholders(text)
    
    // Si le texte ne contient pas de notations mathématiques brutes à convertir, retourner tel quel
    // Vérifier s'il y a des patterns à convertir (x^2, x_2, 1/2, sqrt(x), etc.)
    const hasMathNotation = /[a-zA-Z0-9]+\^[0-9a-zA-Z]+|[a-zA-Z0-9]+\^\([^)]+\)|[a-zA-Z0-9]+\/[a-zA-Z0-9]+|sqrt\([^)]+\)/i.test(text)
    
    if (!hasMathNotation) {
      // Pas de conversion nécessaire, juste nettoyer les placeholders
      return cleanPlaceholders(text)
    }
    
    // Protéger les blocs LaTeX existants avec un système de placeholder plus robuste
    const latexBlocks = []
    let blockIndex = 0
    
    // Protéger les blocs LaTeX existants ($...$, \[...\], \(...\))
    // Utiliser un pattern plus strict pour éviter les faux positifs
    text = text.replace(/\$[^$]+\$|\\\[[^\]]+\\\]|\\\([^)]+\\\)/g, (match) => {
      // Vérifier que c'est vraiment un bloc LaTeX valide
      if (match.length > 2 && (match.startsWith('$') || match.startsWith('\\[') || match.startsWith('\\('))) {
        const placeholder = `__LATEX_PROTECT_${blockIndex}__`
        latexBlocks.push({ placeholder, content: match })
        blockIndex++
        return placeholder
      }
      return match
    })
    
    // Convertir les racines carrées simples comme sqrt(x), sqrt(2), etc.
    text = text.replace(/sqrt\(([^)]+)\)/gi, (match, content) => {
      if (!match.includes('__LATEX_PROTECT_')) {
        return `$\\sqrt{${content}}$`
      }
      return match
    })
    
    // Convertir les fractions simples comme 1/2, x/y, etc.
    text = text.replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, (match, num, den) => {
      if (!match.includes('$') && !match.includes('\\') && !match.includes('__LATEX_PROTECT_')) {
        return `$\\frac{${num}}{${den}}$`
      }
      return match
    })
    
    // Convertir les indices comme x_2, x_i, etc.
    text = text.replace(/([a-zA-Z0-9]+)_([0-9]+|[a-zA-Z]+)/g, (match, base, sub) => {
      if (!match.includes('$') && !match.includes('\\') && !match.includes('__LATEX_PROTECT_')) {
        return `$${base}_{${sub}}$`
      }
      return match
    })
    
    // Convertir les notations comme x^n, x^(n-1), n*x^(n-1), etc. en LaTeX
    // D'abord, gérer les exposants avec parenthèses: x^(n-1), x^(n+1), etc.
    text = text.replace(/([a-zA-Z0-9]+)\^\(([^)]+)\)/g, (match, base, exp) => {
      if (!match.includes('$') && !match.includes('\\') && !match.includes('__LATEX_PROTECT_')) {
        return `$${base}^{${exp}}$`
      }
      return match
    })
    
    // Ensuite, gérer les exposants simples: x^n, x^2, etc.
    text = text.replace(/([a-zA-Z0-9]+)\^([0-9]+|[a-zA-Z]+)/g, (match, base, exp) => {
      if (!match.includes('$') && !match.includes('\\') && !match.includes('__LATEX_PROTECT_')) {
        return `$${base}^{${exp}}$`
      }
      return match
    })
    
    // Convertir les multiplications avec exposants: n*x^(n-1), 2*x^2, etc.
    text = text.replace(/([a-zA-Z0-9]+)\*([a-zA-Z0-9]+)\^\(([^)]+)\)/g, (match, coeff, base, exp) => {
      if (!match.includes('$') && !match.includes('\\') && !match.includes('__LATEX_PROTECT_')) {
        return `$${coeff} \\cdot ${base}^{${exp}}$`
      }
      return match
    })
    
    text = text.replace(/([a-zA-Z0-9]+)\*([a-zA-Z0-9]+)\^([0-9]+|[a-zA-Z]+)/g, (match, coeff, base, exp) => {
      if (!match.includes('$') && !match.includes('\\') && !match.includes('__LATEX_PROTECT_')) {
        return `$${coeff} \\cdot ${base}^{${exp}}$`
      }
      return match
    })
    
    // Restaurer les blocs LaTeX protégés (dans l'ordre inverse)
    for (let i = latexBlocks.length - 1; i >= 0; i--) {
      const { placeholder, content } = latexBlocks[i]
      // Utiliser une regex échappée pour remplacer exactement le placeholder
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      text = text.replace(new RegExp(escapedPlaceholder, 'g'), content)
    }
    
    // Nettoyer TOUS les placeholders restants (sécurité absolue) - plusieurs fois pour être sûr
    text = cleanPlaceholders(text)
    text = cleanPlaceholders(text) // Double nettoyage
    text = cleanPlaceholders(text) // Triple nettoyage pour être absolument sûr
    
    return text
  }

  const stepLikelyHasMath = (text) => {
    if (!text) return false
    const mathIndicators = [
      '\\', '^', '_', '=', 'lim', 'frac', 'sqrt', 'sum', 'int', '∞', '∑', '∫',
      '/', '→'
    ]
    const lowered = text.toLowerCase()
    return mathIndicators.some(indicator => lowered.includes(indicator))
  }

  const parsedExplanationSteps = useMemo(() => {
    if (!result?.explanation) return []
    return parseExplanation(result.explanation)
  }, [result?.explanation])

  const sanitizedMainLatex = useMemo(() => sanitizeLatexExpression(result?.latex), [result?.latex])

  const structureSummaryForDigest = (text) => {
    if (!text) return { sections: [], paragraphs: [], result: '' }
    
    const lines = text.split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean)
    
    const sections = []
    const paragraphs = []
    let resultText = ''
    
    lines.forEach((line) => {
      if (!resultText && /résultat|result/i.test(line)) {
        const afterColon = line.split(':').slice(1).join(':').trim()
        resultText = afterColon || line.replace(/résultat[\s:]/i, '').trim()
        return
      }
      
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0 && colonIndex < line.length - 1) {
        const label = line.slice(0, colonIndex).trim()
        const value = line.slice(colonIndex + 1).trim()
        if (label.length <= 40 && value.length > 0) {
          sections.push({ label, value })
          return
        }
      }
      
      paragraphs.push(line)
    })
    
    return { sections, paragraphs, result: resultText }
  }

  const getSummaryTextForIndex = (index) => {
    if (parsedExplanationSteps[index]?.content) {
      return parsedExplanationSteps[index].content
    }
    if (Array.isArray(result?.steps) && result.steps[index]) {
      return result.steps[index]
    }
    if (result?.explanation) {
      const paragraphs = result.explanation
        .split(/\n\s*\n+/)
        .map(p => p.trim())
        .filter(Boolean)
      return paragraphs[index] || paragraphs[paragraphs.length - 1] || ''
    }
    return ''
  }

  // Fonction pour rendre le texte avec LaTeX de manière améliorée
  const renderTextWithLatex = (text) => {
    if (!text) return null
    
    let normalized = String(text)
    normalized = cleanPlaceholders(normalized)
    normalized = convertMathNotationToLatex(normalized)
    normalized = cleanPlaceholders(normalized)
    
    const paragraphStyle = { margin: '8px 0', lineHeight: 1.7 }
    const latexPattern = /\$([^$]+)\$|\\\[([^\]]+)\\\]|\\\(([^)]+)\\\)|(\\[a-zA-Z]+\s*(?:\{[^}]*\})*(?:\{[^}]*\})*)/g
    const lines = normalized.split('\n')
    
    const paragraphs = lines
      .map(line => line.trim())
      .filter((line, idx) => line.length > 0 || (idx > 0 && line === ''))
    
    if (paragraphs.length === 0) {
      paragraphs.push(normalized.trim())
    }
    
    const renderParagraph = (paragraph, paragraphIndex) => {
      if (!paragraph || !paragraph.trim()) {
        return <div key={`empty-${paragraphIndex}`} style={{ height: '8px' }}></div>
      }
      
      const parts = []
      let lastIndex = 0
      let match
      latexPattern.lastIndex = 0
      
      while ((match = latexPattern.exec(paragraph)) !== null) {
        if (match.index > lastIndex) {
          let textBefore = paragraph.substring(lastIndex, match.index).trim()
          textBefore = cleanPlaceholders(textBefore)
          if (textBefore) {
            const equationRefPattern = /(Équation\s+\d+:|Equation\s+\d+:)/i
            if (equationRefPattern.test(textBefore)) {
              parts.push(
                <strong key={`text-${paragraphIndex}-${lastIndex}`} className="explanation-text-part equation-reference">
                  {textBefore}
                </strong>
              )
            } else {
              parts.push(
                <span key={`text-${paragraphIndex}-${lastIndex}`} className="explanation-text-part">
                  {textBefore}
                </span>
              )
            }
          }
        }
        
        const latex = match[1] || match[2] || match[3] || match[0]
        const isExplicitBlock = match[0].startsWith('\\[') || match[0].startsWith('$$')
        const hasComplexCommand = latex.includes('\\lim') && latex.includes('\\frac') ||
                                  latex.includes('\\sum') ||
                                  latex.includes('\\int') ||
                                  latex.includes('\\prod') ||
                                  (latex.includes('\\frac') && latex.length > 40) ||
                                  (latex.includes('\\sqrt') && latex.length > 30)
        const isBlock = isExplicitBlock || (hasComplexCommand && latex.length > 40)
        
        try {
          parts.push(
            isBlock ? (
              <div key={`latex-${paragraphIndex}-${match.index}`} className="latex-block-inline">
                <BlockMath math={latex} />
              </div>
            ) : (
              <span key={`latex-${paragraphIndex}-${match.index}`} className="latex-inline-wrapper">
                <InlineMath math={latex} />
              </span>
            )
          )
        } catch (err) {
          console.warn('Erreur LaTeX:', err, latex)
          parts.push(
            <span key={`latex-error-${paragraphIndex}-${match.index}`} className="latex-error">
              {latex}
            </span>
          )
        }
        
        lastIndex = match.index + match[0].length
      }
      
      if (lastIndex < paragraph.length) {
        let textAfter = paragraph.substring(lastIndex).trim()
        textAfter = cleanPlaceholders(textAfter)
        if (textAfter) {
          parts.push(
            <span key={`text-${paragraphIndex}-${lastIndex}`} className="explanation-text-part">
              {textAfter}
            </span>
          )
        }
      }
      
      if (parts.length === 0) {
        const cleanedParagraph = cleanPlaceholders(paragraph)
        if (!cleanedParagraph) return null
        return (
          <p key={`paragraph-${paragraphIndex}`} style={paragraphStyle} className="rich-text-paragraph">
            {cleanedParagraph}
          </p>
        )
      }
      
      return (
        <p key={`paragraph-${paragraphIndex}`} style={paragraphStyle} className="rich-text-paragraph">
          {parts}
        </p>
      )
    }
    
    return (
      <div className="explanation-text-wrapper">
        {paragraphs.map((paragraph, index) => renderParagraph(paragraph, index))}
      </div>
    )
  }

  return (
    <div className={`math-solver-container ${theme}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {showCamera && (
        <div className="camera-modal">
          <div className="camera-modal-content">
            <video ref={cameraVideoRef} autoPlay playsInline className="camera-video" />
            <canvas ref={cameraCanvasRef} style={{ display: 'none' }} />
            <div className="camera-controls">
              <button onClick={closeCamera} className="camera-btn cancel">
                Annuler
              </button>
              <button 
                onClick={capturePhoto} 
                className="camera-btn capture"
                disabled={!cameraReady}
                style={{ 
                  opacity: cameraReady ? 1 : 0.6,
                  cursor: cameraReady ? 'pointer' : 'not-allowed'
                }}
              >
                {cameraReady ? 'Capturer' : 'Préparation...'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="math-solver-content">
        <div className="image-upload-section">
          <h3>{t('uploadImage') || 'Télécharger une image'}</h3>
          
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button onClick={handleReset} className="reset-btn">
                {t('reset') || 'Réinitialiser'}
              </button>
            </div>
          ) : (
            <div className="upload-options">
              <button onClick={handleUploadClick} className="upload-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {t('uploadPhoto') || 'Télécharger une photo'}
              </button>
              <button onClick={handleCameraClick} className="camera-btn-upload">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {t('captureImage') || 'Capturer une image'}
              </button>
            </div>
          )}

          {image && (
            <button 
              onClick={handleSolve} 
              disabled={loading}
              className="solve-btn"
            >
              {loading ? (t('solving') || 'Résolution...') : (t('solve') || 'Résoudre')}
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="solution-section">
            <div className="solution-header">
              <h3>{t('solution') || 'Solution'}</h3>
              <button onClick={handleExportPDF} className="export-pdf-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {t('exportPDF') || 'Télécharger en PDF'}
              </button>
            </div>

            {result.latexSegments?.length > 0 && (
              <div className="solution-digest">
                <p className="solution-digest-intro">
                  Voici tous les calculs détaillés. Chaque carte affiche la limite reconnue et un résumé rapide pour comprendre le raisonnement.
                </p>
                {result.latexSegments.map((segment, index) => {
                  const sanitizedSegment = sanitizeLatexExpression(segment)
                  if (!sanitizedSegment) return null
                  const summaryText = getSummaryTextForIndex(index)
                  const structuredSummary = structureSummaryForDigest(summaryText)
                  return (
                    <div key={`digest-${index}`} className="solution-digest-item">
                      <div className="digest-index">✳️ {index + 1}</div>
                      <div className="digest-content">
                        <div className="digest-equation">
                          <BlockMath math={sanitizedSegment} />
                        </div>
                        {summaryText && (
                          <div className="digest-text">
                            {structuredSummary.sections.length > 0 && (
                              <div className="digest-steps">
                                {structuredSummary.sections.map((section, sectionIndex) => (
                                  <div key={`section-${sectionIndex}`} className="digest-step">
                                    <strong>{section.label} :</strong>
                                    <div className="digest-step-content">
                                      {renderTextWithLatex(section.value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {structuredSummary.paragraphs.length > 0 && (
                              <div className="digest-paragraphs">
                                {structuredSummary.paragraphs.map((paragraph, paragraphIndex) => (
                                  <div key={`paragraph-${paragraphIndex}`} className="digest-paragraph">
                                    {renderTextWithLatex(paragraph)}
                                  </div>
                                ))}
                              </div>
                            )}
                            {structuredSummary.result && (
                              <div className="digest-result">
                                <span className="result-icon">✅</span>
                                <span className="result-text">
                                  Résultat : {renderTextWithLatex(structuredSummary.result)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {sanitizedMainLatex && (
              <div className="latex-equation">
              <h4>{t('equation') || 'Équation:'}</h4>
                <BlockMath math={sanitizedMainLatex} />
              </div>
            )}

            {result.wolfram_solution && (
              <div className="wolfram-solution">
                <h4>{t('calculatedSolution') || 'Solution calculée:'}</h4>
                <div className="wolfram-solution-content">
                  {renderTextWithLatex(result.wolfram_solution)}
                </div>
              </div>
            )}

            {result.explanation && (
              <div className="explanation-section">
                <h4>{t('stepByStepExplanation') || 'Explication étape par étape:'}</h4>
                <div className="explanation-content">
                  {(() => {
                    // Essayer de parser l'explication en étapes
                    const parsedSteps = parsedExplanationSteps.length > 0
                      ? parsedExplanationSteps
                      : parseExplanation(result.explanation)
                    
                    if (parsedSteps.length > 0) {
                      return parsedSteps.map((step, index) => {
                        const fallbackLatex = result.latexSegments?.[index]
                        const sanitizedFallback = sanitizeLatexExpression(fallbackLatex)
                        const needsFallback = !stepLikelyHasMath(step.content) && sanitizedFallback
                        return (
                          <div key={index} className="explanation-step">
                            <div className="step-number">{step.number}</div>
                            <div className="step-content">
                              {renderTextWithLatex(step.content)}
                              {needsFallback && (
                                <div className="step-fallback-latex">
                                  <BlockMath math={sanitizedFallback} />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    } else if (result.steps && result.steps.length > 0) {
                      return result.steps.map((step, index) => {
                        const fallbackLatex = result.latexSegments?.[index]
                        const sanitizedFallback = sanitizeLatexExpression(fallbackLatex)
                        const needsFallback = !stepLikelyHasMath(step) && sanitizedFallback
                        return (
                          <div key={index} className="explanation-step">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                              {renderTextWithLatex(step)}
                              {needsFallback && (
                                <div className="step-fallback-latex">
                                  <BlockMath math={sanitizedFallback} />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    } else {
                      // Diviser l'explication par paragraphes ou lignes
                      const paragraphs = result.explanation.split(/\n\s*\n/).filter(p => p.trim())
                      if (paragraphs.length > 1) {
                        return paragraphs.map((paragraph, index) => (
                          <div key={index} className="explanation-step">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">
                              {renderTextWithLatex(paragraph.trim())}
                            </div>
                          </div>
                        ))
                      } else {
                        return (
                          <div className="explanation-text">
                            {renderTextWithLatex(result.explanation)}
                          </div>
                        )
                      }
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MathSolver

