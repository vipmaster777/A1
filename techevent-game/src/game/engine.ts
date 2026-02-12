import type { GameLevel, GameResult, RiskCard, ScoreState } from './types';

export const GAME_CONFIG = {
  durationSec: 60,
  cardCount: 30,
  maxChaos: 100,
  maxScore: 100,
  wrongPenalty: 6,
  stabilityGain: 5,
  comboCap: 6,
} as const;

const LEVEL_TEXT: Record<GameLevel, { recommendation: string; checklist: string[] }> = {
  A: {
    recommendation:
      'Нагрузка управляемая. Достаточно точечной проверки подрядчиков. Уточните финальный тайминг и резервные каналы.',
    checklist: ['Проверить резерв по электропитанию', 'Подтвердить ответственных по зонам', 'Свести единый run of show'],
  },
  B: {
    recommendation:
      'Средняя нагрузка. Нужна архитектура координации и чек-лист рисков. Лучше провести совместный техпрогон до дня мероприятия.',
    checklist: ['Сверить матрицу рисков по зонам', 'Проверить стыки подрядчиков', 'Заложить временной буфер 10–15%'],
  },
  C: {
    recommendation:
      'Высокая нагрузка. Рекомендуется аудит до подписания подрядчиков. Иначе возрастает риск срыва ключевых блоков программы.',
    checklist: ['Провести аудит площадки и потоков', 'Назначить кризис-координатора', 'Подготовить fallback-сценарий на 3 критичных кейса'],
  },
};

export const createInitialScore = (): ScoreState => ({
  score: 0,
  chaos: 8,
  stability: 45,
  combo: 0,
  correct: 0,
  wrong: 0,
});

export const pickRandomCards = (cards: RiskCard[], count: number): RiskCard[] => {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const applyDrop = (state: ScoreState, card: RiskCard, isCorrect: boolean): ScoreState => {
  if (isCorrect) {
    const nextCombo = Math.min(state.combo + 1, GAME_CONFIG.comboCap);
    const comboBonus = nextCombo >= 3 ? nextCombo : 0;
    const gained = card.weight * 3 + comboBonus;
    return {
      ...state,
      combo: nextCombo,
      correct: state.correct + 1,
      score: Math.min(GAME_CONFIG.maxScore, state.score + gained),
      chaos: Math.max(0, state.chaos - (card.weight + 1)),
      stability: Math.min(100, state.stability + GAME_CONFIG.stabilityGain + comboBonus),
    };
  }

  return {
    ...state,
    combo: 0,
    wrong: state.wrong + 1,
    score: Math.max(0, state.score - (GAME_CONFIG.wrongPenalty + card.weight)),
    chaos: Math.min(GAME_CONFIG.maxChaos, state.chaos + card.weight * 5),
    stability: Math.max(0, state.stability - (card.weight * 2 + 3)),
  };
};

export const getLevelByScore = (score: number): GameLevel => {
  if (score >= 75) return 'A';
  if (score >= 45) return 'B';
  return 'C';
};

export const buildResult = (scoreState: ScoreState): GameResult => {
  const finalScore = Math.max(0, Math.min(100, Math.round(scoreState.score + scoreState.stability * 0.25 - scoreState.chaos * 0.2)));
  const level = getLevelByScore(finalScore);

  return {
    score: finalScore,
    level,
    recommendation: LEVEL_TEXT[level].recommendation,
    checklist: LEVEL_TEXT[level].checklist,
  };
};
