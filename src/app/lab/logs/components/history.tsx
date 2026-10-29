'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { getTierCssVar, normalizeTier } from '@/lib/tierColor';
import { SlideIndicator, secondaryBtn } from '../../components/report/ui';
import { Bone } from '../../components/Skeletons';

/*
 * Bagian bersama riwayat Prediction & SHAP: ambil data per halaman, filter tier, baris yang bisa dibuka,
 * dan navigasi halaman. Detail tiap baris dibuka selebar penuh (bukan di dalam sel tabel), jadi tidak
 * berdempet di ponsel.
 */

export const PAGE_SIZE = 50;

/** Warna baris selang-seling (solid, sama dengan laporan risiko) */
export const ZEBRA = 'odd:bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]';

/* ---------- Data ---------- */

export function useHistoryPage<T>(endpoint: string) {
  const [page, setPage] = useState(0);
  // `key` = request yang hasilnya sedang disimpan; loading = key belum sama dengan request saat ini
  const [state, setState] = useState<{ key: string; items: T[]; total: number; error: boolean }>({
    key: '', items: [], total: 0, error: false,
  });
  const url = `${endpoint}?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`;

  useEffect(() => {
    let alive = true;
    api(url)
      .then((res: { items?: T[]; total?: number } | null) => {
        if (!alive) return;
        const items = res?.items ?? [];
        setState({ key: url, items, total: res?.total ?? items.length, error: false });
      })
      .catch(err => {
        console.error(`Failed to fetch ${url}:`, err);
        if (alive) setState(s => ({ ...s, key: url, error: true }));
      });
    return () => { alive = false; };
  }, [url]);

  const loading = state.key !== url;
  const pages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  return { items: state.items, total: state.total, error: !loading && state.error, loading, page, pages, setPage };
}

/** "28 Oct 2026, 14:32" (waktu lokal). Backend kadang mengirim tahun berawalan "+00". */
export function formatWhen(value?: string): string {
  if (!value) return 'Unknown time';
  const d = new Date(value.replace(/^\+00/, ''));
  return Number.isNaN(d.getTime())
    ? 'Unknown time'
    : d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ---------- Filter tier ---------- */

export type TierFilterValue = 'all' | 'low' | 'intermediate' | 'high';
const FILTERS: { id: TierFilterValue; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'high', label: 'High' },
];

export const matchesTier = (tier: string | null | undefined, filter: TierFilterValue) =>
  filter === 'all' || (!!tier && /high|inter|low|medium|moderate/i.test(tier) && normalizeTier(tier) === filter);

