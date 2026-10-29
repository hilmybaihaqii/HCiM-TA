'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FEATURES, formatChange, ratioChange } from '@/lib/pipeline';
import { isStrongChange } from '@/lib/biomarkerHighlight';
import { getTierCssVar } from '@/lib/tierColor';
import type { ShapData } from '@/lib/predict';
import { BIOMARKER_INFO, SHORT_DESC } from './biomarkerText';
import { EcgTrace } from './HeartbeatLoader';
import { SectionHead, TabRail, secondaryBtn } from './ui';

/*
 * 11 biomarker dalam dua slide yang bisa digeser:
 *   1. Main drivers : urutan SHAP, biomarker yang paling menggerakkan model (dari /explain)
 *   2. Drug effect  : perubahan tiap biomarker dari sel tanpa obat (dari simulasi / input user)
 * Ketuk satu baris di slide mana pun untuk membaca artinya & angka lengkapnya.
 * Merah hanya untuk perubahan kuat (isStrongChange); warna tier untuk dorongan SHAP ke arah hasil.
 */

type Feature = (typeof FEATURES)[number];

const ZEBRA = 'odd:bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]';
const numFmt = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
const fmtNum = (v?: number | null) => (typeof v === 'number' && Number.isFinite(v) ? numFmt.format(v) : '—');
const fmtShap = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(3)}`;

/** Kalimat pengaruh ke model untuk satu biomarker (dari SHAP) */
function influenceSentence(shap: number | undefined, rank: number, tier?: string): string | null {
  if (typeof shap !== 'number' || !tier) return null;
  if (Math.abs(shap) < 0.005) return 'In this result it had almost no effect on the model.';
  if (rank <= 3) {
    return shap > 0
      ? `In this result it was one of the main reasons the model chose ${tier}.`
      : `In this result it was one of the main things holding the model back from ${tier}.`;
  }
  return shap > 0
    ? `In this result it nudged the model toward ${tier}.`
    : `In this result it nudged the model away from ${tier}.`;
}

/* ---------- Potongan tampilan ---------- */

/** Bar dua arah dari garis tengah. value -1..1. `color` = warna CSS untuk bar yang ditonjolkan. */
function SplitBar({ value, tone, color }: { value: number | null; tone: 'accent' | 'muted' | 'away'; color?: string }) {
  return (
    <span className="relative h-2" aria-hidden="true">
      <span className="absolute left-1/2 -top-1 -bottom-1 w-px bg-foreground/25" />
      {value !== null && (
        <motion.span
          className={`absolute top-0 bottom-0 rounded-full ${color ? '' : tone === 'accent' ? 'bg-accent' : tone === 'away' ? 'bg-foreground/45' : 'bg-foreground/30'}`}
          style={{ ...(value >= 0 ? { left: '50%' } : { right: '50%' }), ...(color ? { background: color } : {}) }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(1, Math.abs(value)) * 50}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </span>
  );
}

/** Ponsel: kolom kecil rata tengah (tiga berdampingan). Desktop: baris label kiri, nilai kanan. */
function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center md:text-left md:flex md:items-baseline md:justify-between md:gap-4 md:py-2.5">
      <dt className="text-[11px] md:text-xs text-foreground/70">{label}</dt>
      <dd className={`mt-1 md:mt-0 font-mono text-sm tabular-nums ${accent ? 'text-accent font-semibold' : 'text-foreground'}`}>{value}</dd>
    </div>
  );
}

/** Baris yang bisa dibuka; isi ringkas mengikuti `grid`, detail selebar penuh di bawahnya */
function Row({ grid, open, onToggle, panelId, cells, detail }: {
  grid: string; open: boolean; onToggle: () => void; panelId: string; cells: React.ReactNode; detail: React.ReactNode;
}) {
  return (
    <li className={`rounded-chip ${ZEBRA}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className={`${grid} w-full px-2 sm:px-3 py-3 text-left group`}>
        {cells}
        <ChevronDown className={`w-4 h-4 text-foreground/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {detail}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function Name({ k, mark, open, markColor }: { k: Feature; mark?: boolean; open: boolean; markColor?: string }) {
  return (
    <span className="min-w-0 truncate text-sm">
      <span className={`font-medium transition-colors ${open ? 'text-action' : 'text-foreground group-hover:text-action'}`}>{k}</span>
      {mark && <span className="ml-1.5 text-foreground/70" style={markColor ? { color: markColor } : undefined} aria-label="main driver">●</span>}
      <span className="hidden sm:inline ml-2 text-xs text-foreground/60">{SHORT_DESC[k]}</span>
    </span>
  );
}

function ColumnHead({ grid, children }: { grid: string; children: React.ReactNode }) {
  return <div className={`${grid} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>{children}</div>;
}

