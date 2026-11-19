'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { cachedGet } from '@/lib/historyCache';
import {
  formatDrugName,
  getDrugs,
  type DrugDb,
  type DoseRun,
  type Flags,
  type JobStatus,
  type PipelineJob,
  type PipelineRequest,
  type Trace,
} from '@/lib/pipeline';
import { normalizeTier } from '@/lib/tierColor';
import type { PredictionOutput, ShapData } from '@/lib/predict';
import RiskVerdict from '../../components/report/RiskVerdict';
import BiomarkerList from '../../components/report/BiomarkerList';
import { secondaryBtn } from '../../components/report/ui';
import { ManualInputNote } from '../../components/report/ModelInputNote';
import { Bone } from '../../components/Skeletons';
import PipelineResult, { type TracesStatus } from '../../pipeline/components/PipelineResult';
import {
  FilterPanel,
  TIER_OPTIONS,
  HistoryControls,
  HistoryMessage,
  HistoryRow,
  HistorySkeleton,
  Pager,
  TierText,
  type TierFilterValue,
  fetchAllPages,
  formatWhen,
  matchesQuery,
  matchesTier,
  useHistory,
} from './history';

/*
 * Riwayat run (satu catatan per prediksi). Baris dibuka seperti accordion; isinya memakai komponen
 * hasil yang sama dengan halaman Full Pipeline / Digital Lab, jadi riwayat terbaca persis seperti
 * saat hasil pertama kali keluar. Filter: obat, metode input, dan hasil (tier).
 */

export type Confidence = { confidence: number; label: string };

export type InputMethodInfo = {
  method: string;
  mode?: string | null;
  mode_label?: string | null;
  drug?: string | null;
};

export interface RunLog {
  id: string;
  input: number[];
  predicted_tier: string;
  probabilities: Confidence[] | Record<string, number> | null;
  latency_ms: number;
  prediction_set?: string[] | null;
  recommended_action?: string | null;
  is_ambiguous?: boolean | null;
  out_of_distribution?: boolean | null;
  alpha?: number | null;
  q_hat?: number | null;
  created_at: string;
  source: string;
  job_id?: string | null;
  input_method?: InputMethodInfo;
}

export interface RunDetailResponse {
  prediction: RunLog;
  explanation: {
    id: string;
    prediction_id?: string | null;
    input: number[];
    predicted_class?: string | null;
    base_value?: number | null;
    contributions?: {
      feature?: string;
      biomarker?: string;
      shap?: number;
      value?: number;
    }[] | null;
    latency_ms?: number | null;
    created_at: string;
  } | null;
  pipeline: {
    job_id: string;
    status: string;
    input_mode?: string | null;
    sim_params?: (PipelineRequest & { doses?: number[]; dose?: number }) | null;
    ratios?: number[] | null;
    per_dose?: DoseRun[] | null;
    doses?: number[] | null;
    dose_mode?: string | null;
    control_metrics?: Record<string, number | null> | null;
    raw_metrics?: Record<string, number | null> | null;
    sim_latency_ms?: number | null;
    traces?: {
      trace?: Trace | null;
      control_trace?: Trace | null;
      traces_by_dose?: (Trace & { dose: number })[] | null;
    } | null;
  } | null;
}

/** Format input method into a concise badge string for the collapsed row */
export function formatInputMethod(log: RunLog): string {
  const isDigitalLab = log.input_method?.method === 'digital_lab' || log.source === 'digital_lab';
  if (isDigitalLab) {
    return 'Digital Lab';
  }
  const modeLabel = log.input_method?.mode_label;
  const drug = log.input_method?.drug;
  if (modeLabel && drug) {
    const capitalizedDrug = drug.charAt(0).toUpperCase() + drug.slice(1);
    return `${modeLabel} · ${capitalizedDrug}`;
  }
  if (modeLabel) return modeLabel;
  if (drug) {
    const capitalizedDrug = drug.charAt(0).toUpperCase() + drug.slice(1);
    return `Pipeline · ${capitalizedDrug}`;
  }
  return 'Pipeline';
}

function toConfidences(p: RunLog['probabilities']): Confidence[] {
  if (Array.isArray(p)) return p;
  if (p && typeof p === 'object') {
    return Object.entries(p).map(([label, confidence]) => ({
      label,
      confidence: typeof confidence === 'number' ? confidence : Number(confidence) || 0,
    }));
  }
  return [];
}

