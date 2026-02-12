import type { LeadData } from '../types';
import { GlassPanel } from './GlassPanel';

interface LeadPromptProps {
  leadData: LeadData;
  showForm: boolean;
  onSelect: (answer: boolean) => void;
  onChange: (field: keyof LeadData, value: string) => void;
  onSubmit: () => void;
}

export function LeadPrompt({ leadData, showForm, onSelect, onChange, onSubmit }: LeadPromptProps) {
  return (
    <GlassPanel>
      <h2 className="text-xl font-bold text-white md:text-2xl">Хотите точный аудит под вашу площадку?</h2>
      {!showForm ? (
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => onSelect(true)} className="rounded-lg bg-accentCyan px-4 py-2 font-semibold text-[#002f25]">
            Да
          </button>
          <button type="button" onClick={() => onSelect(false)} className="rounded-lg border border-white/20 px-4 py-2 text-white">
            Нет
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            value={leadData.eventType}
            onChange={(e) => onChange('eventType', e.target.value)}
            placeholder="Тип мероприятия"
            className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-slate-400"
          />
          <input
            value={leadData.attendees}
            onChange={(e) => onChange('attendees', e.target.value)}
            placeholder="Кол-во участников"
            className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder:text-slate-400"
          />
          <button type="button" onClick={onSubmit} className="rounded-lg bg-accentBlue px-4 py-2 font-semibold text-[#021b2b]">
            Продолжить
          </button>
        </div>
      )}
    </GlassPanel>
  );
}
