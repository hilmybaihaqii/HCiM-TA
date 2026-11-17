'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cachedGet } from '@/lib/historyCache';
import {
  FEATURES,
  formatChange,
  ratioChange,
  type PipelineJob,
  type DoseRun,
  type Trace,
  type DoseKey,
  type PipelineRequest,
  type JobStatus,
} from '@/lib/pipeline';
import { isStrongChange } from '@/lib/biomarkerHighlight';
import { normalizeTier } from '@/lib/tierColor';
import GuideLink from '../../components/GuideLink';
import RiskVerdict from '../../components/report/RiskVerdict';
import type { PredictionOutput } from '@/lib/predict';
import { SHORT_DESC } from '../../components/report/biomarkerText';
import { ShapDetail, type Contribution } from './ShapHistory';
import {
  TracesSection,
  BiomarkerMatrix,
  useTraceSeries,
  doseSeriesLabel,
} from '../../pipeline/components/SimulationPanel';
import {
  HistoryControls,
  HistoryMessage,
  HistoryRow,
  HistorySkeleton,
  Pager,
  TierFilter,
  TierText,
  TierFilterValue,
  ValueRows,
  formatWhen,
  matchesQuery,
  matchesTier,
  useHistory,
} from './history';

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
   SIMULATION OUTPUT SECTION (Pipeline runs only, 2nd stage fetch)
   ========================================================= */

// In-memory cache for trace payloads (~285 KB per run), valid for the page lifetime only.
// Prevents sessionStorage QuotaExceededError when opening multiple runs.
const tracesMemoryCache = new Map<string, NonNullable<RunDetailResponse['pipeline']>>();

