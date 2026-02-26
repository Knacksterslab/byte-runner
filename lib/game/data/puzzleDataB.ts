// Puzzle templates - privacy and wifi categories

export const privacyAndWifiPuzzles = [
  // SOCIAL MEDIA PRIVACY PUZZLES (3)
  {
    id: 'privacy-location',
    category: 'privacy' as const,
    scenario: "You're on vacation. When should you post your beach photos?",
    choices: [
      {
        text: 'Right now with location tag - share the moment!',
        isCorrect: false,
        explanation: "Broadcasting \"I'm not home\" to burglars and stalkers",
        redFlags: ['Announces empty home', 'Reveals location pattern', 'Safety risk']
      },
      {
        text: 'After returning home, without real-time location',
        isCorrect: true,
        explanation: 'Delayed posting prevents criminals knowing your home is empty',
        redFlags: ['Protects home security', 'Prevents stalking', 'Still share memories safely']
      },
      {
        text: 'Post now but remove location metadata first',
        isCorrect: false,
        explanation: "Better than location tag, but still announces absence in real-time",
        redFlags: ["Still reveals you're away", 'Context clues reveal location', 'Wait until home']
      }
    ]
  },
  {
    id: 'privacy-quiz',
    category: 'privacy' as const,
    scenario: "Fun quiz: \"What's your hacker name? First pet + street you grew up on!\" What's the danger?",
    choices: [
      {
        text: "No danger - it's just a fun game",
        isCorrect: false,
        explanation: 'These are common security questions for password recovery!',
        redFlags: ['Harvests security answers', 'Password reset data', 'Identity theft risk']
      },
      {
        text: 'It harvests answers to security questions',
        isCorrect: true,
        explanation: 'Pet names and childhood streets are common password reset questions',
        redFlags: ['Security question farming', 'Account takeover risk', 'Never share personal security data']
      },
      {
        text: 'Only dangerous if you use your real name',
        isCorrect: false,
        explanation: 'Even without your name, data is linked to your profile for later attacks',
        redFlags: ['Profile data is linkable', 'Builds dossier over time', 'All personal data has value']
      }
    ]
  },
  {
    id: 'privacy-app-permissions',
    category: 'privacy' as const,
    scenario: 'New flashlight app asks for: Camera, Contacts, Location. Should you install it?',
    choices: [
      {
        text: 'Yes - it needs these to work properly',
        isCorrect: false,
        explanation: 'Flashlight only needs LED access. Extra permissions = data harvesting',
        redFlags: ['Excessive permissions', 'Data harvesting app', "Functionality doesn't match permissions"]
      },
      {
        text: "No - flashlight shouldn't need contacts or location",
        isCorrect: true,
        explanation: 'Apps should only request permissions needed for core functionality',
        redFlags: ['Principle of least privilege', 'Unnecessary permissions = red flag', 'Find alternative app']
      },
      {
        text: 'Yes, but deny the permissions after installing',
        isCorrect: false,
        explanation: 'Some malicious apps hide code that activates after initial trust',
        redFlags: ["Don't install suspicious apps at all", 'Malware can hide', 'Better to avoid entirely']
      }
    ]
  },

  // PUBLIC WIFI PUZZLES (3)
  {
    id: 'wifi-evil-twin',
    category: 'wifi' as const,
    scenario: 'At airport. You see two WiFi networks: "Airport_Free_WiFi" and "AirportFreeWiFi". Which do you use?',
    choices: [
      {
        text: "Either one - they're probably the same network",
        isCorrect: false,
        explanation: 'One is likely an "Evil Twin" fake network capturing all your traffic',
        redFlags: ['Identical names are suspicious', 'Evil Twin attack', 'Ask staff for correct network']
      },
      {
        text: 'Ask airport staff which is legitimate',
        isCorrect: true,
        explanation: 'Verify official network name with staff. Evil Twins are common at airports',
        redFlags: ['Verify with official source', 'Evil Twins copy names closely', "Don't guess"]
      },
      {
        text: 'Use cellular data instead of either WiFi',
        isCorrect: false,
        explanation: 'Good security practice but not always practical. VPN + verification is better',
        redFlags: ['Cellular is safer', 'But not always available', 'VPN makes WiFi safe']
      }
    ]
  },
  {
    id: 'wifi-vpn',
    category: 'wifi' as const,
    scenario: 'Connected to coffee shop WiFi. Banking app asks for login. What should you do?',
    choices: [
      {
        text: "Use banking app normally - it's encrypted",
        isCorrect: false,
        explanation: 'While HTTPS helps, public WiFi can be compromised. VPN adds critical layer',
        redFlags: ['Public WiFi = untrusted network', 'VPN encrypts everything', 'Better safe than sorry']
      },
      {
        text: 'Connect to VPN first, then use banking app',
        isCorrect: true,
        explanation: 'VPN encrypts all traffic, protecting from WiFi eavesdropping',
        redFlags: ['VPN = encrypted tunnel', 'Protects from network sniffing', 'Essential on public WiFi']
      },
      {
        text: 'Wait until home to do banking',
        isCorrect: false,
        explanation: 'Overly cautious. VPN makes public WiFi safe for sensitive tasks',
        redFlags: ['VPN solves the problem', 'No need to wait', 'Use security tools available']
      }
    ]
  },
  {
    id: 'wifi-https',
    category: 'wifi' as const,
    scenario: 'On public WiFi, you need to enter password on a website. What is most important to check?',
    choices: [
      {
        text: 'Website has HTTPS (lock icon in browser)',
        isCorrect: true,
        explanation: 'HTTPS encrypts traffic between you and website, even on untrusted WiFi',
        redFlags: ['Lock icon = encrypted connection', 'NEVER enter passwords on HTTP', 'HTTPS is minimum requirement']
      },
      {
        text: 'Website looks professional and legitimate',
        isCorrect: false,
        explanation: 'Appearance is easy to fake. HTTPS and domain verification matter',
        redFlags: ['Looks can deceive', 'Check technical indicators', 'HTTPS + correct domain']
      },
      {
        text: 'No one else is watching your screen',
        isCorrect: false,
        explanation: 'While good practice, network-level interception is the real threat',
        redFlags: ['Shoulder surfing = minor issue', 'Network sniffing = major threat', 'HTTPS protects network transmission']
      }
    ]
  }
]
