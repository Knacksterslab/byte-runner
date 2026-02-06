import type { GameObject } from './objectPool';
import type { QuizChallenge } from './inGameQuizzes';
import { QUIZ_CONFIG } from './gameConstants';

export interface QuizState {
  active: boolean;
  currentQuiz: QuizChallenge | null;
  itemsCollected: Set<string>;
  correctCount: number;
  incorrectCount: number;
  totalCorrectItems: number;
}

export function createQuizState(): QuizState {
  return {
    active: false,
    currentQuiz: null,
    itemsCollected: new Set(),
    correctCount: 0,
    incorrectCount: 0,
    totalCorrectItems: 0,
  };
}

export function generateQuizObjects(
  quiz: QuizChallenge,
  canvasWidth: number,
  laneYPositions: number[]
): GameObject[] {
  const objects: GameObject[] = [];

  quiz.items.forEach((item, index) => {
    const lane = index % 3;
    const xPosition = canvasWidth + index * QUIZ_CONFIG.ITEM_SPACING;

    objects.push({
      id: item.id,
      type: 'quizItem',
      x: xPosition,
      y: laneYPositions[lane],
      width: QUIZ_CONFIG.ITEM_WIDTH,
      height: QUIZ_CONFIG.ITEM_HEIGHT,
      speed: 0,
      lane,
      isCorrect: item.isCorrect,
      label: item.label,
      icon: item.visual,
      vx: 0,
      vy: 0,
      color: item.color,
      threatId: '',
      sentBy: { id: '', name: '', emoji: '', level: 1, speciality: '', category: 'password' },
      category: 'quiz',
      active: true,
    });
  });

  return objects;
}

export function checkQuizCollection(
  player: { x: number; y: number; width: number; height: number },
  quizObjects: GameObject[],
  quizState: QuizState
): { collected: GameObject[]; updated: boolean } {
  const collected: GameObject[] = [];
  let updated = false;

  quizObjects.forEach((obj) => {
    if (
      obj.id &&
      !quizState.itemsCollected.has(obj.id) &&
      isColliding(player, obj)
    ) {
      quizState.itemsCollected.add(obj.id);
      collected.push(obj);
      updated = true;

      if (obj.isCorrect) {
        quizState.correctCount++;
      } else {
        quizState.incorrectCount++;
      }
    }
  });

  return { collected, updated };
}

export function isQuizComplete(quizState: QuizState): boolean {
  const totalCollected = quizState.correctCount + quizState.incorrectCount;
  const allItemsCount = quizState.currentQuiz?.items.length || 0;
  
  return totalCollected >= allItemsCount;
}

export function isQuizPassed(quizState: QuizState): boolean {
  return quizState.correctCount >= quizState.totalCorrectItems && 
         quizState.incorrectCount === 0;
}

function isColliding(
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
