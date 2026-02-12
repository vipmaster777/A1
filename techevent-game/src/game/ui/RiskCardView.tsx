import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle } from 'lucide-react';
import type { RiskCard } from '../types';

interface RiskCardViewProps {
  card: RiskCard;
}

export function RiskCardView({ card }: RiskCardViewProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });

  return (
    <button
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`w-full rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentCyan/80 ${
        isDragging ? 'scale-[1.02] shadow-neon' : 'hover:border-accentBlue/70 hover:bg-white/15'
      }`}
      {...listeners}
      {...attributes}
      aria-label={`Карточка риска: ${card.title}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-accentBlue" />
        <div>
          <div className="text-sm font-medium text-white md:text-base">{card.title}</div>
          <div className="mt-2 text-xs text-slate-300">Вес риска: {card.weight}</div>
        </div>
      </div>
    </button>
  );
}
