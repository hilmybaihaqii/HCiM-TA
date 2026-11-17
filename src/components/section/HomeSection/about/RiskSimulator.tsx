'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from 'framer-motion';
import { accentSerif } from '@/lib/fonts';

const EASE = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const bump = (x: number, c: number, w: number) => Math.exp(-((x - c) ** 2) / (2 * w * w));

/* ============================================================
   EKG skematis (viewBox 1000 × 160).
   - Risiko naik → gelombang T makin jauh dari QRS (QT memanjang).
   - Risiko tinggi → separuh kanan berubah jadi Torsade de Pointes
     (gelombang cepat yang membesar-mengecil seperti pita terpilin).
   ============================================================ */
const W = 1000;
const BASE = 92;
const PERIOD = 160;

function ecgAt(x: number, risk: number) {
  const t = (x + 40) % PERIOD;
  const tCenter = 78 + 34 * risk;
  return (
    7 * bump(t, 20, 5) + // P
    -5 * bump(t, 38, 1.6) + // Q
    48 * bump(t, 43, 2) + // R
    -15 * bump(t, 48, 2) + // S
    (13 - 3 * risk) * bump(t, tCenter, 9 + 6 * risk) // T: makin jauh & lebar saat risiko naik
  );
}

function buildTrace(risk: number): string {
  const tdp = smooth(0.62, 0.95, risk); // seberapa jauh irama berubah jadi TdP
  let d = '';
  for (let x = 0; x <= W; x += 2) {
    let y = ecgAt(x, risk);
    if (tdp > 0) {
      const u = clamp((x - 470) / (W - 470));
      const onset = smooth(0.42, 0.5, x / W);
      const spindle = 0.35 + 0.65 * Math.abs(Math.sin(u * Math.PI * 1.6));
      const tor = Math.sin(((x - 470) / 30) * Math.PI * 2) * 44 * spindle;
      y = lerp(y, tor, tdp * onset);
    }
    d += `${x === 0 ? 'M' : ' L'} ${x} ${(BASE - y).toFixed(1)}`;
  }
  return d;
}

/* Nilai contoh untuk demo; model sebenarnya membaca 11 biomarker. */
type Drug = { name: string; qNet: number; apd: number; risk: number };
const DRUGS: Drug[] = [
  { name: 'Diltiazem', qNet: 92.3, apd: 257, risk: 0.12 },
  { name: 'Verapamil', qNet: 74.0, apd: 323, risk: 0.22 },
  { name: 'Chlorpromazine', qNet: 66.2, apd: 315, risk: 0.44 },
  { name: 'Cisapride', qNet: 60.4, apd: 332, risk: 0.52 },
  { name: 'Dofetilide', qNet: 50.9, apd: 379, risk: 0.8 },
  { name: 'Quinidine', qNet: 37.6, apd: 642, risk: 0.94 },
];

/* Pegas untuk latar tombol obat yang berpindah: cepat tapi tanpa memantul. */
const PILL = { type: 'spring', stiffness: 380, damping: 34, mass: 0.8 } as const;

const tierOf = (r: number) => (r < 0.34 ? 0 : r < 0.67 ? 1 : 2);

const TIERS = [
  {
    name: 'Low risk',
    dot: 'bg-teal',
    text: 'text-teal',
    meaning: 'Unlikely to upset the heart rhythm.',
    trace: 'Normal rhythm. Each beat recovers on time.',
  },
  {
    name: 'Intermediate risk',
    dot: 'bg-amber',
    text: 'text-amber',
    meaning: 'May upset the heart rhythm. Worth a closer look.',
    trace: 'Each beat takes longer to recover (a longer QT interval).',
  },
  {
    name: 'High risk',
    dot: 'bg-accent',
    text: 'text-accent',
    meaning: 'Likely to cause a dangerous rhythm.',
    trace: 'The rhythm breaks down into Torsade de Pointes.',
  },
];

