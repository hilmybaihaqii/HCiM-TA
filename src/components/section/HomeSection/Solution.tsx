'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   TEXT REVEAL COMPONENT
   ========================================================= */
const RevealText = ({ children }: { children: string }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 85%', 'end 50%'] });
  const words = children.split(' ');

  return (
    <p ref={containerRef} className="flex flex-wrap text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-medium tracking-tight text-foreground leading-[1.3] md:leading-tight">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

const Word = ({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [8, 0]);

  return (
    <span className="mr-[1.2vw] md:mr-3 mb-1 md:mb-3 relative inline-block">
      <span className="absolute opacity-0">{children}</span>
      <motion.span style={{ opacity, y }} className="inline-block text-foreground">
        {children}
      </motion.span>
    </span>
  );
};

/* =========================================================
   DATA — biomarkers
   ========================================================= */
type BiomarkerKey =
  | 'qNet' | 'APD90' | 'APD50' | 'dvdtmax' | 'vmax' | 'vrest' | 'max_dv'
  | 'camax' | 'carest' | 'CaTD50' | 'CaTD90';

const BIOMARKERS: Record<BiomarkerKey, { full: string; group: 'Voltage' | 'Calcium'; desc: string }> = {
  qNet: { full: 'Net Charge', group: 'Voltage', desc: 'Total charge carried by depolarizing minus repolarizing currents across one beat — the single strongest predictor of drug-induced TdP risk.' },
  APD90: { full: 'Action Potential Duration, 90%', group: 'Voltage', desc: 'How long the cell stays depolarized before repolarizing almost fully. Prolongation is the classic sign of lost repolarization reserve.' },
  APD50: { full: 'Action Potential Duration, 50%', group: 'Voltage', desc: 'Duration to the midpoint of repolarization — sensitive to shifts in the balance between inward and outward currents.' },
  dvdtmax: { full: 'Max Upstroke Velocity', group: 'Voltage', desc: 'The fastest rate of voltage rise during depolarization, reflecting sodium channel availability and conduction speed.' },
  vmax: { full: 'Peak Voltage', group: 'Voltage', desc: 'The highest membrane voltage reached during the action potential upstroke.' },
  vrest: { full: 'Resting Potential', group: 'Voltage', desc: 'The baseline voltage the cell returns to between beats. A shifted baseline can signal ion channel dysfunction.' },
  max_dv: { full: 'Max Voltage Deflection', group: 'Voltage', desc: 'The largest voltage swing captured across the recorded trace.' },
  camax: { full: 'Peak Calcium', group: 'Calcium', desc: 'The highest intracellular calcium concentration during the transient — the link between electrical activity and contraction.' },
  carest: { full: 'Resting Calcium', group: 'Calcium', desc: 'Intracellular calcium concentration at baseline, between beats.' },
  CaTD50: { full: 'Calcium Transient Duration, 50%', group: 'Calcium', desc: 'Time for the calcium transient to decay halfway — an early signal of handling abnormalities.' },
  CaTD90: { full: 'Calcium Transient Duration, 90%', group: 'Calcium', desc: 'Time for near-complete decay of the calcium transient. Prolongation often mirrors prolonged APD.' },
};

const BIOMARKER_ORDER: BiomarkerKey[] = ['qNet', 'APD90', 'APD50', 'dvdtmax', 'vmax', 'vrest', 'max_dv', 'camax', 'carest', 'CaTD50', 'CaTD90'];

/* =========================================================
   BIOMARKER EXPLORER
   ========================================================= */
const BiomarkerExplorer = () => {
  const [active, setActive] = useState<BiomarkerKey>('qNet');
  const info = BIOMARKERS[active];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full max-w-2xl">
      <div className="grid grid-cols-6 gap-2 md:gap-2.5 content-start md:w-[58%]">
        {BIOMARKER_ORDER.map((key, index) => {
          const isActive = key === active;
          const isTopRow = index < 2; 
          
          return (
            <button
              key={key}
              type="button"
              onMouseEnter={() => setActive(key)}
              onFocus={() => setActive(key)}
              onClick={() => setActive(key)}
              className={`relative flex items-center justify-center py-2.5 md:py-3 px-2 rounded-xl border text-[10px] md:text-xs font-mono transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                isTopRow ? 'col-span-3' : 'col-span-2'
              } ${
                isActive
                  ? 'border-accent/60 bg-accent/[0.06] text-foreground -translate-y-0.5'
                  : 'border-foreground/10 bg-foreground/[0.02] text-muted hover:border-foreground/25 hover:-translate-y-0.5'
              }`}
            >
              <span
                className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-full transition-colors duration-300 ${
                  BIOMARKERS[key].group === 'Voltage' ? 'bg-accent/70' : 'bg-foreground/30'
                }`}
              />
              {key}
            </button>
          );
        })}
      </div>

      <div className="md:w-[42%] relative h-[140px] md:h-[180px] rounded-2xl border border-foreground/10 bg-foreground/1,5 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: luxEase }}
            className="absolute inset-0 p-4 md:p-5 flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1 h-1 rounded-full ${info.group === 'Voltage' ? 'bg-accent/70' : 'bg-foreground/30'}`} />
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted">{info.group} Marker</span>
            </div>
            <h5 className="text-sm md:text-base font-medium text-foreground mb-2 tracking-tight">{info.full}</h5>
            <p className="text-xs md:text-[13px] text-muted leading-relaxed line-clamp-4">{info.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* =========================================================
   DATA — models
   ========================================================= */
type ModelKey = 'ann' | 'xgb' | 'rf';

const MODELS: Record<ModelKey, { title: string; tag: string; desc: string }> = {
  ann: {
    title: 'Artificial Neural Network',
    tag: 'Non-linear pattern learner',
    desc: 'A multi-layer feedforward network maps the 11-biomarker matrix directly to risk. It picks up non-linear interactions between ionic currents that a simple threshold rule would miss entirely.',
  },
  xgb: {
    title: 'XGBoost',
    tag: 'Sequential error correction',
    desc: 'A gradient-boosted ensemble of shallow trees, each one trained specifically to correct the mistakes left by the trees before it — strong at squeezing signal out of structured, tabular simulation output.',
  },
  rf: {
    title: 'Random Forest',
    tag: 'Independent majority vote',
    desc: 'Hundreds of decision trees, each trained on a random subset of the data and voting independently. Averaging their votes smooths out noise from any single simulation run.',
  },
};

const MODEL_ORDER: ModelKey[] = ['ann', 'xgb', 'rf'];

/* ---- SVG DIAGRAMS ---- */
const NetworkDiagram = () => {
  const inputs = [22, 55, 88];
  const hidden = [15, 42, 68, 95];
  const outputY = 55;
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.02 } } };
  const line = { hidden: { opacity: 0, pathLength: 0 }, show: { opacity: 1, pathLength: 1, transition: { duration: 0.4, ease: luxEase } } };
  const node = { hidden: { opacity: 0, scale: 0.4 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: luxEase } } };

  return (
    <svg viewBox="0 0 180 110" className="w-full h-full overflow-visible">
      <motion.g variants={container} initial="hidden" animate="show">
        {inputs.map((iy, i) =>
          hidden.map((hy, j) => (
            <motion.line key={`ih-${i}-${j}`} variants={line} x1={20} y1={iy} x2={90} y2={hy} stroke="currentColor" strokeWidth={0.75} className="text-foreground/20" />
          ))
        )}
        {hidden.map((hy, j) => (
          <motion.line key={`ho-${j}`} variants={line} x1={90} y1={hy} x2={158} y2={outputY} stroke="currentColor" strokeWidth={0.75} className="text-foreground/20" />
        ))}
        {inputs.map((iy, i) => (
          <motion.rect key={`in-${i}`} variants={node} x={18} y={iy - 2.5} width={5} height={5} className="fill-background stroke-foreground/50" strokeWidth={1} />
        ))}
        {hidden.map((hy, j) => (
          <motion.rect key={`hd-${j}`} variants={node} x={87.5} y={hy - 2.5} width={5} height={5} className="fill-background stroke-foreground/50" strokeWidth={1} />
        ))}
        <motion.rect variants={node} x={155.5} y={outputY - 3} width={6} height={6} className="fill-accent" />
      </motion.g>
    </svg>
  );
};

const MiniTree = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <line x1={0} y1={0} x2={0} y2={14} stroke="currentColor" strokeWidth={1} className="text-foreground/40" />
    <line x1={0} y1={5} x2={-8} y2={-4} stroke="currentColor" strokeWidth={1} className="text-foreground/40" />
    <line x1={0} y1={5} x2={8} y2={-4} stroke="currentColor" strokeWidth={1} className="text-foreground/40" />
    <line x1={-8} y1={-4} x2={-8} y2={-10} stroke="currentColor" strokeWidth={1} className="text-foreground/40" />
    <line x1={8} y1={-4} x2={8} y2={-10} stroke="currentColor" strokeWidth={1} className="text-foreground/40" />
    <rect x={-2} y={-13} width={4} height={4} className="fill-foreground/50" />
    <rect x={-10} y={-13} width={4} height={4} className="fill-foreground/50" />
    <rect x={6} y={-13} width={4} height={4} className="fill-foreground/50" />
  </g>
);

const BoostDiagram = () => {
  const stages = [30, 90, 150];
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.18 } } };
  const item = { hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: luxEase } } };

  return (
    <svg viewBox="0 0 180 110" className="w-full h-full overflow-visible">
      <motion.g variants={container} initial="hidden" animate="show">
        {stages.map((x, i) => (
          <motion.g key={i} variants={item}>
            <MiniTree x={x} y={62} />
            <text x={x} y={90} textAnchor="middle" className="fill-muted font-mono" style={{ fontSize: 7, letterSpacing: 1 }}>
              ROUND {i + 1}
            </text>
            {i < stages.length - 1 && (
              <line x1={x + 14} y1={58} x2={stages[i + 1] - 14} y2={58} stroke="currentColor" strokeWidth={0.75} className="text-accent/50" markerEnd="url(#arrow)" />
            )}
          </motion.g>
        ))}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="2" orient="auto">
            <path d="M0,0 L4,2 L0,4 Z" className="fill-accent/50" />
          </marker>
        </defs>
      </motion.g>
    </svg>
  );
};

