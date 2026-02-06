import { BACKGROUND_CONFIG } from './gameConstants';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  stars: Star[]
): void {
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 1.5
  );
  gradient.addColorStop(0, BACKGROUND_CONFIG.GRADIENT.CENTER);
  gradient.addColorStop(0.5, BACKGROUND_CONFIG.GRADIENT.MID);
  gradient.addColorStop(1, BACKGROUND_CONFIG.GRADIENT.EDGE);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawStars(ctx, stars);
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[]): void {
  stars.forEach((star) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
}

export function createStars(canvas: HTMLCanvasElement): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < BACKGROUND_CONFIG.STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.5 + 0.3,
    });
  }
  return stars;
}

export function updateStars(stars: Star[], deltaTime: number): void {
  stars.forEach((star) => {
    star.brightness += (Math.random() - 0.5) * deltaTime * 0.001;
    star.brightness = Math.max(0.2, Math.min(0.8, star.brightness));
  });
}