export default function RiskSimulator() {
  const [risk, setRisk] = useState(0.22); // dipakai untuk aria & label slider
  const [tier, setTier] = useState(tierOf(0.22));
  const [activeDrug, setActiveDrug] = useState<string | null>('Verapamil');
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  // Satu sumber nilai: risiko 0–1. Semua visual mengikuti versi "spring"-nya supaya transisi halus.
  const riskMV = useMotionValue(0.22);
  const riskSpring = useSpring(riskMV, { stiffness: 120, damping: 22, mass: 0.6 });
  const pathD = useTransform(riskSpring, buildTrace);
  const markerLeft = useTransform(riskSpring, (r) => `${r * 100}%`);
  const sliderFill = useTransform(riskMV, (r) => `${r * 100}%`);

  const qNetMV = useMotionValue(74);
  const apdMV = useMotionValue(323);
  const qNetSpring = useSpring(qNetMV, { stiffness: 120, damping: 22 });
  const apdSpring = useSpring(apdMV, { stiffness: 120, damping: 22 });

  const qRef = useRef<HTMLSpanElement>(null);
  const apdRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(riskSpring, 'change', (v) => {
    const t = tierOf(v);
    setTier((prev) => (prev === t ? prev : t));
  });
  useMotionValueEvent(qNetSpring, 'change', (v) => {
    if (qRef.current) qRef.current.textContent = v.toFixed(1);
  });
  useMotionValueEvent(apdSpring, 'change', (v) => {
    if (apdRef.current) apdRef.current.textContent = Math.round(v).toString();
  });

  const set = (r: number, qNet: number, apd: number) => {
    riskMV.set(r);
    qNetMV.set(qNet);
    apdMV.set(apd);
    setRisk(r);
  };
  const applyDrug = (d: Drug) => {
    set(d.risk, d.qNet, d.apd);
    setActiveDrug(d.name);
  };
  const applyCustom = (r: number) => {
    r = clamp(r);
    set(r, lerp(95, 30, r), lerp(250, 660, r));
    setActiveDrug(null);
  };
  const setFromClientX = (x: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) applyCustom((x - rect.left) / rect.width);
  };

  const T = TIERS[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: EASE }}
      className="border-t border-foreground/10 pt-16 md:pt-24"
    >
      {/* ---------- judul ---------- */}
      <div className="mb-10 md:mb-14 max-w-2xl">
        <span className="mb-5 block text-xs font-medium uppercase tracking-[0.2em] text-muted">Try it yourself</span>
        <h3 className="mb-4 text-[clamp(2rem,4.2vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.03em] text-foreground">
          See how a drug changes <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>the heartbeat.</em>
        </h3>
        <p className="max-w-lg text-sm md:text-base text-muted leading-relaxed">
          Pick a drug and watch the heartbeat respond. This demo uses simplified example numbers. The real model reads all 11 measurements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        {/* ---------- kontrol ---------- */}
        <div className="lg:col-span-4 flex flex-col rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 md:p-7">
          <span className="mb-4 flex items-center gap-2 text-xs font-medium text-foreground">
            <span className="font-mono text-muted">01</span> Pick a drug
          </span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
            {DRUGS.map((d) => {
              const on = activeDrug === d.name;
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => applyDrug(d)}
                  onMouseEnter={() => setHovered(d.name)}
                  onMouseLeave={() => setHovered(null)}
                  aria-pressed={on}
                  className={`group relative isolate flex items-center justify-between gap-2 rounded-control px-3 py-2.5 text-left text-[13px] sm:text-sm transition-colors duration-500 ${
                    on ? 'text-surface-white' : 'text-foreground'
                  }`}
                >
                  {/* Latar hitam obat terpilih & sorotan hover "meluncur" dari tombol ke tombol. */}
                  {on && <motion.span layoutId="drug-active" transition={PILL} className="absolute inset-0 -z-10 rounded-control bg-foreground" />}
                  {!on && hovered === d.name && (
                    <motion.span layoutId="drug-hover" transition={PILL} className="absolute inset-0 -z-10 rounded-control bg-foreground/[0.06]" />
                  )}
                  <span className="truncate transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">{d.name}</span>
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-[opacity,transform] duration-500 ${TIERS[tierOf(d.risk)].dot} ${
                      on ? 'scale-100 opacity-100' : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-70'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="my-6 h-px bg-foreground/10" />

          <span className="mb-1 flex items-center gap-2 text-xs font-medium text-foreground">
            <span className="font-mono text-muted">02</span> Or adjust it yourself
          </span>
          <p className="mb-4 text-xs text-muted leading-snug">How strongly the drug slows the heart cell down.</p>
          <div
            ref={trackRef}
            role="slider"
            aria-label="How strongly the drug slows the heart cell"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(risk * 100)}
            aria-valuetext={T.name}
            tabIndex={0}
            onPointerDown={(e) => {
              setDragging(true);
              e.currentTarget.setPointerCapture(e.pointerId);
              setFromClientX(e.clientX);
            }}
            onPointerMove={(e) => dragging && setFromClientX(e.clientX)}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') applyCustom(riskMV.get() + 0.05);
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') applyCustom(riskMV.get() - 0.05);
            }}
            className="relative flex h-9 cursor-pointer touch-none select-none items-center outline-none rounded-full focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            <div className="absolute inset-x-0 h-1 rounded-full bg-foreground/10" />
            <motion.div className="absolute left-0 h-1 rounded-full bg-foreground" style={{ width: sliderFill }} />
            <motion.div
              className="absolute -ml-2.5 h-5 w-5 rounded-full border-2 border-surface-white bg-foreground shadow-md"
              style={{ left: sliderFill }}
              animate={{ scale: dragging ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted">
            <span>Mildly</span>
            <span>Strongly</span>
          </div>
        </div>

        {/* ---------- hasil ---------- */}
        <div className="lg:col-span-8 flex flex-col rounded-sheet border border-foreground/10 bg-surface-white/60 p-5 md:p-7">
          {/* tier + artinya */}
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-h-[4.5rem]">
              <span className="mb-2 block text-xs font-medium text-muted">
                Predicted result{activeDrug ? ` for ${activeDrug}` : ''}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tier}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="flex items-center gap-2.5 text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${T.dot}`} />
                    {T.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{T.meaning}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* EKG di atas kertas grid tipis */}
          <div
            className="relative overflow-hidden rounded-card border border-foreground/[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(43,34,35,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(43,34,35,0.045) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <svg viewBox={`0 0 ${W} 160`} className={`block h-36 md:h-44 w-full transition-colors duration-700 ${T.text}`} preserveAspectRatio="none" aria-hidden>
              <motion.path
                d={pathD}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1.8, ease: EASE }}
              />
            </svg>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={tier}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 text-xs text-muted"
            >
              {T.trace}
            </motion.p>
          </AnimatePresence>

          {/* skala risiko */}
          <div className="mt-7">
            <div className="relative">
              <div className="flex h-1.5 gap-1">
                <span className="flex-[34] rounded-full bg-teal/70" />
                <span className="flex-[33] rounded-full bg-amber/70" />
                <span className="flex-[33] rounded-full bg-accent/70" />
              </div>
              <motion.span
                aria-hidden
                className="absolute top-1/2 -ml-2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-surface-white bg-foreground shadow"
                style={{ left: markerLeft }}
              />
            </div>
            <div className="mt-2.5 grid grid-cols-3 text-[11px] text-muted">
              {TIERS.map((t, i) => (
                <span
                  key={t.name}
                  className={`transition-colors duration-300 ${i === 1 ? 'text-center' : i === 2 ? 'text-right' : ''} ${
                    tier === i ? 'font-medium text-foreground' : ''
                  }`}
                >
                  {t.name.replace(' risk', '')}
                </span>
              ))}
            </div>
          </div>

          {/* dua angka contoh */}
          <div className="mt-7 grid grid-cols-2 gap-4 border-t border-foreground/10 pt-5">
            <div>
              <span className="block text-xs text-muted">
                Charge per beat <span className="opacity-70">· qNet</span>
              </span>
              <span ref={qRef} className="mt-1 block text-2xl md:text-3xl font-light tabular-nums tracking-tight text-foreground">
                74.0
              </span>
              <span className="mt-1 block text-[11px] text-muted leading-snug">Higher is usually safer.</span>
            </div>
            <div>
              <span className="block text-xs text-muted">
                Recovery time <span className="opacity-70">· APD90</span>
              </span>
              <span className="mt-1 block text-2xl md:text-3xl font-light tabular-nums tracking-tight text-foreground">
                <span ref={apdRef}>323</span>
                <span className="ml-1 text-sm text-muted">ms</span>
              </span>
              <span className="mt-1 block text-[11px] text-muted leading-snug">Longer is usually riskier.</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
