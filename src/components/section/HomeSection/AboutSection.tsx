'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useInView,
  animate,
} from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ============================================================
   ECG trace — borderless, drawn on scroll
   ============================================================ */
const BASELINE = 80;
function buildTrace(risk: number): string {
  let d = `M 0 ${BASELINE}`;
  const beat = (sx: number): number[][] => [
    [sx + 14, BASELINE], [sx + 24, BASELINE - 10], [sx + 34, BASELINE],
    [sx + 46, BASELINE], [sx + 50, BASELINE + 8], [sx + 56, BASELINE - 46],
    [sx + 62, BASELINE + 26], [sx + 68, BASELINE], [sx + 82, BASELINE - 14],
    [sx + 96, BASELINE], [sx + 130, BASELINE],
  ];
  for (let b = 0; b < 3; b++) for (const [x, y] of beat(b * 130)) d += ` L ${x} ${y}`;
  const start = 430, end = 1000, steps = 100;
  d += ` L ${start} ${BASELINE}`;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const idle = Math.sin(t * Math.PI * 22) * 2.5;
    const env = Math.sin(Math.PI * t);
    const tor = Math.sin(t * Math.PI * (12 + 3 * risk)) * 50 * env;
    d += ` L ${(start + (end - start) * t).toFixed(1)} ${(BASELINE - (idle * (1 - risk) + tor * risk)).toFixed(1)}`;
  }
  return d;
}

const BIOMARKERS = ['qNet', 'dV/dt Max', 'V Max', 'V Rest', 'APD50', 'APD90', 'Max dV', 'Ca Max', 'Ca Rest', 'CaTD50', 'CaTD90'];

type Drug = { name: string; qNet: number; apd: number; risk: number };
const DRUGS: Drug[] = [
  { name: 'Diltiazem',      qNet: 92.3, apd: 257, risk: 0.12 },
  { name: 'Verapamil',      qNet: 74.0, apd: 323, risk: 0.22 },
  { name: 'Chlorpromazine', qNet: 66.2, apd: 315, risk: 0.44 },
  { name: 'Cisapride',      qNet: 60.4, apd: 332, risk: 0.52 },
  { name: 'Dofetilide',     qNet: 50.9, apd: 379, risk: 0.80 },
  { name: 'Quinidine',      qNet: 37.6, apd: 642, risk: 0.94 },
];
const TIER_NAME = ['Low Risk', 'Intermediate', 'High Risk'];

/* ============================================================
   Kinetic headline — words rise into place, line by line
   ============================================================ */
