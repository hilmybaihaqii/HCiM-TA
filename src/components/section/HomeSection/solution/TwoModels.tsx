'use client';

import { motion } from 'framer-motion';
import { EASE, SubHead } from './ui';

/*
 * Pembagian peran: model sel jantung FDA CiPA (bukan buatan tim) MENGHASILKAN 11 biomarker,
 * model prediksi tim (Random Forest 400 pohon) MEMBACA 11 biomarker itu dan menentukan risikonya.
 */
const CHIPS = ['qNet', 'APD50', 'APD90', 'Max dV', 'V rest', 'Ca max', '+5'];

export default function TwoModels() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
      <SubHead
        label="Two models, two jobs"
        title="The FDA model measures the heart cell."
        accent="Ours reads the numbers."
        body="Cardivex joins two pieces. The FDA's CiPA heart-cell model turns a drug into 11 biomarkers. Our team built the model that reads those 11 numbers and decides the risk."
        className="mb-10 md:mb-14"
      />

      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
        {/* ---------- model FDA CiPA ---------- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: EASE }}
          className="group rounded-sheet border border-dashed border-foreground/20 p-6 transition-colors duration-700 hover:border-foreground/40 md:p-8"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Made by the FDA · CiPA</span>
          <span className="mt-6 block text-2xl font-medium tracking-tight text-foreground md:text-3xl">Virtual heart cell</span>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Simulates how a drug changes a human heart cell, beat by beat, and measures 11 biomarkers from it.
          </p>
          <svg viewBox="0 0 220 70" className="mt-6 h-16 w-full max-w-[16rem] text-foreground/70" aria-hidden>
            <motion.path
              d="M4 60 H22 L26 8 C 50 12, 80 18, 96 44 S 108 60, 118 60 H130 L134 8 C 158 12, 188 18, 204 44 S 212 60, 216 60"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 2, ease: EASE, delay: 0.3 }}
            />
          </svg>
        </motion.div>

        {/* ---------- 11 biomarker mengalir di antara keduanya ---------- */}
        <div className="flex flex-row items-center justify-center gap-1.5 py-2 lg:w-40 lg:flex-col lg:py-0">
          {CHIPS.map((c, i) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.6 + i * 0.08 }}
              className="rounded-md bg-surface-white px-1.5 py-0.5 font-mono text-[10px] text-foreground ring-1 ring-foreground/10"
            >
              {c}
            </motion.span>
          ))}
          <span className="hidden pt-2 text-[10px] uppercase tracking-[0.16em] text-muted lg:block">11 biomarkers</span>
        </div>

        {/* ---------- model prediksi tim ---------- */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          className="group relative overflow-hidden rounded-sheet bg-foreground p-6 text-surface-white md:p-8"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-surface-white/50">Built by our team</span>
          <span className="mt-6 block text-2xl font-medium tracking-tight md:text-3xl">Prediction model</span>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-surface-white/70">
            A Random Forest of 400 decision trees reads the 11 biomarkers and predicts Low, Intermediate or High risk.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="grid grid-cols-10 gap-1" aria-hidden>
              {Array.from({ length: 30 }, (_, i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-surface-white/70"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.9 + i * 0.02 }}
                />
              ))}
            </div>
            <span className="text-surface-white/40">→</span>
            <div className="flex flex-col gap-1 text-[11px]">
              {[
                ['High', 'bg-accent'],
                ['Intermediate', 'bg-amber'],
                ['Low', 'bg-teal'],
              ].map(([t, c]) => (
                <span key={t} className="flex items-center gap-1.5 text-surface-white/80">
                  <span className={`h-1.5 w-1.5 rounded-full ${c}`} /> {t}
                </span>
              ))}
            </div>
          </div>
          {/* kilau halus saat hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-1/2 -top-1/2 h-full rotate-12 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
          />
        </motion.div>
      </div>
    </div>
  );
}
