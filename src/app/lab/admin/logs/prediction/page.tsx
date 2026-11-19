'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HistoryControls, HistoryMessage, HistoryRow, HistorySkeleton, Pager, TierFilter, TierFilterValue, TierText,
  fetchAllPages, formatWhen, matchesQuery, matchesTier, useHistory,
} from '../../../logs/components/history';
import { type PredictionLog } from '../../../logs/components/PredictionHistory';
import { fmtShap, nameOf, sortByInfluence, type ShapLog } from '../../../logs/components/ShapHistory';
import LogReport, { ratiosFromShap, toPredictionOutput } from '../../../components/report/LogReport';
import { personName, useAdminData } from '../../AdminData';

/*
 * Satu daftar untuk prediksi beserta penjelasannya: tiap baris adalah satu prediksi, dan analisis
 * SHAP-nya (bila ada) ikut di dalam baris yang sama, dicocokkan lewat prediction_id. Jadi admin
 * tidak perlu membuka dua tab untuk satu kejadian yang sama.
 */

type AdminPrediction = PredictionLog & { user_id?: string | null };
type AdminShap = ShapLog & { user_id?: string | null };

// Ponsel: akun + waktu | hasil | panah. Desktop: waktu | akun | hasil | faktor utama | panah.
const ROW = 'grid grid-cols-[1fr_auto_1.75rem] sm:grid-cols-[11rem_1fr_9rem_10rem_1.75rem] items-center gap-3 sm:gap-4';

/** Semua analisis SHAP, dipetakan dari prediksi yang dijelaskannya */
function useShapByPrediction() {
  const [map, setMap] = useState<Map<string, AdminShap> | null>(null);

  useEffect(() => {
    let alive = true;
    fetchAllPages<AdminShap>('/admin/shap-logs')
      .then(r => {
        if (!alive) return;
        const next = new Map<string, AdminShap>();
        for (const s of r.items) if (s.prediction_id) next.set(s.prediction_id, s);
        setMap(next);
      })
      .catch(() => { if (alive) setMap(new Map()); });
    return () => { alive = false; };
  }, []);

  return map;
}

/** Semua prediksi risiko dari semua akun; detailnya sama dengan riwayat milik user. */
export default function AdminPredictionsPage() {
  const { byId } = useAdminData();
  const shapByPrediction = useShapByPrediction();

  const match = useCallback((log: AdminPrediction, q: string, tier: TierFilterValue) => {
    const u = log.user_id ? byId.get(log.user_id) : undefined;
    return matchesTier(log.predicted_tier, tier)
      && matchesQuery(q, [log.id, log.user_id, u?.display_name, u?.email, log.predicted_tier, formatWhen(log.created_at)]);
  }, [byId]);

  const h = useHistory<AdminPrediction>('/admin/prediction-logs', match);
  const { items: shown, total, loading, error, page, pages, setPage } = h;
  const [open, setOpen] = useState<string | null>(null);

  const explained = useMemo(
    () => shown.filter(log => shapByPrediction?.has(log.id)).length,
    [shown, shapByPrediction],
  );

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
          <span className="hidden sm:block">Date &amp; time</span>
          <span>Account</span>
          <span className="text-right sm:text-left">Result</span>
          <span className="hidden sm:block">Main driver</span>
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
              const shap = shapByPrediction?.get(log.id);
              const top = shap ? sortByInfluence(shap.contributions)[0] : undefined;
              const input = Array.isArray(log.input) ? log.input : [];
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
                      <span className="hidden sm:block text-sm text-foreground/70 truncate">
                        {top
                          ? <><span className="font-medium text-foreground">{nameOf(top)}</span> {fmtShap(top.shap ?? 0)}</>
                          : shapByPrediction ? '—' : ''}
                      </span>
                    </>
                  }
                >
                  <LogReport
                    tier={log.predicted_tier}
                    prediction={toPredictionOutput(log)}
                    ratios={input.length > 0 ? input : ratiosFromShap(shap?.contributions)}
                    shap={shap ? {
                      predicted_class: (shap.predicted_class || log.predicted_tier || '').toLowerCase(),
                      base_value: shap.base_value,
                      contributions: shap.contributions.map(c => ({
                        biomarker: nameOf(c),
                        value: c.value ?? 0,
                        shap: c.shap ?? 0,
                      })),
                    } : null}
                    note="The 11 biomarker ratios stored with this record are what the risk model read. For a Full Pipeline run they are the average across the simulated concentrations; in Digital Lab they are the values the account entered."
                    meta={[
                      { k: 'User', v: owner },
                      { k: 'Model', v: `${log.latency_ms ?? '—'} ms` },
                      { k: 'Record', v: log.id },
                      ...(shap ? [{ k: 'SHAP record', v: shap.id }] : []),
                    ]}
                  />
                </HistoryRow>
              );
            })}
          </ul>
        )}
      </div>

      {!loading && shown.length > 0 && shapByPrediction && (
        <p className="text-xs text-foreground/55">
          {explained} of {shown.length} records on this page also have a stored driver analysis (SHAP).
        </p>
      )}

      <Pager page={page} pages={pages} disabled={loading} onChange={p => { setOpen(null); setPage(p); }} />
    </div>
  );
}
