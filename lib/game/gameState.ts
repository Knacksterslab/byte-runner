import type { ThreatType } from './threatData';
import type { GhostPlayer } from './ghostPlayers';
import type { ProtectionKit } from './protectionKits';

export interface GameState {
  level: number;
  score: number;
  distance: number;
  isGameOver: boolean;
  lastAttacker: GhostPlayer | null;
  lastThreatType: ThreatType | null;
  kitInventory: Record<string, number>;
  currentThreat: ThreatType | null;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  lane: number;
  targetY: number;
  isJumping: boolean;
}

export function createPlayerState(x: number, y: number, width: number, height: number): PlayerState {
  return {
    x,
    y,
    width,
    height,
    velocityY: 0,
    lane: 1,
    targetY: y,
    isJumping: false,
  };
}

export function createGameState(): GameState {
  return {
    level: 1,
    score: 0,
    distance: 0,
    isGameOver: false,
    lastAttacker: null,
    lastThreatType: null,
    kitInventory: {
      'password-manager': 0,
      'link-analyzer': 0,
      'patch-manager': 0,
      'privacy-optimizer': 0,
      'vpn-shield': 0,
      'mfa-authenticator': 0,
      'backup-system': 0,
      'social-engineering-defense': 0,
      'badge-tap': 0,
      'secure-shred': 0,
      'policy-knowledge': 0,
      'ethics-reporting': 0,
      'compliance-kit': 0,
      'remote-work-guard': 0,
      'waiting-room': 0,
      'travel-vpn': 0,
      'encryption-kit': 0,
      'sbom-toolkit': 0,
      'insider-monitor': 0,
      'email-gateway': 0,
      'classification-labeler': 0,
      'privacy-check': 0,
      'device-control': 0,
    },
    currentThreat: null,
  };
}
