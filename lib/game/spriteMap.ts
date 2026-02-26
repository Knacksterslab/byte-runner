import type { ThreatCategory } from './threatData'

/** Maps a specific threat ID to the sprite image key used in the images object. */
export const THREAT_ID_TO_SPRITE_KEY: Record<string, string> = {
  'weak-password': 'firewall',
  'password-reuse': 'firewall',
  'phishing-email': 'spamWave',
  'spear-phishing': 'spamWave',
  'zero-day': 'malware',
  'unpatched-vuln': 'malware',
  'doxing-attack': 'dataBreach',
  'data-harvester': 'dataBreach',
  'evil-twin': 'virus',
}

/** Maps a threat category to the sprite image key used in the images object. */
export const CATEGORY_TO_SPRITE_KEY: Record<ThreatCategory, string> = {
  password: 'firewall',
  phishing: 'spamWave',
  updates: 'malware',
  privacy: 'dataBreach',
  wifi: 'virus',
  authentication: 'firewall',
  'data-loss': 'dataBreach',
  'social-engineering': 'spamWave',
  'physical-security': 'firewall',
  'secure-disposal': 'dataBreach',
  policy: 'firewall',
  'incident-reporting': 'dataBreach',
  compliance: 'firewall',
  'remote-work': 'virus',
  'meeting-security': 'spamWave',
  'travel-security': 'virus',
  'data-protection': 'dataBreach',
  'supply-chain': 'malware',
  'insider-threats': 'dataBreach',
  'email-security': 'spamWave',
  'data-classification': 'firewall',
  'social-media': 'dataBreach',
  'removable-media': 'malware',
}

/** Look up the sprite image element for a given threat, falling back to category. */
export function getSpriteForThreat(
  threatId: string,
  category: ThreatCategory,
  images: Record<string, HTMLImageElement>
): HTMLImageElement {
  const key = THREAT_ID_TO_SPRITE_KEY[threatId] ?? CATEGORY_TO_SPRITE_KEY[category] ?? 'virus'
  return images[key]
}
