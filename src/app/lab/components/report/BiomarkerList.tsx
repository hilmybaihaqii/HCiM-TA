'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FEATURES, formatChange, ratioChange } from '@/lib/pipeline';
import type { ShapData } from '@/lib/predict';
import { BIOMARKER_INFO, SHORT_DESC } from './biomarkerText';
import { SectionHead, secondaryBtn } from './ui';

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

/** Ponsel: kolom kecil rata tengah (tiga berdampingan). Desktop: baris label kiri, nilai kanan. */
function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center md:text-left md:flex md:items-baseline md:justify-between md:gap-4 md:py-2.5">
      <dt className="text-[11px] md:text-xs text-foreground/70">{label}</dt>
      <dd className={`mt-1 md:mt-0 font-mono text-sm tabular-nums ${accent ? 'text-accent font-semibold' : 'text-foreground'}`}>{value}</dd>
    </div>
  );
}

// Kolom: nama | bar perubahan | persen | pengaruh SHAP (md+) | panah
const ROW_GRID = 'grid grid-cols-[6.25rem_1fr_3.25rem_1rem] sm:grid-cols-[13rem_1fr_4rem_1rem] md:grid-cols-[14rem_1fr_4rem_6.5rem_1rem] items-center gap-3 sm:gap-5';
const ROW_PAD = 'px-2 sm:px-3';

/**
 * 11 biomarker: perubahan dari sel tanpa obat. Setelah SHAP tersedia, urutannya menurut pengaruh ke model
 * (|SHAP|), bukan besar perubahan; kolom Influence menunjukkan angkanya. Ketuk baris untuk penjelasan.
 */
