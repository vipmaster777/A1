import { GlassPanel } from './GlassPanel';

interface StartScreenProps {
  soundOn: boolean;
  onToggleSound: () => void;
  onStart: () => void;
}

export function StartScreen({ soundOn, onToggleSound, onStart }: StartScreenProps) {
  return (
    <GlassPanel>
      <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">Координационный Щит</h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-lg">
        За 60 секунд разложите риски по зонам и получите индекс нагрузки мероприятия.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onStart}
          aria-label="Старт игры"
          className="rounded-xl bg-gradient-to-r from-accentCyan to-accentBlue px-6 py-3 text-sm font-bold text-[#03231d] shadow-neon transition hover:brightness-110"
        >
          Старт
        </button>
        <button
          type="button"
          onClick={onToggleSound}
          aria-label="Переключить звук"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20"
        >
          Звук: {soundOn ? 'Вкл' : 'Выкл'}
        </button>
      </div>
    </GlassPanel>
  );
}
