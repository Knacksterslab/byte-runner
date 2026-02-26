// In-game quiz challenge data - set A (email, password, wifi, link)

export const emailSecurityQuiz = {
  id: 'email-security',
  type: 'email' as const,
  question: 'PHISHING DETECTION CHALLENGE',
  instructions: 'Pick the LEGITIMATE email.',
  educationalNote: 'Check domains carefully! Phishing uses typos like netfIix.com',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'email-1', visual: '', label: 'support@netflix.com', color: '#00ccff', isCorrect: true },
    { id: 'email-2', visual: '', label: 'support@netfIix.com', color: '#00ccff', isCorrect: false },
    { id: 'email-3', visual: '', label: 'urgent@paypa1.com', color: '#00ccff', isCorrect: false }
  ],
  correctAnswers: ['email-1']
}

export const passwordStrengthQuiz = {
  id: 'password-strength',
  type: 'password' as const,
  question: 'DATA BREACH',
  instructions: 'Pick the strongest passwords.',
  educationalNote: 'Longer passwords & real tools keep you safe!',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'pass-1', visual: '', label: 'p1zz@', color: '#00ccff', isCorrect: false, description: 'common word + symbol' },
    { id: 'pass-2', visual: '', label: '12345678', color: '#00ccff', isCorrect: false, description: 'keyboard pattern' },
    { id: 'pass-3', visual: '', label: 'Tr0ubAdor3-X3', color: '#00ccff', isCorrect: true, description: 'long + unique' }
  ],
  correctAnswers: ['pass-3']
}

export const wifiSecurityQuiz = {
  id: 'wifi-security',
  type: 'wifi' as const,
  question: 'WIFI SECURITY CHALLENGE',
  instructions: 'Pick the most secure network.',
  educationalNote: 'Public WiFi is dangerous! Always use VPN on untrusted networks',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'wifi-1', visual: '', label: 'MyHome_WPA3', color: '#00ccff', isCorrect: true },
    { id: 'wifi-2', visual: '', label: 'Free_Public_WiFi', color: '#00ccff', isCorrect: false },
    { id: 'wifi-3', visual: '', label: 'Starbucks_Guest', color: '#00ccff', isCorrect: false }
  ],
  correctAnswers: ['wifi-1']
}

export const linkSafetyQuiz = {
  id: 'link-safety',
  type: 'link' as const,
  question: 'LINK SAFETY CHALLENGE',
  instructions: 'Pick the safe link.',
  educationalNote: 'Look for HTTPS, correct spelling, and legitimate domains',
  duration: 40,
  speedBonus: 1.2,
  pointsForCorrect: 10,
  pointsForIncorrect: -5,
  passingScore: 10,
  items: [
    { id: 'link-1', visual: '', label: 'https://google.com', color: '#00ccff', isCorrect: true },
    { id: 'link-2', visual: '', label: 'http://g00gle.com', color: '#00ccff', isCorrect: false },
    { id: 'link-3', visual: '', label: 'http://paypal-verify', color: '#00ccff', isCorrect: false }
  ],
  correctAnswers: ['link-1']
}
