'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { cachedGet } from '@/lib/historyCache';
import { getTierCssVar, normalizeTier } from '@/lib/tierColor';
import { secondaryBtn } from '../../components/report/ui';
import { Bone } from '../../components/Skeletons';

/*
 * Bagian bersama riwayat Prediction & SHAP: ambil data, pencarian & filter tier, baris yang bisa dibuka,
 * dan navigasi halaman. Detail tiap baris dibuka selebar penuh (bukan di dalam sel tabel), jadi tidak
 * berdempet di ponsel.
 */

export const PAGE_SIZE = 50;

/** Warna baris selang-seling (solid, sama dengan laporan risiko) */
export const ZEBRA = 'odd:bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]';

/* ---------- Data ---------- */

type Fetched<T> = { key: string; items: T[]; total: number; error: boolean };
/** Batas aman saat memuat semua catatan untuk pencarian (40 × 50 = 2000 catatan) */
const MAX_PAGES = 40;

async function fetchPage<T>(endpoint: string, offset: number) {
  // Lewat cache: berpindah tab atau kembali ke halaman ini tidak meminta data yang sama lagi
  const sep = endpoint.includes('?') ? '&' : '?';
  const res = await cachedGet<{ items?: T[]; total?: number } | null>(`${endpoint}${sep}limit=${PAGE_SIZE}&offset=${offset}`);
  const items = res?.items ?? [];
  return { items, total: res?.total ?? items.length };
}

/** Semua catatan sebuah endpoint (halaman demi halaman lewat cache), dibatasi MAX_PAGES */
export async function fetchAllPages<T>(endpoint: string): Promise<{ items: T[]; total: number }> {
  const first = await fetchPage<T>(endpoint, 0);
  const pages = Math.min(MAX_PAGES, Math.ceil(first.total / PAGE_SIZE));
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) => fetchPage<T>(endpoint, (i + 1) * PAGE_SIZE)),
  );
  return { items: [first, ...rest].flatMap(r => r.items), total: first.total };
}

/**
 * Riwayat dengan pencarian & satu filter (default: tier; halaman admin memakai filter lain).
 * Tanpa pencarian/filter: satu halaman dari server per kali (limit/offset).
 * Dengan pencarian/filter: semua catatan dimuat sekali, lalu disaring & dibagi per halaman di browser,
 * jadi hasilnya mencakup seluruh riwayat, bukan hanya halaman yang sedang terbuka.
 * `test` harus fungsi tingkat modul (stabil). `allValue` = nilai filter yang berarti "semua".
 */
export function useHistory<T, F extends string = TierFilterValue>(
  endpoint: string,
  test: (item: T, query: string, filter: F) => boolean,
  allValue = 'all' as F,
) {
  const [page, setPage] = useState(0);
  const [query, setQueryState] = useState('');
  const [filter, setFilterState] = useState<F>(allValue);
  const q = query.trim().toLowerCase();
  const filtering = q !== '' || filter !== allValue;

  // `key` = request yang hasilnya sedang disimpan; loading = key belum sama dengan request saat ini
  const [paged, setPaged] = useState<Fetched<T>>({ key: '', items: [], total: 0, error: false });
  const [all, setAll] = useState<Fetched<T>>({ key: '', items: [], total: 0, error: false });
  const pageKey = `${endpoint}#${page}`;
  const allKey = `${endpoint}#all`;

  useEffect(() => {
    if (filtering) return;
    let alive = true;
    fetchPage<T>(endpoint, page * PAGE_SIZE)
      .then(r => { if (alive) setPaged({ key: pageKey, ...r, error: false }); })
      .catch(err => {
        console.error(`Failed to fetch ${endpoint}:`, err);
        if (alive) setPaged(s => ({ ...s, key: pageKey, error: true }));
      });
    return () => { alive = false; };
  }, [endpoint, page, pageKey, filtering]);

  useEffect(() => {
    if (!filtering || all.key === allKey) return;
    let alive = true;
    fetchAllPages<T>(endpoint)
      .then(r => { if (alive) setAll({ key: allKey, ...r, error: false }); })
      .catch(err => {
        console.error(`Failed to fetch all of ${endpoint}:`, err);
        if (alive) setAll(s => ({ ...s, key: allKey, error: true }));
      });
    return () => { alive = false; };
  }, [endpoint, allKey, all.key, filtering]);

  const matches = useMemo(
    () => (filtering ? all.items.filter(item => test(item, q, filter)) : []),
    [filtering, all.items, q, filter, test],
  );

  const setQuery = (v: string) => { setQueryState(v); setPage(0); };
  const setFilter = (v: F) => { setFilterState(v); setPage(0); };
  const common = { page, setPage, query, setQuery, filter, setFilter, filtering };

  if (filtering) {
    const loading = all.key !== allKey;
    return {
      ...common,
      items: matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
      total: matches.length,
      loading,
      error: !loading && all.error,
      pages: Math.max(1, Math.ceil(matches.length / PAGE_SIZE)),
    };
  }
  const loading = paged.key !== pageKey;
  return {
    ...common,
    items: paged.items,
    total: paged.total,
    loading,
    error: !loading && paged.error,
    pages: Math.max(1, Math.ceil(paged.total / PAGE_SIZE)),
  };
}

