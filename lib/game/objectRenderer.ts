import type { GameObject } from './objectPool';
import { VISUAL_CONFIG } from './gameConstants';

const isDev = process.env.NODE_ENV !== 'production';
const debugIngest = (payload: Record<string, unknown>) => {
  if (!isDev) return;
  fetch('http://127.0.0.1:7244/ingest/8044fb5f-bff6-484b-95e6-3e4a2d42e250', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
};

export function drawGameObjects(
  ctx: CanvasRenderingContext2D,
  objects: GameObject[]
): void {
  objects.forEach((obj) => {
    if (obj.type === 'obstacle') {
      drawObstacle(ctx, obj);
    } else if (obj.type === 'kit') {
      drawKit(ctx, obj);
    } else if (obj.type === 'quizItem') {
      drawQuizItem(ctx, obj);
    }
  });
}

function drawObstacle(ctx: CanvasRenderingContext2D, obj: GameObject): void {
  ctx.fillStyle = VISUAL_CONFIG.OBSTACLE_COLOR;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

  ctx.fillStyle = 'white';
  ctx.font = '24px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial';
  ctx.textAlign = 'center';
  ctx.fillText(obj.icon || '⚠️', obj.x + obj.width / 2, obj.y + obj.height / 2 + 8);
  ctx.textAlign = 'left';
}

function drawKit(ctx: CanvasRenderingContext2D, obj: GameObject): void {
  ctx.fillStyle = VISUAL_CONFIG.KIT_COLOR;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

  ctx.fillStyle = 'white';
  ctx.font = '20px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",Arial';
  ctx.textAlign = 'center';
  ctx.fillText(obj.icon || '🛡️', obj.x + obj.width / 2, obj.y + obj.height / 2 + 8);
  ctx.textAlign = 'left';
}

function drawQuizItem(ctx: CanvasRenderingContext2D, obj: GameObject): void {
  // #region agent log
  debugIngest({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H6',location:'objectRenderer.ts:drawQuizItem',message:'objectRenderer quiz item draw',data:{label:obj.label,icon:obj.icon,isCorrect:obj.isCorrect,hasNonAscii:typeof obj.label === 'string' ? /[^\x20-\x7E]/.test(obj.label) : false},timestamp:Date.now()});
  // #endregion
  const isCorrect = obj.isCorrect ?? false;
  ctx.fillStyle = isCorrect
    ? VISUAL_CONFIG.QUIZ_CORRECT_COLOR
    : VISUAL_CONFIG.QUIZ_INCORRECT_COLOR;
  
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  
  const lines = obj.label?.split('\n') || ['?'];
  const lineHeight = 18;
  const startY = obj.y + obj.height / 2 - (lines.length * lineHeight) / 2;
  
  lines.forEach((line: string, i: number) => {
    ctx.fillText(
      line,
      obj.x + obj.width / 2,
      startY + i * lineHeight + lineHeight
    );
  });
  
  ctx.textAlign = 'left';
}
