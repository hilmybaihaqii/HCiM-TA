'use client';

import React, { useMemo, useState } from 'react';
import { FEATURES, formatChange, ratioChange } from '@/lib/pipeline';
import { VoteBar } from '../../components/report/RiskVerdict';
import { SHORT_DESC } from '../../components/report/biomarkerText';
import {
  HistoryMessage, HistoryRow, HistorySkeleton, Pager, TierFilter, TierText, TierFilterValue, ValueRows,
  formatWhen, matchesTier, useHistoryPage,
} from './history';

type Confidence = { confidence: number; label: string };

interface PredictionLog {
  id: string;
  input: number[];
  predicted_tier: string;
  probabilities: Confidence[] | Record<string, number> | null;
  latency_ms: number;
  created_at: string;
}

/** probabilities bisa berupa daftar {label, confidence} atau objek {high: 0.9, ...} */
function toConfidences(p: PredictionLog['probabilities']): Confidence[] {
  if (Array.isArray(p)) return p;
  if (p && typeof p === 'object') return Object.entries(p).map(([label, confidence]) => ({ label, confidence }));
  return [];
}

// Ponsel: waktu | hasil | panah. Desktop: + waktu proses.
const ROW = 'grid grid-cols-[1fr_auto_1rem] sm:grid-cols-[13rem_1fr_6rem_1rem] items-center gap-3 sm:gap-4';

function PredictionDetail({ log }: { log: PredictionLog }) {
  const confidences = toConfidences(log.probabilities);
  const known = /high|inter|low|medium|moderate/i.test(log.predicted_tier || '');
  const input = Array.isArray(log.input) ? log.input : [];
  const changes = FEATURES.map((_, i) => ratioChange(input[i]));
  const maxDev = Math.max(0.1, ...changes.map(c => Math.abs(c ?? 0)));

  return (
    <div className="flex flex-col gap-8">
      {known && confidences.length > 0 && (
        <VoteBar prediction={{ confidences, predictedLabel: log.predicted_tier.toLowerCase() }} />
      )}
      {input.length > 0 ? (
        <ValueRows
          headers={['Biomarker', 'Change from the drug-free cell', 'Change', 'Ratio']}
          rows={FEATURES.map((key, i) => ({
            key,
            hint: SHORT_DESC[key],
            bar: changes[i] === null ? null : (changes[i] as number) / maxDev,
            strong: Math.abs(changes[i] ?? 0) >= 0.1,
            main: formatChange(changes[i]),
            second: typeof input[i] === 'number' ? input[i].toFixed(3) : '—',
          }))}
        />
      ) : (
        <p className="text-sm text-foreground/70">No input values were stored for this prediction.</p>
      )}
      <dl className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-xs text-foreground/60">
        <div className="flex gap-2"><dt>Processing time</dt><dd className="font-mono text-foreground/80">{log.latency_ms ?? '—'} ms</dd></div>
        <div className="flex gap-2 min-w-0"><dt>Record</dt><dd className="font-mono text-foreground/80 truncate">{log.id}</dd></div>
      </dl>
    </div>
  );
}

/** Riwayat prediksi: satu baris per prediksi, buka untuk melihat vote & 11 biomarker yang dikirim. */
export default function PredictionHistory() {
  const { items, total, loading, error, page, pages, setPage } = useHistoryPage<PredictionLog>('/api/history/predictions');
  const [filter, setFilter] = useState<TierFilterValue>('all');
  const [open, setOpen] = useState<string | null>(null);
  const shown = useMemo(() => items.filter(l => matchesTier(l.predicted_tier, filter)), [items, filter]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-foreground/70">
          {filter === 'all' ? `${total} predictions` : `${shown.length} of ${items.length} on this page`}
        </p>
        <TierFilter value={filter} onChange={setFilter} />
      </div>

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span>Date & time</span>
          <span className="text-right sm:text-left">Result</span>
          <span className="hidden sm:block text-right">Processing</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load your predictions. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          <HistoryMessage>{items.length === 0 ? 'No predictions yet.' : 'No predictions with this result on this page.'}</HistoryMessage>
        ) : (
          <ul>
            {shown.map(log => (
              <HistoryRow
                key={log.id}
                id={log.id}
                grid={ROW}
                open={open === log.id}
                onToggle={() => setOpen(open === log.id ? null : log.id)}
                cells={
                  <>
                    <span className="text-sm text-foreground truncate">{formatWhen(log.created_at)}</span>
                    <span className="justify-self-end sm:justify-self-start"><TierText tier={log.predicted_tier} /></span>
                    <span className="hidden sm:block text-right font-mono text-xs text-foreground/70 tabular-nums">{log.latency_ms ?? '—'} ms</span>
                  </>
                }
              >
                <PredictionDetail log={log} />
              </HistoryRow>
            ))}
          </ul>
        )}
      </div>

      <Pager page={page} pages={pages} disabled={loading} onChange={p => { setOpen(null); setPage(p); }} />
    </div>
  );
}