export default function BiomarkerList({ ratios, control, drug, tier, shap, explaining = false, shapError, onExplain }: {
  ratios: (number | null)[];
  /** Nilai mentah sel tanpa obat (Full Pipeline) */
  control?: Record<string, number | null>;
  /** Nilai mentah dengan obat (Full Pipeline) */
  drug?: Record<string, number | null>;
  /** Tier yang diprediksi, kalau sudah ada */
  tier?: string;
  shap?: ShapData | null;
  explaining?: boolean;
  shapError?: string;
  /** Minta SHAP; panduan API: explain lebih lambat, jadi hanya atas permintaan */
  onExplain?: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const influence = new Map((shap?.contributions ?? []).map(c => [c.biomarker, c.shap]));
    const list = FEATURES.map((key, i) => ({
      key,
      ratio: ratios[i],
      change: ratioChange(ratios[i], control?.[key]),
      shap: influence.get(key),
    }));
    if (shap) list.sort((a, b) => Math.abs(b.shap ?? 0) - Math.abs(a.shap ?? 0));
    return list.map((r, i) => ({ ...r, rank: shap ? i + 1 : 0 }));
  }, [ratios, control, shap]);

  const maxDev = Math.max(0.1, ...rows.map(r => Math.abs(r.change ?? 0)));
  const maxShap = Math.max(1e-9, ...rows.map(r => Math.abs(r.shap ?? 0)));
  const knownTier = tier && tier !== 'unknown' ? tier : undefined;
  const canExplain = !shap && !!knownTier && !explaining && !!onExplain;

  let note: React.ReactNode;
  if (shap) {
    note = <>Sorted by influence on the model (SHAP), not by size of change. <span className="text-accent">●</span> marks the top three.</>;
  } else if (explaining) {
    note = <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>Computing the main drivers (SHAP)…</motion.span>;
  } else if (shapError) {
    note = <>Could not load the main drivers. {shapError}</>;
  } else if (canExplain) {
    note = 'Tap a row to see what each biomarker means. The main drivers (SHAP) take a few seconds to compute.';
  } else {
    note = 'Tap a row to see what each biomarker means.';
  }

  return (
    <section aria-labelledby="biomarkers-heading">
      <SectionHead id="biomarkers-heading" title="11 biomarkers" meta={shap ? 'Most influential first' : undefined} />
      {/* Catatan di kiri, tombol di kanan; di ponsel tombol selebar layar */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-sm text-foreground/70 leading-relaxed">{note}</p>
        {canExplain && (
          <button type="button" onClick={onExplain} className={`${secondaryBtn} w-full sm:w-auto`}>
            {shapError ? 'Try again' : 'Show main drivers'}
          </button>
        )}
      </div>

      {/* Judul kolom */}
      <div className={`${ROW_GRID} ${ROW_PAD} mt-5 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
        <span>Biomarker</span>
        <span className="text-center">Change from the drug-free cell</span>
        <span className="text-right">%</span>
        <span className="hidden md:block text-right">{shap ? 'Influence' : ''}</span>
        <span />
      </div>

      <ul>
        {rows.map(r => {
          const has = r.change !== null;
          const dev = r.change ?? 0;
          const width = (Math.abs(dev) / maxDev) * 50;
          const strong = Math.abs(dev) >= 0.1;
          const isOpen = open === r.key;
          const influence = influenceSentence(r.shap, r.rank, knownTier);
          return (
            <li key={r.key} className="rounded-chip odd:bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.key)}
                aria-expanded={isOpen}
                aria-controls={`bm-${r.key}`}
                className={`${ROW_GRID} ${ROW_PAD} w-full py-3 text-left group`}
              >
                <span className="min-w-0 truncate text-sm">
                  <span className={`font-medium transition-colors ${isOpen ? 'text-accent' : 'text-foreground group-hover:text-accent'}`}>{r.key}</span>
                  {r.rank > 0 && r.rank <= 3 && <span className="ml-1.5 text-accent" aria-label="main driver">●</span>}
                  <span className="hidden sm:inline ml-2 text-xs text-foreground/60">{SHORT_DESC[r.key]}</span>
                </span>

                {/* Bar dua arah dari garis tengah (= sama dengan sel tanpa obat) */}
                <span className="relative h-2" aria-hidden="true">
                  <span className="absolute left-1/2 -top-1 -bottom-1 w-px bg-foreground/25" />
                  {has && (
                    <motion.span
                      className={`absolute top-0 bottom-0 rounded-full ${strong ? 'bg-accent' : 'bg-foreground/35'}`}
                      style={dev >= 0 ? { left: '50%' } : { right: '50%' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </span>

                <span className={`text-right font-mono text-sm tabular-nums ${strong ? 'text-accent font-semibold' : 'text-foreground/70'}`}>
                  {formatChange(r.change)}
                </span>

                {/* Pengaruh ke model: bar kecil sebanding |SHAP| + angkanya */}
                <span className="hidden md:flex items-center justify-end gap-2">
                  {typeof r.shap === 'number' && (
                    <>
                      <span className="w-10 h-1.5 rounded-full bg-foreground/10 overflow-hidden flex justify-end" aria-hidden="true">
                        <span
                          className={`h-full rounded-full ${r.shap > 0 ? 'bg-foreground/70' : 'bg-foreground/30'}`}
                          style={{ width: `${(Math.abs(r.shap) / maxShap) * 100}%` }}
                        />
                      </span>
                      <span className="font-mono text-xs tabular-nums text-foreground/70">{fmtShap(r.shap)}</span>
                    </>
                  )}
                </span>

                <ChevronDown className={`w-4 h-4 text-foreground/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`bm-${r.key}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    {/* Desktop: penjelasan kiri, angka kanan. Ponsel: penjelasan, lalu tiga angka berdampingan */}
                    <div className={`${ROW_PAD} pb-5 pt-1 grid grid-cols-1 md:grid-cols-[1fr_16rem] gap-5 md:gap-10 items-start`}>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        <span className="font-medium text-foreground">{SHORT_DESC[r.key]}.</span>{' '}
                        {BIOMARKER_INFO[r.key]}
                        {influence && <> <span className="text-foreground">{influence}</span></>}
                      </p>
                      <dl className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-0 py-3 md:py-1 md:px-4 rounded-card bg-surface-white/70 md:divide-y md:divide-foreground/10">
                        {control || drug ? (
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
                        <Stat
                          label="Influence"
                          value={r.rank > 0 ? `#${r.rank} of 11` : '—'}
                          accent={r.rank > 0 && r.rank <= 3}
                        />
                      </dl>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className={`${ROW_GRID} ${ROW_PAD} mt-3 text-[11px] text-foreground/60`}>
        <span />
        <span className="flex justify-between"><span>lower</span><span>same</span><span>higher</span></span>
        <span />
        <span className="hidden md:block" />
        <span />
      </div>
    </section>
  );
}
