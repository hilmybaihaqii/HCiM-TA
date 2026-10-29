'use client';

import React, { useCallback, useState } from 'react';
import {
  HistoryControls, HistoryMessage, HistoryRow, HistorySkeleton, Pager, TierFilter, TierFilterValue, TierText,
  formatWhen, matchesQuery, matchesTier, useHistory,
} from '../../../logs/components/history';
import { PredictionDetail, type PredictionLog } from '../../../logs/components/PredictionHistory';
import { personName, useAdminData } from '../../AdminData';

type AdminPrediction = PredictionLog & { user_id?: string | null };

// Ponsel: akun + waktu | hasil | panah. Desktop: waktu | akun | hasil | waktu proses | panah.
const ROW = 'grid grid-cols-[1fr_auto_1rem] sm:grid-cols-[11rem_1fr_9rem_6rem_1rem] items-center gap-3 sm:gap-4';

/** Semua prediksi risiko dari semua akun; detailnya sama dengan riwayat milik user. */
export default function AdminPredictionsPage() {
  const { byId } = useAdminData();
  const match = useCallback((log: AdminPrediction, q: string, tier: TierFilterValue) => {
    const u = log.user_id ? byId.get(log.user_id) : undefined;
    return matchesTier(log.predicted_tier, tier)
      && matchesQuery(q, [log.id, log.user_id, u?.display_name, u?.email, log.predicted_tier, formatWhen(log.created_at)]);
  }, [byId]);
  const h = useHistory<AdminPrediction>('/admin/prediction-logs', match);
  const { items: shown, total, loading, error, page, pages, setPage } = h;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <HistoryControls
        query={h.query}
        onQuery={v => { setOpen(null); h.setQuery(v); }}
        filter={<TierFilter value={h.filter} onChange={v => { setOpen(null); h.setFilter(v); }} />}
        placeholder="Search by name, email, record ID or result"
        summary={!loading && h.filtering ? `${total} matching ${total === 1 ? 'prediction' : 'predictions'}` : null}
      />

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span className="hidden sm:block">Date & time</span>
          <span>Account</span>
          <span className="text-right sm:text-left">Result</span>
          <span className="hidden sm:block text-right">Processing</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load the predictions. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          <HistoryMessage>{h.filtering ? 'No predictions match your search.' : 'No predictions yet.'}</HistoryMessage>
        ) : (
          <ul>
            {shown.map(log => {
              const owner = personName(log.user_id ? byId.get(log.user_id) : undefined, log.user_id);
              return (
                <HistoryRow
                  key={log.id}
                  id={log.id}
                  grid={ROW}
                  open={open === log.id}
                  onToggle={() => setOpen(open === log.id ? null : log.id)}
                  cells={
                    <>
                      <span className="hidden sm:block text-sm text-foreground truncate">{formatWhen(log.created_at)}</span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm text-foreground truncate">{owner}</span>
                        <span className="sm:hidden text-xs text-foreground/55 truncate">{formatWhen(log.created_at)}</span>
                      </span>
                      <span className="justify-self-end sm:justify-self-start"><TierText tier={log.predicted_tier} /></span>
                      <span className="hidden sm:block text-right font-mono text-xs text-foreground/70 tabular-nums">{log.latency_ms ?? '—'} ms</span>
                    </>
                  }
                >
                  <PredictionDetail log={log} owner={owner} />
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
