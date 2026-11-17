'use client';

import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { SubHead } from './ui';

/*
 * Cara kerja model prediksi (Random Forest, 400 pohon), empat langkah yang digerakkan scroll:
 * baca 11 angka → tiap pohon bertanya → 400 pohon memilih → suara jadi tingkat risiko.
 * Contoh input: azimilide (obat uji berisiko tinggi), satu sel virtual, CD-4 Tabel 3.1.
 */
const STEPS = [
  {
    title: 'It reads 11 numbers.',
    body: 'Each biomarker compares the drug-treated cell with a healthy one. 1.00 means no change. Here, recovery time (APD90) is 52% longer and the charge per beat (qNet) is 37% lower.',
  },
  {
    title: 'Each tree asks simple questions.',
    body: 'A decision tree works like a flowchart: is qNet low? Is recovery slow? Every tree learns from a different random sample of the training data, so each one asks slightly different questions.',
  },
  {
    title: '400 trees vote.',
    body: 'No single tree is trusted on its own. All 400 give an answer, and because each saw the data differently, their mistakes tend to cancel out.',
  },
  {
    title: 'The votes become a risk level.',
    body: 'The share of votes becomes the probability of each level. If two levels are too close to call, Cardivex reports both and recommends the more cautious one.',
  },
];

const AZIMILIDE: [string, number][] = [
  ['qNet', 0.626],
  ['dV/dt max', 1.0],
  ['V max', 1.004],
  ['V rest', -1.0],
  ['APD50', 1.422],
  ['APD90', 1.522],
  ['Max dV', -0.631],
  ['Ca max', 1.064],
  ['Ca rest', 1.02],
  ['CaTD50', 1.121],
  ['CaTD90', 1.057],
];

/* Ilustrasi pembagian suara (bukan angka model): 352 High, 40 Intermediate, 8 Low. */
const VOTES = { high: 352, int: 40, low: 8 };
const VOTE_ORDER = (() => {
  const out: ('high' | 'int' | 'low')[] = [];
  let seed = 11;
  const pool = [...Array(VOTES.high).fill('high'), ...Array(VOTES.int).fill('int'), ...Array(VOTES.low).fill('low')];
  while (pool.length) {
    seed = (seed * 9301 + 49297) % 233280;
    out.push(pool.splice(Math.floor((seed / 233280) * pool.length), 1)[0]);
  }
  return out;
})();
const DOT = { high: 'bg-accent', int: 'bg-amber', low: 'bg-teal' };

