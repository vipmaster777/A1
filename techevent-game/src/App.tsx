import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { ALL_RISKS, ZONES } from './game/data';
import { applyDrop, buildResult, createInitialScore, GAME_CONFIG, pickRandomCards } from './game/engine';
import { DropZone } from './game/ui/DropZone';
import { LeadPrompt } from './game/ui/LeadPrompt';
import { ProgressBars } from './game/ui/ProgressBars';
import { ResultScreen } from './game/ui/ResultScreen';
import { RiskCardView } from './game/ui/RiskCardView';
import { StartScreen } from './game/ui/StartScreen';
import type { GameResult, LeadData, RiskCard, RiskCategory, ScoreState } from './game/types';

const TELEGRAM_USERNAME = 'techevent_pro';
const EMAIL = 'hello@techevent.pro';

const STORAGE_KEY = 'techevent_coordination_result';

type Stage = 'start' | 'playing' | 'leadPrompt' | 'result';

declare global {
  interface Window {
    techeventTrack: (eventName: string, payload?: Record<string, unknown>) => void;
  }
}

if (!window.techeventTrack) {
  window.techeventTrack = (eventName, payload = {}) => {
    (window as any).dataLayer?.push({ event: eventName, ...payload });
    (window as any).ym?.(0, 'reachGoal', eventName, payload);
  };
}

const playTone = (frequency: number, duration = 0.08) => {
  const audio = new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(audio.destination);
  gain.gain.value = 0.05;
  osc.start();
  setTimeout(() => {
    osc.stop();
    audio.close();
  }, duration * 1000);
};

export default function App() {
  const [stage, setStage] = useState<Stage>('start');
  const [soundOn, setSoundOn] = useState(true);
  const [cards, setCards] = useState<RiskCard[]>([]);
  const [currentCard, setCurrentCard] = useState<RiskCard | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.durationSec);
  const [scoreState, setScoreState] = useState<ScoreState>(createInitialScore());
  const [activeZone, setActiveZone] = useState<RiskCategory | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({ eventType: 'не указано', attendees: 'не указано' });

  useEffect(() => {
    if (stage !== 'playing') return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  useEffect(() => {
    if (cards.length) {
      setCurrentCard(cards[0]);
    }
  }, [cards]);

  const progress = useMemo(() => {
    const done = GAME_CONFIG.cardCount - cards.length;
    return Math.round((done / GAME_CONFIG.cardCount) * 100);
  }, [cards.length]);

  const startGame = () => {
    setCards(pickRandomCards(ALL_RISKS, GAME_CONFIG.cardCount));
    setScoreState(createInitialScore());
    setTimeLeft(GAME_CONFIG.durationSec);
    setResult(null);
    setShowLeadForm(false);
    setLeadData({ eventType: 'не указано', attendees: 'не указано' });
    setStage('playing');
    window.techeventTrack('game_start', { duration: GAME_CONFIG.durationSec });
  };

  const handleDrop = (zone: RiskCategory, card = currentCard) => {
    if (!card || stage !== 'playing') return;
    const isCorrect = card.type === zone;
    setActiveZone(zone);
    const next = applyDrop(scoreState, card, isCorrect);
    setScoreState(next);
    setCards((prev) => prev.filter((item) => item.id !== card.id));

    if (soundOn) {
      playTone(isCorrect ? 690 : 240, isCorrect ? 0.05 : 0.09);
    }

    window.techeventTrack(isCorrect ? 'card_drop_correct' : 'card_drop_wrong', {
      cardId: card.id,
      expectedZone: card.type,
      dropZone: zone,
      combo: next.combo,
    });
  };

  const onDragEnd = ({ over }: DragEndEvent) => {
    if (!over) return;
    handleDrop(over.id as RiskCategory);
  };

  const finishGame = () => {
    const gameResult = buildResult(scoreState);
    setResult(gameResult);
    setStage('leadPrompt');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...gameResult, createdAt: new Date().toISOString() }));
    window.techeventTrack('game_finish', gameResult as unknown as Record<string, unknown>);
  };

  useEffect(() => {
    if (stage === 'playing' && cards.length === 0 && currentCard) {
      finishGame();
    }
  }, [cards.length, currentCard, stage]);

  const message = result
    ? `TechEventPro: прошёл мини-игру “Координационный Щит”. Индекс: ${result.score}/100, уровень: ${result.level}. Тип мероприятия: ${leadData.eventType}. Участники: ${leadData.attendees}. Хочу аудит сложности и рекомендации по подрядчикам.`
    : '';

  const openTelegram = () => {
    window.techeventTrack('cta_telegram', { level: result?.level, score: result?.score });
    window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openEmail = () => {
    window.techeventTrack('cta_email', { level: result?.level, score: result?.score });
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Запрос аудита сложности мероприятия от мини-игры')}&body=${encodeURIComponent(message)}`;
  };

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
      {stage === 'start' && <StartScreen soundOn={soundOn} onToggleSound={() => setSoundOn((v) => !v)} onStart={startGame} />}

      {stage === 'playing' && currentCard && (
        <DndContext onDragEnd={onDragEnd}>
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-200">
                <span>Осталось: {timeLeft} сек</span>
                <span>Очки: {scoreState.score}</span>
                <span>Комбо: x{scoreState.combo}</span>
                <span>Прогресс: {progress}%</span>
              </div>
              <p className="mt-2 text-xs text-slate-300 md:text-sm">Перетащите карточку в подходящую зону. Ошибка повышает хаос.</p>
              <div className="mt-3">
                <ProgressBars stability={scoreState.stability} chaos={scoreState.chaos} />
              </div>
            </div>

            <RiskCardView card={currentCard} />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {ZONES.map((zone) => (
                <DropZone key={zone.key} zone={zone} active={activeZone === zone.key} onTap={(zoneKey) => handleDrop(zoneKey)} />
              ))}
            </div>
          </motion.section>
        </DndContext>
      )}

      {stage === 'leadPrompt' && result && (
        <LeadPrompt
          leadData={leadData}
          showForm={showLeadForm}
          onSelect={(answer) => {
            if (!answer) {
              setStage('result');
              return;
            }
            setShowLeadForm(true);
          }}
          onChange={(field, value) => setLeadData((prev) => ({ ...prev, [field]: value || 'не указано' }))}
          onSubmit={() => {
            window.techeventTrack('lead_form_submit', leadData as unknown as Record<string, unknown>);
            setStage('result');
          }}
        />
      )}

      {stage === 'result' && result && (
        <ResultScreen result={result} onTelegram={openTelegram} onEmail={openEmail} onRestart={startGame} />
      )}
    </main>
  );
}
