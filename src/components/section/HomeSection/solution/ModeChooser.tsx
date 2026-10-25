'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CARD, EASE, FadeUp, PILL, SubHead } from './ui';

/*
 * Tiga mode (sama dengan halaman /lab/pipeline): tambahan bagi yang belum punya 11 biomarker.
 * Pengunjung memilih dari kalimat "apa yang saya punya", lalu melihat alurnya.
 */
const MODES = [
  {
    id: 1,
    have: 'I have a drug name',
    title: 'CiPA drug',
    text: 'Pick one of the 28 CiPA drugs. Nothing else to fill in.',
    you: ['Drug name'],
    auto: ['Plasma level (Cmax)', 'hERG binding', 'Channel block'],
  },
  {
    id: 2,
    have: 'I have data for a new compound',
    title: 'New drug',
    text: 'Enter its plasma level, hERG binding and channel block yourself.',
    you: ['Plasma level (Cmax)', 'hERG binding', 'Channel block'],
    auto: [],
  },
  {
    id: 3,
    have: 'I re-measured a CiPA drug',
    title: 'CiPA drug + new lab data',
    text: 'Start from a CiPA drug and replace the values you measured.',
    you: ['Drug name', 'Your new values'],
    auto: ['Plasma level (Cmax)', 'Values you keep'],
  },
];

export default function ModeChooser() {
  const [id, setId] = useState(1);
  const [hover, setHover] = useState<number | null>(null);
  const m = MODES.find((x) => x.id === id)!;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
      <SubHead
        label="Starting from a drug"
        title="No biomarkers yet?"
        accent="Start from what you have."
        body="Cardivex can run the FDA CiPA simulation for you first. Pick the option that matches your data. All three end in the same 400-tree model."
        className="mb-8 md:mb-12"
      />

      <FadeUp className={`${CARD} grid grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-12 lg:gap-8`}>
        {/* ---------- pilihan ---------- */}
        <div role="tablist" aria-label="What do you have?" className="flex flex-col gap-1.5 lg:col-span-5" onMouseLeave={() => setHover(null)}>
          {MODES.map((x) => {
            const on = x.id === id;
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setId(x.id)}
                onMouseEnter={() => setHover(x.id)}
                className={`relative isolate rounded-card px-4 py-4 text-left transition-colors duration-500 md:px-5 ${on ? 'text-surface-white' : 'text-foreground'}`}
              >
                {on && <motion.span layoutId="mode-pick" transition={PILL} className="absolute inset-0 -z-10 rounded-card bg-foreground" />}
                {!on && hover === x.id && <motion.span layoutId="mode-hover" transition={PILL} className="absolute inset-0 -z-10 rounded-card bg-foreground/[0.05]" />}
                <span className={`block font-mono text-[11px] transition-colors duration-500 ${on ? 'text-surface-white/50' : 'text-muted'}`}>
                  Mode 0{x.id} · {x.title}
                </span>
                <span className="mt-1 block text-base font-medium md:text-lg">“{x.have}”</span>
              </button>
            );
          })}
          <p className="mt-3 px-4 text-xs leading-relaxed text-muted md:px-5">
            Already have the 11 biomarkers? Enter them in the Digital Lab and go straight to our model.
          </p>
        </div>

        {/* ---------- alur mode terpilih ---------- */}
        <div className="relative rounded-card bg-background/80 p-5 md:p-7 lg:col-span-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="block text-xl font-medium tracking-tight text-foreground md:text-2xl">{m.title}</span>
              <p className="mt-1 text-sm text-muted">{m.text}</p>

              <ol className="mt-6 space-y-3">
                <Step n={1} title="You enter" delay={0.05}>
                  <div className="flex flex-wrap gap-1.5">
                    {m.you.map((t) => (
                      <span key={t} className="rounded-full bg-foreground px-2.5 py-1 text-[11px] text-surface-white">
                        {t}
                      </span>
                    ))}
                    {m.auto.map((t) => (
                      <span key={t} className="rounded-full border border-dashed border-foreground/30 px-2.5 py-1 text-[11px] text-muted">
                        {t} · from database
                      </span>
                    ))}
                  </div>
                </Step>
                <Step n={2} title="FDA CiPA heart-cell simulation" delay={0.15}>
                  <span className="text-xs text-muted">Runs at 1, 2, 3 and 4 × the plasma level. Takes about a minute.</span>
                </Step>
                <Step n={3} title="11 biomarkers" delay={0.25}>
                  <span className="text-xs text-muted">Averaged over the four runs, in the same way the training data was made.</span>
                </Step>
                <Step n={4} title="Our 400-tree model + SHAP" delay={0.35} highlight>
                  <span className="text-xs text-muted">Risk level, and the biomarkers behind it.</span>
                </Step>
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </FadeUp>
    </div>
  );
}

function Step({ n, title, delay, highlight = false, children }: { n: number; title: string; delay: number; highlight?: boolean; children: ReactNode }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className="grid grid-cols-[1.75rem_1fr] gap-3"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] ${
          highlight ? 'bg-accent text-surface-white' : 'border border-foreground/15 bg-surface-white text-muted'
        }`}
      >
        {n}
      </span>
      <div className="pt-0.5">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <div className="mt-1">{children}</div>
      </div>
    </motion.li>
  );
}
