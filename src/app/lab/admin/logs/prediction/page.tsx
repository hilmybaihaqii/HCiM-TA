'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  FilterPanel, HistoryControls, HistoryMessage, HistoryRow, HistorySkeleton, Pager, TIER_OPTIONS, TierText,
  fetchAllPages, formatWhen, useHistory,
} from '../../../logs/components/history';
import {
  ALL_RUNS, RunDetail, isAllRuns, matchRunWith, methodLabel, methodOf, useRunOptions, type RunFilter, type RunLog,
} from '../../../logs/components/RunHistory';
import { nameOf, type ShapLog } from '../../../logs/components/ShapHistory';
import { secondaryBtn } from '../../../components/report/ui';
import LogReport, { ratiosFromShap, toPredictionOutput } from '../../../components/report/LogReport';
import { formatDrugName } from '@/lib/pipeline';
import { personName, useAdminData } from '../../AdminData';

/*
 * Riwayat prediksi semua akun, disusun sama dengan Activity Logs milik user: kolom metode input,
 * filter obat / metode / hasil, dan detail yang memakai komponen hasil yang sama.
 * Detail lengkap (simulasi per dosis, sel) hanya tampil bila backend mengizinkan detail run itu dibuka;
 * kalau tidak, dipakai laporan dari data log admin (11 rasio + SHAP), tanpa menambah data yang tidak ada.
 */

type AdminPrediction = RunLog & { user_id?: string | null };
type AdminShap = ShapLog & { user_id?: string | null };

const ENDPOINT = '/admin/prediction-logs';

// Ponsel: akun + metode | hasil | panah. Desktop: waktu | akun | metode | hasil | panah.
const ROW = 'grid grid-cols-[1fr_auto_1.75rem] sm:grid-cols-[10.5rem_minmax(0,0.9fr)_minmax(0,1.1fr)_7rem_1.75rem] items-center gap-3 sm:gap-4';

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

export default function AdminPredictionsPage() {
  const { byId } = useAdminData();
  const shapByPrediction = useShapByPrediction();

  const match = useMemo(() => matchRunWith(log => {
    const u = (log as AdminPrediction).user_id ? byId.get((log as AdminPrediction).user_id!) : undefined;
    return [(log as AdminPrediction).user_id, u?.display_name, u?.email];
  }), [byId]);

  const h = useHistory<AdminPrediction, RunFilter>(ENDPOINT, match, ALL_RUNS, isAllRuns);
  const { items: shown, total, loading, error, page, pages, setPage } = h;
  const [open, setOpen] = useState<string | null>(null);
  const opts = useRunOptions(ENDPOINT);

  const setFilter = (next: RunFilter) => {
    setOpen(null);
    h.setFilter(next);
  };
  const toggle = (group: string, id: string) => {
    const g = group as keyof RunFilter;
    const list = h.filter[g];
    setFilter({ ...h.filter, [g]: list.includes(id) ? list.filter(x => x !== id) : [...list, id] });
  };

  const labelOf = (list: readonly { id: string; label: string }[], id: string) => list.find(o => o.id === id)?.label ?? formatDrugName(id);
  const activeText = [
    h.filter.drug.length ? `Drug: ${h.filter.drug.map(d => labelOf(opts.drugs, d)).join(', ')}` : '',
    h.filter.method.length ? `Method: ${h.filter.method.join(', ')}` : '',
    h.filter.tier.length ? `Result: ${h.filter.tier.map(t => labelOf(TIER_OPTIONS, t)).join(', ')}` : '',
  ].filter(Boolean).join(' · ');

  const explained = useMemo(
    () => shown.filter(log => shapByPrediction?.has(log.id)).length,
    [shown, shapByPrediction],
  );

  return (
    <div className="flex flex-col gap-5">
      <HistoryControls
        query={h.query}
        onQuery={v => { setOpen(null); h.setQuery(v); }}
        filter={
          <FilterPanel
            onOpen={opts.load}
            onClear={() => setFilter(ALL_RUNS)}
            onToggle={toggle}
            groups={[
              { id: 'drug', title: 'Drug', options: opts.drugs, selected: h.filter.drug, loading: opts.loading, emptyText: 'No drugs recorded yet.' },
              { id: 'method', title: 'Input method', options: opts.methods, selected: h.filter.method, loading: opts.loading, emptyText: 'No input methods recorded yet.' },
              { id: 'tier', title: 'Result', options: TIER_OPTIONS, selected: h.filter.tier },
            ]}
          />
        }
        placeholder="Search by name, email, drug, input method, record ID or result"
        summary={!loading && h.filtering
          ? <>{`${total} matching ${total === 1 ? 'prediction' : 'predictions'}`}{activeText && <span className="text-foreground/50"> · {activeText}</span>}</>
          : null}
      />

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span className="hidden sm:block">Date &amp; time</span>
          <span>Account</span>
          <span className="hidden sm:block">Input method</span>
          <span className="text-right sm:text-left">Result</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load the predictions. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          h.filtering ? (
            <div className="py-14 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-foreground/70 text-balance">
                No predictions match {isAllRuns(h.filter) ? 'your search' : 'the filters you picked'}. Try fewer filters or a different search.
              </p>
              {!isAllRuns(h.filter) && (
                <button type="button" onClick={() => setFilter(ALL_RUNS)} className={secondaryBtn}>Clear filters</button>
              )}
            </div>
          ) : (
            <HistoryMessage>No predictions yet.</HistoryMessage>
          )
        ) : (
          <ul>
            {shown.map(log => {
              const owner = personName(log.user_id ? byId.get(log.user_id) : undefined, log.user_id);
              const shap = shapByPrediction?.get(log.id);
              const input = Array.isArray(log.input) ? log.input : [];
              const method = methodLabel(log);
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
                        <span className="sm:hidden text-xs text-foreground/55 truncate">{method} · {formatWhen(log.created_at)}</span>
                      </span>
                      <span className="hidden sm:block text-sm font-medium text-foreground truncate">{method}</span>
                      <span className="justify-self-end sm:justify-self-start"><TierText tier={log.predicted_tier} /></span>
                    </>
                  }
                >
                  <RunDetail
                    log={log}
                    owner={owner}
                    fallback={
                      <LogReport
                        tier={log.predicted_tier}
                        prediction={toPredictionOutput(log)}
                        ratios={input.length > 0 ? input : ratiosFromShap(shap?.contributions)}
                        shap={shap ? {
                          predicted_class: (shap.predicted_class || log.predicted_tier || '').toLowerCase(),
                          base_value: shap.base_value,
                          contributions: shap.contributions.map(c => ({ biomarker: nameOf(c), value: c.value ?? 0, shap: c.shap ?? 0 })),
                        } : null}
                        // Digital Lab hanya mengirim 11 rasio yang diketik akun itu: tidak ada rata-rata dosis yang perlu dijelaskan
                        note={methodOf(log) === 'Digital Lab' ? undefined : 'The 11 biomarker ratios stored with this record are what the risk model read. For a Full Pipeline run they are the average across the simulated concentrations.'}
                        meta={[
                          { k: 'User', v: owner },
                          { k: 'Method', v: method },
                          { k: 'Model', v: `${log.latency_ms ?? '—'} ms` },
                          { k: 'Record', v: log.id },
                          ...(shap ? [{ k: 'SHAP record', v: shap.id }] : []),
                        ]}
                      />
                    }
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