export function historyToPredictionOutput(pred: RunLog): PredictionOutput {
  const confidences = toConfidences(pred.probabilities);
  const predictedLabel = (pred.predicted_tier || 'unknown').toLowerCase();
  const predictionSet = Array.isArray(pred.prediction_set)
    ? pred.prediction_set.map(s => String(s).toLowerCase())
    : [];

  return {
    confidences,
    predictedLabel,
    conformal: {
      alpha: pred.alpha ?? 0.05,
      calibrationNote: '',
      isAmbiguous: Boolean(pred.is_ambiguous),
      outOfDistribution: Boolean(pred.out_of_distribution),
      predictionSet,
      qHat: pred.q_hat ?? 0,
      recommendedAction: (pred.recommended_action || pred.predicted_tier || 'high').toLowerCase(),
      setSize: predictionSet.length,
    },
  };
}

/* =========================================================
   DETAIL RUN: tampilan sama dengan halaman hasil prediksi
   ========================================================= */

// Trace (~285 KB per run) hanya disimpan di memori selama halaman terbuka, bukan di sessionStorage.
const tracesMemoryCache = new Map<string, NonNullable<RunDetailResponse['pipeline']>>();

/** Database obat (CiPA risk, parameter) untuk run pipeline; satu request bersama lewat getDrugs() */
function useDrugDb(enabled: boolean) {
  const [db, setDb] = useState<DrugDb | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    getDrugs().then(d => { if (alive) setDb(d); }).catch(() => { /* detail tetap tampil tanpa db */ });
    return () => { alive = false; };
  }, [enabled]);
  return db;
}

/** Trace AP/kalsium dimuat setelah detail utama tampil, jadi vonis & biomarker tidak menunggu payload besar */
function useRunTraces(runId: string, enabled: boolean) {
  const [state, setState] = useState<{ id: string; pipe: RunDetailResponse['pipeline'] | null; status: TracesStatus }>(() => {
    const cached = tracesMemoryCache.get(runId);
    return { id: runId, pipe: cached ?? null, status: cached ? 'ready' : 'loading' };
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || tracesMemoryCache.has(runId)) return;
    let alive = true;
    api(`/api/history/runs/${encodeURIComponent(runId)}?include_traces=true`)
      .then((res: RunDetailResponse) => {
        if (!alive) return;
        if (res?.pipeline) tracesMemoryCache.set(runId, res.pipeline);
        setState({ id: runId, pipe: res?.pipeline ?? null, status: 'ready' });
      })
      .catch(err => {
        console.error('Failed to load simulation traces:', err);
        if (alive) setState(s => ({ ...s, status: 'error' }));
      });
    return () => { alive = false; };
  }, [runId, enabled, attempt]);

  const retry = () => { setState(s => ({ ...s, status: 'loading' })); setAttempt(a => a + 1); };
  return { ...state, retry };
}

function toShapData(expl: RunDetailResponse['explanation'], tier: string): ShapData | null {
  const list = expl?.contributions;
  if (!expl || !Array.isArray(list) || list.length === 0) return null;
  return {
    predicted_class: tier,
    base_value: expl.base_value ?? 0,
    contributions: list.map(c => ({ biomarker: c.biomarker || c.feature || '—', value: c.value ?? 0, shap: c.shap ?? 0 })),
  };
}

