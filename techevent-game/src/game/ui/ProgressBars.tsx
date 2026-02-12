interface ProgressBarsProps {
  stability: number;
  chaos: number;
}

export function ProgressBars({ stability, chaos }: ProgressBarsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-200">
          <span>Стабильность</span>
          <span>{Math.round(stability)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-accentBlue to-accentCyan" style={{ width: `${stability}%` }} />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-200">
          <span>Хаос</span>
          <span>{Math.round(chaos)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${chaos}%` }} />
        </div>
      </div>
    </div>
  );
}
