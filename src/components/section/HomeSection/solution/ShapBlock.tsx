'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE, FadeUp, SubHead } from './ui';

/*
 * SHAP: biomarker mana yang paling memengaruhi prediksi. Angka = mean |SHAP|
 * (TreeExplainer, 320 sel virtual dari data uji ChanTest), CD-4 §2.1.8. Hanya lima teratas yang dilaporkan.
 */
const SHAP = [
  { name: 'qNet', v: 0.105, plain: 'Net electrical charge carried in one beat', why: 'The reference measure CiPA itself uses for this heart risk. The model ranking it first is a good sign it learned the right signal.' },
  { name: 'APD50', v: 0.096, plain: 'Time for the cell to half-recover after a beat', why: 'Slow recovery is how drugs set up the dangerous rhythm.' },
  { name: 'APD90', v: 0.078, plain: 'Time to recover 90% after a beat', why: 'Closely tied to the QT interval that doctors read on an ECG.' },
  { name: 'Max dV', v: 0.056, plain: 'Fastest speed of recovery', why: 'Another view of how smoothly the cell resets after each beat.' },
  { name: 'V rest', v: 0.053, plain: 'Resting voltage of the cell', why: 'It barely changes in the data, so its weight should be read with care.' },
];
const MAX = SHAP[0].v;

export default function ShapBlock() {
  const [active, setActive] = useState(0);
  const s = SHAP[active];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SubHead
            label="Explainable with SHAP"
            title="No black box."
            accent="It shows its reasons."
            body="With every prediction, SHAP measures how much each biomarker pushed the result towards or away from a risk level. You see what the model saw, so the answer is easy to check."
          />
          <FadeUp delay={0.15} className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-card border border-foreground/10 bg-surface-white/60 p-4">
              <span className="block text-2xl font-light tracking-tight text-foreground">Every</span>
              <span className="mt-1 block text-xs text-muted">prediction comes with its explanation</span>
            </div>
            <div className="rounded-card border border-foreground/10 bg-surface-white/60 p-4">
              <span className="block text-2xl font-light tracking-tight text-foreground">~1.5 ms</span>
              <span className="mt-1 block text-xs text-muted">of computing per explanation</span>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.1} className="rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 md:p-8 lg:col-span-7">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-foreground">What mattered most</span>
            <span className="hidden text-xs text-muted sm:block">Hover a biomarker</span>
          </div>
          <ul className="space-y-1" onMouseLeave={() => setActive(0)}>
            {SHAP.map((b, i) => {
              const on = i === active;
              return (
                <li key={b.name}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={on}
                    className="group flex w-full items-center gap-3 rounded-control px-2 py-2.5 text-left transition-colors duration-500 hover:bg-foreground/[0.04]"
                  >
                    <span className="w-6 shrink-0 font-mono text-[10px] text-muted">0{i + 1}</span>
                    <span className={`w-16 shrink-0 font-mono text-xs transition-colors duration-500 ${on ? 'text-foreground' : 'text-muted'}`}>{b.name}</span>
                    <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                      <motion.span
                        className={`absolute inset-y-0 left-0 rounded-full transition-colors duration-500 ${on ? 'bg-accent' : 'bg-foreground/30'}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(b.v / MAX) * 100}%` }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 1.3, ease: EASE, delay: 0.15 + i * 0.1 }}
                      />
                    </span>
                    <span className={`w-11 shrink-0 text-right text-xs tabular-nums transition-colors duration-500 ${on ? 'text-foreground' : 'text-muted'}`}>
                      {b.v.toFixed(3)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 px-2 text-[11px] text-muted">The calcium readings and upstroke speed matter least.</p>

          <div className="relative mt-6 min-h-[6.5rem] overflow-hidden rounded-card bg-background/80 p-4 md:p-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span className="block text-sm font-medium text-foreground">
                  {s.name} <span className="font-normal text-muted">· {s.plain}</span>
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.why}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-3 text-[11px] text-muted">Average impact (mean |SHAP|) across 320 virtual cells from the test drugs.</p>
        </FadeUp>
      </div>
    </div>
  );
}
