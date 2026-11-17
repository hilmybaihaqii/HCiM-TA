'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChartColumn, FlaskConical, Gauge, HeartPulse, Hourglass } from 'lucide-react';
import { DrugDb, JobStatus, PipelineJob, formatChange, formatDrugName, joinList, strongestChange } from '@/lib/pipeline';
import { getTierColor } from '@/lib/tierColor';
import HeartbeatLoader, { EcgTrace, type LoaderStep } from '../../components/report/HeartbeatLoader';
import StageMonitor, { type Stage, type StageState } from '../../components/report/StageMonitor';

/** Setelah 4 menit masih queued/simulating -> catatan lembut. */
export const SLOW_NOTE_MS = 4 * 60 * 1000;

function parseTime(s?: string | null): number | null {
  if (!s) return null;
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? null : t;
}

const fmtElapsed = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/**
 * Waktu berjalan sejak job dibuat. Jam baru jalan setelah mount, supaya HTML server & client
 * tidak beda (hydration mismatch). Fallback ke waktu pertama kali jam berdetak.
 */
function useElapsed(createdAt: string | null | undefined, running: boolean) {
  const [clock, setClock] = useState<{ start: number; now: number } | null>(null);
  useEffect(() => {
    if (!running) return;
    const tick = () => setClock(c => {
      const now = Date.now();
      return { start: c?.start ?? now, now };
    });
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [running]);
  return clock ? clock.now - Math.min(parseTime(createdAt) ?? clock.start, clock.now) : 0;
}

const isRunning = (s: JobStatus | null) => s === 'queued' || s === 'simulating' || s === 'predicting';

/* =========================================================
   TAHAP PIPELINE
   ========================================================= */

/** Index tahap yang sedang berjalan untuk tiap status job */
const ACTIVE_AT: Record<JobStatus, number> = { queued: 1, simulating: 2, predicting: 4, done: 5, failed: 2 };

function stageState(i: number, status: JobStatus | null): StageState {
  if (!status) return i === 0 ? 'active' : 'pending';
  const at = ACTIVE_AT[status];
  if (status === 'failed') return i < at ? 'done' : i === at ? 'failed' : 'pending';
  if (i < at) return 'done';
  return i === at ? 'active' : 'pending';
}

function paramSource(job: PipelineJob | null): string | null {
  const req = job?.request;
  if (!req) return null;
  if (!req.drug) return 'Your own values';
  return req.herg || req.ic50 ? 'CiPA values with your edits' : 'CiPA values';
}

function buildStages(job: PipelineJob | null, doses: number[], db: DrugDb | null): Stage[] {
  const drug = job?.request?.drug;
  const cmax = job?.request?.cmax_nM ?? (drug ? db?.drugs[drug]?.cmax_nM : undefined);
  const r = job?.sim_result;
  const simSeconds = typeof job?.sim_latency_ms === 'number' ? job.sim_latency_ms / 1000 : r?.elapsed_s;
  const shift = strongestChange(job?.ratios, r?.control_metrics);
  const tier = Array.isArray(job?.prediction)
    ? String((job.prediction[0] as { label?: string } | undefined)?.label ?? '').toLowerCase()
    : '';

  return [
    {
      id: 'drug',
      title: 'Drug',
      icon: FlaskConical,
      does: 'Exposure (Cmax) plus hERG binding and ion-channel block.',
      output: job ? (
        <>
          {drug ? formatDrugName(drug) : 'Custom compound'}
          {typeof cmax === 'number' && <span className="text-foreground/70"> · Cmax {cmax} nM</span>}
          <span className="block text-foreground/70">{paramSource(job)}</span>
        </>
      ) : undefined,
    },
    {
      id: 'queue',
      title: 'Queue',
      icon: Hourglass,
      does: 'Waiting for the simulator to start this run.',
      output: job?.started_at ? 'Started' : undefined,
    },
    {
      id: 'simulation',
      title: 'Heart-cell simulation',
      icon: HeartPulse,
      does: `Simulates the heart cell at ${joinList(doses)}× Cmax.`,
      live: <EcgTrace className="w-full max-w-56 h-10" />,
      output: r ? (
        <>
          {(r.doses ?? doses).length} doses
          {typeof simSeconds === 'number' && <span className="text-foreground/70"> · {simSeconds.toFixed(1)} s</span>}
          {r.flags?.EADs > 0 && <span className="block text-amber-700">EADs detected</span>}
        </>
      ) : undefined,
    },
    {
      id: 'biomarkers',
      title: '11 biomarkers',
      icon: ChartColumn,
      does: 'Each one compared with the drug-free cell, per dose and as the mean.',
      output: shift ? <>Largest change <span className="font-mono">{shift.key} {formatChange(shift.change)}</span></> : undefined,
    },
    {
      id: 'risk',
      title: 'Risk model',
      icon: Gauge,
      does: 'Classifies TdP risk as low, intermediate or high, with SHAP.',
      output: tier ? (
        <><span className={`capitalize ${getTierColor(tier).text}`}>{tier}</span> risk <span className="text-foreground/70">(mean)</span></>
      ) : undefined,
    },
  ];
}

function statusText(status: JobStatus | null, doses: number[]): string {
  switch (status) {
    case 'queued': return 'Waiting for a free slot';
    case 'simulating': return `Simulating the cell at ${joinList(doses)}× Cmax`;
    case 'predicting': return 'Running the risk model';
    case 'done': return 'Run complete';
    case 'failed': return 'The run stopped';
    default: return 'Ready for a drug';
  }
}

/** Status Full Pipeline: lima tahap kerja yang sebenarnya, dengan hasil nyata tiap tahap. */
export default function PipelineMonitor({ job, loading, doses, db = null }: {
  /** Job yang sedang dibuka (null = belum ada run) */
  job: PipelineJob | null;
  /** true saat ?job= ada tapi datanya belum termuat */
  loading?: boolean;
  doses: number[];
  db?: DrugDb | null;
}) {
  const status: JobStatus | null = job?.status ?? (loading ? 'queued' : null);
  const elapsed = useElapsed(job?.created_at, isRunning(status));
  const stages = buildStages(job, doses, db);

  return (
    <StageMonitor
      label="Pipeline"
      status={loading && !job ? 'Opening your run' : statusText(status, doses)}
      meta={isRunning(status) ? fmtElapsed(elapsed) : undefined}
      stages={stages}
      states={stages.map((_, i) => stageState(i, status))}
    />
  );
}

/* =========================================================
   ISI HALAMAN SAAT SIMULASI BERJALAN
   ========================================================= */

const DETAIL: Partial<Record<JobStatus, string>> = {
  queued: 'Your run is in the queue and starts when the simulator is free.',
  simulating: 'The simulator is running each dose.',
  predicting: 'Computing the 11 biomarkers and running the risk model on them.',
};

function runSteps(status: JobStatus | null): LoaderStep[] {
  const at = status === 'queued' || !status ? 0 : status === 'simulating' ? 1 : status === 'predicting' ? 2 : 3;
  return ['Queue', 'Simulation', 'Risk model'].map((label, i) => ({
    label,
    state: i < at ? 'done' : i === at ? 'active' : 'pending',
  }));
}

/** Isi halaman saat simulasi berjalan: animasi detak + langkah yang sedang dikerjakan */
export function RunningDetails({ job, notice }: { job: PipelineJob | null; notice?: string | null }) {
  const status = job?.status ?? null;
  const elapsed = useElapsed(job?.created_at, isRunning(status));
  const showSlowNote = (status === 'queued' || status === 'simulating') && elapsed > SLOW_NOTE_MS;
  const drug = job?.request?.drug;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
      {notice && <p className="pl-4 border-l-2 border-amber-500/70 text-sm text-amber-800 leading-relaxed">{notice}</p>}

      <HeartbeatLoader
        eyebrow={drug ? formatDrugName(drug) : 'Custom compound'}
        title={status === 'queued' || !status ? 'Waiting for the simulator' : status === 'predicting' ? 'Reading the biomarkers' : 'Simulating the heart cell'}
        detail={(status && DETAIL[status]) ?? 'Waiting for the run to start.'}
        steps={runSteps(status)}
        since={parseTime(job?.created_at)}
      />

      <AnimatePresence>
        {showSlowNote && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-1 text-sm text-amber-700">
            The server is busy or just waking up. This can take a little longer.
          </motion.p>
        )}
      </AnimatePresence>

      <p className="px-1 text-xs text-foreground/70">You can leave this page. The result also appears in Activity Logs.</p>
    </motion.div>
  );
}
