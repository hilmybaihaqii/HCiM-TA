'use client';

import React from 'react';
import type { Mode } from '../form';

export type StepId = 'overview' | 'drug' | 'exposure' | 'herg' | 'channels' | 'review';

export const STEP_LABEL: Record<StepId, string> = {
  overview: 'Overview',
  drug: 'Drug',
  exposure: 'Exposure',
  herg: 'hERG',
  channels: 'Channels',
  review: 'Review & run',
};

type ModeInfo = {
  id: Mode;
  /** Nama resmi mode (dari panduan) */
  title: string;
  /** Kalimat dari sudut pandang user, supaya langsung tahu "ini untuk saya" */
  question: string;
  /** Satu kalimat di kartu */
  short: string;
  useWhen: string;
  /** Yang diisi user, dengan contoh nilai (untuk overview) */
  enter: { k: string; v: string; muted?: boolean }[];
  effort: string;
  steps: StepId[];
};

export const MODES: ModeInfo[] = [
  {
    id: 1,
    title: 'CiPA drug',
    question: 'I have a drug name',
    short: 'Pick one of the 28 CiPA drugs. Nothing else to fill in.',
    useWhen: 'The drug is one of the 28 CiPA reference compounds. Every parameter is already in the database.',
    enter: [{ k: 'Drug', v: 'e.g. Bepridil' }],
    effort: '1 field',
    steps: ['overview', 'drug', 'review'],
  },
  {
    id: 2,
    title: 'New drug',
    question: 'I have data for a new compound',
    short: 'Enter its Cmax, hERG binding and channel block yourself.',
    useWhen: 'The compound is not in the CiPA set, and you have its exposure and ion-channel data.',
    enter: [
      { k: 'Cmax', v: 'nM' },
      { k: 'hERG', v: 'Kmax, Ku, n, halfmax, Vhalf' },
      { k: 'IC50 / Hill', v: 'INa, INaL, ICaL · optional', muted: true },
    ],
    effort: '6 required fields',
    steps: ['overview', 'exposure', 'herg', 'channels', 'review'],
  },
  {
    id: 3,
    title: 'CiPA drug + new lab data',
    question: 'I re-measured a CiPA drug',
    short: 'Start from a CiPA drug and replace the values you measured.',
    useWhen: 'You have your own hERG or IC50 measurements for a CiPA drug and want to see how they change the risk.',
    enter: [
      { k: 'Drug', v: 'e.g. Bepridil' },
      { k: 'Edits', v: 'hERG, IC50 / Hill' },
      { k: 'Cmax', v: 'from the database', muted: true },
    ],
    effort: '1 drug, then edits',
    steps: ['overview', 'drug', 'herg', 'channels', 'review'],
  },
];

export const modeInfo = (m: Mode) => MODES.find(x => x.id === m) ?? MODES[0];

/** Daftar polos: apa yang diisi di mode ini */
export function EnterList({ info }: { info: ModeInfo }) {
  return (
    <dl>
      {info.enter.map(e => (
        <div key={e.k} className="flex items-baseline justify-between gap-4 py-2 border-b border-foreground/6 last:border-b-0">
          <dt className="text-sm text-foreground">{e.k}</dt>
          <dd className={`text-sm text-right ${e.muted ? 'text-muted/70' : 'text-muted'}`}>{e.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* =========================================================
   PILIH MODE — tiga kartu sejajar, isi minimal
   ========================================================= */
export default function ModeSelector({ onSelect, current }: { onSelect: (m: Mode) => void; current?: Mode }) {
  return (
    <div className="px-6 sm:px-10 md:px-16 py-10 md:py-14">
      <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">What data do you have?</h2>
      <p className="mt-2 text-sm text-muted">All three run the same simulation and the same AI model.</p>

      <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        {MODES.map(m => {
          const isCurrent = current === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={`group w-full text-left flex flex-col rounded-card border p-5 md:p-7 transition-all duration-300
                hover:border-action/40 hover:bg-surface-white
                ${isCurrent ? 'border-action/40 bg-surface-white' : 'border-foreground/8'}`}
            >
              <span className="font-mono text-[11px] text-muted">0{m.id} · {m.title}</span>
              <span className="mt-4 md:mt-6 text-lg md:text-xl font-medium tracking-tight text-foreground leading-snug">{m.question}</span>
              <span className="mt-2 text-sm text-muted leading-relaxed">{m.short}</span>
              <span className="mt-6 md:mt-auto md:pt-8 flex items-center justify-between text-xs">
                <span className="text-muted">{m.effort}</span>
                <span className="text-foreground group-hover:text-action transition-colors">
                  Choose <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
