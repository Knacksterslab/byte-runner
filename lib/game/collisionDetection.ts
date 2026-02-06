import type { GameObject } from './objectPool';

export interface CollisionResult {
  obstacles: GameObject[];
  kits: GameObject[];
}

export function checkCollisions(
  player: { x: number; y: number; width: number; height: number },
  objects: GameObject[]
): CollisionResult {
  const result: CollisionResult = {
    obstacles: [],
    kits: [],
  };

  objects.forEach((obj) => {
    if (isColliding(player, obj)) {
      if (obj.type === 'obstacle') {
        result.obstacles.push(obj);
      } else if (obj.type === 'kit') {
        result.kits.push(obj);
      }
    }
  });

  return result;
}

export function isColliding(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
