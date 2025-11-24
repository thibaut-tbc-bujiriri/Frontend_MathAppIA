/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { apiRequest } from './config'
import { getTranslation } from './translations'
import MathSolver from './MathSolver'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

// Composant Login
function Login({ onSwitchToSignUp, onSwitchToForgotPassword, onLoginSuccess, theme, toggleTheme, language, t, toggleLanguage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    
    try {
      const { response, data } = await apiRequest('login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        alert(data.message || 'Erreur de connexion')
        return
      }
      
      if (data.success) {
        onLoginSuccess(data.user)
      } else {
        alert(data.message || t('invalidCredentials'))
      }
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'Non configurée'
        alert(`Erreur de connexion réseau.\n\nURL backend configurée: ${apiUrl}\n\nVérifiez que:\n1. La variable VITE_API_URL est configurée sur Vercel\n2. Le backend Railway est accessible\n3. L'URL est correcte: https://backendmathassistantia-production.up.railway.app`)
      } else {
        // Afficher un message d'erreur plus informatif
        const errorMsg = error.message || 'Erreur inconnue'
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
          const apiUrl = import.meta.env.VITE_API_URL || 'Non configurée'
          alert(`Erreur de connexion réseau.\n\nURL backend configurée: ${apiUrl}\n\nVérifiez que:\n1. La variable VITE_API_URL est configurée sur Vercel\n2. Le backend Railway est accessible\n3. L'URL est correcte: https://backendmathassistantia-production.up.railway.app`)
        } else {
          alert(t('loginFailed') + ': ' + errorMsg)
        }
      }
    }
  }

  return (
    <div className={`login-container ${theme}`}>
      {/* Theme and Language Toggle Buttons */}
      <div className="top-controls">
        <button className="language-toggle-btn" onClick={toggleLanguage} title={language === 'fr' ? 'Switch to English' : 'Passer au français'}>
          {language === 'fr' ? 'EN' : 'FR'}
        </button>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      <div className="login-card">
        {/* Icon */}
        <div className="app-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#3B82F6"/>
            <path d="M12 24H36M24 12V36M20 20L28 28M28 20L20 28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="app-title">Math Solver</h1>
        <p className="app-subtitle">{t('login')}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="input-group">
            <label htmlFor="login-email">{t('email')}</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="login-email"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 5.83333L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 5.83333M4.16667 15.8333H15.8333C16.7538 15.8333 17.5 15.0872 17.5 14.1667V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V14.1667C2.5 15.0872 3.24619 15.8333 4.16667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <label htmlFor="login-password">{t('password')}</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.79857 8.51809 7.5 9.01722 7.5 9.58333C7.5 10.7155 8.38447 11.6 9.51667 11.6C10.0828 11.6 10.5819 11.3014 10.9417 10.9417M5.97499 5.97499C4.60833 6.92916 3.45 8.30833 2.5 9.99999C3.45 11.6917 4.60833 13.0708 5.97499 14.025C7.34166 14.9792 8.91666 15.4167 10 15.4167C11.0833 15.4167 12.6583 14.9792 14.025 14.025L5.97499 5.97499ZM14.025 14.025L11.1917 11.1917M14.025 14.025C15.3917 13.0708 16.55 11.6917 17.5 9.99999C16.55 8.30833 15.3917 6.92916 14.025 5.97499C12.6583 5.02083 11.0833 4.58333 10 4.58333C9.34166 4.58333 8.72499 4.69999 8.15833 4.90833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 9.99999C2.5 9.99999 5.83333 4.58333 10 4.58333C14.1667 4.58333 17.5 9.99999 17.5 9.99999C17.5 9.99999 14.1667 15.4167 10 15.4167C5.83333 15.4167 2.5 9.99999 2.5 9.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToForgotPassword(); }}>
              {t('forgotPassword')}
            </a>
          </div>

          {/* Login Button */}
          <button type="submit" className="login-button">
            {t('logIn')}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="signup-link">
          <span>{t('dontHaveAccount')} </span>
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }}>
            {t('signUp')}
          </a>
        </div>
      </div>
    </div>
  )
}

