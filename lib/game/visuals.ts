/**
 * ═══════════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH for entity visuals.
 *
 * Every threat and kit renders from the specs defined here — no image
 * sprites, no emoji. Threats inherit their category's SHAPE (23 distinct
 * silhouettes, one per category) combined with the threat's own COLOR.
 * Kits render as hex badges (uniform "protection" language) with a
 * monogram derived from the kit id.
 *
 * To change how anything in the game looks, edit this file only.
 * ═══════════════════════════════════════════════════════════════════
 */
import type { ThreatCategory } from './threatData'

/** Distinct procedural silhouettes (see renderers/entityRenderer.ts). */
export type ShapeKind =
  | 'keyhole'      // password
  | 'hook'         // phishing
  | 'gear'         // updates
  | 'eye'          // privacy
  | 'signal'       // wifi
  | 'badge'        // authentication
  | 'dbCrack'      // data-loss
  | 'mask'         // social-engineering
  | 'door'         // physical-security
  | 'shredder'     // secure-disposal
  | 'book'         // policy
  | 'siren'        // incident-reporting
  | 'clipboard'    // compliance
  | 'house'        // remote-work
  | 'cam'          // meeting-security
  | 'suitcase'     // travel-security
  | 'hexLock'      // data-protection
  | 'package'      // supply-chain
  | 'insider'      // insider-threats
  | 'mailAlert'    // email-security
  | 'tag'          // data-classification
  | 'share'        // social-media
  | 'usb'          // removable-media

export interface ThreatVisualSpec {
  shape: ShapeKind
  /** Neon accent for inner details (white-ish cyan reads best on dark). */
  accent: string
}

/**
 * Category → visual. One entry per ThreatCategory; the compiler enforces
 * completeness, so a new category cannot be added without a visual.
 */
export const CATEGORY_VISUALS: Record<ThreatCategory, ThreatVisualSpec> = {
  password:             { shape: 'keyhole',   accent: '#ffd166' },
  phishing:             { shape: 'hook',      accent: '#ff9ecd' },
  updates:              { shape: 'gear',      accent: '#ffd166' },
  privacy:              { shape: 'eye',       accent: '#b892ff' },
  wifi:                 { shape: 'signal',    accent: '#7CFCFF' },
  authentication:       { shape: 'badge',     accent: '#ffd166' },
  'data-loss':          { shape: 'dbCrack',   accent: '#ff8fa3' },
  'social-engineering': { shape: 'mask',      accent: '#ffb37C' },
  'physical-security':  { shape: 'door',      accent: '#ffd166' },
  'secure-disposal':    { shape: 'shredder',  accent: '#a8b8c8' },
  policy:               { shape: 'book',      accent: '#9bb8ff' },
  'incident-reporting': { shape: 'siren',     accent: '#ff8fa3' },
  compliance:           { shape: 'clipboard', accent: '#8affc1' },
  'remote-work':        { shape: 'house',     accent: '#8affc1' },
  'meeting-security':   { shape: 'cam',       accent: '#c9a7ff' },
  'travel-security':    { shape: 'suitcase',  accent: '#7CFCFF' },
  'data-protection':    { shape: 'hexLock',   accent: '#8affc1' },
  'supply-chain':       { shape: 'package',   accent: '#ffb37C' },
  'insider-threats':    { shape: 'insider',   accent: '#ffd166' },
  'email-security':     { shape: 'mailAlert', accent: '#ff9ecd' },
  'data-classification':{ shape: 'tag',       accent: '#d7ff9e' },
  'social-media':       { shape: 'share',     accent: '#c9a7ff' },
  'removable-media':    { shape: 'usb',       accent: '#ff8fa3' },
}

/** Resolve the visual spec for a threat (category-driven). */
export function getThreatVisual(category: string): ThreatVisualSpec {
  return (
    CATEGORY_VISUALS[category as ThreatCategory] ?? {
      shape: 'hexLock',
      accent: '#7CFCFF',
    }
  )
}

/** Kit badge specs — hex badge + monogram, colored by the kit's own color. */
export interface KitBadgeSpec {
  monogram: string
}

const KIT_MONOGRAMS: Record<string, string> = {
  'password-manager': 'PM',
  'link-analyzer': 'LA',
  'patch-manager': 'PA',
  'privacy-optimizer': 'PO',
  'vpn-shield': 'VP',
  'mfa-authenticator': 'MF',
  'backup-system': 'BK',
  'social-engineering-defense': 'SE',
  'badge-tap': 'BD',
  'secure-shred': 'SH',
  'policy-knowledge': 'PK',
  'ethics-reporting': 'ER',
  'compliance-kit': 'CK',
  'remote-work-guard': 'RW',
  'waiting-room': 'WR',
  'travel-vpn': 'TV',
  'encryption-kit': 'EN',
  'sbom-toolkit': 'SB',
  'insider-monitor': 'IM',
  'email-gateway': 'EG',
  'classification-labeler': 'CL',
  'privacy-check': 'PC',
  'device-control': 'DC',
}

export function getKitBadge(kitType: string): KitBadgeSpec {
  return { monogram: KIT_MONOGRAMS[kitType] ?? kitType.slice(0, 2).toUpperCase() }
}
