import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Zone } from '../types';

interface DropZoneProps {
  zone: Zone;
  active: boolean;
  onTap: (zoneKey: Zone['key']) => void;
}

export function DropZone({ zone, active, onTap }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: zone.key });

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      onClick={() => onTap(zone.key)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full rounded-xl border px-3 py-3 text-left transition md:min-h-24 ${
        isOver || active
          ? 'border-accentCyan/90 bg-accentCyan/20 shadow-neon'
          : 'border-white/15 bg-white/5 hover:border-accentBlue/70 hover:bg-white/10'
      }`}
      aria-label={`Зона ${zone.label}`}
    >
      <div className="text-sm font-semibold text-white md:text-base">{zone.label}</div>
      <div className="mt-1 text-xs text-slate-300">{zone.hint}</div>
    </motion.button>
  );
}
