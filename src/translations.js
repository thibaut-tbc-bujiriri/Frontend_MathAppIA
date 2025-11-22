// Traductions pour l'application
export const translations = {
  fr: {
    // Login
    login: 'Connexion',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    dontHaveAccount: "Vous n'avez pas de compte?",
    signUp: "S'inscrire",
    logIn: 'Se connecter',
    enterEmail: 'Entrez votre email',
    enterPassword: 'Entrez votre mot de passe',
    
    // Sign Up
    createAccount: 'Créer votre compte',
    fullName: 'Nom complet',
    confirmPassword: 'Confirmer le mot de passe',
    enterFullName: 'Entrez votre nom complet',
    enterConfirmPassword: 'Confirmez votre mot de passe',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    passwordsNotMatch: 'Les mots de passe ne correspondent pas!',
    passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères!',
    
    // Forgot Password
    resetPassword: 'Réinitialiser votre mot de passe',
    enterCodeAndPassword: 'Entrez le code et votre nouveau mot de passe',
    sendCode: 'Envoyer le code',
    sending: 'Envoi...',
    resetCode: 'Code de réinitialisation',
    enter6DigitCode: 'Entrez le code à 6 chiffres',
    newPassword: 'Nouveau mot de passe',
    enterNewPassword: 'Entrez votre nouveau mot de passe',
    resetPasswordButton: 'Réinitialiser le mot de passe',
    resetting: 'Réinitialisation...',
    rememberPassword: 'Vous vous souvenez de votre mot de passe?',
    
    // Home
    mathAssistant: 'Math Assistant',
    solveMathProblems: 'Résoudre des problèmes mathématiques',
    instantly: 'instantanément',
    captureImage: 'Capturer une image',
    uploadPhoto: 'Télécharger une photo',
    
    // History
    history: 'Historique',
    noHistoryYet: "Pas encore d'historique",
    historyDescription: 'Vos problèmes mathématiques résolus apparaîtront ici',
    problem: 'Problème',
    solution: 'Solution',
    clearAll: 'Tout effacer',
    areYouSure: 'Êtes-vous sûr de vouloir effacer tout l\'historique?',
    
    // Messages
    accountCreated: 'Compte créé avec succès! Veuillez vous connecter.',
    passwordResetSuccess: 'Mot de passe réinitialisé avec succès! Vous pouvez maintenant vous connecter.',
    loginSuccess: 'Connexion réussie!',
    
    // Errors
    invalidCredentials: 'Email ou mot de passe incorrect',
    registrationFailed: 'Erreur lors de la création du compte',
    loginFailed: 'Erreur de connexion',
    resetFailed: 'Erreur lors de la réinitialisation du mot de passe',
    
    // Math Solver
    uploadImage: 'Télécharger une image',
    reset: 'Réinitialiser',
    solve: 'Résoudre',
    solving: 'Résolution...',
    equation: 'Équation',
    calculatedSolution: 'Solution calculée',
    stepByStepExplanation: 'Explication étape par étape',
    exportPDF: 'Télécharger en PDF',
  },
  en: {
    // Login
    login: 'Login',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign Up',
    logIn: 'Log In',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    
    // Sign Up
    createAccount: 'Create your account',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    enterFullName: 'Enter your full name',
    enterConfirmPassword: 'Confirm your password',
    alreadyHaveAccount: 'Already have an account?',
    passwordsNotMatch: 'Passwords do not match!',
    passwordMinLength: 'Password must be at least 6 characters long!',
    
    // Forgot Password
    resetPassword: 'Reset your password',
    enterCodeAndPassword: 'Enter the code and your new password',
    sendCode: 'Send Code',
    sending: 'Sending...',
    resetCode: 'Reset Code',
    enter6DigitCode: 'Enter the 6-digit code',
    newPassword: 'New Password',
    enterNewPassword: 'Enter your new password',
    resetPasswordButton: 'Reset Password',
    resetting: 'Resetting...',
    rememberPassword: 'Remember your password?',
    
    // Home
    mathAssistant: 'Math Assistant',
    solveMathProblems: 'Solve math problems',
    instantly: 'instantly',
    captureImage: 'Capture an image',
    uploadPhoto: 'Upload a photo',
    
    // History
    history: 'History',
    noHistoryYet: 'No history yet',
    historyDescription: 'Your solved math problems will appear here',
    problem: 'Problem',
    solution: 'Solution',
    clearAll: 'Clear All',
    areYouSure: 'Are you sure you want to clear all history?',
    
    // Messages
    accountCreated: 'Account created successfully! Please log in.',
    passwordResetSuccess: 'Password reset successfully! You can now log in.',
    loginSuccess: 'Login successful!',
    
    // Errors
    invalidCredentials: 'Email or password incorrect',
    registrationFailed: 'Error creating account',
    loginFailed: 'Login error',
    resetFailed: 'Error resetting password',
    
    // Math Solver
    uploadImage: 'Upload an image',
    reset: 'Reset',
    solve: 'Solve',
    solving: 'Solving...',
    equation: 'Equation',
    calculatedSolution: 'Calculated Solution',
    stepByStepExplanation: 'Step-by-Step Explanation',
    exportPDF: 'Download PDF',
  }
}

// Fonction pour obtenir la traduction
export function getTranslation(lang, key) {
  return translations[lang]?.[key] || key
}