/** Bentuk PipelineJob dari catatan riwayat, supaya komponen hasil pipeline bisa dipakai ulang apa adanya */
function toJob(runId: string, pred: RunLog, pipe: NonNullable<RunDetailResponse['pipeline']>): PipelineJob {
  const traces = pipe.traces;
  const perDose = pipe.per_dose ?? [];
  const sum = (k: keyof Flags) => perDose.reduce((n, d) => n + (d.flags?.[k] ?? 0), 0);
  const empty: Trace = { time: [], voltage: [], cai: [] };
  return {
    id: pipe.job_id || runId,
    status: (pipe.status as JobStatus) || 'done',
    request: (pipe.sim_params as PipelineRequest) || {},
    error: null,
    created_at: pred.created_at,
    started_at: null,
    finished_at: null,
    sim_params: pipe.sim_params ?? null,
    ratios: pipe.ratios ?? (Array.isArray(pred.input) ? pred.input : []),
    sim_result: {
      doses: pipe.doses ?? pipe.sim_params?.doses ?? perDose.map(d => d.dose),
      dose_mode: 'mean_of_doses',
      per_dose: perDose,
      traces_by_dose: traces?.traces_by_dose ?? [],
      trace: traces?.trace ?? empty,
      control_trace: traces?.control_trace ?? empty,
      raw_metrics: pipe.raw_metrics ?? {},
      control_metrics: pipe.control_metrics ?? {},
      conc_nM: [],
      flags: { EADs: sum('EADs'), noDepols: sum('noDepols'), noRepols: sum('noRepols') },
      elapsed_s: 0,
      engine_version: '',
    },
    sim_latency_ms: pipe.sim_latency_ms,
  };
}

/** Kerangka saat detail dimuat: bentuk vonis + daftar biomarker, supaya tinggi tidak melompat */
function DetailSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 py-6" aria-hidden="true">
      <Bone className="h-3 w-40" />
      <Bone className="h-12 w-56 sm:w-72" />
      <Bone className="h-3 w-64 max-w-full" />
      <div className="w-full flex flex-col gap-2 pt-6">
        {[0, 1, 2, 3, 4].map(i => <Bone key={i} className="h-9 w-full" />)}
      </div>
    </div>
  );
}

