'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, type LucideIcon } from 'lucide-react';

export type StageState = 'pending' | 'active' | 'done' | 'failed';

export type Stage = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Apa yang dikerjakan di tahap ini */
  does: string;
  /** Hasil nyata setelah tahap selesai (dari data API) */
  output?: React.ReactNode;
  /** Isi saat tahap sedang berjalan (mis. jejak ECG kecil) */
  live?: React.ReactNode;
};

function Node({ state, icon: Icon, size = 'md' }: { state: StageState; icon: LucideIcon; size?: 'sm' | 'md' }) {
  const Glyph = state === 'done' ? Check : state === 'failed' ? X : Icon;
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  return (
    <span className={`relative z-10 ${dim} rounded-full border flex items-center justify-center shrink-0 transition-colors duration-500
      ${state === 'done' ? 'bg-accent border-transparent text-surface-white'
        : state === 'active' || state === 'failed' ? 'bg-surface-white border-accent text-accent'
        : 'bg-surface-white border-foreground/15 text-foreground/60'}`}
    >
      {/* Langkah aktif: cincin tipis yang mengembang pelan */}
      {state === 'active' && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-accent/60"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 1.45 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <Glyph className="w-4 h-4" strokeWidth={state === 'done' ? 2.5 : 1.6} />
    </span>
  );
}

/** Garis penghubung antar tahap. Segmen yang sedang dikerjakan dialiri cahaya tipis. */
function Connector({ state }: { state: 'done' | 'flowing' | 'idle' }) {
  return (
    <span aria-hidden="true" className="relative flex-1 h-px mx-2 overflow-hidden">
      <span className={`absolute inset-0 ${state === 'done' ? 'bg-accent' : 'bg-foreground/15'}`} />
      {state === 'flowing' && (
        <motion.span
          className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-accent/70 to-transparent"
          initial={{ left: '-33%' }}
          animate={{ left: '100%' }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </span>
  );
}

function StageOutput({ stage, state }: { stage: Stage; state: StageState }) {
  if (state === 'active' && stage.live) return <div className="mt-3">{stage.live}</div>;
  if (state === 'failed') return <p className="mt-3 text-xs text-accent">Stopped here</p>;
  if (!stage.output || state === 'pending') return null;
  return <div className="mt-3 text-xs text-foreground leading-relaxed">{stage.output}</div>;
}

/**
 * Panel status proses (Full Pipeline & Digital Lab). Desktop: semua tahap berdampingan dengan
 * keterangan & hasilnya. Ponsel: deretan node, ketuk untuk membaca satu tahap.
 */
export default function StageMonitor({ id, label, status, meta, stages, states }: {
  /** id elemen (dipakai tur Digital Lab) */
  id?: string;
  label: string;
  status: string;
  /** Isi di kanan header, mis. timer */
  meta?: React.ReactNode;
  stages: Stage[];
  states: StageState[];
}) {
  const current = states.findIndex(s => s === 'active' || s === 'failed');
  const lastDone = states.lastIndexOf('done');
  const [picked, setPicked] = useState<number | null>(null);
  const shown = picked ?? (current >= 0 ? current : Math.max(0, lastDone));

  const connector = (i: number): 'done' | 'flowing' | 'idle' =>
    states[i + 1] === 'done' ? 'done'
      : states[i] === 'done' && states[i + 1] === 'active' ? 'flowing'
      : 'idle';

  return (
    <section
      id={id}
      aria-label={`${label} status`}
      className="w-full bg-surface-white/80 border border-foreground/10 rounded-sheet px-5 py-6 md:px-10 md:py-8"
    >
      <div className="flex items-center justify-between gap-4 pb-4 mb-6 md:mb-8 border-b border-foreground/10">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="shrink-0 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-foreground font-semibold">
            {label}
          </span>
          {/* Animasi masuk saja (AnimatePresence mode="wait" bisa macet di opacity 0) */}
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate text-xs md:text-sm text-accent"
          >
            {status}
          </motion.span>
        </div>
        {meta && <span className="shrink-0 font-mono text-xs md:text-sm tabular-nums text-foreground/70">{meta}</span>}
      </div>

      {/* Desktop */}
      <ol className="hidden md:grid gap-x-4" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((s, i) => (
          <li key={s.id} className="min-w-0" aria-current={states[i] === 'active' ? 'step' : undefined}>
            <div className="flex items-center">
              <Node state={states[i]} icon={s.icon} />
              {i < stages.length - 1 && <Connector state={connector(i)} />}
            </div>
            <p className="mt-4 text-[10px] font-mono tracking-[0.15em] text-foreground/60">0{i + 1}</p>
            <p className={`mt-0.5 text-sm font-medium ${states[i] === 'pending' ? 'text-foreground/60' : 'text-foreground'}`}>{s.title}</p>
            <p className="mt-1.5 text-xs text-foreground/70 leading-relaxed pr-2">{s.does}</p>
            <StageOutput stage={s} state={states[i]} />
          </li>
        ))}
      </ol>

      {/* Ponsel */}
      <div className="md:hidden">
        <ol className="flex items-center">
          {stages.map((s, i) => (
            <li key={s.id} className={`flex items-center ${i < stages.length - 1 ? 'flex-1' : ''}`}>
              <button
                type="button"
                onClick={() => setPicked(i)}
                aria-label={`${s.title}: ${states[i]}`}
                aria-pressed={shown === i}
                className={`rounded-full transition-shadow ${shown === i ? 'ring-2 ring-accent/25 ring-offset-2 ring-offset-surface-white' : ''}`}
              >
                <Node state={states[i]} icon={s.icon} size="sm" />
              </button>
              {i < stages.length - 1 && <Connector state={connector(i)} />}
            </li>
          ))}
        </ol>
        <motion.div
          key={shown}
          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-5"
        >
          <p className="text-[10px] font-mono tracking-[0.15em] text-foreground/60">0{shown + 1} / 0{stages.length}</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{stages[shown].title}</p>
          <p className="mt-1 text-xs text-foreground/70 leading-relaxed">{stages[shown].does}</p>
          <StageOutput stage={stages[shown]} state={states[shown]} />
        </motion.div>
      </div>
    </section>
  );
}
