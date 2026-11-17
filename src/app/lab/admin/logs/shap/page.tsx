'use client';

import React, { useCallback, useState } from 'react';
import {
  HistoryControls, HistoryMessage, HistoryRow, HistorySkeleton, Pager, TierFilter, TierFilterValue, TierText,
  formatWhen, matchesQuery, matchesTier, useHistory,
} from '../../../logs/components/history';
import { ShapDetail, fmtShap, nameOf, sortByInfluence, type ShapLog } from '../../../logs/components/ShapHistory';
import { personName, useAdminData } from '../../AdminData';

type AdminShap = ShapLog & { user_id?: string | null };

// Ponsel: akun + waktu | hasil | panah. Desktop: waktu | akun | hasil | faktor utama | panah.
const ROW = 'grid grid-cols-[1fr_auto_1rem] sm:grid-cols-[11rem_1fr_9rem_10rem_1rem] items-center gap-3 sm:gap-4';

/** Semua analisis SHAP dari semua akun; detailnya sama dengan riwayat milik user. */
export default function AdminShapPage() {
  const { byId } = useAdminData();
  const match = useCallback((log: AdminShap, q: string, tier: TierFilterValue) => {
    if (!matchesTier(log.predicted_class, tier)) return false;
    const u = log.user_id ? byId.get(log.user_id) : undefined;
    const top = sortByInfluence(log.contributions)[0];
    return matchesQuery(q, [log.id, log.prediction_id, log.user_id, u?.display_name, u?.email, log.predicted_class,
      formatWhen(log.created_at), top ? nameOf(top) : null]);
  }, [byId]);
  const h = useHistory<AdminShap>('/admin/shap-logs', match);
  const { items: shown, total, loading, error, page, pages, setPage } = h;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <HistoryControls
        query={h.query}
        onQuery={v => { setOpen(null); h.setQuery(v); }}
        filter={<TierFilter value={h.filter} onChange={v => { setOpen(null); h.setFilter(v); }} />}
        placeholder="Search by name, email, record ID or main factor"
        summary={!loading && h.filtering ? `${total} matching ${total === 1 ? 'analysis' : 'analyses'}` : null}
      />

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span className="hidden sm:block">Date & time</span>
          <span>Account</span>
          <span className="text-right sm:text-left">Explained result</span>
          <span className="hidden sm:block">Main factor</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load the SHAP analyses. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          <HistoryMessage>{h.filtering ? 'No analyses match your search.' : 'No SHAP analyses yet.'}</HistoryMessage>
        ) : (
          <ul>
            {shown.map(log => {
              const owner = personName(log.user_id ? byId.get(log.user_id) : undefined, log.user_id);
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
                      <span className="hidden sm:block text-sm text-foreground truncate">{formatWhen(log.created_at)}</span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm text-foreground truncate">{owner}</span>
                        <span className="sm:hidden text-xs text-foreground/55 truncate">{formatWhen(log.created_at)}</span>
                      </span>
                      <span className="justify-self-end sm:justify-self-start"><TierText tier={log.predicted_class} /></span>
                      <span className="hidden sm:block text-sm text-foreground/70 truncate">
                        {top ? <><span className="font-medium text-foreground">{nameOf(top)}</span> {fmtShap(top.shap ?? 0)}</> : '—'}
                      </span>
                    </>
                  }
                >
                  <ShapDetail log={log} owner={owner} />
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
