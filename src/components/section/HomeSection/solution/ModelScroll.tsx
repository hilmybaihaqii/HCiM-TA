'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { accentSerif } from '@/lib/fonts';
import { getLenis } from '@/lib/smoothScroll';
import { LABEL, Reveal } from './ui';
import ModesOverview from './ModesOverview';
import FitBox from '@/components/ui/FitBox';

/*
 * Section "The model": tiga mode masuk (CD-4 Tabel 2.18) ditampilkan satu per satu di panggung
 * yang menempel. Semua gerakan dihitung dari posisi scroll (framer-motion useScroll), jadi alur
 * maju & mundur persis mengikuti scroll pengunjung: input → sel jantung virtual → 11 biomarker
 * → 400 pohon → tingkat risiko.
 */
type ModeId = 'known' | 'new' | 'mixed';
type Kind = 'pick' | 'you' | 'db';

/* Nama mode & kalimat "yang saya punya" sama dengan halaman /lab/pipeline. */
const MODES: { id: ModeId; name: string; have: string; you: string; purpose: string; best: string; inputs: { t: string; kind: Kind }[]; inputNote: string }[] = [
  {
    id: 'known',
    name: 'CiPA drug',
    have: 'I have a drug name',
    you: 'just the drug name',
    purpose: 'Pick one of the 28 CiPA reference drugs. Cardivex fills in all of its lab values for you.',
    best: 'Checking or comparing well-known drugs.',
    inputs: [
      { t: 'Vandetanib', kind: 'pick' },
      { t: 'Plasma level', kind: 'db' },
      { t: 'hERG binding', kind: 'db' },
      { t: 'Channel block', kind: 'db' },
    ],
    inputNote: 'You pick the drug. Its lab values come from the CiPA database.',
  },
  {
    id: 'new',
    name: 'New drug',
    have: 'I have data for a new compound',
    you: 'plasma level, hERG binding, channel block',
    purpose: 'Enter your compound’s own lab values: plasma level, hERG binding and channel block.',
    best: 'Screening a brand-new compound.',
    inputs: [
      { t: 'Plasma level', kind: 'you' },
      { t: 'hERG binding', kind: 'you' },
      { t: 'Channel block', kind: 'you' },
    ],
    inputNote: 'You type in every value from your own lab.',
  },
  {
    id: 'mixed',
    name: 'CiPA drug + new lab data',
    have: 'I re-measured a CiPA drug',
    you: 'a drug name and your new values',
    purpose: 'Pick a reference drug, then swap in your own measurements for some of its values.',
    best: 'Seeing how your lab’s data changes a known result.',
    inputs: [
      { t: 'Cisapride', kind: 'pick' },
      { t: 'hERG binding', kind: 'you' },
      { t: 'Plasma level', kind: 'db' },
      { t: 'Channel block', kind: 'db' },
    ],
    inputNote: 'Your values replace the database ones. The rest is filled in.',
  },
];

const KIND_STYLE: Record<Kind, { cls: string; tag: string }> = {
  pick: { cls: 'bg-foreground text-surface-white', tag: '' },
  you: { cls: 'border border-foreground text-foreground', tag: 'you' },
  db: { cls: 'border border-dashed border-foreground/30 text-muted', tag: 'auto' },
};

/* Kapan tiap tahap menyala di dalam satu mode (0–1 = awal–akhir giliran mode itu). */
const STAGE_AT = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68];
const STAGE_LEN = 0.11;

const INK = '#2A2A2A';
const IDLE = 'rgba(42,42,42,0.12)';
const TIER = { high: '#B8545C', int: '#D98B1E', low: '#16856F' };
const BIOMARKERS = ['qNet', 'dV/dt', 'V max', 'V rest', 'APD50', 'APD90', 'Max dV', 'Ca max', 'Ca rest', 'CaTD50', 'CaTD90'];

/* Potensial aksi skematis: dosis lebih tinggi → plateau lebih panjang (viewBox 140 × 64). */
const ap = (k: number) => {
  const w = 40 + k * 11;
  return `M4 54 H14 L17 8 C ${17 + w * 0.3} 12, ${14 + w * 0.8} 16, ${14 + w} 40 S ${22 + w} 54, ${28 + w} 54 H136`;
};

