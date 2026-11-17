'use client';

import { motion } from 'framer-motion';
import { EASE } from './ui';

/*
 * Pengantar tiga mode, sebelum alur per mode di-scroll. Klik kartu → meluncur ke giliran
 * mode itu di panggung (ModelScroll memberi fungsi `onPick`).
 */
export type ModeCard = { name: string; have: string; you: string };

export default function ModesOverview({ modes, onPick }: { modes: ModeCard[]; onPick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {modes.map((m, i) => (
        <motion.button
          key={m.name}
          type="button"
          onClick={() => onPick(i)}
          initial={{ opacity: 0, y: 32, rotate: i === 0 ? -1.5 : i === 2 ? 1.5 : 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
          className="group relative isolate flex flex-col overflow-hidden rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 text-left transition-[border-color,transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-foreground/25 hover:shadow-[0_24px_50px_-30px_rgba(43,34,35,0.45)] md:p-7"
        >
          {/* latar gelap naik dari bawah saat hover */}
          <span aria-hidden className="absolute inset-0 -z-10 translate-y-full rounded-sheet bg-foreground transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
          <span className="font-mono text-xs text-muted transition-colors duration-700 group-hover:text-surface-white/50">Mode 0{i + 1}</span>
          <span className="mt-6 block text-xl font-medium tracking-tight text-foreground transition-colors duration-700 group-hover:text-surface-white md:mt-10 md:text-2xl">
            {m.name}
          </span>
          <span className="mt-2 block text-sm text-foreground/80 transition-colors duration-700 group-hover:text-surface-white/80">“{m.have}”</span>
          <span className="mt-1 block text-xs text-muted transition-colors duration-700 group-hover:text-surface-white/50">You enter: {m.you}</span>
          <span className="mt-6 flex items-center gap-2 text-xs text-foreground transition-colors duration-700 group-hover:text-surface-white">
            See how it runs
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-5-5 5 5 5-5" />
            </svg>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