// Composant ForgotPassword
function ForgotPassword({ onSwitchToLogin, theme, toggleTheme, language, t, toggleLanguage }) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(1) // 1: email, 2: code + new password
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { response, data } = await apiRequest('forgot_password.php', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      
      // Vérifier si la réponse HTTP indique une erreur
      if (!response.ok) {
        // Afficher le message d'erreur du serveur
        const errorMsg = data.message || `Erreur ${response.status}: ${response.statusText}`
        alert(errorMsg)
        return
      }
      
      if (data.success) {
        if (data.token) {
          setToken(data.token)
          setStep(2)
          // Email envoyé avec succès - le code est dans l'email, pas dans la réponse
          alert(data.message || 'Un code de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception.')
        } else {
          alert(data.message || 'Si cet email existe, un code de réinitialisation vous sera envoyé.')
        }
      } else {
        // Erreur : email n'existe pas ou autre erreur
        alert(data.message || t('resetFailed'))
        // Afficher les détails de l'erreur si disponibles
        let errorMsg = data.message || t('resetFailed')
        if (data.error_details) {
          errorMsg += '\n\nDétails: ' + data.error_details
        }
        alert(errorMsg)
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const apiUrl = import.meta.env.VITE_API_URL || 'Non configurée'
        alert(`Erreur de connexion réseau.\n\nURL backend configurée: ${apiUrl}\n\nVérifiez que:\n1. La variable VITE_API_URL est configurée sur Vercel\n2. Le backend Railway est accessible\n3. L'URL est correcte: https://backendmathassistantia-production.up.railway.app`)
      } else {
        alert(t('resetFailed') + ': ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      alert(t('passwordsNotMatch'))
      return
    }

    if (newPassword.length < 6) {
      alert(t('passwordMinLength'))
      return
    }

    if (!resetCode || resetCode.length !== 6) {
      alert(t('enter6DigitCode'))
      return
    }

    setLoading(true)
    
    try {
      console.log('Reset password attempt:', { 
        token: token ? token.substring(0, 20) + '...' : 'missing',
        resetCode: resetCode,
        hasToken: !!token 
      })
      
      const { response, data } = await apiRequest('reset_password.php', {
        method: 'POST',
        body: JSON.stringify({ 
          token: token,
          reset_code: resetCode.trim(),
          new_password: newPassword 
        })
      })
      
      console.log('Reset password response:', response.status, data)
      
      if (!response.ok) {
        console.error('Response error:', response.status, data)
        const errorMsg = data.message || t('resetFailed')
        const errorDetails = data.error ? `\n\nDétails: ${data.error}` : ''
        const errorCode = data.error_code ? `\nCode erreur: ${data.error_code}` : ''
        alert(errorMsg + errorDetails + errorCode)
        if (data.error_code) {
          console.error('Error code:', data.error_code)
        }
        return
      }
      
      if (data.success) {
        alert(t('passwordResetSuccess'))
        onSwitchToLogin()
      } else {
        const errorMsg = data.message || t('resetFailed')
        const errorDetails = data.error ? `\n\nDétails: ${data.error}` : ''
        alert(errorMsg + errorDetails)
        if (data.error) {
          console.error('Error details:', data.error)
        }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      alert(t('resetFailed') + ': ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`login-container ${theme}`}>
      {/* Theme and Language Toggle Buttons */}
      <div className="top-controls">
        <button className="language-toggle-btn" onClick={toggleLanguage} title={language === 'fr' ? 'Switch to English' : 'Passer au français'}>
          {language === 'fr' ? 'EN' : 'FR'}
        </button>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      <div className="login-card">
        {/* Icon */}
        <div className="app-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#3B82F6"/>
            <path d="M12 24H36M24 12V36M20 20L28 28M28 20L20 28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="app-title">Math Solver</h1>
        <p className="app-subtitle">
          {step === 1 ? t('resetPassword') : t('enterCodeAndPassword')}
        </p>

        {/* Form */}
        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="login-form">
            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="forgot-email">{t('email')}</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="forgot-email"
                  placeholder={t('enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5.83333L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 5.83333M4.16667 15.8333H15.8333C16.7538 15.8333 17.5 15.0872 17.5 14.1667V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V14.1667C2.5 15.0872 3.24619 15.8333 4.16667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? t('sending') : t('sendCode')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form">
            {/* Reset Code Field */}
            <div className="input-group">
              <label htmlFor="reset-code">{t('resetCode')}</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="reset-code"
                  placeholder={t('enter6DigitCode')}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="input-group">
              <label htmlFor="new-password">{t('newPassword')}</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="new-password"
                  placeholder={t('enterNewPassword')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.79857 8.51809 7.5 9.01722 7.5 9.58333C7.5 10.7155 8.38447 11.6 9.51667 11.6C10.0828 11.6 10.5819 11.3014 10.9417 10.9417M5.97499 5.97499C4.60833 6.92916 3.45 8.30833 2.5 9.99999C3.45 11.6917 4.60833 13.0708 5.97499 14.025C7.34166 14.9792 8.91666 15.4167 10 15.4167C11.0833 15.4167 12.6583 14.9792 14.025 14.025L5.97499 5.97499ZM14.025 14.025L11.1917 11.1917M14.025 14.025C15.3917 13.0708 16.55 11.6917 17.5 9.99999C16.55 8.30833 15.3917 6.92916 14.025 5.97499C12.6583 5.02083 11.0833 4.58333 10 4.58333C9.34166 4.58333 8.72499 4.69999 8.15833 4.90833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 9.99999C2.5 9.99999 5.83333 4.58333 10 4.58333C14.1667 4.58333 17.5 9.99999 17.5 9.99999C17.5 9.99999 14.1667 15.4167 10 15.4167C5.83333 15.4167 2.5 9.99999 2.5 9.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
              <label htmlFor="confirm-new-password">{t('confirmPassword')}</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-new-password"
                  placeholder={t('enterConfirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.79857 8.51809 7.5 9.01722 7.5 9.58333C7.5 10.7155 8.38447 11.6 9.51667 11.6C10.0828 11.6 10.5819 11.3014 10.9417 10.9417M5.97499 5.97499C4.60833 6.92916 3.45 8.30833 2.5 9.99999C3.45 11.6917 4.60833 13.0708 5.97499 14.025C7.34166 14.9792 8.91666 15.4167 10 15.4167C11.0833 15.4167 12.6583 14.9792 14.025 14.025L5.97499 5.97499ZM14.025 14.025L11.1917 11.1917M14.025 14.025C15.3917 13.0708 16.55 11.6917 17.5 9.99999C16.55 8.30833 15.3917 6.92916 14.025 5.97499C12.6583 5.02083 11.0833 4.58333 10 4.58333C9.34166 4.58333 8.72499 4.69999 8.15833 4.90833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 9.99999C2.5 9.99999 5.83333 4.58333 10 4.58333C14.1667 4.58333 17.5 9.99999 17.5 9.99999C17.5 9.99999 14.1667 15.4167 10 15.4167C5.83333 15.4167 2.5 9.99999 2.5 9.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? t('resetting') : t('resetPasswordButton')}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="signup-link">
          <span>{t('rememberPassword')} </span>
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
            {t('logIn')}
          </a>
        </div>
      </div>
    </div>
  )
}

// Composant SignUp
function SignUp({ onSwitchToLogin, theme, toggleTheme, language, t, toggleLanguage }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (password !== confirmPassword) {
      alert(t('passwordsNotMatch'))
      return
    }

    if (password.length < 6) {
      alert(t('passwordMinLength'))
      return
    }

    console.log('Sign up attempt:', { name, email, password })
    
    try {
      const { response, data } = await apiRequest('register.php', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      
      if (!response.ok) {
        alert(data.message || t('registrationFailed'))
        return
      }
      
      if (data.success) {
        alert(t('accountCreated'))
        onSwitchToLogin()
      } else {
        alert(data.message || t('registrationFailed'))
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Gérer tous les types d'erreurs de réseau
      const errorMsg = error.message || 'Erreur inconnue'
      if (error.name === 'TypeError' && (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError'))) {
        const apiUrl = import.meta.env.VITE_API_URL || 'Non configurée'
        alert(`Erreur de connexion réseau.\n\nURL backend configurée: ${apiUrl}\n\nVérifiez que:\n1. La variable VITE_API_URL est configurée sur Vercel\n2. Le backend Railway est accessible\n3. L'URL est correcte: https://backendmathassistantia-production.up.railway.app`)
      } else {
        alert('Erreur: ' + errorMsg + '\n\nVérifiez la console pour plus de détails.')
      }
    }
  }

  return (
    <div className={`login-container ${theme}`}>
      {/* Theme and Language Toggle Buttons */}
      <div className="top-controls">
        <button className="language-toggle-btn" onClick={toggleLanguage} title={language === 'fr' ? 'Switch to English' : 'Passer au français'}>
          {language === 'fr' ? 'EN' : 'FR'}
        </button>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      <div className="login-card">
        {/* Icon */}
        <div className="app-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#3B82F6"/>
            <path d="M12 24H36M24 12V36M20 20L28 28M28 20L20 28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="app-title">Math Solver</h1>
        <p className="app-subtitle">{t('createAccount')}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Name Field */}
          <div className="input-group">
            <label htmlFor="signup-name">{t('fullName')}</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="signup-name"
                placeholder={t('enterFullName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10C11.8417 10 13.3333 8.50833 13.3333 6.66667C13.3333 4.825 11.8417 3.33333 10 3.33333C8.15833 3.33333 6.66667 4.825 6.66667 6.66667C6.66667 8.50833 8.15833 10 10 10ZM10 12.0833C7.425 12.0833 3.33333 13.3167 3.33333 15.8333V16.6667H16.6667V15.8333C16.6667 13.3167 12.575 12.0833 10 12.0833Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Email Field */}
          <div className="input-group">
            <label htmlFor="signup-email">{t('email')}</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="signup-email"
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 5.83333L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 5.83333M4.16667 15.8333H15.8333C16.7538 15.8333 17.5 15.0872 17.5 14.1667V5.83333C17.5 4.91286 16.7538 4.16667 15.8333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V14.1667C2.5 15.0872 3.24619 15.8333 4.16667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <label htmlFor="signup-password">{t('password')}</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="signup-password"
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.79857 8.51809 7.5 9.01722 7.5 9.58333C7.5 10.7155 8.38447 11.6 9.51667 11.6C10.0828 11.6 10.5819 11.3014 10.9417 10.9417M5.97499 5.97499C4.60833 6.92916 3.45 8.30833 2.5 9.99999C3.45 11.6917 4.60833 13.0708 5.97499 14.025C7.34166 14.9792 8.91666 15.4167 10 15.4167C11.0833 15.4167 12.6583 14.9792 14.025 14.025L5.97499 5.97499ZM14.025 14.025L11.1917 11.1917M14.025 14.025C15.3917 13.0708 16.55 11.6917 17.5 9.99999C16.55 8.30833 15.3917 6.92916 14.025 5.97499C12.6583 5.02083 11.0833 4.58333 10 4.58333C9.34166 4.58333 8.72499 4.69999 8.15833 4.90833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 9.99999C2.5 9.99999 5.83333 4.58333 10 4.58333C14.1667 4.58333 17.5 9.99999 17.5 9.99999C17.5 9.99999 14.1667 15.4167 10 15.4167C5.83333 15.4167 2.5 9.99999 2.5 9.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="input-group">
            <label htmlFor="signup-confirm-password">{t('confirmPassword')}</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="signup-confirm-password"
                placeholder={t('enterConfirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.79857 8.51809 7.5 9.01722 7.5 9.58333C7.5 10.7155 8.38447 11.6 9.51667 11.6C10.0828 11.6 10.5819 11.3014 10.9417 10.9417M5.97499 5.97499C4.60833 6.92916 3.45 8.30833 2.5 9.99999C3.45 11.6917 4.60833 13.0708 5.97499 14.025C7.34166 14.9792 8.91666 15.4167 10 15.4167C11.0833 15.4167 12.6583 14.9792 14.025 14.025L5.97499 5.97499ZM14.025 14.025L11.1917 11.1917M14.025 14.025C15.3917 13.0708 16.55 11.6917 17.5 9.99999C16.55 8.30833 15.3917 6.92916 14.025 5.97499C12.6583 5.02083 11.0833 4.58333 10 4.58333C9.34166 4.58333 8.72499 4.69999 8.15833 4.90833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 9.99999C2.5 9.99999 5.83333 4.58333 10 4.58333C14.1667 4.58333 17.5 9.99999 17.5 9.99999C17.5 9.99999 14.1667 15.4167 10 15.4167C5.83333 15.4167 2.5 9.99999 2.5 9.99999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button type="submit" className="login-button">
            {t('signUp')}
          </button>
        </form>

        {/* Login Link */}
        <div className="signup-link">
          <span>{t('alreadyHaveAccount')} </span>
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
            {t('logIn')}
          </a>
        </div>
      </div>
    </div>
  )
}

// Composant Home - Interface principale après connexion
function Home({ user, onLogout, theme, toggleTheme, onNavigateToHistory, language, t, toggleLanguage }) {
  return (
    <div className={`home-container ${theme}`}>
      {/* Header */}
      <header className="home-header">
        <h1 className="home-header-title">{t('mathAssistant')}</h1>
        <div className="header-actions">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name || user.email}</span>
            </div>
          )}
          <button className="language-toggle-btn" onClick={toggleLanguage} title={language === 'fr' ? 'Switch to English' : 'Passer au français'}>
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
          <button className="history-btn" onClick={onNavigateToHistory} title={t('history')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
          <button className="logout-btn" onClick={onLogout} title="Déconnexion">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="moon-icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="home-main">
        <MathSolver 
          theme={theme}
          language={language}
          t={t}
          onProblemSolved={(data) => {
            console.log('Problème résolu:', data)
          }}
        />
      </main>
    </div>
  )
}

// Composant History - Interface pour afficher l'historique
function History({ theme, toggleTheme, onNavigateToHome, history, deleteHistoryItem, clearAllHistory, language, t, toggleLanguage }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fonction pour nettoyer les placeholders
  const cleanPlaceholders = (text) => {
    if (!text) return text
    let cleaned = String(text)
    cleaned = cleaned.replace(/__LATEX_BLOCK_\d+__/g, '')
    cleaned = cleaned.replace(/__LATEX_PROTECT_\d+__/g, '')
    cleaned = cleaned.replace(/__EXISTING_PLACEHOLDER_\d+__/g, '')
    cleaned = cleaned.replace(/__LATEX[_\w]*_\d+__/g, '')
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

  // Fonction pour détecter si une chaîne contient du LaTeX
  const containsLaTeX = (str) => {
    if (!str) return false
    // Détecter les commandes LaTeX courantes
    const latexCommands = [
      '\\frac', '\\lim', '\\sum', '\\int', '\\prod', '\\sqrt', '\\exists', '\\forall',
      '\\in', '\\notin', '\\subset', '\\supset', '\\cup', '\\cap', '\\cdot', '\\times',
      '\\div', '\\pm', '\\mp', '\\leq', '\\geq', '\\neq', '\\approx', '\\equiv',
      '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\theta', '\\lambda',
      '\\mu', '\\pi', '\\sigma', '\\phi', '\\Phi', '\\omega', '\\Omega',
      '\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\exp',
      '\\rightarrow', '\\leftarrow', '\\Rightarrow', '\\Leftarrow',
      '\\left(', '\\right)', '\\left[', '\\right]', '\\left{', '\\right}',
      '\\to', '\\infty', '\\partial', '\\nabla'
    ]
    
    // Vérifier si la chaîne contient des commandes LaTeX
    const hasLaTeXCommand = latexCommands.some(cmd => str.includes(cmd))
    
    // Vérifier si la chaîne contient des patterns LaTeX (commandes avec accolades)
    const hasLaTeXPattern = /\\[a-zA-Z]+\s*\{[^}]*\}/.test(str) || /\\[a-zA-Z]+\s*\([^)]*\)/.test(str)
    
    // Vérifier si la chaîne contient des indices ou exposants LaTeX
    const hasLaTeXSubSup = /[a-zA-Z0-9]+\^[a-zA-Z0-9]+|[a-zA-Z0-9]+_[a-zA-Z0-9]+/.test(str)
    
    return hasLaTeXCommand || hasLaTeXPattern || hasLaTeXSubSup
  }

  // Fonction pour extraire les équations LaTeX d'une ligne (version simplifiée)
  const extractLaTeXFromLine = (line) => {
    // Si la ligne entière semble être du LaTeX, la retourner comme une seule partie LaTeX
    if (line.trim().startsWith('\\') && containsLaTeX(line)) {
      // Chercher où se termine l'équation LaTeX (jusqu'à la fin de la ligne ou jusqu'à un point/virgule suivi d'un espace)
      const latexEndMatch = line.match(/^([^.,!?;]+[.,!?;]?)(?:\s|$)/)
      if (latexEndMatch) {
        const latexPart = latexEndMatch[1].trim()
        const textAfter = line.substring(latexEndMatch[0].length).trim()
        const parts = []
        if (latexPart && containsLaTeX(latexPart)) {
          parts.push({ type: 'latex', content: latexPart })
        }
        if (textAfter) {
          parts.push({ type: 'text', content: textAfter })
        }
        return parts.length > 0 ? parts : [{ type: 'latex', content: line.trim() }]
      }
      return [{ type: 'latex', content: line.trim() }]
    }
    
    // Sinon, chercher des segments LaTeX dans la ligne
    const parts = []
    const latexRegex = /(\\[a-zA-Z]+(?:\{[^}]*\})*(?:\([^)]*\))*(?:\{[^}]*\})*)/g
    let lastIndex = 0
    let match
    
    while ((match = latexRegex.exec(line)) !== null) {
      // Ajouter le texte avant
      if (match.index > lastIndex) {
        const textBefore = line.substring(lastIndex, match.index).trim()
        if (textBefore) {
          parts.push({ type: 'text', content: textBefore })
        }
      }
      
      // Ajouter le LaTeX
      if (containsLaTeX(match[1])) {
        parts.push({ type: 'latex', content: match[1] })
      } else {
        parts.push({ type: 'text', content: match[1] })
      }
      
      lastIndex = match.index + match[0].length
    }
    
    // Ajouter le texte restant
    if (lastIndex < line.length) {
      const textAfter = line.substring(lastIndex).trim()
      if (textAfter) {
        parts.push({ type: 'text', content: textAfter })
      }
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: line.trim() }]
  }

  // Fonction pour rendre le texte avec LaTeX dans l'historique
  const renderHistoryText = (text) => {
    if (!text) return null
    
    text = String(text)
    text = cleanPlaceholders(text)
    text = cleanPlaceholders(text)
    text = cleanPlaceholders(text)
    
    // Diviser le texte en lignes
    const lines = text.split('\n')
    const renderedLines = []
    const paragraphStyle = { margin: '8px 0', lineHeight: 1.7 }
    
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim()
      if (!trimmed) {
        renderedLines.push(<div key={`empty-${lineIndex}`} style={{ height: '8px' }}></div>)
        return
      }
      
      // Si la ligne entière est du LaTeX (commence par \ et contient des commandes LaTeX)
      // Ou si la ligne contient principalement du LaTeX (plus de 50% de la ligne est du LaTeX)
      const isMostlyLaTeX = trimmed.startsWith('\\') && containsLaTeX(trimmed)
      const latexRatio = (trimmed.match(/\\[a-zA-Z]+/g) || []).length / Math.max(trimmed.split(/\s+/).length, 1)
      const isMostlyLaTeXByRatio = latexRatio > 0.3 && containsLaTeX(trimmed)
      
      if (isMostlyLaTeX || isMostlyLaTeXByRatio) {
        try {
          // Si la ligne contient du texte après le LaTeX, séparer
          const latexMatch = trimmed.match(/^(.*?)([.,!?;]?\s+[A-Z][^\\]*)$/)
          if (latexMatch && containsLaTeX(latexMatch[1])) {
            // Ligne avec LaTeX suivi de texte
            renderedLines.push(
              <div key={`latex-line-${lineIndex}`} className="history-latex-block" style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', margin: '12px 0' }}>
                <BlockMath math={latexMatch[1].trim()} />
                {latexMatch[2] && (
                  <div style={{ marginTop: '6px', lineHeight: 1.6 }}>{latexMatch[2].trim()}</div>
                )}
              </div>
            )
          } else {
            // Ligne entièrement LaTeX
            renderedLines.push(
              <div key={`latex-line-${lineIndex}`} className="history-latex-block" style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px', margin: '12px 0' }}>
                <BlockMath math={trimmed} />
              </div>
            )
          }
        } catch (err) {
          console.warn('Erreur LaTeX dans l\'historique:', err, trimmed)
          renderedLines.push(
            <p key={`latex-error-${lineIndex}`} style={paragraphStyle}>{trimmed}</p>
          )
        }
      } else if (containsLaTeX(trimmed)) {
        // La ligne contient du LaTeX mélangé avec du texte
        const parts = extractLaTeXFromLine(trimmed)
        const lineParts = []
        
        parts.forEach((part, partIndex) => {
          if (part.type === 'latex') {
            try {
              lineParts.push(
                <span key={`latex-${lineIndex}-${partIndex}`} style={{ display: 'inline-block', margin: '0 2px' }}>
                  <InlineMath math={part.content} />
                </span>
              )
            } catch (err) {
              console.warn('Erreur LaTeX inline:', err, part.content)
              lineParts.push(
                <span key={`latex-error-${lineIndex}-${partIndex}`}>{part.content}</span>
              )
            }
          } else {
            lineParts.push(
              <span key={`text-${lineIndex}-${partIndex}`}>{part.content}</span>
            )
          }
        })
        
        renderedLines.push(
          <p key={`mixed-line-${lineIndex}`} style={paragraphStyle}>
            {lineParts}
          </p>
        )
      } else {
        // Ligne de texte simple
        renderedLines.push(
          <p key={`text-line-${lineIndex}`} style={paragraphStyle}>{trimmed}</p>
        )
      }
    })
    
    return <div style={{ lineHeight: '1.6' }}>{renderedLines}</div>
  }

  return (
    <div className={`history-container ${theme}`}>
      {/* Header */}
      <header className="history-header">
        <button className="back-btn" onClick={onNavigateToHome}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="history-header-title">{t('history')}</h1>
        <div className="header-actions">
          <button className="language-toggle-btn" onClick={toggleLanguage} title={language === 'fr' ? 'Switch to English' : 'Passer au français'}>
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
          {history.length > 0 && (
            <button className="clear-history-btn" onClick={clearAllHistory} title={t('clearAll')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button className="moon-icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="history-main">
        {history.length === 0 ? (
          <div className="empty-history">
            <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="empty-title">{t('noHistoryYet')}</h2>
            <p className="empty-text">{t('historyDescription')}</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <span className="history-item-date">{formatDate(item.date)}</span>
                  <button className="delete-item-btn" onClick={() => deleteHistoryItem(item.id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {item.image && (
                  <div className="history-item-image">
                    <img src={item.image} alt="Problem" />
                  </div>
                )}
                <div className="history-item-content">
                  <div className="history-item-problem">
                    <strong>{t('problem')}:</strong>
                    <div className="history-item-text">
                      {renderHistoryText(item.problem)}
                    </div>
                  </div>
                  {item.solution && (
                    <div className="history-item-solution">
                      <strong>{t('solution')}:</strong>
                      <div className="history-item-text">
                        {renderHistoryText(item.solution)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Composant principal App
function App() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'signup', 'home', ou 'history'
  const [user, setUser] = useState(null) // Stocker les informations de l'utilisateur connecté
  const [theme, setTheme] = useState('dark') // 'dark' ou 'light'
  const [history, setHistory] = useState([]) // Historique des problèmes résolus
  const [language, setLanguage] = useState('fr') // 'fr' ou 'en'

  // Fonction de traduction
  const t = (key) => getTranslation(language, key)

  // Charger le thème, la langue et l'historique depuis localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.body.setAttribute('data-theme', savedTheme)
    
    const savedLanguage = localStorage.getItem('language') || 'fr'
    setLanguage(savedLanguage)
    
    // Charger l'historique
    const savedHistory = localStorage.getItem('mathHistory')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error('Error loading history:', e)
      }
    }
  }, [])

  // Sauvegarder le thème dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  // Sauvegarder la langue dans localStorage quand elle change
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'fr' ? 'en' : 'fr')
  }

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentView('home')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('login')
  }

  // Fonction pour ajouter un problème à l'historique
  const addToHistory = useCallback((problemData) => {
    const newItem = {
      id: Date.now().toString(),
      problem: problemData.problem || 'Math problem',
      solution: problemData.solution || '',
      image: problemData.image || null,
      date: new Date().toISOString()
    }
    setHistory(prevHistory => {
      const updatedHistory = [newItem, ...prevHistory]
      localStorage.setItem('mathHistory', JSON.stringify(updatedHistory))
      return updatedHistory
    })
  }, [])

  // Fonction pour supprimer un élément de l'historique
  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem('mathHistory', JSON.stringify(updatedHistory))
  }

  // Fonction pour supprimer tout l'historique
  const clearAllHistory = () => {
    if (window.confirm(t('areYouSure'))) {
      setHistory([])
      localStorage.removeItem('mathHistory')
    }
  }

  // Exposer addToHistory via window pour qu'elle puisse être appelée depuis d'autres endroits
  useEffect(() => {
    window.addToHistory = addToHistory
    return () => {
      delete window.addToHistory
    }
  }, [addToHistory])

  return (
    <>
      {currentView === 'login' && (
        <Login 
          onSwitchToSignUp={() => setCurrentView('signup')}
          onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          t={t}
          toggleLanguage={toggleLanguage}
        />
      )}
      {currentView === 'forgot-password' && (
        <ForgotPassword 
          onSwitchToLogin={() => setCurrentView('login')}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          t={t}
          toggleLanguage={toggleLanguage}
        />
      )}
      {currentView === 'signup' && (
        <SignUp 
          onSwitchToLogin={() => setCurrentView('login')}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          t={t}
          toggleLanguage={toggleLanguage}
        />
      )}
      {currentView === 'home' && (
        <Home 
          user={user} 
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          onNavigateToHistory={() => setCurrentView('history')}
          language={language}
          t={t}
          toggleLanguage={toggleLanguage}
        />
      )}
      {currentView === 'history' && (
        <History
          theme={theme}
          toggleTheme={toggleTheme}
          onNavigateToHome={() => setCurrentView('home')}
          history={history}
          deleteHistoryItem={deleteHistoryItem}
          clearAllHistory={clearAllHistory}
          language={language}
          t={t}
          toggleLanguage={toggleLanguage}
        />
      )}
    </>
  )
}

export default App
