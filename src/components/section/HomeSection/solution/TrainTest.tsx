'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EASE, FadeUp, PILL, SubHead } from './ui';

/* Pembagian 28 obat CiPA (CD-4 Tabel 2.2) dan hasil pada 16 obat uji (Tabel 2.6). */
type Risk = 'high' | 'int' | 'low';
const TRAIN: Record<Risk, string[]> = {
  high: ['Bepridil', 'Dofetilide', 'Quinidine', 'Sotalol'],
  int: ['Chlorpromazine', 'Cisapride', 'Ondansetron', 'Terfenadine'],
  low: ['Diltiazem', 'Mexiletine', 'Ranolazine', 'Verapamil'],
};
const TEST: Record<Risk, string[]> = {
  high: ['Azimilide', 'Disopyramide', 'Ibutilide', 'Vandetanib'],
  int: ['Astemizole', 'Clarithromycin', 'Clozapine', 'Domperidone', 'Droperidol', 'Pimozide', 'Risperidone'],
  low: ['Loratadine', 'Metoprolol', 'Nifedipine', 'Nitrendipine', 'Tamoxifen'],
};
const RISKS: { key: Risk | 'all'; name: string; dot: string }[] = [
  { key: 'all', name: 'All', dot: 'bg-foreground' },
  { key: 'high', name: 'High', dot: 'bg-accent' },
  { key: 'int', name: 'Intermediate', dot: 'bg-amber' },
  { key: 'low', name: 'Low', dot: 'bg-teal' },
];
const DOT: Record<Risk, string> = { high: 'bg-accent', int: 'bg-amber', low: 'bg-teal' };

function DrugCloud({ data, filter, delay, dark = false }: { data: Record<Risk, string[]>; filter: Risk | 'all'; delay: number; dark?: boolean }) {
  const list = (Object.keys(data) as Risk[]).flatMap((r) => data[r].map((d) => ({ d, r })));
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map(({ d, r }, i) => {
        const dim = filter !== 'all' && filter !== r;
        return (
          <motion.span
            key={d}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: EASE, delay: delay + i * 0.03 }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-[opacity,background-color,border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              dim
                ? 'border-transparent opacity-25'
                : dark
                  ? 'border-surface-white/10 bg-surface-white/[0.06] hover:-translate-y-0.5 hover:border-surface-white/30'
                  : 'border-foreground/10 bg-surface-white hover:-translate-y-0.5 hover:border-foreground/30'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[r]}`} />
            {d}
          </motion.span>
        );
      })}
    </div>
  );
}

export default function TrainTest() {
  const [filter, setFilter] = useState<Risk | 'all'>('all');

  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
      <SubHead
        label="Honest testing"
        title="Tested on drugs"
        accent="it had never seen."
        body="The 28 CiPA reference drugs were split in two. The model learned from 12 of them. The other 16 were locked away until the final test, so a good score cannot come from memory."
        className="mb-8 md:mb-12"
      />

      {/* filter tingkat risiko: latar hitam meluncur ke pilihan aktif */}
      <FadeUp className="mb-4 inline-flex flex-wrap rounded-full border border-foreground/10 bg-surface-white/70 p-1">
        {RISKS.map((r) => {
          const on = filter === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => setFilter(r.key)}
              aria-pressed={on}
              className={`relative isolate flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs transition-colors duration-500 md:text-sm ${on ? 'text-surface-white' : 'text-muted hover:text-foreground'}`}
            >
              {on && <motion.span layoutId="risk-filter" transition={PILL} className="absolute inset-0 -z-10 rounded-full bg-foreground" />}
              {r.key !== 'all' && <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />}
              {r.name}
            </button>
          );
        })}
      </FadeUp>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1.35fr] lg:gap-0">
        <FadeUp className="rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 md:p-7">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <span className="text-lg font-medium text-foreground">Training</span>
            <span className="text-xs text-muted">12 drugs · 24,000 virtual cells</span>
          </div>
          <DrugCloud data={TRAIN} filter={filter} delay={0.1} />
        </FadeUp>

        {/* dinding pemisah */}
        <div className="flex items-center justify-center py-1 lg:w-16 lg:py-0" aria-hidden>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-background text-muted">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
        </div>

        <FadeUp delay={0.1} className="rounded-sheet bg-foreground p-5 text-surface-white md:p-7">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <span className="text-lg font-medium">Testing</span>
            <span className="text-xs text-surface-white/50">16 drugs the model never saw</span>
          </div>
          <DrugCloud data={TEST} filter={filter} delay={0.2} dark />
        </FadeUp>
      </div>

      {/* hasil pada obat uji */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { big: '14/16', text: 'unseen drugs classified correctly', note: '13/16 and 12/16 on two other lab platforms it was not trained on' },
          { big: '4/4', text: 'high-risk drugs caught on every platform', note: 'No high-risk drug was ever placed in a lower tier' },
          { big: '2,000', text: 'virtual cells per drug', note: 'Cells of one drug are nearly alike, so a drug is never split across training and testing' },
        ].map((s, i) => (
          <FadeUp
            key={s.text}
            delay={i * 0.08}
            className="group rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 transition-colors duration-700 hover:bg-surface-white md:p-6"
          >
            <span className="block text-3xl font-light tracking-tight text-foreground transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 md:text-4xl">
              {s.big}
            </span>
            <span className="mt-2 block text-sm text-foreground">{s.text}</span>
            <span className="mt-1 block text-xs leading-snug text-muted">{s.note}</span>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