function SimulationSection({
  runId,
  prediction,
  initialPipeline,
}: {
  runId: string;
  prediction: RunLog;
  initialPipeline: RunDetailResponse['pipeline'];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pipelineWithTraces, setPipelineWithTraces] = useState<RunDetailResponse['pipeline'] | null>(() => {
    return tracesMemoryCache.get(runId) ?? null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDose, setSelectedDose] = useState<DoseKey>('mean');

  const fetchTraces = () => {
    if (pipelineWithTraces || tracesMemoryCache.has(runId)) {
      if (!pipelineWithTraces && tracesMemoryCache.has(runId)) {
        setPipelineWithTraces(tracesMemoryCache.get(runId)!);
      }
      return;
    }
    setLoading(true);
    setError(null);
    cachedGet<RunDetailResponse>(`/api/history/runs/${runId}?include_traces=true`)
      .then(res => {
        if (res.pipeline) {
          tracesMemoryCache.set(runId, res.pipeline);
          setPipelineWithTraces(res.pipeline);
        }
      })
      .catch(err => {
        console.error('Failed to load simulation traces:', err);
        setError('Could not load simulation traces. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  const onToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !pipelineWithTraces && !loading) {
      fetchTraces();
    }
  };

  const pipe = pipelineWithTraces || initialPipeline;
  const traces = pipe?.traces;

  const simJob: PipelineJob = useMemo(() => {
    return {
      id: pipe?.job_id || runId,
      status: (pipe?.status as JobStatus) || 'done',
      request: (pipe?.sim_params as PipelineRequest) || {},
      error: null,
      created_at: prediction.created_at,
      started_at: null,
      finished_at: null,
      sim_params: pipe?.sim_params || null,
      ratios: (pipe?.ratios as number[]) || (prediction.input as number[]) || [],
      sim_result: {
        doses: (pipe?.doses as number[]) || [1, 2, 3, 4],
        dose_mode: (pipe?.dose_mode as 'mean_of_doses') || 'mean_of_doses',
        per_dose: (pipe?.per_dose as DoseRun[]) || [],
        traces_by_dose: (traces?.traces_by_dose as (Trace & { dose: number })[]) || [],
        trace: (traces?.trace as Trace) || { time: [], voltage: [], cai: [] },
        control_trace: (traces?.control_trace as Trace) || { time: [], voltage: [], cai: [] },
        raw_metrics: pipe?.raw_metrics || {},
        control_metrics: pipe?.control_metrics || {},
        conc_nM: [],
        flags: { EADs: 0, noDepols: 0, noRepols: 0 },
        elapsed_s: 0,
        engine_version: '1.0',
      },
      sim_latency_ms: pipe?.sim_latency_ms,
    };
  }, [pipe, traces, runId, prediction]);

  const { apSeries, caSeries } = useTraceSeries(simJob);
  const highlightLabel = selectedDose === 'mean' ? null : doseSeriesLabel(Number(selectedDose));

  return (
    <div className="border border-foreground/10 rounded-card overflow-hidden bg-surface-white/40">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-foreground/[0.03] transition-colors"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">Simulation output</span>
          <span className="text-xs text-foreground/60">
            Action potential and calcium traces, and per-dose biomarker matrix
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-foreground/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-foreground/10 flex flex-col gap-8">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-foreground/60">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading simulation traces and dose matrix…</span>
            </div>
          ) : error ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-accent">{error}</p>
              <button
                type="button"
                onClick={fetchTraces}
                className="px-3 py-1.5 rounded-chip border border-foreground/20 text-xs font-medium text-foreground hover:bg-foreground/5 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {apSeries.length > 0 || caSeries.length > 0 ? (
                <TracesSection apSeries={apSeries} caSeries={caSeries} highlight={highlightLabel} />
              ) : (
                <p className="text-sm text-foreground/70 py-4 text-center">No trace data recorded for this run.</p>
              )}
              <BiomarkerMatrix job={simJob} selected={selectedDose} onSelect={setSelectedDose} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   RUN DETAIL (Stage 1 fetch on row expand)
   ========================================================= */

export function RunDetail({ log, owner }: { log: RunLog; owner?: React.ReactNode }) {
  const [detail, setDetail] = useState<RunDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    cachedGet<RunDetailResponse>(`/api/history/runs/${log.id}`)
      .then(res => {
        if (alive) {
          setDetail(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load run detail:', err);
        if (alive) {
          setError('Could not load run details. Please try again.');
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [log.id]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3 text-foreground/60">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading run details…</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-accent">{error || 'Could not load run details.'}</p>
      </div>
    );
  }

  const pred = detail.prediction;
  const expl = detail.explanation;
  const pipeline = detail.pipeline;
  const isPipeline = pred.input_method?.method === 'pipeline' || pred.source === 'pipeline' || !!pipeline;

  const predOutput = historyToPredictionOutput(pred);
  const input = Array.isArray(pred.input) ? pred.input : [];
  const changes = FEATURES.map((_, i) => ratioChange(input[i]));
  const maxDev = Math.max(0.1, ...changes.map(c => Math.abs(c ?? 0)));

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Input method block */}
      <div className="rounded-card border border-foreground/10 bg-surface-white/60 p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-mono uppercase tracking-wider text-foreground/50">Input Method</span>
          <span className="text-xs text-foreground/60">
            {isPipeline ? 'Cardiac electrophysiology simulation' : 'Manual entry'}
          </span>
        </div>
        {isPipeline ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div>
              <dt className="text-xs text-foreground/60">Mode</dt>
              <dd className="text-sm font-medium text-foreground">
                {pred.input_method?.mode_label || 'Pipeline simulation'}
              </dd>
            </div>
            {pred.input_method?.drug && (
              <div>
                <dt className="text-xs text-foreground/60">Drug</dt>
                <dd className="text-sm font-medium text-foreground capitalize">{pred.input_method.drug}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-foreground/60">Peak concentration (Cmax)</dt>
              <dd className="text-sm font-medium text-foreground font-mono">
                {typeof pipeline?.sim_params?.cmax_nM === 'number'
                  ? `${pipeline.sim_params.cmax_nM} nM`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-foreground/60">Simulated doses</dt>
              <dd className="text-sm font-medium text-foreground font-mono">
                {Array.isArray(pipeline?.doses) && pipeline.doses.length > 0
                  ? pipeline.doses.map(d => `${d}×`).join(', ') + ' Cmax'
                  : Array.isArray(pipeline?.sim_params?.doses) && pipeline.sim_params.doses.length > 0
                  ? pipeline.sim_params.doses.map(d => `${d}×`).join(', ') + ' Cmax'
                  : '1×, 2×, 3×, 4× Cmax'}
              </dd>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/70">
            Eleven biomarker ratios entered manually in Digital Lab. No cardiac cell simulation was run for this record.
          </p>
        )}
      </div>

      {/* 2. Risk verdict, probabilities, and prediction set */}
      <div className="py-2 flex flex-col items-center">
        <RiskVerdict
          tier={pred.predicted_tier ? normalizeTier(pred.predicted_tier) : 'unknown'}
          prediction={predOutput}
          compact
        />
      </div>

      {/* 3. Eleven biomarker ratios */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {isPipeline ? 'Mean biomarker ratios across doses' : 'Biomarker ratios'}
          </h3>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-1"><span className="text-xs text-foreground/60">Relative to drug-free control</span><GuideLink topic="ratios" /></div>
        </div>
        {input.length > 0 ? (
          <ValueRows
            headers={['Biomarker', 'Change from the drug-free cell', 'Change', 'Ratio']}
            rows={FEATURES.map((key, i) => ({
              key,
              hint: SHORT_DESC[key],
              bar: changes[i] === null ? null : (changes[i] as number) / maxDev,
              strong: isStrongChange(key, input[i]),
              main: formatChange(changes[i]),
              second: typeof input[i] === 'number' ? input[i].toFixed(4) : '—',
            }))}
          />
        ) : (
          <p className="text-sm text-foreground/70">No biomarker ratios were recorded for this run.</p>
        )}
      </div>

      {/* 4. SHAP driver analysis with base value */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h3 className="text-sm font-semibold text-foreground">SHAP driver analysis</h3>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-1"><span className="text-xs text-foreground/60">Feature importance</span><GuideLink topic="shap" /></div>
        </div>
        {expl && expl.contributions && expl.contributions.length > 0 ? (
          <ShapDetail
            log={{
              id: expl.id,
              prediction_id: expl.prediction_id,
              predicted_class: expl.predicted_class || pred.predicted_tier || '',
              base_value: expl.base_value ?? 0,
              contributions: (expl.contributions as Contribution[]) ?? [],
              created_at: expl.created_at,
            }}
            note={
              isPipeline
                ? 'Calculated for the overall run from the mean biomarker profile across simulated doses.'
                : undefined
            }
          />
        ) : (
          <p className="text-sm text-foreground/70">No SHAP explanation was recorded for this run.</p>
        )}
      </div>

      {/* 5. Simulation output accordion (pipeline runs only) */}
      {isPipeline && (
        <SimulationSection
          runId={log.id}
          prediction={pred}
          initialPipeline={pipeline}
        />
      )}

      {/* 6. Metadata footer */}
      <dl className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-xs text-foreground/60 border-t border-foreground/10 pt-4">
        {owner && (
          <div className="flex gap-2 min-w-0">
            <dt>User</dt>
            <dd className="text-foreground/80 truncate">{owner}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt>Model processing</dt>
          <dd className="font-mono text-foreground/80">{pred.latency_ms ?? '—'} ms</dd>
        </div>
        {typeof pipeline?.sim_latency_ms === 'number' && (
          <div className="flex gap-2">
            <dt>Simulation runtime</dt>
            <dd className="font-mono text-foreground/80">{pipeline.sim_latency_ms} ms</dd>
          </div>
        )}
        <div className="flex gap-2 min-w-0">
          <dt>Record</dt>
          <dd className="font-mono text-foreground/80 truncate">{log.id}</dd>
        </div>
        {pipeline?.job_id && (
          <div className="flex gap-2 min-w-0">
            <dt>Job ID</dt>
            <dd className="font-mono text-foreground/80 truncate">{pipeline.job_id}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/* =========================================================
   RUN HISTORY LIST
   ========================================================= */

// Ponsel: input method + waktu | hasil | panah. Desktop: waktu | input method | hasil | waktu proses | panah.
const ROW = 'grid grid-cols-[1fr_auto_1rem] sm:grid-cols-[11rem_1fr_8rem_6rem_1rem] items-center gap-3 sm:gap-4';

/** Match search query across ID, tier, date, drug name, and input method */
const matchRun = (log: RunLog, query: string, tier: TierFilterValue) => {
  if (!matchesTier(log.predicted_tier, tier)) return false;
  const inputMethodStr = formatInputMethod(log);
  return matchesQuery(query, [
    log.id,
    log.predicted_tier,
    formatWhen(log.created_at),
    inputMethodStr,
    log.input_method?.method,
    log.input_method?.mode,
    log.input_method?.mode_label,
    log.input_method?.drug,
  ]);
};

export default function RunHistory() {
  const h = useHistory<RunLog>('/api/history/predictions', matchRun);
  const { items: shown, total, loading, error, page, pages, setPage } = h;
  const [open, setOpen] = useState<string | null>(null);

  // Bersihkan cache stale pipeline-run-traces dan pipeline-doses dari sessionStorage
  useEffect(() => {
    try {
      const staleKeys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('pipeline-doses:') || key.startsWith('pipeline-run-traces:'))) {
          staleKeys.push(key);
        }
      }
      staleKeys.forEach(k => sessionStorage.removeItem(k));
    } catch {
      // storage blocked / SSR: ignore
    }
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <HistoryControls
        query={h.query}
        onQuery={v => {
          setOpen(null);
          h.setQuery(v);
        }}
        filter={
          <TierFilter
            value={h.filter}
            onChange={v => {
              setOpen(null);
              h.setFilter(v);
            }}
          />
        }
        placeholder="Search by drug, input method, record ID or result"
        summary={!loading && h.filtering ? `${total} matching ${total === 1 ? 'run' : 'runs'}` : null}
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
          <HistoryMessage>{h.filtering ? 'No runs match your search.' : 'No runs yet.'}</HistoryMessage>
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
                    <span className="hidden sm:block text-sm text-foreground truncate">
                      {formatWhen(log.created_at)}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {formatInputMethod(log)}
                      </span>
                      <span className="sm:hidden text-xs text-foreground/55 truncate">
                        {formatWhen(log.created_at)}
                      </span>
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
        onChange={p => {
          setOpen(null);
          setPage(p);
        }}
      />
    </div>
  );
}
