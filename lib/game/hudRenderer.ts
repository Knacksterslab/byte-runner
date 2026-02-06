import type { ThreatType } from './threatData';
import { getKitIcon, type KitType } from './gameConstants';

export interface HUDState {
  level: number;
  score: number;
  kitInventory: Record<string, number>;
  currentThreat: ThreatType | null;
  quizScore: { correct: number; incorrect: number } | null;
  isHudExpanded: boolean;
  isMobile: boolean;
}

const HUD_CONFIG = {
  PADDING: 15,
  PANEL_RADIUS: 12,
  FONT: {
    TITLE: 'bold 16px "Space Grotesk", sans-serif',
    LABEL: '13px "Space Grotesk", sans-serif',
    VALUE: 'bold 14px "Space Grotesk", sans-serif',
    SMALL: '12px "Space Grotesk", sans-serif',
  },
  COLOR: {
    PANEL_BG: 'rgba(10, 10, 30, 0.85)',
    TEXT_PRIMARY: '#00ff88',
    TEXT_SECONDARY: '#88ccff',
    TEXT_MUTED: '#6c7a89',
    THREAT_RED: '#ff4444',
    SUCCESS_GREEN: '#00ff88',
  },
  LINE_HEIGHT: 20,
  ICON_SIZE: 16,
};

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: HUDState
): void {
  if (state.isMobile) {
    drawMobileHUD(ctx, canvas, state);
  } else {
    drawDesktopHUD(ctx, canvas, state);
  }
}

function drawDesktopHUD(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: HUDState
): void {
  const x = HUD_CONFIG.PADDING;
  const y = HUD_CONFIG.PADDING;
  let currentY = y + HUD_CONFIG.PADDING;

  drawRoundedRect(
    ctx,
    x,
    y,
    state.isHudExpanded ? 280 : 200,
    state.isHudExpanded ? 180 : 60,
    HUD_CONFIG.PANEL_RADIUS,
    HUD_CONFIG.COLOR.PANEL_BG
  );

  ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_PRIMARY;
  ctx.font = HUD_CONFIG.FONT.TITLE;
  ctx.fillText('CYBER DEFENSE', x + HUD_CONFIG.PADDING, currentY);
  currentY += HUD_CONFIG.LINE_HEIGHT + 5;

  ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_SECONDARY;
  ctx.font = HUD_CONFIG.FONT.LABEL;
  ctx.fillText(
    `Level ${state.level} | Score: ${state.score}`,
    x + HUD_CONFIG.PADDING,
    currentY
  );

  if (state.isHudExpanded) {
    currentY += HUD_CONFIG.LINE_HEIGHT + 10;
    ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_MUTED;
    ctx.font = HUD_CONFIG.FONT.SMALL;
    ctx.fillText('PROTECTION KITS:', x + HUD_CONFIG.PADDING, currentY);
    currentY += HUD_CONFIG.LINE_HEIGHT;

    Object.entries(state.kitInventory).forEach(([type, count]) => {
      if (count > 0) {
        const icon = getKitIcon(type as KitType);
        ctx.fillText(
          `${icon} ${type}: ${count}`,
          x + HUD_CONFIG.PADDING + 10,
          currentY
        );
        currentY += HUD_CONFIG.LINE_HEIGHT;
      }
    });
  }

  if (state.currentThreat) {
    drawThreatPanel(ctx, canvas, state.currentThreat);
  }

  if (state.quizScore) {
    drawQuizScorePanel(ctx, canvas, state.quizScore);
  }
}

function drawMobileHUD(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: HUDState
): void {
  const panelWidth = canvas.width - HUD_CONFIG.PADDING * 2;
  const x = HUD_CONFIG.PADDING;
  const y = HUD_CONFIG.PADDING;

  drawRoundedRect(
    ctx,
    x,
    y,
    panelWidth,
    80,
    HUD_CONFIG.PANEL_RADIUS,
    HUD_CONFIG.COLOR.PANEL_BG
  );

  let currentY = y + HUD_CONFIG.PADDING + 5;
  ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_PRIMARY;
  ctx.font = HUD_CONFIG.FONT.TITLE;
  ctx.fillText('CYBER DEFENSE', x + HUD_CONFIG.PADDING, currentY);
  currentY += HUD_CONFIG.LINE_HEIGHT + 5;

  ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_SECONDARY;
  ctx.font = HUD_CONFIG.FONT.LABEL;
  ctx.fillText(
    `L:${state.level} | S:${state.score}`,
    x + HUD_CONFIG.PADDING,
    currentY
  );
}

function drawThreatPanel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  threat: ThreatType
): void {
  const panelWidth = 240;
  const panelHeight = 100;
  const x = canvas.width - panelWidth - HUD_CONFIG.PADDING;
  const y = HUD_CONFIG.PADDING;

  drawRoundedRect(
    ctx,
    x,
    y,
    panelWidth,
    panelHeight,
    HUD_CONFIG.PANEL_RADIUS,
    HUD_CONFIG.COLOR.PANEL_BG
  );

  let currentY = y + HUD_CONFIG.PADDING + 5;
  ctx.fillStyle = HUD_CONFIG.COLOR.THREAT_RED;
  ctx.font = HUD_CONFIG.FONT.TITLE;
  ctx.fillText('⚠️ THREAT SOURCE', x + HUD_CONFIG.PADDING, currentY);
  currentY += HUD_CONFIG.LINE_HEIGHT + 5;

  ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_PRIMARY;
  ctx.font = HUD_CONFIG.FONT.VALUE;
  ctx.fillText(`${threat.emoji} ${threat.name}`, x + HUD_CONFIG.PADDING, currentY);
  currentY += HUD_CONFIG.LINE_HEIGHT + 5;

  ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_SECONDARY;
  ctx.font = HUD_CONFIG.FONT.SMALL;
  ctx.fillText(`Category: ${threat.category}`, x + HUD_CONFIG.PADDING, currentY);
  currentY += HUD_CONFIG.LINE_HEIGHT;
  ctx.fillText('Status: ACTIVE', x + HUD_CONFIG.PADDING, currentY);
}

function drawQuizScorePanel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  score: { correct: number; incorrect: number }
): void {
  const panelWidth = 200;
  const panelHeight = 80;
  const x = canvas.width - panelWidth - HUD_CONFIG.PADDING;
  const y = canvas.height - panelHeight - HUD_CONFIG.PADDING;

  drawRoundedRect(
    ctx,
    x,
    y,
    panelWidth,
    panelHeight,
    HUD_CONFIG.PANEL_RADIUS,
    HUD_CONFIG.COLOR.PANEL_BG
  );

  let currentY = y + HUD_CONFIG.PADDING + 5;
  ctx.fillStyle = HUD_CONFIG.COLOR.TEXT_PRIMARY;
  ctx.font = HUD_CONFIG.FONT.TITLE;
  ctx.fillText('QUIZ SCORE', x + HUD_CONFIG.PADDING, currentY);
  currentY += HUD_CONFIG.LINE_HEIGHT + 5;

  ctx.fillStyle = HUD_CONFIG.COLOR.SUCCESS_GREEN;
  ctx.font = HUD_CONFIG.FONT.VALUE;
  ctx.fillText(`✓ Correct: ${score.correct}`, x + HUD_CONFIG.PADDING, currentY);
  currentY += HUD_CONFIG.LINE_HEIGHT;

  ctx.fillStyle = HUD_CONFIG.COLOR.THREAT_RED;
  ctx.fillText(`✗ Wrong: ${score.incorrect}`, x + HUD_CONFIG.PADDING, currentY);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string
): void {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}
