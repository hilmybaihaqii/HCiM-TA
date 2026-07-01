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

/* =========================================================
   INTERACTIVE CARDIAC-RISK SIMULATOR (Dashboard UI)
   ========================================================= */
const BASELINE = 80;
const luxEase = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function buildTrace(risk: number): string {
  let d = `M 0 ${BASELINE}`;
  const beat = (sx: number): number[][] => [
    [sx + 14, BASELINE], [sx + 24, BASELINE - 10], [sx + 34, BASELINE],
    [sx + 46, BASELINE], [sx + 50, BASELINE + 8], [sx + 56, BASELINE - 46],
    [sx + 62, BASELINE + 26], [sx + 68, BASELINE], [sx + 82, BASELINE - 14],
    [sx + 96, BASELINE], [sx + 130, BASELINE],
  ];
  for (let b = 0; b < 3; b++) for (const [x, y] of beat(b * 130)) d += ` L ${x} ${y}`;

  const start = 430, end = 1000, steps = 256;
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

type Drug = { name: string; tier: 0 | 1 | 2; qNet: number; apd: number; risk: number };
const DRUGS: Drug[] = [
  { name: 'Diltiazem',      tier: 0, qNet: 92.3, apd: 257, risk: 0.12 },
  { name: 'Verapamil',      tier: 0, qNet: 74.0, apd: 323, risk: 0.22 },
  { name: 'Chlorpromazine', tier: 1, qNet: 66.2, apd: 315, risk: 0.44 },
  { name: 'Cisapride',      tier: 1, qNet: 60.4, apd: 332, risk: 0.52 },
  { name: 'Dofetilide',     tier: 2, qNet: 50.9, apd: 379, risk: 0.80 },
  { name: 'Quinidine',      tier: 2, qNet: 37.6, apd: 642, risk: 0.94 },
];
const TIER_NAME = ['Low Risk', 'Intermediate', 'High Risk'];

export default function AboutSection() {
  const [tier, setTier] = useState(0);
  const [activeDrug, setActiveDrug] = useState<string | null>('Verapamil');
  const [dragging, setDragging] = useState(false);

  // Motion values dengan spring yang lebih responsif (anti-lag)
  const riskMV = useMotionValue(0.22);
  const riskSpring = useSpring(riskMV, { stiffness: 200, damping: 25, mass: 0.5 });
  const pathD = useTransform(riskSpring, (r) => buildTrace(r));
  const strokeW = useTransform(riskSpring, [0, 1], [2.3, 3.2]);
  const fillPct = useTransform(riskSpring, (r) => `${(r * 100).toFixed(1)}%`);
  
  const thumbMV = useMotionValue(0.22);
  const thumbPct = useTransform(thumbMV, (v) => `${v * 100}%`);

  const qNetMV = useMotionValue(74);
  const apdMV = useMotionValue(323);
  const qNetSpring = useSpring(qNetMV, { stiffness: 150, damping: 20 });
  const apdSpring = useSpring(apdMV, { stiffness: 150, damping: 20 });

  const qRef = useRef<HTMLSpanElement>(null);
  const apdCellRef = useRef<HTMLSpanElement>(null);
  const apdSlideRef = useRef<HTMLSpanElement>(null);
  const tierRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<HTMLDivElement>(null);

  const inView = useInView(simRef, { once: true, amount: 0.4 });

  useMotionValueEvent(riskSpring, 'change', (v) => {
    const t = v < 0.34 ? 0 : v < 0.67 ? 1 : 2;
    if (t !== tierRef.current) { tierRef.current = t; setTier(t); }
  });
  useMotionValueEvent(qNetSpring, 'change', (v) => { if (qRef.current) qRef.current.textContent = v.toFixed(1); });
  useMotionValueEvent(apdSpring, 'change', (v) => {
    const s = Math.round(v).toString();
    if (apdCellRef.current) apdCellRef.current.textContent = s;
    if (apdSlideRef.current) apdSlideRef.current.textContent = s;
  });

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
    }, 2000);
    return () => clearTimeout(id);
  }, [inView, riskMV, thumbMV, qNetMV, apdMV]);

  const applyDrug = (d: Drug) => {
    riskMV.set(d.risk); thumbMV.set(d.risk); qNetMV.set(d.qNet); apdMV.set(d.apd);
    setActiveDrug(d.name);
  };
  
  const applyRisk = (r: number) => {
    r = clamp(r); 
    // State React (setAriaValue) dihapus dari fungsi ini untuk mencegah re-render konstan (lag)
    riskMV.set(r); thumbMV.set(r); qNetMV.set(lerp(92, 8, r)); apdMV.set(lerp(258, 760, r));
    if (activeDrug !== null) setActiveDrug(null);
  };
  
  const setFromClientX = (x: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) applyRisk((x - rect.left) / rect.width);
  };

  const isHigh = tier === 2;

  return (
    <section id="about" className="relative w-full py-20 md:py-32 bg-background font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-12 relative z-10">

        {/* --- 1. HEADLINE NARRATIVE --- */}
        <div className="flex items-center gap-3 mb-10 md:mb-16">
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-muted font-medium">01 — Platform Overview</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-16 items-end mb-10 md:mb-16">
          <div className="lg:col-span-7">
            <h2 className="text-3xl md:text-5xl lg:text-[56px] font-medium tracking-tight text-foreground leading-[1.05]">
              Translating cell simulations <br className="hidden lg:block" />
              into toxicity predictions<span className="text-accent">.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm md:text-base text-muted leading-relaxed">
              Instead of relying on costly in-vivo animal testing, we trained a <strong className="text-foreground font-medium">Stacking Ensemble Machine Learning</strong> model using datasets generated purely from the <strong className="text-foreground font-medium">O&apos;Hara-Rudy in-silico model</strong>. By evaluating 11 critical cellular biomarkers, the system precisely classifies the risk of Torsade de Pointes (TdP) for any given compound.
            </p>
          </div>

          <div className="lg:col-span-5 lg:pb-1">
            {[
              { label: 'Data Source', value: "O'Hara-Rudy Output" },
              { label: 'Model Engine', value: 'Stacking Ensemble ML' },
              { label: 'Target', value: 'Torsade de Pointes Risk' },
            ].map((row, i) => (
              <div key={row.label} className={`flex items-baseline justify-between gap-6 py-3.5 md:py-4 ${i === 0 ? 'border-y' : 'border-b'} border-foreground/10`}>
                <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.15em] text-muted whitespace-nowrap">{row.label}</span>
                <span className="text-xs md:text-sm font-medium text-foreground text-right tracking-tight">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- 2. BENTO BOX / DASHBOARD SIMULATOR --- */}
        <div
          ref={simRef}
          className={`relative w-full rounded-3xl md:rounded-4xl border overflow-hidden flex flex-col lg:flex-row transition-all duration-700 bg-surface-white ${
            isHigh ? 'border-accent/30 shadow-[0_10px_50px_rgba(186,59,70,0.06)]' : 'border-foreground/10 shadow-[0_10px_40px_rgba(0,0,0,0.03)]'
          }`}
        >
          
          {/* PANEL KIRI: VISUALISASI DISPLAY */}
          <div className="w-full lg:w-[65%] flex flex-col justify-between">
            
            {/* Header Display */}
            <div className="px-5 py-5 md:px-8 md:py-6 flex items-center justify-between border-b border-foreground/5">
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-foreground font-bold">TdP Electrophysicology Trace</span>
              </div>
              
              <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-500 ${isHigh ? 'bg-accent/10 border-accent/25' : 'bg-surface-white border-foreground/10'}`}>
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${tier === 2 ? 'bg-accent' : tier === 1 ? 'bg-foreground' : 'bg-foreground/40'}`} />
                <span className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors duration-500 ${isHigh ? 'text-accent font-bold' : 'text-foreground'}`}>{TIER_NAME[tier]}</span>
              </div>
            </div>

            {/* SVG Grafik */}
            <div className="px-5 py-6 md:px-8 md:py-8 relative">
              <div className={`relative z-10 w-full transition-colors duration-700 ${isHigh ? 'text-accent' : 'text-foreground'}`}>
                <svg viewBox="0 0 1000 160" className="w-full h-auto max-h-25 md:max-h-35" preserveAspectRatio="none">
                  <line x1="0" y1={BASELINE} x2="1000" y2={BASELINE} stroke="var(--color-muted)" strokeWidth="0.5" strokeDasharray="4 4" />
                  <motion.path 
                    d={pathD} 
                    fill="none" 
                    stroke="currentColor" 
                    style={{ strokeWidth: strokeW }} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    initial={{ pathLength: 0 }} 
                    whileInView={{ pathLength: 1 }} 
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 2.5, ease: luxEase }}
                  />
                </svg>
              </div>

              {/* Anotasi Sumbu */}
              <div className="relative z-10 flex items-start justify-between mt-4 md:mt-6">
                {[{ t: 'Normal Sinus', danger: false }, { t: 'QT Prolongation', danger: false }, { t: 'Torsade de Pointes', danger: true }].map((a, i) => {
                  const hot = a.danger && isHigh;
                  return (
                    <div key={a.t} className={`flex flex-col gap-1.5 ${i === 1 ? 'items-center text-center' : i === 2 ? 'items-end text-right' : 'items-start'}`}>
                      <div className={`w-px h-2 transition-colors duration-500 ${hot ? 'bg-accent' : 'bg-foreground/20'}`} />
                      <span className={`text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] transition-colors duration-500 ${hot ? 'text-accent font-bold' : 'text-muted'}`}>{a.t}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Readout 3 Kolom */}
            <div className="grid grid-cols-3 border-t border-foreground/5 bg-foreground/1">
              <div className="px-4 py-4 md:px-6 md:py-5 border-r border-foreground/5 flex flex-col justify-between">
                <div className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] text-muted mb-2">QNet</div>
                <div className="text-xl md:text-3xl font-light tracking-tight tabular-nums text-foreground"><span ref={qRef}>74.0</span></div>
                <div className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.2em] text-muted mt-2">1 of 11</div>
              </div>
              
              <div className="px-4 py-4 md:px-6 md:py-5 border-r border-foreground/5 flex flex-col justify-between">
                <div className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] text-muted mb-2">APD₉₀</div>
                <div className="text-xl md:text-3xl font-light tracking-tight tabular-nums text-foreground"><span ref={apdCellRef}>323</span> <span className="text-xs md:text-sm text-muted">ms</span></div>
                <div className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.2em] text-muted mt-2">+ 9 more</div>
              </div>

              <div className={`px-4 py-4 md:px-6 md:py-5 flex flex-col justify-between transition-colors duration-500 ${isHigh ? 'bg-accent/10' : ''}`}>
                <div className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] text-muted mb-2">Risk tier</div>
                <div className={`text-xl md:text-3xl font-medium tracking-tight transition-colors duration-500 ${isHigh ? 'text-accent' : 'text-foreground'} truncate`}>
                  {TIER_NAME[tier]}
                </div>
                <div className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.2em] text-muted mt-2 truncate">
                  {activeDrug ?? 'Custom input'}
                </div>
              </div>
            </div>
          </div>

          {/* PANEL KANAN: CONTROL CENTER */}
          <div className="w-full lg:w-[35%] flex flex-col border-t lg:border-t-0 lg:border-l border-foreground/5 bg-foreground/2">
            
            <div className="px-5 py-4 md:px-8 md:py-6 border-b border-foreground/5">
              <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-foreground font-bold">Parameters</span>
            </div>

            <div className="p-5 md:p-8 flex-1 flex flex-col justify-center">
              
              {/* Load Compound */}
              <div className="mb-8">
                <span className="block text-[8px] md:text-[9px] font-mono uppercase tracking-[0.18em] text-muted mb-3">Load reference compound</span>
                <div className="flex lg:flex-wrap gap-2 overflow-x-auto pb-2 lg:pb-0 snap-x scrollbar-none">
                  {DRUGS.map((d) => {
                    const on = activeDrug === d.name;
                    return (
                      <button 
                        key={d.name}
                        onClick={() => applyDrug(d)}
                        className={`snap-start shrink-0 relative rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-[11px] font-medium tracking-tight transition-colors duration-300 border ${
                          on 
                            ? 'bg-foreground border-foreground text-surface-white' 
                            : 'bg-surface-white border-foreground/15 text-foreground hover:border-foreground/40'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Repolarization */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.18em] text-muted">Manual Repolarization</span>
                  <span className="text-[10px] md:text-[11px] font-mono text-foreground font-medium tabular-nums"><span ref={apdSlideRef}>323</span> ms</span>
                </div>
                
                <div ref={trackRef} role="slider" aria-label="APD90 repolarization" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}
                  tabIndex={0}
                  onPointerDown={(e) => { setDragging(true); (e.target as HTMLElement).setPointerCapture(e.pointerId); setFromClientX(e.clientX); }}
                  onPointerMove={(e) => dragging && setFromClientX(e.clientX)}
                  onPointerUp={() => setDragging(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') applyRisk((riskMV.get() * 100 + 4) / 100);
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') applyRisk((riskMV.get() * 100 - 4) / 100);
                  }}
                  className="relative h-8 md:h-10 flex items-center cursor-pointer touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/40 group">
                  
                  <div className="absolute left-0 right-0 h-0.75 rounded-full bg-foreground/10" />
                  
                  <div className="absolute h-3 w-0.5 bg-foreground/20" style={{ left: '34%' }} />
                  <div className="absolute h-3 w-0.5 bg-foreground/20" style={{ left: '67%' }} />
                  
                  <motion.div className="absolute left-0 h-0.75 rounded-full bg-accent" style={{ width: fillPct }} />
                  
                  <motion.div className="absolute w-3 h-5 md:w-3.5 md:h-6 rounded-full bg-black shadow-md -ml-1.5 md:-ml-1.75 cursor-grab active:cursor-grabbing"
                    style={{ left: thumbPct }} animate={{ scale: dragging ? 1.1 : 1 }} transition={{ duration: 0.2 }} />
                </div>
                
                <span className="block mt-4 text-[7px] md:text-[8px] font-mono uppercase tracking-[0.2em] text-muted">
                  ↔ Drag to simulate repolarization
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. THE CLIFFHANGER --- */}
        <div className="mt-20 md:mt-28 pt-10 border-t border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <p className="text-xs md:text-sm text-muted max-w-sm text-center md:text-left leading-relaxed">
            Every breakthrough begins with a flaw in the system it replaces.{' '}
            <span className="text-foreground font-medium">Why did we build this?</span>
          </p>
          <a href="#problem" className="group relative overflow-hidden inline-flex items-center gap-3 rounded-full border border-foreground/20 px-6 py-3 shrink-0 hover:border-foreground transition-colors duration-300">
            <span className="absolute inset-0 bg-foreground translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 text-[10px] font-mono uppercase tracking-[0.15em] text-foreground group-hover:text-surface-white transition-colors duration-500 whitespace-nowrap">Explore the Paradox</span>
            <svg className="relative z-10 w-3 h-3 text-foreground group-hover:text-surface-white transition-all duration-500 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}