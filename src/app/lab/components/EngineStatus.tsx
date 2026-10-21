'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, type LucideIcon } from 'lucide-react';

export type EngineStep = { id: string; label: string; icon: LucideIcon };

/**
 * Panel "Engine status" yang dipakai bersama oleh Digital Lab dan Full Pipeline.
 * Hanya tampilan: halaman yang memakainya menentukan langkah aktif & teks statusnya.
 */
export default function EngineStatus({
  id, steps, activeIndex, complete = false, status, meta, children,
}: {
  /** id elemen (dipakai tur Digital Lab: #tour-engine-visualizer) */
  id?: string;
  steps: EngineStep[];
  /** Index langkah yang sedang berjalan */
  activeIndex: number;
  /** true = semua langkah selesai */
  complete?: boolean;
  /** Teks di samping "Engine status" */
  status: string;
  /** Isi di kanan header, mis. timer */
  meta?: React.ReactNode;
  /** Isi tambahan di bawah langkah, mis. keterangan proses */
  children?: React.ReactNode;
}) {
  const last = steps.length - 1;
  const progress = complete ? 1 : Math.min(activeIndex, last) / last;

  return (
    <section
      id={id}
      className="w-full bg-surface-white/80 backdrop-blur-xl border border-foreground/6 rounded-sheet px-5 py-6 md:px-10 md:py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 mb-8 md:mb-10 border-b border-foreground/6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-foreground font-semibold">
            Engine status
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block truncate text-[10px] md:text-xs font-mono uppercase tracking-widest text-accent"
            >
              {status}
            </motion.span>
          </AnimatePresence>
        </div>
        {meta && <div className="shrink-0 font-mono text-xs md:text-sm tabular-nums text-muted">{meta}</div>}
      </div>
      {/* Ponsel: teks status turun ke baris sendiri */}
      <p className="sm:hidden -mt-5 mb-7 text-[10px] font-mono uppercase tracking-widest text-accent">{status}</p>

      {/* Langkah */}
      <div className="relative">
        {/* Garis dasar + garis progres. Pusat node pertama/terakhir ada di 1/(2n) lebar. */}
        <div className="absolute top-5 md:top-6 h-px bg-foreground/8" style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%` }}>
          <motion.div
            className="absolute inset-y-0 left-0 bg-accent"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((step, i) => {
            const isDone = complete || i < activeIndex;
            const isActive = !complete && i === activeIndex;
            const Icon = isDone ? Check : step.icon;
            return (
              <li key={step.id} className="flex flex-col items-center text-center" aria-current={isActive ? 'step' : undefined}>
                <div className="relative w-10 h-10 md:w-12 md:h-12 mb-4">
                  {/* Langkah aktif cukup ditandai warna; tanpa animasi denyut */}
                  <span
                    className={`relative z-10 w-full h-full rounded-full border flex items-center justify-center transition-colors duration-300
                      ${isDone ? 'bg-accent border-transparent text-surface-white'
                        : isActive ? 'bg-surface-white border-accent text-accent ring-4 ring-accent/10'
                        : 'bg-surface-white border-foreground/10 text-muted'}`}
                  >
                    <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isDone ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                  </span>
                </div>
                <span className={`text-[9px] md:text-[10px] font-mono tracking-[0.15em] ${isActive ? 'text-accent font-semibold' : 'text-muted/60'}`}>
                  0{i + 1}
                </span>
                <span className={`mt-1 text-[9px] md:text-[11px] uppercase tracking-widest font-medium leading-tight ${isActive || isDone ? 'text-foreground' : 'text-muted'}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {children && <div className="mt-8 pt-5 border-t border-foreground/6">{children}</div>}
    </section>
  );
}