function KineticHeadline({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <motion.h2
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{ show: { transition: { staggerChildren: 0.055 } } }}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.28em]">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%' }, show: { y: '0%' } }}
            transition={{ duration: 0.9, ease: luxEase }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  /* --- interactive instrument state --- */
  const [tier, setTier] = useState(0);
  const [activeDrug, setActiveDrug] = useState<string | null>('Verapamil');
  const [dragging, setDragging] = useState(false);

  const riskMV = useMotionValue(0.22);
  const riskSpring = useSpring(riskMV, { stiffness: 170, damping: 22, mass: 0.5 });
  const pathD = useTransform(riskSpring, (r) => buildTrace(r));
  const fillPct = useTransform(riskSpring, (r) => `${(r * 100).toFixed(1)}%`);
  const thumbMV = useMotionValue(0.22);
  const thumbPct = useTransform(thumbMV, (v) => `${v * 100}%`);

  const qNetMV = useMotionValue(74);
  const apdMV = useMotionValue(323);
  const qNetSpring = useSpring(qNetMV, { stiffness: 140, damping: 20 });
  const apdSpring = useSpring(apdMV, { stiffness: 140, damping: 20 });

  const qRef = useRef<HTMLSpanElement>(null);
  const apdRef = useRef<HTMLSpanElement>(null);
  const tierRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<HTMLDivElement>(null);
  const inView = useInView(simRef, { once: true, amount: 0.5 });

  useMotionValueEvent(riskSpring, 'change', (v) => {
    const t = v < 0.34 ? 0 : v < 0.67 ? 1 : 2;
    if (t !== tierRef.current) { tierRef.current = t; setTier(t); }
  });
  useMotionValueEvent(qNetSpring, 'change', (v) => { if (qRef.current) qRef.current.textContent = v.toFixed(1); });
  useMotionValueEvent(apdSpring, 'change', (v) => { if (apdRef.current) apdRef.current.textContent = Math.round(v).toString(); });

  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => {
      setActiveDrug(null);
      animate(0.22, [0.22, 0.94, 0.22], {
        duration: 3.6, times: [0, 0.5, 1], ease: luxEase,
        onUpdate: (v) => {
          riskMV.set(v); thumbMV.set(v);
          qNetMV.set(lerp(92, 8, v)); apdMV.set(lerp(258, 760, v));
        },
      });
    }, 2200);
    return () => clearTimeout(id);
  }, [inView, riskMV, thumbMV, qNetMV, apdMV]);

  const applyDrug = (d: Drug) => {
    riskMV.set(d.risk); thumbMV.set(d.risk); qNetMV.set(d.qNet); apdMV.set(d.apd);
    setActiveDrug(d.name);
  };
  const applyRisk = (r: number) => {
    r = clamp(r);
    riskMV.set(r); thumbMV.set(r); qNetMV.set(lerp(92, 8, r)); apdMV.set(lerp(258, 760, r));
    if (activeDrug !== null) setActiveDrug(null);
  };
  const setFromClientX = (x: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) applyRisk((x - rect.left) / rect.width);
  };

  const isHigh = tier === 2;
  const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 } };

  return (
    <section id="about" ref={sectionRef} className="relative w-full py-24 md:py-40 bg-background font-sans overflow-hidden">

      {/* film-grain texture — the single touch that reads as "expensive" */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* --- EYEBROW with draw-in rule --- */}
        <motion.div {...reveal} transition={{ duration: 0.7, ease: luxEase }} className="flex items-center gap-4 mb-10 md:mb-24">
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-muted">01 — Platform Overview</span>
          <motion.span
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
            transition={{ duration: 1, ease: luxEase, delay: 0.15 }}
            className="h-px flex-1 bg-foreground/15 origin-left"
          />
        </motion.div>

        {/* --- KINETIC HEADLINE --- */}
        <div className="max-w-4xl mb-8 md:mb-10">
          <KineticHeadline
            text="Predicting drug toxicity with machine learning."
            className="text-[10.5vw] sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.03] text-foreground"
          />
        </div>
        <motion.p {...reveal} transition={{ duration: 0.9, delay: 0.2, ease: luxEase }} className="max-w-xl text-sm md:text-base text-muted leading-relaxed mb-16 md:mb-32">
          You give Cardiotox a drug. It hands back a simple risk rating for the heart — worked out from a computer
          simulation of a real heart cell, and tested only on drugs it has never seen before.
        </motion.p>

        {/* --- BIOMARKER MARQUEE (input, made tangible) --- */}
        <motion.div {...reveal} transition={{ duration: 0.8, ease: luxEase }} className="mb-16 md:mb-36">
          <span className="block text-[9px] font-mono uppercase tracking-[0.25em] text-muted mb-5">Eleven biomarkers read per compound</span>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="flex w-max marquee-track">
              {[...BIOMARKERS, ...BIOMARKERS].map((b, i) => (
                <span key={i} className="flex items-center gap-6 md:gap-10 px-3 md:px-5 shrink-0">
                  <span className="text-2xl md:text-4xl font-medium tracking-tight text-foreground/90 whitespace-nowrap">{b}</span>
                  <span className="w-1 h-1 rounded-full bg-accent/60 shrink-0" />
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- EDITORIAL NOTES: Input / Model / Output, thread-connected --- */}
        <div className="relative grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-10 mb-16 md:mb-40">
          {/* growing thread */}
          <motion.div
            initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.4, ease: luxEase }}
            className="hidden md:block absolute left-0 top-2 bottom-2 w-px bg-foreground/10 origin-top"
          />
          {[
            { n: '01', t: 'Input', body: 'We measure eleven signals from a simulated heartbeat — things like electrical activity and calcium flow inside the cell.' },
            { n: '02', t: 'Model', body: "Those eleven numbers feed into our prediction model — trained on one set of drugs, then tested on a completely different set it had never seen." },
            { n: '03', t: 'Output', body: 'The result: a simple Low, Intermediate, or High risk rating for a dangerous heart rhythm — all before the drug ever touches a real cell.' },
          ].map((note, i) => (
            <motion.div
              key={note.n}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: luxEase }}
              className="md:col-span-4 md:pl-10 relative"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-[10px] font-mono text-accent">{note.n}</span>
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-foreground font-medium">{note.t}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{note.body}</p>
            </motion.div>
          ))}
        </div>

        {/* --- BORDERLESS SIGNAL --- */}
        <motion.div {...reveal} transition={{ duration: 0.9, ease: luxEase }} className="mb-16 md:mb-36">
          <div className={`relative w-full transition-colors duration-700 ${isHigh ? 'text-accent' : 'text-foreground/70'}`}>
            <svg viewBox="0 0 1000 140" className="w-full h-auto" preserveAspectRatio="none">
              <line x1="0" y1={BASELINE} x2="1000" y2={BASELINE} stroke="rgba(43,34,35,0.06)" strokeWidth="1" />
              <motion.path
                d={pathD} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, amount: 0.5 }}
                transition={{ pathLength: { duration: 2.2, ease: luxEase }, opacity: { duration: 0.3 } }}
              />
            </svg>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">Normal Sinus</span>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">QT Prolongation</span>
            <span className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors duration-500 ${isHigh ? 'text-accent font-medium' : 'text-muted'}`}>Torsade de Pointes</span>
          </div>
        </motion.div>

        {/* --- THE INSTRUMENT (restyled: no boxes, editorial numerals) --- */}
        <motion.div ref={simRef} {...reveal} transition={{ duration: 0.9, ease: luxEase }} className="border-t border-b border-foreground/10 py-10 md:py-16 mb-16 md:mb-32">
          <div className="flex items-center justify-between mb-8 md:mb-14">
            <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted">Try it yourself</span>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isHigh ? 'bg-accent' : 'bg-foreground/50'}`} />
              <span className={`text-[10px] font-mono uppercase tracking-[0.2em] transition-colors duration-500 ${isHigh ? 'text-accent' : 'text-foreground'}`}>{TIER_NAME[tier]}</span>
            </div>
          </div>

          <div className="mb-8 md:mb-10 max-w-xl">
            <p className="text-sm md:text-base text-foreground font-medium leading-relaxed">
              Here are 2 of the 11 signals, live.
            </p>
            <p className="text-xs md:text-sm text-muted leading-relaxed mt-1.5">
              To keep things simple, this demo only shows two signals. Behind the scenes, the real system always
              checks all eleven before making a decision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* clear, labeled readout — plain-language first, technical term second */}
            <div className="lg:col-span-5">
              <div className="divide-y divide-foreground/10 border-t border-b border-foreground/10">
                {[
                  {
                    label: 'Electrical Charge',
                    tag: 'qNet',
                    valueRef: qRef,
                    unit: '',
                    meaning: 'How much electrical charge moves through the heart cell each beat. More charge usually means the drug is safer.',
                  },
                  {
                    label: 'Recovery Time',
                    tag: 'APD₉₀',
                    valueRef: apdRef,
                    unit: 'ms',
                    meaning: 'How long the heart cell takes to reset after beating. A slower reset can mean higher risk.',
                  },
                ].map((row) => (
                  <div key={row.label} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4">
                    <div className="min-w-0 sm:max-w-57.5]">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs md:text-sm font-medium text-foreground">{row.label}</span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-muted">({row.tag})</span>
                      </div>
                      <p className="text-xs text-muted leading-snug">{row.meaning}</p>
                    </div>
                    <div className="text-2xl md:text-3xl font-light tracking-tight tabular-nums text-foreground shrink-0">
                      <span ref={row.valueRef}>{row.label === 'Electrical Charge' ? '74.0' : '323'}</span>
                      {row.unit && <span className="text-sm text-muted ml-1">{row.unit}</span>}
                    </div>
                  </div>
                ))}
                <div className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-4">
                  <div className="min-w-0 sm:max-w-57.5]">
                    <div className="text-xs md:text-sm font-medium text-foreground mb-1">Our Guess</div>
                    <p className="text-xs text-muted leading-snug">Based on the numbers above (plus 9 more signals working quietly in the background).</p>
                  </div>
                  <div className={`text-lg md:text-xl font-medium tracking-tight shrink-0 transition-colors duration-500 ${isHigh ? 'text-accent' : 'text-foreground'}`}>
                    {TIER_NAME[tier]}
                  </div>
                </div>
              </div>
            </div>

            {/* controls */}
            <div className="lg:col-span-7">
              <div className="mb-8">
                <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-muted mb-3">Try a real drug</span>
                <div className="flex flex-wrap gap-x-1 gap-y-2 text-sm">
                  {DRUGS.map((d, i) => {
                    const on = activeDrug === d.name;
                    return (
                      <React.Fragment key={d.name}>
                        <button
                          onClick={() => applyDrug(d)}
                          className={`relative pb-0.5 font-medium tracking-tight transition-colors duration-300 ${on ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
                        >
                          {d.name}
                          <span className={`absolute left-0 -bottom-0.5 h-px bg-accent transition-all duration-300 ${on ? 'w-full' : 'w-0'}`} />
                        </button>
                        {i < DRUGS.length - 1 && <span className="text-muted/40 px-1.5">·</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">Or set recovery time yourself</span>
                </div>
                <div
                  ref={trackRef} role="slider" aria-label="APD90 repolarization" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} tabIndex={0}
                  onPointerDown={(e) => { setDragging(true); (e.target as HTMLElement).setPointerCapture(e.pointerId); setFromClientX(e.clientX); }}
                  onPointerMove={(e) => dragging && setFromClientX(e.clientX)}
                  onPointerUp={() => setDragging(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') applyRisk((riskMV.get() * 100 + 4) / 100);
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') applyRisk((riskMV.get() * 100 - 4) / 100);
                  }}
                  className="relative h-8 flex items-center cursor-pointer touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-full"
                >
                  <div className="absolute left-0 right-0 h-px bg-foreground/15" />
                  <motion.div className="absolute left-0 h-px bg-accent" style={{ width: fillPct }} />
                  <motion.div
                    className="absolute w-3.5 h-3.5 rounded-full bg-foreground -ml-1.75"
                    style={{ left: thumbPct }} animate={{ scale: dragging ? 1.3 : 1 }} transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="block mt-3 text-[9px] font-mono uppercase tracking-[0.15em] text-muted/70">↔ Drag to see how risk changes</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- CLIFFHANGER --- */}
        <motion.div {...reveal} transition={{ duration: 1, ease: luxEase }} className="flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-sm md:text-base text-muted max-w-md text-center md:text-left leading-relaxed">
            Every breakthrough begins with a flaw in the system it replaces.{' '}
            <span className="text-foreground font-medium">So why did we build this?</span>
          </p>
          <a href="#problem" className="group relative overflow-hidden inline-flex items-center gap-3 rounded-full border border-foreground/15 px-7 py-3.5 shrink-0">
            <span className="absolute inset-0 bg-foreground translate-y-[101%] group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 text-[11px] font-mono uppercase tracking-[0.15em] text-foreground group-hover:text-surface-white transition-colors duration-500 whitespace-nowrap">Explore the Paradox</span>
            <svg className="relative z-10 w-4 h-4 text-foreground group-hover:text-surface-white transition-all duration-500 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </motion.div>

      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee 32s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}