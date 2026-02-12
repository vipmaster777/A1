import type { PropsWithChildren } from 'react';

export function GlassPanel({ children }: PropsWithChildren) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-neon backdrop-blur-xl md:p-5">
      {children}
    </div>
  );
}