export default function ForestWalkthrough() {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });
  const full = useMotionValue(1);
  const p = reduce ? full : scrollYProgress;
  const n = STEPS.length;

  return (
    <div>
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        <SubHead
          label="Inside our model"
          title="How 400 trees"
          accent="reach one answer."
          body="Follow one high-risk test drug, azimilide, through the model."
        />
      </div>

      <div ref={track} className="relative mt-6 motion-safe:h-[520svh]">
        <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-svh motion-safe:overflow-hidden">
          <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 content-center gap-6 px-6 motion-safe:pt-24 motion-safe:pb-4 md:px-12 lg:grid-cols-12 lg:gap-12">
            {/* ---------- visual (atas di HP) ---------- */}
            <div className="relative order-1 h-[42svh] lg:order-2 lg:col-span-7 lg:h-[min(60svh,30rem)]">
              {STEPS.map((_, i) => (
                <Layer key={i} p={p} i={i} n={n} animated={!reduce}>
                  {(local) => [<InputBars key="a" local={local} />, <TreeDiagram key="b" local={local} />, <VoteGrid key="c" local={local} />, <Probabilities key="d" local={local} />][i]}
                </Layer>
              ))}
            </div>

            {/* ---------- teks langkah ---------- */}
            <div className="relative order-2 min-h-[13rem] lg:order-1 lg:col-span-5 lg:min-h-[16rem]">
              {STEPS.map((s, i) => (
                <StepText key={i} p={p} i={i} n={n} animated={!reduce} title={s.title} body={s.body} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Rentang scroll milik langkah i, dengan sedikit tumpang-tindih supaya pergantiannya bersambung. */
const range = (i: number, n: number) => [i / n, (i + 1) / n] as const;

function useStepOpacity(p: MotionValue<number>, i: number, n: number) {
  const [a, b] = range(i, n);
  const fade = 0.03;
  // Rentang harus tetap di 0–1 dan naik: framer bisa menjalankannya sebagai animasi scroll bawaan browser.
  return useTransform(p, [Math.max(0, a - fade), a + fade, b - fade, Math.min(1, b + fade)], [i === 0 ? 1 : 0, 1, 1, i === n - 1 ? 1 : 0]);
}

function StepText({ p, i, n, animated, title, body }: { p: MotionValue<number>; i: number; n: number; animated: boolean; title: string; body: string }) {
  const opacity = useStepOpacity(p, i, n);
  const y = useTransform(opacity, [0, 1], [24, 0]);
  return (
    <motion.div style={animated ? { opacity, y } : undefined} className="motion-safe:absolute motion-safe:inset-0 mb-10 lg:flex lg:flex-col lg:justify-center">
      <span className="font-mono text-xs text-muted">0{i + 1}</span>
      <h4 className="mt-3 text-[clamp(1.5rem,2.6vw,2.4rem)] font-medium leading-[1.08] tracking-[-0.025em] text-foreground">{title}</h4>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:text-base">{body}</p>
    </motion.div>
  );
}

function Layer({ p, i, n, animated, children }: { p: MotionValue<number>; i: number; n: number; animated: boolean; children: (local: MotionValue<number>) => ReactNode }) {
  const [a, b] = range(i, n);
  // animasi di dalam langkah selesai di 70% giliran langkah itu; sisanya jeda baca
  const local = useTransform(p, [a, a + (b - a) * 0.7], [0, 1]);
  const opacity = useStepOpacity(p, i, n);
  const scale = useTransform(opacity, [0, 1], [0.96, 1]);
  const filter = useTransform(opacity, [0, 1], ['blur(8px)', 'blur(0px)']);
  return (
    <motion.div style={animated ? { opacity, scale, filter } : undefined} className="motion-safe:absolute motion-safe:inset-0 mb-10 flex items-center">
      <div className="w-full">{children(local)}</div>
    </motion.div>
  );
}

/* ---------- 01. sebelas angka: batang menyimpang dari "tidak berubah" ---------- */
function Bar({ local, at, name, v }: { local: MotionValue<number>; at: number; name: string; v: number }) {
  const change = Math.abs(v) - 1; // rasio terhadap sel sehat: 0 = tidak berubah
  const pctW = Math.min(Math.abs(change), 0.6) / 0.6; // 60% perubahan = setengah lebar penuh
  const grow = useTransform(local, [at, at + 0.25], [0, 1]);
  const opacity = useTransform(local, [at, at + 0.15], [0.2, 1]);
  const big = Math.abs(change) > 0.2;
  return (
    <motion.div style={{ opacity }} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-[11px]">
      <span className="font-mono text-muted">{name}</span>
      <div className="relative h-2">
        <span className="absolute inset-y-[-3px] left-1/2 w-px bg-foreground/20" />
        <motion.span
          style={{ scaleX: grow, width: `${pctW * 50}%`, left: change >= 0 ? '50%' : undefined, right: change < 0 ? '50%' : undefined }}
          className={`absolute inset-y-0 rounded-full ${change >= 0 ? 'origin-left' : 'origin-right'} ${big ? 'bg-accent' : 'bg-foreground/25'}`}
        />
      </div>
      <span className={`text-right tabular-nums ${big ? 'font-medium text-foreground' : 'text-muted'}`}>{v.toFixed(2)}</span>
    </motion.div>
  );
}

function InputBars({ local }: { local: MotionValue<number> }) {
  return (
    <div className="rounded-sheet border border-foreground/10 bg-surface-white/60 p-3 md:p-6">
      <div className="mb-3 grid grid-cols-[4.5rem_1fr_3rem] gap-3 text-[10px] text-muted">
        <span />
        <span className="flex justify-between">
          <span>lower</span>
          <span>no change</span>
          <span>higher</span>
        </span>
        <span className="text-right">ratio</span>
      </div>
      <div className="space-y-1 md:space-y-2">
        {AZIMILIDE.map(([name, v], i) => (
          <Bar key={name} local={local} at={i * 0.06} name={name} v={v} />
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted md:mt-3">Azimilide, one virtual cell from the test data.</p>
    </div>
  );
}

/* ---------- 02. satu pohon keputusan (disederhanakan) ---------- */
function TreeDiagram({ local }: { local: MotionValue<number> }) {
  const e1 = useTransform(local, [0.15, 0.4], [0, 1]);
  const e2 = useTransform(local, [0.45, 0.7], [0, 1]);
  const leaf = useTransform(local, [0.7, 0.85], [0, 1]);
  const node = 'fill-surface-white stroke-foreground/20';
  return (
    <div className="rounded-sheet border border-foreground/10 bg-surface-white/60 p-3 md:p-6">
      <svg viewBox="0 0 420 250" className="h-auto w-full" aria-hidden>
        {/* cabang yang tidak dilewati */}
        <path d="M210 52 L330 112 M110 132 L60 192 M330 132 L290 192 M330 132 L380 192" stroke="rgba(42,42,42,0.15)" strokeWidth={1.5} fill="none" />
        {/* jalur azimilide */}
        <motion.path d="M210 52 L110 112" stroke="#2A2A2A" strokeWidth={2} fill="none" style={{ pathLength: e1 }} />
        <motion.path d="M110 132 L160 192" stroke="#2A2A2A" strokeWidth={2} fill="none" style={{ pathLength: e2 }} />

        <rect x={140} y={18} width={140} height={34} rx={17} className="fill-foreground" />
        <text x={210} y={40} textAnchor="middle" className="fill-surface-white text-[12px]">qNet below 0.80?</text>

        <rect x={40} y={112} width={140} height={34} rx={17} className={node} strokeWidth={1.5} />
        <text x={110} y={134} textAnchor="middle" className="fill-foreground text-[12px]">APD90 above 1.30?</text>
        <rect x={260} y={112} width={140} height={34} rx={17} className={node} strokeWidth={1.5} />
        <text x={330} y={134} textAnchor="middle" className="fill-muted text-[12px]">APD50 above 1.10?</text>

        <text x={152} y={84} className="fill-muted text-[10px]">yes</text>
        <text x={262} y={84} className="fill-muted text-[10px]">no</text>

        {[
          { x: 60, t: 'Intermediate', c: '#D98B1E' },
          { x: 290, t: 'Intermediate', c: '#D98B1E' },
          { x: 380, t: 'Low', c: '#16856F' },
        ].map((l) => (
          <g key={`${l.x}`} opacity={0.45}>
            <circle cx={l.x} cy={200} r={6} fill={l.c} />
            <text x={l.x} y={226} textAnchor="middle" className="fill-muted text-[10px]">{l.t}</text>
          </g>
        ))}
        <motion.g style={{ opacity: leaf }}>
          <circle cx={160} cy={200} r={10} fill="#B8545C" />
          <text x={160} y={232} textAnchor="middle" className="fill-foreground text-[12px] font-medium">High</text>
        </motion.g>
      </svg>
      <p className="mt-1 text-[10px] text-muted">Simplified example. Real trees ask many more questions.</p>
    </div>
  );
}

/* ---------- 03. 400 suara ---------- */
function VoteGrid({ local }: { local: MotionValue<number> }) {
  // Jumlah titik yang sudah memilih, dibulatkan per 20 supaya render ulangnya sedikit.
  const toCount = (v: number) => Math.round(Math.min(1, Math.max(0, v / 0.85)) * 20) * 20;
  const [filled, setFilled] = useState(() => toCount(local.get()));
  useMotionValueEvent(local, 'change', (v) => {
    const next = toCount(v);
    setFilled((f) => (f === next ? f : next));
  });
  const counts = { high: 0, int: 0, low: 0 };
  VOTE_ORDER.slice(0, filled).forEach((t) => counts[t]++);

  return (
    <div className="rounded-sheet border border-foreground/10 bg-surface-white/60 p-3 md:p-6">
      <div className="mx-auto grid w-full max-w-[12rem] grid-cols-20 gap-[2px] sm:max-w-[16rem] md:gap-1 lg:max-w-[20rem]" aria-hidden>
        {VOTE_ORDER.map((t, i) => (
          <span
            key={i}
            className={`aspect-square rounded-full transition-[background-color,transform] duration-500 ${i < filled ? `${DOT[t]} scale-100` : 'scale-75 bg-foreground/10'}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted md:mt-4 md:gap-x-5">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> High <b className="tabular-nums font-medium text-foreground">{counts.high}</b>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber" /> Intermediate <b className="tabular-nums font-medium text-foreground">{counts.int}</b>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal" /> Low <b className="tabular-nums font-medium text-foreground">{counts.low}</b>
        </span>
      </div>
      <p className="mt-2 text-center text-[10px] text-muted">Illustration of a vote. Each dot is one tree.</p>
    </div>
  );
}

/* ---------- 04. suara → probabilitas → tingkat risiko ---------- */
function Prob({ local, at, name, v, color }: { local: MotionValue<number>; at: number; name: string; v: number; color: string }) {
  const width = useTransform(local, [at, at + 0.35], ['0%', `${v * 100}%`]);
  const num = useTransform(local, [at, at + 0.35], [0, v * 100]);
  const text = useTransform(num, (x) => `${Math.round(x)}%`);
  return (
    <div className="grid grid-cols-[6rem_1fr_3rem] items-center gap-3 text-xs">
      <span className="text-foreground">{name}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-foreground/[0.07]">
        <motion.div style={{ width }} className={`h-full rounded-full ${color}`} />
      </div>
      <motion.span className="text-right tabular-nums text-foreground">{text}</motion.span>
    </div>
  );
}

function Probabilities({ local }: { local: MotionValue<number> }) {
  const verdict = useTransform(local, [0.75, 0.95], [0, 1]);
  const vy = useTransform(verdict, [0, 1], [12, 0]);
  return (
    <div className="rounded-sheet border border-foreground/10 bg-surface-white/60 p-3 md:p-6">
      <div className="space-y-3">
        <Prob local={local} at={0} name="High" v={VOTES.high / 400} color="bg-accent" />
        <Prob local={local} at={0.12} name="Intermediate" v={VOTES.int / 400} color="bg-amber" />
        <Prob local={local} at={0.24} name="Low" v={VOTES.low / 400} color="bg-teal" />
      </div>
      <motion.div style={{ opacity: verdict, y: vy }} className="mt-6 flex items-center justify-between gap-4 rounded-card bg-foreground px-4 py-3 text-surface-white">
        <span className="text-xs text-surface-white/60">Predicted risk</span>
        <span className="flex items-center gap-2 text-lg font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> High
        </span>
      </motion.div>
      <p className="mt-3 text-[10px] text-muted">Illustration. Azimilide is a known high-risk drug, and the model calls it High.</p>
    </div>
  );
}
