'use client';

import React, { useMemo, useState } from 'react';
import { SHORT_DESC } from '../../components/report/biomarkerText';
import {
  HistoryMessage, HistoryRow, HistorySkeleton, Pager, TierFilter, TierText, TierFilterValue, ValueRows,
  formatWhen, matchesTier, useHistoryPage,
} from './history';

interface Contribution {
  feature?: string;
  biomarker?: string;
  shap?: number;
  value?: number;
}

interface ShapLog {
  id: string;
  predicted_class: string;
  base_value: number;
  contributions: Contribution[];
  created_at: string;
}

const numFmt = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
const fmtShap = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(3)}`;
const nameOf = (c: Contribution) => c.biomarker || c.feature || '—';

const sortByInfluence = (list: Contribution[] = []) => [...list].sort((a, b) => Math.abs(b.shap ?? 0) - Math.abs(a.shap ?? 0));

// Ponsel: waktu | kelas | panah. Desktop: + faktor utama.
const ROW = 'grid grid-cols-[1fr_auto_1rem] sm:grid-cols-[13rem_9rem_1fr_1rem] items-center gap-3 sm:gap-4';

function ShapDetail({ log }: { log: ShapLog }) {
  const sorted = sortByInfluence(log.contributions);
  const maxAbs = Math.max(1e-9, ...sorted.map(c => Math.abs(c.shap ?? 0)));
  const tier = (log.predicted_class || '').toLowerCase();

  if (sorted.length === 0) return <p className="text-sm text-foreground/70">No contributions were stored for this analysis.</p>;

  return (
    <div className="flex flex-col gap-5">
      {/* Satu baris: kiri penjelasan singkat, kanan nilai dasar */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
        <p className="text-foreground/70">
          How much each biomarker pushed the model toward <span className="capitalize text-foreground">{tier || 'this result'}</span> (+) or away from it (−).
        </p>
        <p className="text-foreground/60 text-xs">Base value <span className="font-mono text-foreground/80">{Number.isFinite(log.base_value) ? log.base_value.toFixed(4) : '—'}</span></p>
      </div>
      <ValueRows
        headers={['Biomarker', 'Push on the model', 'SHAP', 'Value']}
        rows={sorted.map((c, i) => {
          const shap = c.shap ?? 0;
          const name = nameOf(c);
          return {
            key: name,
            hint: SHORT_DESC[name as keyof typeof SHORT_DESC],
            bar: shap / maxAbs,
            strong: i < 3 && Math.abs(shap) > 0,
            main: fmtShap(shap),
            second: typeof c.value === 'number' ? numFmt.format(c.value) : '—',
          };
        })}
      />
      <p className="text-xs text-foreground/60 truncate">Record <span className="font-mono text-foreground/80">{log.id}</span></p>
    </div>
  );
}

/** Riwayat SHAP: satu baris per analisis, buka untuk melihat pengaruh tiap biomarker. */
export default function ShapHistory() {
  const { items, total, loading, error, page, pages, setPage } = useHistoryPage<ShapLog>('/api/history/explanations');
  const [filter, setFilter] = useState<TierFilterValue>('all');
  const [open, setOpen] = useState<string | null>(null);
  const shown = useMemo(() => items.filter(l => matchesTier(l.predicted_class, filter)), [items, filter]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-foreground/70">
          {filter === 'all' ? `${total} analyses` : `${shown.length} of ${items.length} on this page`}
        </p>
        <TierFilter value={filter} onChange={setFilter} />
      </div>

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span>Date & time</span>
          <span className="text-right sm:text-left">Explained result</span>
          <span className="hidden sm:block">Main factor</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load your SHAP analyses. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          <HistoryMessage>{items.length === 0 ? 'No SHAP analyses yet.' : 'No analyses with this result on this page.'}</HistoryMessage>
        ) : (
          <ul>
            {shown.map(log => {
              const top = sortByInfluence(log.contributions)[0];
              return (
                <HistoryRow
                  key={log.id}
                  id={log.id}
                  grid={ROW}
                  open={open === log.id}
                  onToggle={() => setOpen(open === log.id ? null : log.id)}
                  cells={
                    <>
                      <span className="text-sm text-foreground truncate">{formatWhen(log.created_at)}</span>
                      <span className="justify-self-end sm:justify-self-start"><TierText tier={log.predicted_class} /></span>
                      <span className="hidden sm:block text-sm text-foreground/70 truncate">
                        {top ? <><span className="font-medium text-foreground">{nameOf(top)}</span> {fmtShap(top.shap ?? 0)}</> : '—'}
                      </span>
                    </>
                  }
                >
                  <ShapDetail log={log} />
                </HistoryRow>
              );
            })}
          </ul>
        )}
      </div>

      <Pager page={page} pages={pages} disabled={loading} onChange={p => { setOpen(null); setPage(p); }} />
    </div>
  );
}