export default function ModelScroll() {
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });
  const done = useMotionValue(1); // tanpa animasi: semua tahap langsung tampil penuh

  /** Kartu mode diklik → meluncur ke awal giliran mode itu di panggung. */
  const jumpTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + ((i + 0.08) / MODES.length) * (el.offsetHeight - window.innerHeight);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        <Reveal>
          <span className={`${LABEL} mb-6`}>The model</span>
        </Reveal>
        <h2 className="text-[clamp(2.2rem,5vw,4.5rem)] font-medium leading-[1.03] tracking-[-0.035em] text-foreground">
          <Reveal>From a drug</Reveal>
          <Reveal delay={0.06}>
            to a <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>risk level.</em>
          </Reveal>
        </h2>
        <Reveal delay={0.12} className="mt-6">
          <p className="max-w-xl text-base leading-relaxed text-muted md:text-lg">
            Cardivex has three modes, so you can start from whatever data you have. Each one runs the FDA CiPA heart-cell simulation, then hands the 11 biomarkers to
            our prediction model.
          </p>
        </Reveal>
        <div className="mt-10 md:mt-14">
          <ModesOverview modes={MODES} onPick={jumpTo} />
        </div>
      </div>

      <div ref={track} className="relative mt-10 motion-safe:h-[840svh] md:mt-16">
        <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-dvh motion-safe:overflow-hidden">
          <div className="relative mx-auto h-full w-full max-w-7xl">
            {MODES.map((m, i) => (
              <ModeScene key={m.id} mode={m} index={i} progress={reduce ? done : scrollYProgress} animated={!reduce} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/** Satu mode: teks di kiri, alur 5 tahap di kanan. Masuk/keluar memudar sambil bergeser. */
function ModeScene({ mode, index, progress, animated }: { mode: (typeof MODES)[number]; index: number; progress: MotionValue<number>; animated: boolean }) {
  const n = MODES.length;
  const t = useTransform(progress, [index / n, (index + 1) / n], [0, 1]);
  const first = index === 0;
  const last = index === n - 1;
  const opacity = useTransform(t, [0, 0.06, 0.92, 1], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(t, [0, 0.06, 0.92, 1], [first ? 0 : 48, 0, 0, last ? 0 : -48]);
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'));

  return (
    <motion.article
      style={animated ? { opacity, y, visibility } : undefined}
      className="px-6 py-16 md:px-12 motion-safe:absolute motion-safe:inset-0 motion-safe:pt-20 motion-safe:pb-6 lg:motion-safe:pt-24"
    >
      {/* FitBox: kalau layar terlalu pendek, isi mengecil sedikit supaya tidak terpotong */}
      <FitBox align="items-start lg:items-center">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-12">
      {/* ---------- teks mode ---------- */}
      <div className="lg:col-span-4">
        <span className="font-mono text-xs text-muted">Mode 0{index + 1}</span>
        <h3 className="mt-2 text-[clamp(1.7rem,3.4vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.03em] text-foreground lg:mt-4">{mode.name}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted md:text-base lg:mt-5">{mode.purpose}</p>
        <p className="mt-3 hidden max-w-sm text-sm text-foreground md:block lg:mt-6">
          <span className="text-muted">Best for: </span>
          {mode.best}
        </p>
      </div>

      {/* ---------- alur 5 tahap ---------- */}
      <ol className="relative lg:col-span-8">
        <Row animated={animated} t={t} i={0} title="Your input" desc={mode.inputNote}>
          {(sp) => <InputVisual mode={mode} sp={sp} />}
        </Row>
        <Row animated={animated} t={t} i={1} title="Virtual heart cell" tag={{ text: 'FDA CiPA' }} desc="The drug is applied to a simulated human heart cell at 1, 2, 3 and 4 times its plasma level.">
          {(sp) => <SimVisual sp={sp} />}
        </Row>
        <Row animated={animated} t={t} i={2} title="11 biomarkers" desc="Each run gives 11 readings, like charge per beat and recovery time. The four runs are averaged.">
          {(sp) => <BioVisual sp={sp} />}
        </Row>
        <Row
          animated={animated}
          t={t}
          i={3}
          title="400 trees vote"
          tag={{ text: 'Our model', ours: true }}
          desc="Our Random Forest of 400 decision trees reads the 11 numbers and votes on the risk. It was tested only on drugs it never saw."
        >
          {(sp) => <TreesVisual mode={mode.id} sp={sp} />}
        </Row>
        <Row
          animated={animated}
          t={t}
          i={4}
          title="Risk level"
          desc={mode.id === 'known' ? 'Vandetanib lands on High, with 99.8% of the vote.' : 'Your compound lands on Low, Intermediate or High.'}
        >
          {(sp) => <RiskMeter mode={mode.id} sp={sp} />}
        </Row>
        <Row
          animated={animated}
          t={t}
          i={5}
          last
          title="Why: SHAP"
          tag={{ text: 'Explained', ours: true }}
          desc="SHAP shows which biomarkers pushed the result up or down, so every answer can be checked."
        >
          {(sp) => <ShapVisual sp={sp} />}
        </Row>
      </ol>
      </div>
      </FitBox>
    </motion.article>
  );
}

/** Satu tahap: nomor + garis penghubung yang terisi, judul & keterangan, lalu visualnya. */
function Row({
  t,
  i,
  title,
  desc,
  tag,
  last = false,
  animated,
  children,
}: {
  t: MotionValue<number>;
  i: number;
  title: string;
  desc: string;
  tag?: { text: string; ours?: boolean };
  last?: boolean;
  animated: boolean;
  children: (sp: MotionValue<number>) => ReactNode;
}) {
  const sp = useTransform(t, [STAGE_AT[i], STAGE_AT[i] + STAGE_LEN], [0, 1]);
  // Sorotan lembut di belakang tahap yang sedang berjalan (tahap terakhir tetap tersorot).
  const end = STAGE_AT[i] + STAGE_LEN;
  const glow = useTransform(t, [STAGE_AT[i] - 0.02, STAGE_AT[i], last ? 0.95 : end + 0.05, last ? 1 : end + 0.1], [0, 1, 1, last ? 1 : 0]);
  const lineEnd = last ? 1 : STAGE_AT[i + 1];
  const line = useTransform(t, [STAGE_AT[i] + STAGE_LEN, lineEnd], [0, 1]);
  // HP: visual hanya terbuka selama tahap ini berjalan (tahap terakhir tetap terbuka), supaya muat satu layar.
  const next = last ? 1 : STAGE_AT[i + 1];
  const open = useTransform(t, [STAGE_AT[i] - 0.01, STAGE_AT[i] + 0.02, next, last ? 1 : next + 0.03], [0, 1, 1, last ? 1 : 0]);
  const openHeight = useTransform(open, [0, 1], ['0px', '104px']);
  const opacity = useTransform(sp, [0, 0.35], [0.28, 1]);
  const dotBg = useTransform(sp, [0, 0.3], ['#F6F4F3', INK]);
  const dotFg = useTransform(sp, [0, 0.3], ['#7C7B7B', '#FFFFFF']);
  const dotBorder = useTransform(sp, [0, 0.3], ['rgba(42,42,42,0.15)', INK]);
  const scale = useTransform(sp, [0, 0.3, 0.6, 1], [1, 1.15, 1, 1]);

  return (
    <li className="relative isolate grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-1.5 md:pb-3 lg:grid-cols-[2.25rem_minmax(0,1fr)_16rem] lg:gap-x-6">
      <motion.span
        aria-hidden
        style={{ opacity: glow }}
        className="absolute -inset-x-3 -top-2 bottom-0 -z-10 hidden rounded-card bg-surface-white/80 shadow-[0_14px_36px_-24px_rgba(43,34,35,0.35)] md:block"
      />
      {!last && (
        <span aria-hidden className="absolute bottom-0 left-[1.1rem] top-9 w-px bg-foreground/10">
          <motion.span style={{ scaleY: line }} className="absolute inset-0 origin-top bg-foreground" />
        </span>
      )}
      <motion.span
        style={{ backgroundColor: dotBg, color: dotFg, borderColor: dotBorder, scale }}
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border font-mono text-xs"
      >
        {i + 1}
      </motion.span>
      <motion.div style={{ opacity }} className="min-w-0 pt-1.5">
        <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground md:text-base">
          {title}
          {tag && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${
                tag.ours ? 'bg-accent/10 text-accent' : 'border border-dashed border-foreground/25 text-muted'
              }`}
            >
              {tag.text}
            </span>
          )}
        </span>
        <span className="mt-0.5 hidden max-w-sm text-xs leading-relaxed text-muted md:block [@media(min-height:760px)]:text-sm">{desc}</span>
        {/* di HP visual berada di bawah judul */}
        <motion.div style={animated ? { maxHeight: openHeight, opacity: open } : undefined} className="overflow-hidden lg:hidden">
          <div className="pt-2">{children(sp)}</div>
        </motion.div>
      </motion.div>
      <motion.div style={{ opacity }} className="hidden items-center lg:flex">
        {children(sp)}
      </motion.div>
    </li>
  );
}

/*
 * Elemen kecil yang muncul ketika progres tahap melewati `at`. Arah masuknya dibuat
 * beda per tahap supaya tidak monoton: naik, dari kiri, jatuh berputar, atau membesar.
 */
type From = 'up' | 'left' | 'drop' | 'zoom';
const FROM: Record<From, { x: number; y: number; rotate: number; scale: number }> = {
  up: { x: 0, y: 8, rotate: 0, scale: 0.85 },
  left: { x: -16, y: 0, rotate: 0, scale: 1 },
  drop: { x: 0, y: -14, rotate: -10, scale: 0.9 },
  zoom: { x: 0, y: 0, rotate: 0, scale: 0.55 },
};

function Pop({ sp, at, from = 'up', className = '', children }: { sp: MotionValue<number>; at: number; from?: From; className?: string; children: ReactNode }) {
  const f = FROM[from];
  const range = [at, at + 0.2];
  const opacity = useTransform(sp, range, [0, 1]);
  const x = useTransform(sp, range, [f.x, 0]);
  const y = useTransform(sp, range, [f.y, 0]);
  const rotate = useTransform(sp, range, [f.rotate, 0]);
  const scale = useTransform(sp, range, [f.scale, 1]);
  return (
    <motion.span style={{ opacity, x, y, rotate, scale }} className={className}>
      {children}
    </motion.span>
  );
}

function InputVisual({ mode, sp }: { mode: (typeof MODES)[number]; sp: MotionValue<number> }) {
  return (
    // grid 2 kolom: semua pill sama lebar, tidak ada yang melompat ke baris baru sendirian
    <div className="grid max-w-[18rem] grid-cols-2 gap-1.5">
      {mode.inputs.map((x, i) => (
        <Pop
          key={x.t}
          sp={sp}
          at={(i / mode.inputs.length) * 0.75}
          from="left"
          className={`flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px] ${KIND_STYLE[x.kind].cls}`}
        >
          {x.t}
          {KIND_STYLE[x.kind].tag && <span className="opacity-60">· {KIND_STYLE[x.kind].tag}</span>}
        </Pop>
      ))}
    </div>
  );
}

function Curve({ sp, k }: { sp: MotionValue<number>; k: number }) {
  const pathLength = useTransform(sp, [k * 0.12, 0.55 + k * 0.12], [0, 1]);
  const opacity = useTransform(sp, [k * 0.12, k * 0.12 + 0.1], [0, 0.35 + k * 0.21]);
  return <motion.path d={ap(k)} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength, opacity }} />;
}

function SimVisual({ sp }: { sp: MotionValue<number> }) {
  return (
    <div className="flex items-end gap-3">
      <svg viewBox="0 0 140 64" className="h-12 w-36 text-accent lg:h-12 lg:w-40" aria-hidden>
        {[0, 1, 2, 3].map((k) => (
          <Curve key={k} sp={sp} k={k} />
        ))}
      </svg>
      <Pop sp={sp} at={0.6} className="pb-1 text-[10px] leading-tight text-muted">
        1×
        <br />
        to 4×
      </Pop>
    </div>
  );
}

function BioVisual({ sp }: { sp: MotionValue<number> }) {
  return (
    // sel sama besar untuk 11 biomarker
    <div className="grid max-w-[18rem] grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-4">
      {BIOMARKERS.map((b, i) => (
        <Pop key={b} sp={sp} at={i * 0.07} from="drop" className="block rounded-md bg-surface-white py-0.5 text-center font-mono text-[10px] text-foreground ring-1 ring-foreground/10">
          {b}
        </Pop>
      ))}
    </div>
  );
}

/* 40 titik mewakili 400 pohon (1 titik = 10 pohon). Vandetanib: 399 dari 400 memilih High (CD-4 Tabel 2.21). */
const VOTES: Record<ModeId, (keyof typeof TIER)[]> = {
  known: Array.from({ length: 40 }, () => 'high'),
  new: Array.from({ length: 40 }, (_, i) => (i % 3 === 0 ? 'low' : i % 3 === 1 ? 'int' : 'high')),
  mixed: Array.from({ length: 40 }, (_, i) => (i % 4 === 0 ? 'high' : i % 4 === 3 ? 'low' : 'int')),
};

function Vote({ sp, at, color }: { sp: MotionValue<number>; at: number; color: string }) {
  const backgroundColor = useTransform(sp, [at, at + 0.12], [IDLE, color]);
  const scale = useTransform(sp, [at, at + 0.06, at + 0.12], [1, 1.5, 1]);
  return <motion.span style={{ backgroundColor, scale }} className="h-2 w-2 rounded-full" />;
}

function TreesVisual({ mode, sp }: { mode: ModeId; sp: MotionValue<number> }) {
  return (
    <div>
      <div className="grid w-fit grid-cols-20 gap-1" aria-hidden>
        {VOTES[mode].map((v, i) => (
          <Vote key={i} sp={sp} at={(i / 40) * 0.8} color={TIER[v]} />
        ))}
      </div>
      <Pop sp={sp} at={0.75} className="mt-1.5 block text-[10px] text-muted">
        {mode === 'known' ? '1 dot = 10 trees' : 'Example votes · 1 dot = 10 trees'}
      </Pop>
    </div>
  );
}

/*
 * Tingkat risiko: meter tiga bagian yang sama untuk semua mode. Mode 01 memakai hasil nyata
 * vandetanib (penanda berhenti di High, 99.8%). Mode 02/03 belum punya obat tertentu, jadi
 * ketiga bagian menyala bergantian: hasilnya bergantung pada data pengguna.
 */
const SEGMENTS = [
  { name: 'Low', color: TIER.low },
  { name: 'Intermediate', color: TIER.int },
  { name: 'High', color: TIER.high },
];

/** Satu bagian meter; `from`–`to` = kapan ia menyala. Tanpa rentang, bagian itu tetap redup. */
function Segment({ sp, color, from = 0, to = 0 }: { sp: MotionValue<number>; color: string; from?: number; to?: number }) {
  const lit = useTransform(sp, [from, Math.max(to, from + 0.01)], [0.18, 1]);
  return <motion.span style={{ opacity: to ? lit : 0.18, backgroundColor: color }} className="h-2 flex-1 rounded-full" />;
}

function RiskMeter({ mode, sp }: { mode: ModeId; sp: MotionValue<number> }) {
  const known = mode === 'known';
  const left = useTransform(sp, [0.05, 0.75], ['0%', '83.3%']);
  const markerOpacity = useTransform(sp, [0, 0.1], [0, 1]);
  const pct = useTransform(sp, [0.1, 0.8], [0, 99.8]);
  const label = useTransform(pct, (v) => `${v.toFixed(1)}%`);

  return (
    <div className="w-full max-w-[16rem]">
      <div className="relative pt-3">
        {known && (
          <motion.span
            style={{ left, opacity: markerOpacity }}
            className="absolute top-0 -ml-[5px] h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-foreground"
          />
        )}
        <div className="flex gap-1">
          {SEGMENTS.map((s, i) =>
            known ? (
              <Segment key={s.name} sp={sp} color={s.color} {...(i === 2 ? { from: 0.7, to: 0.85 } : {})} />
            ) : (
              <Segment key={s.name} sp={sp} color={s.color} from={i * 0.22} to={i * 0.22 + 0.2} />
            ),
          )}
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-3 text-[10px] text-muted">
        <span>Low</span>
        <span className="text-center">Intermediate</span>
        <span className="text-right">High</span>
      </div>
      <Pop sp={sp} at={0.7} from="zoom" className="mt-2 flex items-center gap-1.5 text-xs text-foreground">
        {known ? (
          <>
            <span className="font-medium">Vandetanib: High</span>
            <span className="text-muted">·</span>
            <motion.span className="tabular-nums">{label}</motion.span>
          </>
        ) : (
          <span className="text-muted">Depends on your data</span>
        )}
      </Pop>
    </div>
  );
}

/*
 * SHAP: biomarker yang paling memengaruhi prediksi. Angka = rata-rata |SHAP| pada data uji
 * ChanTest (CD-4 §2.1.8); sama untuk semua mode karena menggambarkan model, bukan satu obat.
 */
const SHAP_TOP: [string, number][] = [
  ['qNet', 0.105],
  ['APD50', 0.096],
  ['APD90', 0.078],
];

function ShapBar({ sp, at, name, v }: { sp: MotionValue<number>; at: number; name: string; v: number }) {
  const scaleX = useTransform(sp, [at, at + 0.3], [0, 1]);
  const opacity = useTransform(sp, [at, at + 0.15], [0.2, 1]);
  return (
    <motion.div style={{ opacity }} className="grid grid-cols-[3rem_1fr_2.25rem] items-center gap-2 text-[10px]">
      <span className="font-mono text-foreground">{name}</span>
      <span className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]">
        <motion.span style={{ scaleX, width: `${(v / SHAP_TOP[0][1]) * 100}%` }} className="block h-full origin-left rounded-full bg-accent" />
      </span>
      <span className="text-right tabular-nums text-muted">{v.toFixed(3)}</span>
    </motion.div>
  );
}

function ShapVisual({ sp }: { sp: MotionValue<number> }) {
  return (
    <div className="w-full max-w-[16rem] space-y-1">
      {SHAP_TOP.map(([name, v], i) => (
        <ShapBar key={name} sp={sp} at={i * 0.18} name={name} v={v} />
      ))}
    </div>
  );
}
