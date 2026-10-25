'use client';

import { useRef, useState } from 'react';
import { LayoutGroup, motion, useInView } from 'framer-motion';
import { accentSerif } from '@/lib/fonts';
import { EASE, LABEL, Reveal } from './ui';

/*
 * Model prediksi dilatih & diuji pada obat yang berbeda (CD-4 Tabel 2.2 & 2.6).
 * 28 titik obat mula-mula bercampur, lalu terpisah jadi 12 (training) dan 16 (testing)
 * saat blok ini masuk layar. Hover titik untuk melihat nama obatnya.
 */
type Risk = 'high' | 'int' | 'low';
const TRAIN: [string, Risk][] = [
  ['Bepridil', 'high'], ['Dofetilide', 'high'], ['Quinidine', 'high'], ['Sotalol', 'high'],
  ['Chlorpromazine', 'int'], ['Cisapride', 'int'], ['Ondansetron', 'int'], ['Terfenadine', 'int'],
  ['Diltiazem', 'low'], ['Mexiletine', 'low'], ['Ranolazine', 'low'], ['Verapamil', 'low'],
];
const TEST: [string, Risk][] = [
  ['Azimilide', 'high'], ['Disopyramide', 'high'], ['Ibutilide', 'high'], ['Vandetanib', 'high'],
  ['Astemizole', 'int'], ['Clarithromycin', 'int'], ['Clozapine', 'int'], ['Domperidone', 'int'], ['Droperidol', 'int'], ['Pimozide', 'int'], ['Risperidone', 'int'],
  ['Loratadine', 'low'], ['Metoprolol', 'low'], ['Nifedipine', 'low'], ['Nitrendipine', 'low'], ['Tamoxifen', 'low'],
];
const DOT: Record<Risk, string> = { high: 'bg-accent', int: 'bg-amber', low: 'bg-teal' };
const RISK_NAME: Record<Risk, string> = { high: 'High risk', int: 'Intermediate risk', low: 'Low risk' };

/* Urutan campur tetap (sebelum dipisah). */
const MIXED = [...TRAIN, ...TEST]
  .map((d) => ({ d }))
  .map((x, i) => ({ ...x, k: (i * 17) % 28 }))
  .sort((a, b) => a.k - b.k);

function Dot({ name, risk, onHover }: { name: string; risk: Risk; onHover: (v: string | null) => void }) {
  return (
    <motion.button
      layoutId={`drug-${name}`}
      type="button"
      transition={{ duration: 1.1, ease: EASE }}
      onMouseEnter={() => onHover(`${name} · ${RISK_NAME[risk]}`)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(`${name} · ${RISK_NAME[risk]}`)}
      onBlur={() => onHover(null)}
      aria-label={`${name}, ${RISK_NAME[risk]}`}
      className={`h-4 w-4 rounded-full ring-2 ring-transparent transition-[box-shadow,transform] duration-300 hover:scale-125 hover:ring-foreground/20 md:h-5 md:w-5 ${DOT[risk]}`}
    />
  );
}

export default function TrainTestSplit() {
  const ref = useRef<HTMLDivElement>(null);
  const split = useInView(ref, { once: true, amount: 0.5 });
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
      <div className="mb-8 max-w-3xl md:mb-12">
        <Reveal>
          <span className={`${LABEL} mb-5`}>Honest testing</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h3 className="text-[clamp(1.9rem,3.6vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.03em] text-foreground">
            Trained on 12 drugs. <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>Tested on 16 it had never seen.</em>
          </h3>
        </Reveal>
        <Reveal delay={0.12} className="mt-4">
          <p className="max-w-xl text-sm leading-relaxed text-muted md:text-base">
            Our prediction model learned from 12 CiPA drugs. The other 16 were locked away until the final test, so its score shows how it handles new drugs, not how well it remembers.
          </p>
        </Reveal>
      </div>

      <div ref={ref} className="rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 md:p-8">
        <LayoutGroup>
          {split ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto_1.35fr] md:gap-0">
              <div>
                <span className="mb-4 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">Training</span>
                  <span className="text-xs text-muted">12 drugs · learned from</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {TRAIN.map(([n, r]) => (
                    <Dot key={n} name={n} risk={r} onHover={setHover} />
                  ))}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
                className="relative flex items-center justify-center py-2 md:w-20 md:py-0"
                aria-hidden
              >
                <span className="h-px w-full bg-foreground/10 md:h-full md:w-px" />
                <span className="absolute flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-background text-muted">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
              </motion.div>
              <div>
                <span className="mb-4 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">Testing</span>
                  <span className="text-xs text-muted">16 drugs · never seen before</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {TEST.map(([n, r]) => (
                    <Dot key={n} name={n} risk={r} onHover={setHover} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2.5 py-6">
              {MIXED.map(({ d: [n, r] }) => (
                <Dot key={n} name={n} risk={r} onHover={setHover} />
              ))}
            </div>
          )}
        </LayoutGroup>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-4 text-xs text-muted">
          <span className="min-h-[1rem] text-foreground">{hover ?? 'Hover a dot to see the drug.'}</span>
          <span className="flex gap-4">
            {(['high', 'int', 'low'] as Risk[]).map((r) => (
              <span key={r} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${DOT[r]}`} /> {RISK_NAME[r].replace(' risk', '')}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* hasil pada 16 obat yang belum pernah dilihat */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { big: '28', text: 'CiPA reference drugs', note: 'The reference set chosen by the FDA-led CiPA initiative, each with an official risk level.' },
          { big: '12 + 16', text: 'to learn from, and to test', note: 'The 16 test drugs were never shown to the model while it learned.' },
          { big: '14/16', text: 'test drugs called correctly', note: 'Its answer matched the official risk level for 14 of the 16 new drugs.' },
        ].map((s, i) => (
          <motion.div
            key={s.text}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
            className="group rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 transition-colors duration-700 hover:bg-surface-white md:p-6"
          >
            <span className="block text-3xl font-light tracking-tight text-foreground transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 md:text-4xl">{s.big}</span>
            <span className="mt-2 block text-sm text-foreground">{s.text}</span>
            <span className="mt-1 block text-xs leading-snug text-muted">{s.note}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
