import type { QuizChallenge } from '@/lib/game/inGameQuizzes'

export interface QuizLesson {
  title: string
  points: string[]
}

const LESSONS: Record<QuizChallenge['type'], QuizLesson> = {
  email: {
    title: 'Email Attack Intel',
    points: [
      'Most phishing emails look almost real at first glance.',
      'Attackers change tiny characters in domains to fool you.',
      'One rushed click can expose your account.',
    ],
  },
  password: {
    title: 'Password Attack Intel',
    points: [
      'Weak passwords are cracked in minutes, not days.',
      'Reused passwords let one breach unlock many accounts.',
      'Long unique passphrases are your best defense.',
    ],
  },
  wifi: {
    title: 'WiFi Attack Intel',
    points: [
      'Fake hotspots mimic trusted network names.',
      'Open WiFi can expose traffic to nearby attackers.',
      'Secure encryption and VPN sharply reduce risk.',
    ],
  },
  link: {
    title: 'Link Attack Intel',
    points: [
      'Malicious links often look valid at a glance.',
      'One character changes can redirect to fake sites.',
      'Verify domain spelling before you trust a URL.',
    ],
  },
  update: {
    title: 'Patch Priority Intel',
    points: [
      'Attackers scan for systems missing known patches.',
      'Critical security updates beat feature updates.',
      'Delay creates a larger and easier target window.',
    ],
  },
  classification: {
    title: 'Data Classification Intel',
    points: [
      'Mislabeling data causes accidental high-impact leaks.',
      'PII and sensitive records require tighter handling.',
      'Correct labels control where data can be shared.',
    ],
  },
  disposal: {
    title: 'Secure Disposal Intel',
    points: [
      'Attackers recover sensitive data from normal trash.',
      'Paper and media must be destroyed securely.',
      'Proper disposal prevents low-tech data theft.',
    ],
  },
  meeting: {
    title: 'Meeting Security Intel',
    points: [
      'Uncontrolled links let unknown guests into meetings.',
      'Waiting rooms and passwords block most intrusions.',
      'Publicly shared links are quickly abused.',
    ],
  },
}

export function getPreQuizLesson(quizType: QuizChallenge['type']): QuizLesson {
  return LESSONS[quizType]
}
