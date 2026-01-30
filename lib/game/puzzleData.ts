// Puzzle templates for all 5 Tier 1 categories (password, updates, privacy, wifi)
// Phishing puzzles use the existing email system

import type { ThreatCategory } from './threatData'

export interface PuzzleChoice {
  text: string
  isCorrect: boolean
  explanation: string
  redFlags?: string[]
}

export interface PuzzleTemplate {
  id: string
  category: ThreatCategory
  scenario: string
  choices: PuzzleChoice[]
}

export const puzzleTemplates: PuzzleTemplate[] = [
  // PASSWORD PUZZLES (3)
  {
    id: 'password-strength',
    category: 'password',
    scenario: 'Choose the STRONGEST password for your bank account:',
    choices: [
      {
        text: 'P@ssw0rd123',
        isCorrect: false,
        explanation: 'Common pattern, easily cracked by dictionary attacks',
        redFlags: ['Too short', 'Predictable substitutions', 'Common word base']
      },
      {
        text: 'correct-horse-battery-staple-2024',
        isCorrect: true,
        explanation: 'Long passphrase with 35 characters beats complex but short passwords',
        redFlags: ['Length > complexity', 'Random word combination', 'Easy to remember, hard to crack']
      },
      {
        text: 'Tr0ub4dor&3',
        isCorrect: false,
        explanation: 'Only 11 characters, predictable leet speak substitutions',
        redFlags: ['Too short (under 16)', 'Predictable pattern', 'Dictionary word base']
      }
    ]
  },
  {
    id: 'password-reuse',
    category: 'password',
    scenario: 'LinkedIn was breached. Your email/password were leaked. What should you do FIRST?',
    choices: [
      {
        text: 'Change my LinkedIn password only',
        isCorrect: false,
        explanation: 'Attackers will try your leaked password on ALL your accounts',
        redFlags: ['Ignores credential stuffing', 'Leaves other accounts vulnerable']
      },
      {
        text: 'Change passwords on ALL sites where I reused that password',
        isCorrect: true,
        explanation: 'Breached credentials are immediately tested across all major sites',
        redFlags: ['Prevents credential stuffing', 'Updates all affected accounts', 'Use password manager to track unique passwords']
      },
      {
        text: 'Wait to see if my other accounts get hacked',
        isCorrect: false,
        explanation: 'Reactive approach - damage already done by the time you notice',
        redFlags: ['Too slow', 'Guaranteed losses', 'Attackers move fast']
      }
    ]
  },
  {
    id: 'password-mfa',
    category: 'password',
    scenario: 'Your password was leaked, but you have 2FA enabled. What happens?',
    choices: [
      {
        text: 'Completely safe - 2FA blocks all attacks',
        isCorrect: false,
        explanation: 'Still change the password! Some 2FA can be bypassed (SMS, phishing)',
        redFlags: ['SMS 2FA vulnerable to SIM swapping', 'Phishing can capture 2FA codes', 'Defense in depth needed']
      },
      {
        text: 'Mostly protected, but should still change password',
        isCorrect: true,
        explanation: '2FA blocks most attacks, but layered security is best practice',
        redFlags: ['2FA adds critical layer', 'Change compromised passwords anyway', 'Use authenticator app or hardware key']
      },
      {
        text: 'No protection - 2FA is useless',
        isCorrect: false,
        explanation: '2FA stops 99% of automated credential stuffing attacks',
        redFlags: ['2FA extremely effective', 'Prevents automated attacks', 'Critical security layer']
      }
    ]
  },

  // SOFTWARE UPDATE PUZZLES (3)
  {
    id: 'update-timing',
    category: 'updates',
    scenario: 'Your OS shows "Critical Security Update Available". When should you install it?',
    choices: [
      {
        text: 'Ignore it - updates break things',
        isCorrect: false,
        explanation: 'Unpatched systems are prime targets. WannaCry spread via unpatched Windows',
        redFlags: ['Ignores known vulnerabilities', 'Easy target for attackers', 'Risk > reward']
      },
      {
        text: 'Install within 24 hours on trusted network',
        isCorrect: true,
        explanation: 'Critical patches should install ASAP. Attackers scan for unpatched systems',
        redFlags: ['Time-sensitive threat', 'Exploit code often public', 'Quick action prevents compromise']
      },
      {
        text: 'Wait 6 months for bugs to be fixed first',
        isCorrect: false,
        explanation: 'Security patches close active exploits. Waiting = vulnerable',
        redFlags: ['Exploits active NOW', 'Delay = guaranteed exposure', 'Test non-critical systems first']
      }
    ]
  },
  {
    id: 'update-source',
    category: 'updates',
    scenario: 'You receive an email: "Critical Windows Update - Click to Download". What do you do?',
    choices: [
      {
        text: 'Click the link and download immediately',
        isCorrect: false,
        explanation: 'Microsoft NEVER sends update links via email. This is malware',
        redFlags: ['Phishing attempt', 'Malware distribution', 'Social engineering']
      },
      {
        text: 'Delete email, check Windows Update in Settings',
        isCorrect: true,
        explanation: 'Always update through official OS settings, never email links',
        redFlags: ['Use built-in update mechanism', 'Verify through official channels', 'Never download updates from email']
      },
      {
        text: 'Reply asking if it\'s legitimate',
        isCorrect: false,
        explanation: 'Replying confirms your email is active. Attackers will target you more',
        redFlags: ['Never engage with suspicious emails', 'Confirms active target', 'Invites more attacks']
      }
    ]
  },
  {
    id: 'update-zero-day',
    category: 'updates',
    scenario: 'News: "Zero-day vulnerability in Chrome actively exploited". What does this mean?',
    choices: [
      {
        text: 'Vulnerability has existed for 0 days, no danger yet',
        isCorrect: false,
        explanation: '"Zero-day" means patch available for 0 days - attackers got there first',
        redFlags: ['Already being exploited', 'No patch available yet', 'Highest priority threat']
      },
      {
        text: 'Unknown vulnerability being exploited, patch ASAP when available',
        isCorrect: true,
        explanation: 'Zero-day = attackers discovered before vendor. Update immediately when patch releases',
        redFlags: ['Active exploitation ongoing', 'Vendor scrambling to patch', 'Update the moment patch drops']
      },
      {
        text: 'Not a real threat, just media hype',
        isCorrect: false,
        explanation: 'Zero-days are the most serious threats. Log4Shell affected millions',
        redFlags: ['Actively exploited RIGHT NOW', 'No defense until patch', 'Critical severity']
      }
    ]
  },

  // SOCIAL MEDIA PRIVACY PUZZLES (3)
  {
    id: 'privacy-location',
    category: 'privacy',
    scenario: 'You\'re on vacation. When should you post your beach photos?',
    choices: [
      {
        text: 'Right now with location tag - share the moment!',
        isCorrect: false,
        explanation: 'Broadcasting "I\'m not home" to burglars and stalkers',
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
        explanation: 'Better than location tag, but still announces absence in real-time',
        redFlags: ['Still reveals you\'re away', 'Context clues reveal location', 'Wait until home']
      }
    ]
  },
  {
    id: 'privacy-quiz',
    category: 'privacy',
    scenario: 'Fun quiz: "What\'s your hacker name? First pet + street you grew up on!" What\'s the danger?',
    choices: [
      {
        text: 'No danger - it\'s just a fun game',
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
    category: 'privacy',
    scenario: 'New flashlight app asks for: Camera, Contacts, Location. Should you install it?',
    choices: [
      {
        text: 'Yes - it needs these to work properly',
        isCorrect: false,
        explanation: 'Flashlight only needs LED access. Extra permissions = data harvesting',
        redFlags: ['Excessive permissions', 'Data harvesting app', 'Functionality doesn\'t match permissions']
      },
      {
        text: 'No - flashlight shouldn\'t need contacts or location',
        isCorrect: true,
        explanation: 'Apps should only request permissions needed for core functionality',
        redFlags: ['Principle of least privilege', 'Unnecessary permissions = red flag', 'Find alternative app']
      },
      {
        text: 'Yes, but deny the permissions after installing',
        isCorrect: false,
        explanation: 'Some malicious apps hide code that activates after initial trust',
        redFlags: ['Don\'t install suspicious apps at all', 'Malware can hide', 'Better to avoid entirely']
      }
    ]
  },

  // PUBLIC WIFI PUZZLES (3)
  {
    id: 'wifi-evil-twin',
    category: 'wifi',
    scenario: 'At airport. You see two WiFi networks: "Airport_Free_WiFi" and "AirportFreeWiFi". Which do you use?',
    choices: [
      {
        text: 'Either one - they\'re probably the same network',
        isCorrect: false,
        explanation: 'One is likely an "Evil Twin" fake network capturing all your traffic',
        redFlags: ['Identical names are suspicious', 'Evil Twin attack', 'Ask staff for correct network']
      },
      {
        text: 'Ask airport staff which is legitimate',
        isCorrect: true,
        explanation: 'Verify official network name with staff. Evil Twins are common at airports',
        redFlags: ['Verify with official source', 'Evil Twins copy names closely', 'Don\'t guess']
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
    category: 'wifi',
    scenario: 'Connected to coffee shop WiFi. Banking app asks for login. What should you do?',
    choices: [
      {
        text: 'Use banking app normally - it\'s encrypted',
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
    category: 'wifi',
    scenario: 'On public WiFi, you need to enter password on a website. What\'s most important to check?',
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

// Get random puzzle by category
export function getRandomPuzzle(category: ThreatCategory): PuzzleTemplate | null {
  const categoryPuzzles = puzzleTemplates.filter(p => p.category === category)
  if (categoryPuzzles.length === 0) return null
  return categoryPuzzles[Math.floor(Math.random() * categoryPuzzles.length)]
}

// Get all puzzles for a category
export function getPuzzlesByCategory(category: ThreatCategory): PuzzleTemplate[] {
  return puzzleTemplates.filter(p => p.category === category)
}

// Get puzzle by ID
export function getPuzzleById(id: string): PuzzleTemplate | undefined {
  return puzzleTemplates.find(p => p.id === id)
}
