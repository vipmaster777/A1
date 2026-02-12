import { CheckCircle2 } from 'lucide-react';
import type { GameResult } from '../types';
import { GlassPanel } from './GlassPanel';

interface ResultScreenProps {
  result: GameResult;
  onTelegram: () => void;
  onEmail: () => void;
  onRestart: () => void;
}

export function ResultScreen({ result, onTelegram, onEmail, onRestart }: ResultScreenProps) {
  return (
    <GlassPanel>
      <h2 className="text-2xl font-bold text-white md:text-3xl">Ваш индекс координационной нагрузки: {result.score}/100</h2>
      <p className="mt-2 text-slate-200">Уровень: {result.level}</p>
      <p className="mt-3 text-sm text-slate-100 md:text-base">{result.recommendation}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-200">
        {result.checklist.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-accentCyan" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onTelegram} className="rounded-lg bg-gradient-to-r from-accentCyan to-accentBlue px-4 py-2 font-semibold text-[#06231d]">
          Получить аудит в Telegram
        </button>
        <button type="button" onClick={onEmail} className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white">
          Отправить запрос на email
        </button>
        <button type="button" onClick={onRestart} className="rounded-lg px-4 py-2 text-slate-300 underline underline-offset-4">
          Сыграть ещё раз
        </button>
      </div>
    </GlassPanel>
  );
}