export function TierFilter({ value, onChange }: { value: TierFilterValue; onChange: (v: TierFilterValue) => void }) {
  const index = FILTERS.findIndex(f => f.id === value);
  return (
    <div role="radiogroup" aria-label="Filter by risk" className="relative grid grid-cols-4 p-1 rounded-control bg-foreground/6 w-full sm:w-auto sm:min-w-[22rem]">
      <span className="absolute inset-1 pointer-events-none">
        <SlideIndicator index={index} count={FILTERS.length} className="inset-y-0 left-0 rounded-[calc(var(--radius-control)-4px)] bg-surface-white border border-foreground/15 shadow-sm" />
      </span>
      {FILTERS.map(f => (
        <button
          key={f.id}
          type="button"
          role="radio"
          aria-checked={value === f.id}
          onClick={() => onChange(f.id)}
          className={`relative z-10 px-1.5 py-1.5 text-xs font-medium transition-colors ${value === f.id ? 'text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Tier: titik warna + teks ---------- */

export function TierText({ tier }: { tier?: string | null }) {
  const known = !!tier && /high|inter|low|medium|moderate/i.test(tier);
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground capitalize min-w-0">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: known ? getTierCssVar(tier!) : 'currentColor', opacity: known ? 1 : 0.3 }} />
      <span className="truncate">{known ? normalizeTier(tier!) : tier || 'Unknown'}</span>
    </span>
  );
}

/* ---------- Baris riwayat ---------- */

/** Baris yang bisa dibuka. `cells` = isi ringkas (ikut kolom `grid`), `children` = detail selebar penuh. */
export function HistoryRow({ grid, cells, open, onToggle, children, id }: {
  grid: string;
  cells: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <li className={`rounded-chip ${ZEBRA}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`row-${id}`}
        className={`${grid} w-full px-2 sm:px-3 py-3.5 text-left group`}
      >
        {cells}
        <ChevronDown className={`w-4 h-4 text-foreground/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`row-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-2 sm:px-3 pb-6 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Kerangka saat memuat: bentuk baris yang sama */
export function HistorySkeleton({ grid }: { grid: string }) {
  return (
    <ul aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className={`rounded-chip ${ZEBRA}`}>
          <div className={`${grid} px-2 sm:px-3 py-4`}>
            <Bone className="h-3 w-28" />
            <Bone className="h-3 w-20" />
            <Bone className="hidden sm:block h-3 w-14 justify-self-end" />
            <span />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function HistoryMessage({ children }: { children: React.ReactNode }) {
  return <p className="py-14 text-center text-sm text-foreground/70 text-balance">{children}</p>;
}

/* ---------- Navigasi halaman ---------- */

export function Pager({ page, pages, onChange, disabled }: {
  page: number; pages: number; onChange: (p: number) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <span className="text-sm text-foreground/70">Page {page + 1} of {pages}</span>
      <div className="flex gap-2">
        <button type="button" onClick={() => onChange(page - 1)} disabled={disabled || page === 0} className={`${secondaryBtn} px-3 disabled:opacity-40 disabled:pointer-events-none`}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Prev
        </button>
        <button type="button" onClick={() => onChange(page + 1)} disabled={disabled || page >= pages - 1} className={`${secondaryBtn} px-3 disabled:opacity-40 disabled:pointer-events-none`}>
          Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ---------- Daftar 11 nilai di panel detail ---------- */

// Kolom: nama | bar dua arah | angka utama | angka kedua. Lebar tetap supaya angka tidak berdempet di ponsel.
export const VALUE_GRID = 'grid grid-cols-[5.25rem_1fr_3.5rem_4rem] sm:grid-cols-[13rem_1fr_4.5rem_5rem] items-center gap-2 sm:gap-4';

export type ValueRow = {
  key: string;
  hint?: string;
  /** -1..1, posisi bar dua arah dari tengah */
  bar: number | null;
  strong?: boolean;
  main: string;
  second: string;
};

export function ValueRows({ rows, headers }: { rows: ValueRow[]; headers: [string, string, string, string] }) {
  return (
    <div>
      <div className={`${VALUE_GRID} px-2 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
        <span>{headers[0]}</span>
        <span className="text-center">{headers[1]}</span>
        <span className="text-right">{headers[2]}</span>
        <span className="text-right">{headers[3]}</span>
      </div>
      <ul>
        {rows.map(r => (
          <li key={r.key} className={`${VALUE_GRID} px-2 py-2.5 rounded-chip odd:bg-surface-white/70`}>
            <span className="min-w-0 truncate text-sm">
              <span className="font-medium text-foreground">{r.key}</span>
              {r.hint && <span className="hidden sm:inline ml-2 text-xs text-foreground/60">{r.hint}</span>}
            </span>
            <span className="relative h-1.5" aria-hidden="true">
              <span className="absolute left-1/2 -top-1 -bottom-1 w-px bg-foreground/25" />
              {r.bar !== null && (
                <span
                  className={`absolute top-0 bottom-0 rounded-full ${r.strong ? 'bg-accent' : 'bg-foreground/35'}`}
                  style={{ ...(r.bar >= 0 ? { left: '50%' } : { right: '50%' }), width: `${Math.min(1, Math.abs(r.bar)) * 50}%` }}
                />
              )}
            </span>
            <span className={`text-right font-mono text-xs sm:text-sm tabular-nums ${r.strong ? 'text-accent font-semibold' : 'text-foreground'}`}>{r.main}</span>
            <span className="text-right font-mono text-xs sm:text-sm tabular-nums text-foreground/70">{r.second}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