const ForestDiagram = () => {
  const trees = [
    { x: 26, y: 45, s: 0.85 },
    { x: 58, y: 38, s: 0.95 },
    { x: 90, y: 48, s: 1 },
    { x: 122, y: 38, s: 0.95 },
    { x: 154, y: 45, s: 0.85 },
  ];
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: luxEase } } };
  const vote = { hidden: { opacity: 0, scaleY: 0 }, show: { opacity: 1, scaleY: 1, transition: { duration: 0.4, ease: luxEase, delay: 0.5 } } };

  return (
    <svg viewBox="0 0 180 110" className="w-full h-full overflow-visible">
      <motion.g variants={container} initial="hidden" animate="show">
        {trees.map((t, i) => (
          <motion.g key={i} variants={item}>
            <MiniTree x={t.x} y={t.y} scale={t.s} />
          </motion.g>
        ))}
        <motion.line variants={vote} x1={90} y1={62} x2={90} y2={82} stroke="currentColor" strokeWidth={1} className="text-foreground/30" style={{ transformOrigin: '90px 62px' }} />
        <motion.g variants={item}>
          <rect x={55} y={84} width={70} height={18} rx={4} className="fill-background stroke-foreground/25" strokeWidth={1} />
          <text x={90} y={95.5} textAnchor="middle" className="fill-foreground font-mono" style={{ fontSize: 5.5, letterSpacing: 1 }}>
            Majority Vote
          </text>
        </motion.g>
      </motion.g>
    </svg>
  );
};