/* ---------- Kolom tiap slide ---------- */

// Slide 1: nama | bar SHAP | angka SHAP | panah
const DRIVER_GRID = 'grid grid-cols-[6.25rem_1fr_3.75rem_1rem] sm:grid-cols-[14rem_1fr_5rem_1rem] items-center gap-3 sm:gap-5';
// Slide 2 (dengan nilai mentah): nama | bar | tanpa obat | dengan obat | % | panah. Ponsel: nama | bar | % | panah.
const CHANGE_GRID_RAW = 'grid grid-cols-[6.25rem_1fr_3.25rem_1rem] sm:grid-cols-[12rem_1fr_5rem_5rem_4rem_1rem] items-center gap-3 sm:gap-4';
// Slide 2 (hanya rasio, Digital Lab): nama | bar | rasio (sm+) | % | panah
const CHANGE_GRID_RATIO = 'grid grid-cols-[6.25rem_1fr_3.25rem_1rem] sm:grid-cols-[13rem_1fr_5rem_4rem_1rem] items-center gap-3 sm:gap-5';

const SLIDES = [
  { id: 'drivers', label: 'Main drivers' },
  { id: 'change', label: 'Drug effect' },
] as const;

export default function BiomarkerList({ ratios, control, drug, tier, shap, explaining = false, shapError, onExplain }: {
  ratios: (number | null)[];
  /** Nilai mentah sel tanpa obat (Full Pipeline) */
  control?: Record<string, number | null>;
  /** Nilai mentah dengan obat (Full Pipeline) */
  drug?: Record<string, number | null>;
  /** Tier yang diprediksi */
  tier?: string;
  shap?: ShapData | null;
  explaining?: boolean;
  shapError?: string;
  /** Muat ulang SHAP (dipakai kalau gagal atau belum ada) */
  onExplain?: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [slide, setSlide] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  /** Slide tujuan saat berpindah lewat tab (scroll halus); selama itu index tidak diubah oleh scroll */
  const target = useRef<number | null>(null);
  const settle = useRef(0);
  useEffect(() => () => window.clearTimeout(settle.current), []);
  const hasRaw = !!(control || drug);
  const knownTier = tier && tier !== 'unknown' ? tier : undefined;
  const tierColor = knownTier ? getTierCssVar(knownTier) : undefined;

  /* ---------- data ---------- */
  const base = useMemo(() => {
    const influence = new Map((shap?.contributions ?? []).map(c => [c.biomarker, c.shap]));
    return FEATURES.map((key, i) => ({ key, ratio: ratios[i], change: ratioChange(ratios[i], control?.[key]), shap: influence.get(key) }));
  }, [ratios, control, shap]);

  const drivers = useMemo(() => [...base].sort((a, b) => Math.abs(b.shap ?? 0) - Math.abs(a.shap ?? 0)), [base]);
  const rankOf = useMemo(() => new Map(drivers.map((r, i) => [r.key, shap ? i + 1 : 0])), [drivers, shap]);
  const changes = useMemo(() => [...base].sort((a, b) => Math.abs(b.change ?? 0) - Math.abs(a.change ?? 0)), [base]);

  const maxShap = Math.max(1e-9, ...base.map(r => Math.abs(r.shap ?? 0)));
  const maxDev = Math.max(0.1, ...base.map(r => Math.abs(r.change ?? 0)));

  /* ---------- slide ----------
     Garis aktif di rel tab mengikuti posisi scroll setiap frame (CSS var, tanpa render ulang React),
     jadi geseran jari dan klik tab sama-sama mulus. Index tab hanya berubah sekali per perpindahan. */
  const goTo = (i: number) => {
    const el = scroller.current;
    setSlide(i);
    if (!el) return;
    target.current = i;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };
  const onScroll = () => {
    const el = scroller.current;
    if (!el || !el.clientWidth) return;
    const pos = el.scrollLeft / el.clientWidth;
    rail.current?.style.setProperty('--rail-pos', String(pos));
    // Scroll berhenti ±120 ms: anggap selesai, sinkronkan index dengan posisi akhir
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      target.current = null;
      setSlide(Math.round(el.scrollLeft / el.clientWidth));
    }, 120);
    if (target.current === null) {
      const i = Math.round(pos);
      setSlide(s => (s === i ? s : i));
    }
  };

  const toggle = (id: string) => setOpen(open === id ? null : id);

  /** Detail satu biomarker: penjelasan + angka (sama di kedua slide) */
  const detail = (r: (typeof base)[number]) => {
    const rank = rankOf.get(r.key) ?? 0;
    const strong = isStrongChange(r.key, r.ratio);
    const influence = influenceSentence(r.shap, rank, knownTier);
    return (
      <div className="px-2 sm:px-3 pb-5 pt-1 grid grid-cols-1 md:grid-cols-[1fr_16rem] gap-5 md:gap-10 items-start">
        <p className="text-sm text-foreground/80 leading-relaxed">
          <span className="font-medium text-foreground">{SHORT_DESC[r.key]}.</span>{' '}
          {BIOMARKER_INFO[r.key]}
          {influence && <> <span className="text-foreground">{influence}</span></>}
        </p>
        <dl className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-0 py-3 md:py-1 md:px-4 rounded-card bg-surface-white/70 md:divide-y md:divide-foreground/10">
          {hasRaw ? (
            <>
              <Stat label="Without drug" value={fmtNum(control?.[r.key])} />
              <Stat label="With drug" value={fmtNum(drug?.[r.key])} />
            </>
          ) : (
            <>
              <Stat label="Ratio entered" value={fmtNum(r.ratio)} />
              <Stat label="Change" value={formatChange(r.change)} accent={strong} />
            </>
          )}
          <Stat label="Influence" value={rank > 0 ? `#${rank} of 11` : '—'} />
        </dl>
      </div>
    );
  };

  /* ---------- isi slide 1: SHAP ---------- */
  let driversBody: React.ReactNode;
  if (shap) {
    driversBody = (
      <>
        <ColumnHead grid={DRIVER_GRID}>
          <span>Biomarker</span>
          <span className="flex justify-between"><span>← away</span><span>toward →</span></span>
          <span className="text-right">SHAP</span>
          <span />
        </ColumnHead>
        <ul>
          {drivers.map((r, i) => {
            const id = `drivers-${r.key}`;
            const value = typeof r.shap === 'number' ? r.shap / maxShap : null;
            return (
              <Row
                key={r.key}
                grid={DRIVER_GRID}
                open={open === id}
                onToggle={() => toggle(id)}
                panelId={`bm-${id}`}
                cells={
                  <>
                    <Name k={r.key} mark={i < 3} open={open === id} markColor={tierColor} />
                    <SplitBar value={value} tone={(r.shap ?? 0) > 0 ? 'accent' : 'away'} color={(r.shap ?? 0) > 0 ? tierColor : undefined} />
                    <span className={`text-right font-mono text-sm tabular-nums ${i < 3 ? 'text-foreground font-semibold' : 'text-foreground/70'}`}>
                      {typeof r.shap === 'number' ? fmtShap(r.shap) : '—'}
                    </span>
                  </>
                }
                detail={detail(r)}
              />
            );
          })}
        </ul>
      </>
    );
  } else if (explaining) {
    driversBody = (
      <div className="py-10 flex flex-col items-center gap-4 text-center">
        <EcgTrace className="w-full max-w-sm h-14" />
        <p className="text-sm text-foreground/70">Working out which biomarkers moved the model most…</p>
      </div>
    );
  } else {
    driversBody = (
      <div className="py-12 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-foreground/70 max-w-md text-balance">
          {shapError ? `Could not load the main drivers. ${shapError}` : 'The main drivers for this result are not loaded yet.'}
        </p>
        {onExplain && knownTier && (
          <button type="button" onClick={onExplain} className={secondaryBtn}>{shapError ? 'Try again' : 'Load main drivers'}</button>
        )}
      </div>
    );
  }

  /* ---------- isi slide 2: perubahan ---------- */
  const changeGrid = hasRaw ? CHANGE_GRID_RAW : CHANGE_GRID_RATIO;
  const changeBody = (
    <>
      <ColumnHead grid={changeGrid}>
        <span>Biomarker</span>
        <span className="flex justify-between"><span>lower</span><span>same</span><span>higher</span></span>
        {hasRaw ? (
          <>
            <span className="hidden sm:block text-right">Without drug</span>
            <span className="hidden sm:block text-right">With drug</span>
          </>
        ) : (
          <span className="hidden sm:block text-right">Ratio</span>
        )}
        <span className="text-right">Change</span>
        <span />
      </ColumnHead>
      <ul>
        {changes.map(r => {
          const id = `change-${r.key}`;
          const strong = isStrongChange(r.key, r.ratio);
          const rank = rankOf.get(r.key) ?? 0;
          return (
            <Row
              key={r.key}
              grid={changeGrid}
              open={open === id}
              onToggle={() => toggle(id)}
              panelId={`bm-${id}`}
              cells={
                <>
                  <Name k={r.key} mark={rank > 0 && rank <= 3} open={open === id} markColor={tierColor} />
                  <SplitBar value={r.change === null ? null : r.change / maxDev} tone={strong ? 'accent' : 'muted'} />
                  {hasRaw ? (
                    <>
                      <span className="hidden sm:block text-right font-mono text-sm tabular-nums text-foreground/70">{fmtNum(control?.[r.key])}</span>
                      <span className="hidden sm:block text-right font-mono text-sm tabular-nums text-foreground">{fmtNum(drug?.[r.key])}</span>
                    </>
                  ) : (
                    <span className="hidden sm:block text-right font-mono text-sm tabular-nums text-foreground/70">{fmtNum(r.ratio)}</span>
                  )}
                  <span className={`text-right font-mono text-sm tabular-nums ${strong ? 'text-accent font-semibold' : 'text-foreground/70'}`}>
                    {formatChange(r.change)}
                  </span>
                </>
              }
              detail={detail(r)}
            />
          );
        })}
      </ul>
    </>
  );

  return (
    <section aria-labelledby="biomarkers-heading">
      <SectionHead id="biomarkers-heading" title="11 biomarkers" meta={<span className="sm:hidden">Swipe to switch</span>} />

      <div className="mt-5">
        <TabRail
          tabs={SLIDES}
          value={SLIDES[slide].id}
          onChange={id => goTo(SLIDES.findIndex(s => s.id === id))}
          label="Biomarker view"
          railRef={rail}
          panelPrefix="slide"
        />
      </div>

      {/* Dua slide berdampingan; geser horizontal dengan snap. Keterangan ikut di dalam slide,
          jadi tidak ada teks di luar yang berganti (dan menggeser tata letak) saat berpindah. */}
      <div
        ref={scroller}
        onScroll={onScroll}
        className="mt-5 flex items-start overflow-x-auto snap-x snap-mandatory overscroll-x-contain scrollbar-hide [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
      >
        <div id="slide-drivers" role="tabpanel" inert={slide !== 0} className="w-full shrink-0 snap-start snap-always">
          <p className="mb-4 text-sm text-foreground/70 leading-relaxed">
            Which biomarkers moved the risk model most, from SHAP. Bars to the right pushed it toward this result.{' '}
            <span className="text-foreground/70" style={tierColor ? { color: tierColor } : undefined}>●</span> marks the top three.
          </p>
          {driversBody}
        </div>
        <div id="slide-change" role="tabpanel" inert={slide !== 1} className="w-full shrink-0 snap-start snap-always">
          <p className="mb-4 text-sm text-foreground/70 leading-relaxed">
            How far each biomarker moved from the drug-free cell, largest first. <span className="text-accent">Red</span>: qNet
            below 0.9, APD50 or APD90 above 1.1, or any other biomarker that moved more than 10%.
          </p>
          {changeBody}
        </div>
      </div>
    </section>
  );
}
