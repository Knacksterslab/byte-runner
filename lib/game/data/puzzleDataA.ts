// Puzzle templates - password and software update categories

export const passwordAndUpdatePuzzles = [
  // PASSWORD PUZZLES (3)
  {
    id: 'password-strength',
    category: 'password' as const,
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
    category: 'password' as const,
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
    category: 'password' as const,
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
    category: 'updates' as const,
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
    category: 'updates' as const,
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
        text: "Reply asking if it's legitimate",
        isCorrect: false,
        explanation: 'Replying confirms your email is active. Attackers will target you more',
        redFlags: ['Never engage with suspicious emails', 'Confirms active target', 'Invites more attacks']
      }
    ]
  },
  {
    id: 'update-zero-day',
    category: 'updates' as const,
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
  }
]