const DIAGRAMS: Record<ModelKey, React.FC> = { ann: NetworkDiagram, xgb: BoostDiagram, rf: ForestDiagram };

/* =========================================================
   MODEL EXPLORER (UPDATED - FULL WIDTH PILLS)
   ========================================================= */
const ModelExplorer = () => {
  const [active, setActive] = useState<ModelKey>('ann');
  const Diagram = DIAGRAMS[active];
  const info = MODELS[active];

  return (
    <div className="w-full max-w-lg">
      
      {/* Container ini sekarang match dengan border radius kotak konten di bawahnya (rounded-2xl) */}
      <div className="flex w-full p-1.5 mb-6 rounded-2xl border border-foreground/10 bg-foreground/1,5">
        {MODEL_ORDER.map((key) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              onFocus={() => setActive(key)}
              className={`relative flex-1 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-mono uppercase tracking-[0.15em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                isActive ? 'text-background' : 'text-muted hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="model-pill"
                  className="absolute inset-0 bg-foreground rounded-xl"
                  transition={{ duration: 0.4, ease: luxEase }}
                />
              )}
              {/* Teks di tengah dengan proporsi yang sama persis */}
              <span className="relative z-10 block text-center">
                {MODELS[key].title === 'XGBoost' ? 'XGBoost' : MODELS[key].title.split(' ').map((w) => w[0]).join('')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-foreground/10 bg-foreground/1,5 p-5 md:p-7 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        <div className="w-full md:w-[45%] aspect-[180/110] text-foreground">
          <Diagram />
        </div>

        <div className="relative w-full md:w-[55%] h-[150px] md:h-[160px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: luxEase }}
              className="absolute inset-0 flex flex-col justify-center"
            >
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-accent block mb-2">{info.tag}</span>
              <h5 className="text-lg md:text-xl font-medium tracking-tight text-foreground mb-2">{info.title}</h5>
              <p className="text-xs md:text-sm text-muted leading-relaxed line-clamp-4">{info.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SHAP VISUALIZER (UPDATED - FULL WIDTH BOX)
   ========================================================= */
const SHAPVisualizer = () => {
  const shapData = [
    { label: 'qNet', val: 75, color: 'bg-rose-500/90' }, 
    { label: 'vmax', val: -40, color: 'bg-blue-500/90' }, 
    { label: 'CaTD90', val: 30, color: 'bg-rose-500/90' },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center mb-1 border-b border-foreground/10 pb-4">
        <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-foreground">SHAP Feature Audit</span>
        <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      {shapData.map((b, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-muted-foreground w-12 shrink-0">{b.label}</span>
          <div className="relative flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/20 z-10" />
            
            {b.val > 0 ? (
              <motion.div 
                className={`absolute left-1/2 top-0 bottom-0 ${b.color}`} 
                initial={{ width: 0 }} 
                whileInView={{ width: `${b.val / 2}%` }} 
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: luxEase }}
              />
            ) : (
              <motion.div 
                className={`absolute right-1/2 top-0 bottom-0 ${b.color}`} 
                initial={{ width: 0 }} 
                whileInView={{ width: `${Math.abs(b.val) / 2}%` }} 
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: luxEase }}
              />
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-1 text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-muted">
        <span>← Reduces Risk</span>
        <span>Increases Risk →</span>
      </div>
    </div>
  );
};

/* =========================================================
   RISK TIERS
   ========================================================= */
const TIERS: { label: string; note: string }[] = [
  { label: 'Low', note: 'Ionic profile consistent with normal repolarization reserve.' },
  { label: 'Intermediate', note: 'Some markers deviate — flagged for closer review, not an automatic stop.' },
  { label: 'High', note: 'Profile consistent with elevated TdP liability across the ensemble.' },
];

const RiskTiers = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-1.5">
        {TIERS.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onBlur={() => setHovered(null)}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-[0.15em] border transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
              hovered === i ? 'border-accent/60 bg-accent/[0.06] text-foreground' : 'border-foreground/10 text-muted hover:border-foreground/25'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      
      <div className="relative h-[40px] md:h-[32px] px-1 mt-1">
        <AnimatePresence initial={false}>
          <motion.p
            key={hovered ?? 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 text-[11px] md:text-xs text-muted leading-relaxed"
          >
            {hovered === null ? 'Hover a tier to see what it means.' : TIERS[hovered].note}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN SECTION: SOLUTION
   ========================================================= */
export default function SolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: lineProgress } = useScroll({
    target: lineRef,
    offset: ['start center', 'end center'],
  });
  const smoothLine = useSpring(lineProgress, { stiffness: 80, damping: 25 });

  const scrollToModel = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const target = document.getElementById('model-architecture');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 } };

  return (
    <section ref={containerRef} id="solution" className="relative w-full bg-background font-sans overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-16 md:pb-24 border-b border-foreground/10">
        <div className="flex flex-col justify-center max-w-5xl">
          <motion.div {...reveal} transition={{ duration: 0.7, ease: luxEase }} className="flex items-center gap-4 mb-10 md:mb-16">
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-muted">
              03 — The Objective
            </span>
            <motion.span
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 1, ease: luxEase, delay: 0.15 }}
              className="h-px w-24 bg-foreground/15 origin-left"
            />
          </motion.div>

          <RevealText>
            An ensemble machine learning system that translates 11 in-silico biomarkers into a reliable risk classification.
          </RevealText>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: luxEase }}
            className="mt-12 md:mt-16 flex items-center gap-6"
          >
            <a
              href="#model-architecture"
              onClick={scrollToModel}
              className="group flex items-center gap-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors duration-300"
            >
              Explore the Architecture
              <div className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center group-hover:border-accent transition-colors duration-300">
                <svg className="w-3 h-3 transform transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </a>
          </motion.div>
        </div>
      </div>

      <div id="model-architecture" className="relative z-10 w-full bg-background pt-16 md:pt-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row relative" ref={lineRef}>
            
            <div className="w-full md:w-1/3 md:border-r border-foreground/10 relative">
              <div className="md:sticky md:top-32 pt-4 md:pt-10 pb-8 md:pb-10 flex flex-col">
                <h3 className="text-2xl md:text-4xl font-medium tracking-tight text-foreground mb-4">
                  Computational <br className="hidden md:block" /> Pipeline
                </h3>
                <p className="text-sm text-muted leading-relaxed max-w-60 mb-8 md:mb-12">
                  A structured approach designed for high-precision inference and clinical transparency.
                </p>

                <div className="hidden md:block relative w-px h-32 bg-foreground/10 ml-1">
                  <motion.div
                    style={{ scaleY: smoothLine, transformOrigin: 'top' }}
                    className="absolute top-0 left-0 w-full h-full bg-accent"
                  />
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3 md:pl-16 lg:pl-24 pt-4 md:pt-10 pb-24 md:pb-32 flex flex-col gap-16 md:gap-24">
              
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, ease: luxEase }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent block">Phase 01</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>
                <h4 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-4">Data Ingestion</h4>
                <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl">
                  We extract exactly 11 essential electrophysiological parameters directly from the O&apos;Hara-Rudy cellular simulation.
                  Hover any marker below to see what it actually measures.
                </p>

                <BiomarkerExplorer />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, ease: luxEase }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent block">Phase 02</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>
                <h4 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-4">Model Inference</h4>
                <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl">
                  The extracted matrix is processed through three distinct models in parallel, each contributing a different
                  strength to the final vote. Switch between them to see how each one reasons.
                </p>

                <ModelExplorer />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8, ease: luxEase }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent block">Phase 03</span>
                  <div className="flex-1 h-px bg-foreground/10" />
                </div>
                <h4 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-4">Risk Synthesis</h4>
                <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl">
                  A Hard Voting mechanism aggregates the three predictions into a final tier. Each result is supported by
                  SHAP values to maintain full clinical transparency.
                </p>

                {/* PHASE 03 - UPDATED STRUCTURE */}
                <div className="w-full max-w-lg flex flex-col gap-4">
                  
                  {/* BOX 1: Final Output */}
                  <div className="p-6 md:p-8 rounded-2xl border border-foreground/10 bg-foreground/1,5 flex flex-col gap-6">
                    <div>
                      <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-muted mb-2">Final Output</span>
                      <span className="text-xl md:text-2xl font-medium tracking-tight text-foreground block">3-Tier Risk Classification</span>
                    </div>
                    <RiskTiers />
                  </div>

                  {/* BOX 2: SHAP Audit (Berada tepat di bawah dan seukuran) */}
                  <div className="p-6 md:p-8 rounded-2xl border border-foreground/10 bg-foreground/1,5 flex flex-col">
                    <SHAPVisualizer />
                  </div>

                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}