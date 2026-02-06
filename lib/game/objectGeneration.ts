import type { GameObject, ObjectPool } from './objectPool';
import { getRandomProtectionKit } from './protectionKits';
import { GAME_CONFIG } from './gameConstants';

interface ThreatData {
  id: string;
  name: string;
  icon: string;
}

export interface ObjectGenerationState {
  obstacleTimer: number;
  kitTimer: number;
  lastObstacleType: string | null;
}

export function createGenerationState(): ObjectGenerationState {
  return {
    obstacleTimer: 0,
    kitTimer: 0,
    lastObstacleType: null,
  };
}

export function generateGameObjects(
  state: ObjectGenerationState,
  pool: ObjectPool,
  canvasWidth: number,
  laneYPositions: number[],
  currentThreat: ThreatData | null,
  deltaTime: number
): void {
  state.obstacleTimer += deltaTime;
  state.kitTimer += deltaTime;

  if (state.obstacleTimer >= GAME_CONFIG.OBSTACLE_SPAWN_INTERVAL) {
    spawnObstacle(pool, canvasWidth, laneYPositions, currentThreat, state);
    state.obstacleTimer = 0;
  }

  if (state.kitTimer >= GAME_CONFIG.KIT_SPAWN_INTERVAL) {
    spawnKit(pool, canvasWidth, laneYPositions);
    state.kitTimer = 0;
  }
}

function spawnObstacle(
  pool: ObjectPool,
  canvasWidth: number,
  laneYPositions: number[],
  currentThreat: ThreatData | null,
  state: ObjectGenerationState
): void {
  const lane = Math.floor(Math.random() * 3);
  const threat = currentThreat;

  if (threat && threat.name !== state.lastObstacleType) {
    const obj = pool.getObject();
    if (!obj) return;
    
    obj.type = 'obstacle';
    obj.x = canvasWidth;
    obj.y = laneYPositions[lane];
    obj.width = 50;
    obj.height = 50;
    obj.speed = GAME_CONFIG.BASE_SPEED;
    obj.lane = lane;
    obj.threatId = threat.id;
    obj.icon = threat.icon;
    obj.active = true;
    state.lastObstacleType = threat.name;
  }
}

function spawnKit(
  pool: ObjectPool,
  canvasWidth: number,
  laneYPositions: number[]
): void {
  const lane = Math.floor(Math.random() * 3);
  const kit = getRandomProtectionKit();

  const obj = pool.getObject();
  if (!obj) return;
  
  obj.type = 'kit';
  obj.x = canvasWidth;
  obj.y = laneYPositions[lane];
  obj.width = 40;
  obj.height = 40;
  obj.speed = GAME_CONFIG.BASE_SPEED;
  obj.lane = lane;
  obj.kitType = kit.id;
  obj.icon = kit.emoji;
  obj.active = true;
}
