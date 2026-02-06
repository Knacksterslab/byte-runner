// Phishing email templates for boss battles
import { getRandomByFilter, getRandomItem } from './utils'

export interface EmailTemplate {
  isPhishing: boolean
  sender: string
  subject: string
  redFlags: string[]
}

export const emailTemplates: EmailTemplate[] = [
  // Phishing emails
  {
    isPhishing: true,
    sender: "security@your-bank.com",
    subject: "URGENT: Verify Account",
    redFlags: ["Generic greeting", "Urgent language", "Suspicious domain (.com not bank)"]
  },
  {
    isPhishing: true,
    sender: "support@microsoft-verify.net",
    subject: "Windows License Expiring",
    redFlags: ["Wrong domain (.net)", "False urgency", "Payment request"]
  },
  {
    isPhishing: true,
    sender: "noreply@paypal-security.org",
    subject: "Unusual Activity Detected",
    redFlags: ["Wrong PayPal domain", "Time pressure", "Suspicious link"]
  },
  {
    isPhishing: true,
    sender: "admin@amazon-prime.co",
    subject: "Payment Failed - Act Now",
    redFlags: ["Fake Amazon domain", "Urgent action required", "Generic greeting"]
  },
  {
    isPhishing: true,
    sender: "security@google-accounts.com",
    subject: "Security Alert: New Login",
    redFlags: ["Not official Google domain", "Fear tactic", "Requests credentials"]
  },
  
  // Legitimate emails
  {
    isPhishing: false,
    sender: "newsletter@github.com",
    subject: "Your weekly digest",
    redFlags: ["Legitimate sender", "Expected content", "No urgent requests"]
  },
  {
    isPhishing: false,
    sender: "notifications@slack.com",
    subject: "New message from team",
    redFlags: ["Official domain", "Expected notification", "No suspicious links"]
  },
  {
    isPhishing: false,
    sender: "receipts@uber.com",
    subject: "Your trip receipt",
    redFlags: ["Legitimate service", "Expected email", "Official domain"]
  },
  {
    isPhishing: false,
    sender: "updates@linkedin.com",
    subject: "Job recommendations",
    redFlags: ["Known sender", "Regular update", "No threats"]
  },
  {
    isPhishing: false,
    sender: "noreply@reddit.com",
    subject: "Trending posts today",
    redFlags: ["Official Reddit", "Expected content", "No urgency"]
  },
  {
    isPhishing: false,
    sender: "team@vercel.com",
    subject: "Deployment successful",
    redFlags: ["Legitimate service", "Expected notification", "Professional tone"]
  }
]

// Get random email set (1 phishing, 2 legitimate)
export function getRandomEmailSet(): EmailTemplate[] {
  const phishing = getRandomByFilter(emailTemplates, e => e.isPhishing)
  const legit1 = getRandomByFilter(emailTemplates, e => !e.isPhishing)
  let legit2 = getRandomByFilter(emailTemplates, e => !e.isPhishing)
  
  if (!phishing || !legit1 || !legit2) {
    return []
  }
  
  // Ensure different legitimate emails
  const legitimateEmails = emailTemplates.filter(e => !e.isPhishing)
  while (legit2.sender === legit1.sender && legitimateEmails.length > 1) {
    legit2 = getRandomItem(legitimateEmails)
  }
  
  // Shuffle the order
  const emails = [phishing, legit1, legit2]
  return emails.sort(() => Math.random() - 0.5)
}