/** "28 Oct 2026, 14:32" (waktu lokal). Backend kadang mengirim tahun berawalan "+00". */
export function formatWhen(value?: string): string {
  if (!value) return 'Unknown time';
  const d = new Date(value.replace(/^\+00/, ''));
  return Number.isNaN(d.getTime())
    ? 'Unknown time'
    : d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ---------- Pencarian & filter tier ---------- */

export type TierFilterValue = 'all' | 'low' | 'intermediate' | 'high';
const FILTERS: { id: TierFilterValue; label: string }[] = [
  { id: 'all', label: 'All results' },
  { id: 'low', label: 'Low' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'high', label: 'High' },
];

export const matchesTier = (tier: string | null | undefined, filter: TierFilterValue) =>
  filter === 'all' || (!!tier && /high|inter|low|medium|moderate/i.test(tier) && normalizeTier(tier) === filter);

/** Cocok kalau salah satu teks catatan memuat kata kunci (huruf kecil) */
export const matchesQuery = (query: string, parts: (string | null | undefined)[]) =>
  !query || parts.some(p => !!p && p.toLowerCase().includes(query));

/** Kolom cari + tombol filter (ikon) di sebelahnya; pilihan filter baru muncul saat tombol diklik. */
export function HistoryControls({ query, onQuery, filter, placeholder, summary }: {
  query: string;
  onQuery: (v: string) => void;
  /** Tombol filter, mis. <TierFilter /> atau <FilterMenu /> */
  filter: React.ReactNode;
  placeholder: string;
  /** Teks kecil di bawah (mis. jumlah hasil pencarian); kosong = tidak ditampilkan */
  summary?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={e => onQuery(e.target.value)}
            placeholder={placeholder}
            enterKeyHint="search"
            className="w-full h-11 pl-10 pr-10 rounded-control border border-foreground/12 bg-surface-white/80 text-sm text-foreground placeholder:text-foreground/45
              outline-none transition-[border-color,box-shadow] duration-200 focus:border-action/50 focus:ring-4 focus:ring-action/10
              [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-chip text-foreground/50 hover:text-action hover:bg-action/10 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </label>
        {filter}
      </div>
      <p className="text-sm text-foreground/70 empty:hidden" aria-live="polite">{summary}</p>
    </div>
  );
}

export type FilterOption<F extends string> = { id: F; label: string; dot?: string };

/**
 * Tombol filter berikon. Diklik: menu kecil berisi pilihan muncul di bawahnya (tidak ditampilkan
 * terus-menerus). Saat filter aktif, tombol menjadi gelap dan menampilkan namanya.
 * Menutup saat memilih, klik di luar, atau Escape.
 */
export function FilterMenu<F extends string>({ options, value, onChange, label, allValue = 'all' as F }: {
  options: readonly FilterOption<F>[];
  value: F;
  onChange: (v: F) => void;
  /** Judul menu & label aksesibilitas, mis. "Filter by risk" */
  label: string;
  allValue?: F;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const active = value !== allValue ? options.find(o => o.id === value) : undefined;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={active ? `${label}: ${active.label}` : label}
        className={`h-11 inline-flex items-center gap-2 rounded-control border px-3.5 text-sm font-medium transition-colors duration-200
          ${active
            ? 'bg-action border-action text-surface-white'
            : `bg-surface-white/80 border-foreground/12 text-foreground/70 hover:border-foreground/30 hover:text-foreground ${open ? 'border-foreground/30 text-foreground' : ''}`}`}
      >
        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
        {active && <span className="hidden xs:inline max-w-28 truncate">{active.label}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-40 mt-2 w-60 origin-top-right rounded-card border border-foreground/10 bg-surface-white p-1.5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.22)]"
          >
            <p className="px-3 pt-2 pb-1.5 text-[11px] text-foreground/50">{label}</p>
            {options.map(o => {
              const checked = o.id === value;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={checked}
                  onClick={() => { onChange(o.id); setOpen(false); }}
                  className={`flex w-full items-center gap-2.5 rounded-chip px-3 py-2.5 text-left text-sm transition-colors duration-150
                    ${checked ? 'bg-foreground/[0.06] text-foreground font-medium' : 'text-foreground/75 hover:bg-foreground/[0.04] hover:text-foreground'}`}
                >
                  <span className="flex h-2 w-2 shrink-0 items-center justify-center">
                    {o.dot && <span className="h-2 w-2 rounded-full" style={{ background: o.dot }} />}
                  </span>
                  <span className="flex-1 truncate">{o.label}</span>
                  {checked && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Filter tier: tombol filter dengan titik warna tier di depan tiap pilihan. */
export function TierFilter({ value, onChange }: { value: TierFilterValue; onChange: (v: TierFilterValue) => void }) {
  return (
    <FilterMenu
      options={FILTERS.map(f => ({ id: f.id, label: f.label, dot: f.id === 'all' ? undefined : getTierCssVar(f.id) }))}
      value={value}
      onChange={onChange}
      label="Filter by risk"
    />
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