/** Keterangan teknis kecil di paling bawah detail */
function RecordMeta({ log, pred, pipeline, owner }: {
  log: RunLog; pred: RunLog; pipeline: RunDetailResponse['pipeline']; owner?: React.ReactNode;
}) {
  const items: { k: string; v: React.ReactNode; mono?: boolean }[] = [
    ...(owner ? [{ k: 'User', v: owner }] : []),
    { k: 'Model', v: `${pred.latency_ms ?? '—'} ms`, mono: true },
    ...(typeof pipeline?.sim_latency_ms === 'number' ? [{ k: 'Simulation', v: `${(pipeline.sim_latency_ms / 1000).toFixed(1)} s`, mono: true }] : []),
    { k: 'Record', v: log.id, mono: true },
    ...(pipeline?.job_id ? [{ k: 'Job', v: pipeline.job_id, mono: true }] : []),
  ];
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-1.5 border-t border-foreground/10 pt-5 text-xs text-foreground/55">
      {items.map(it => (
        <div key={it.k} className="flex min-w-0 gap-2">
          <dt>{it.k}</dt>
          <dd className={`truncate text-foreground/80 ${it.mono ? 'font-mono' : ''}`}>{it.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RunDetail({ log, owner }: { log: RunLog; owner?: React.ReactNode }) {
  const [detail, setDetail] = useState<RunDetailResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    cachedGet<RunDetailResponse>(`/api/history/runs/${log.id}`)
      .then(res => { if (alive) setDetail(res); })
      .catch(err => {
        console.error('Failed to load run detail:', err);
        if (alive) setFailed(true);
      });
    return () => { alive = false; };
  }, [log.id, attempt]);

  const pred = detail?.prediction;
  const pipelineBase = detail?.pipeline ?? null;
  const isPipeline = !!detail && (pred?.input_method?.method === 'pipeline' || pred?.source === 'pipeline' || !!pipelineBase);
  const db = useDrugDb(isPipeline);
  const traces = useRunTraces(log.id, isPipeline);

  const tier = pred?.predicted_tier ? normalizeTier(pred.predicted_tier) : 'unknown';
  const prediction = useMemo(() => (pred ? historyToPredictionOutput(pred) : null), [pred]);
  const shap = useMemo(() => toShapData(detail?.explanation ?? null, tier), [detail?.explanation, tier]);
  const pipe = traces.pipe ?? pipelineBase;
  const job = useMemo(() => (pred && pipe ? toJob(log.id, pred, pipe) : null), [log.id, pred, pipe]);

  if (failed) {
    return (
      <div className="py-10 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-foreground/70">Could not load the details of this run.</p>
        <button type="button" onClick={() => { setFailed(false); setAttempt(a => a + 1); }} className={secondaryBtn}>Try again</button>
      </div>
    );
  }
  if (!detail || !pred || !prediction) return <DetailSkeleton />;

  const when = <span className="shrink-0 text-xs sm:text-sm text-foreground/55 tabular-nums">{formatWhen(pred.created_at)}</span>;
  const meta = <RecordMeta log={log} pred={pred} pipeline={pipe} owner={owner} />;

  if (isPipeline && job) {
    return (
      <PipelineResult
        embedded
        job={job}
        db={db}
        header={when}
        prediction={prediction}
        tier={tier}
        shap={shap}
        tracesStatus={traces.status}
        onRetryTraces={traces.retry}
        footer={meta}
      />
    );
  }

  // Digital Lab: susunan sama dengan hasil di halaman Digital Lab
  const input = Array.isArray(pred.input) ? pred.input : [];
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-12 md:gap-16">
      <div className="flex items-center justify-between gap-4 px-1">
        <p className="min-w-0 text-sm text-foreground/70 leading-snug">
          <span className="font-medium text-foreground">Digital Lab</span> · 11 ratios entered manually
        </p>
        {when}
      </div>
      <RiskVerdict tier={tier} prediction={prediction} />
      <ManualInputNote />
      <BiomarkerList
        ratios={input}
        tier={tier}
        shap={shap}
        explaining={false}
        emptyDriversMessage="No driver analysis (SHAP) was recorded for this run."
      />
      {meta}
    </div>
  );
}

/* =========================================================
   DAFTAR RIWAYAT + FILTER (obat, metode, hasil)
   ========================================================= */

// Ponsel: metode + waktu | hasil | panah. Desktop: waktu | metode | hasil | waktu proses | panah.
const ROW = 'grid grid-cols-[1fr_auto_1.75rem] sm:grid-cols-[11rem_1fr_8rem_6rem_1.75rem] items-center gap-3 sm:gap-4';

/** Filter multi-pilih: daftar kosong = tidak disaring. Di dalam grup = ATAU, antar grup = DAN. */
type RunFilter = { drug: string[]; method: string[]; tier: string[] };
type GroupId = keyof RunFilter;
const ALL_RUNS: RunFilter = { drug: [], method: [], tier: [] };
const isAllRuns = (f: RunFilter) => !f.drug.length && !f.method.length && !f.tier.length;

const isDigitalLab = (log: RunLog) => log.input_method?.method === 'digital_lab' || log.source === 'digital_lab';
/** Nama metode untuk filter: Digital Lab, atau mode pipeline (CiPA drug, New drug, ...) */
const methodOf = (log: RunLog) => (isDigitalLab(log) ? 'Digital Lab' : log.input_method?.mode_label || 'Pipeline');
const drugOf = (log: RunLog) => (isDigitalLab(log) ? null : log.input_method?.drug?.trim().toLowerCase() || null);

const matchRun = (log: RunLog, query: string, f: RunFilter) => {
  if (f.tier.length && !f.tier.some(t => matchesTier(log.predicted_tier, t as TierFilterValue))) return false;
  if (f.method.length && !f.method.includes(methodOf(log))) return false;
  if (f.drug.length && !f.drug.includes(drugOf(log) ?? '')) return false;
  return matchesQuery(query, [
    log.id,
    log.predicted_tier,
    formatWhen(log.created_at),
    formatInputMethod(log),
    log.input_method?.method,
    log.input_method?.mode,
    log.input_method?.mode_label,
    log.input_method?.drug,
  ]);
};

/** Pilihan filter obat & metode dari seluruh riwayat; dimuat saat pill pertama kali dibuka */
function useRunOptions(endpoint: string) {
  const [items, setItems] = useState<RunLog[] | null>(null);
  const requested = useRef(false);
  const load = () => {
    if (requested.current) return;
    requested.current = true;
    fetchAllPages<RunLog>(endpoint)
      .then(r => setItems(r.items))
      .catch(() => { requested.current = false; setItems([]); });
  };
  const options = useMemo(() => {
    const drugs = new Set<string>();
    const methods = new Set<string>();
    for (const log of items ?? []) {
      const d = drugOf(log);
      if (d) drugs.add(d);
      methods.add(methodOf(log));
    }
    return {
      drugs: [...drugs].sort().map(d => ({ id: d, label: formatDrugName(d) })),
      methods: [...methods].sort().map(m => ({ id: m, label: m })),
    };
  }, [items]);
  return { ...options, loading: items === null, load };
}

const ENDPOINT = '/api/history/predictions';

export default function RunHistory() {
  const h = useHistory<RunLog, RunFilter>(ENDPOINT, matchRun, ALL_RUNS, isAllRuns);
  const { items: shown, total, loading, error, page, pages, setPage } = h;
  const [open, setOpen] = useState<string | null>(null);
  const opts = useRunOptions(ENDPOINT);

  const setFilter = (next: RunFilter) => {
    setOpen(null);
    h.setFilter(next);
  };
  const toggle = (group: string, id: string) => {
    const g = group as GroupId;
    const list = h.filter[g];
    setFilter({ ...h.filter, [g]: list.includes(id) ? list.filter(x => x !== id) : [...list, id] });
  };

  // Ringkasan filter aktif dalam satu kalimat, mis. "Drug: Bepridil, Dofetilide · Result: High"
  const labelOf = (list: readonly { id: string; label: string }[], id: string) => list.find(o => o.id === id)?.label ?? formatDrugName(id);
  const activeText = [
    h.filter.drug.length ? `Drug: ${h.filter.drug.map(d => labelOf(opts.drugs, d)).join(', ')}` : '',
    h.filter.method.length ? `Method: ${h.filter.method.join(', ')}` : '',
    h.filter.tier.length ? `Result: ${h.filter.tier.map(t => labelOf(TIER_OPTIONS, t)).join(', ')}` : '',
  ].filter(Boolean).join(' · ');

  // Bersihkan cache lama trace/dosis dari sessionStorage (versi sebelumnya menyimpannya di sana)
  useEffect(() => {
    try {
      const stale: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('pipeline-doses:') || key.startsWith('pipeline-run-traces:'))) stale.push(key);
      }
      stale.forEach(k => sessionStorage.removeItem(k));
    } catch {
      // storage diblokir: abaikan
    }
  }, []);

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
              { id: 'drug', title: 'Drug', options: opts.drugs, selected: h.filter.drug, loading: opts.loading, emptyText: 'No drugs in your history yet.' },
              { id: 'method', title: 'Input method', options: opts.methods, selected: h.filter.method, loading: opts.loading, emptyText: 'No input methods in your history yet.' },
              { id: 'tier', title: 'Result', options: TIER_OPTIONS, selected: h.filter.tier },
            ]}
          />
        }
        placeholder="Search by drug, input method, record ID or result"
        summary={!loading && h.filtering
          ? <>{total} matching {total === 1 ? 'run' : 'runs'}{activeText && <span className="text-foreground/50"> · {activeText}</span>}</>
          : null}
      />

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span className="hidden sm:block">Date & time</span>
          <span>Input method</span>
          <span className="text-right sm:text-left">Result</span>
          <span className="hidden sm:block text-right">Processing</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load your activity history. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          h.filtering ? (
            <div className="py-14 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-foreground/70 text-balance">
                No runs match {isAllRuns(h.filter) ? 'your search' : 'the filters you picked'}. Try fewer filters or a different search.
              </p>
              {!isAllRuns(h.filter) && (
                <button type="button" onClick={() => setFilter(ALL_RUNS)} className={secondaryBtn}>Clear filters</button>
              )}
            </div>
          ) : (
            <HistoryMessage>No runs yet.</HistoryMessage>
          )
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
                    <span className="hidden sm:block text-sm text-foreground truncate">{formatWhen(log.created_at)}</span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{formatInputMethod(log)}</span>
                      <span className="sm:hidden text-xs text-foreground/55 truncate">{formatWhen(log.created_at)}</span>
                    </span>
                    <span className="justify-self-end sm:justify-self-start">
                      <TierText tier={log.predicted_tier} />
                    </span>
                    <span className="hidden sm:block text-right font-mono text-xs text-foreground/70 tabular-nums">
                      {log.latency_ms ?? '—'} ms
                    </span>
                  </>
                }
              >
                <RunDetail log={log} />
              </HistoryRow>
            ))}
          </ul>
        )}
      </div>

      <Pager
        page={page}
        pages={pages}
        disabled={loading}
        onChange={p => { setOpen(null); setPage(p); }}
      />
    </div>
  );
}
