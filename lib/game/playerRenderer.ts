import { PLAYER_CONFIG, VISUAL_CONFIG } from './gameConstants';

export interface PlayerState {
  x: number;
  y: number;
  lane: number;
  targetY: number;
  velocityY: number;
  isJumping: boolean;
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState
): void {
  ctx.fillStyle = VISUAL_CONFIG.PLAYER_COLOR;
  ctx.fillRect(
    player.x,
    player.y,
    PLAYER_CONFIG.WIDTH,
    PLAYER_CONFIG.HEIGHT
  );

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🛡️', player.x + PLAYER_CONFIG.WIDTH / 2, player.y + 20);
  ctx.textAlign = 'left';
}

export function updatePlayerPhysics(
  player: PlayerState,
  deltaTime: number,
  groundY: number
): void {
  if (player.isJumping) {
    player.velocityY += PLAYER_CONFIG.GRAVITY * deltaTime;
    player.y += player.velocityY * deltaTime;

    if (player.y >= groundY) {
      player.y = groundY;
      player.velocityY = 0;
      player.isJumping = false;
    }
  }

  const laneY = groundY - (player.lane - 1) * 80;
  if (!player.isJumping && Math.abs(player.y - laneY) > 1) {
    player.y += (laneY - player.y) * 0.1;
  }
}
