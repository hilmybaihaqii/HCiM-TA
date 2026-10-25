'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Cpu, FlaskConical, HeartPulse } from 'lucide-react';
import EngineStatus, { type EngineStep } from '../../components/EngineStatus';
import { ResultSkeleton } from '../../components/Skeletons';
import { JobStatus, PipelineJob, formatDrugName, joinList } from '@/lib/pipeline';

/* Langkah sama jumlahnya dengan Digital Lab: input -> proses -> analisis -> hasil */
const STEPS: EngineStep[] = [
  { id: 'input', label: 'Your drug', icon: FlaskConical },
  { id: 'simulating', label: 'Heart cell', icon: HeartPulse },
  { id: 'predicting', label: 'Analysis', icon: Cpu },
  { id: 'done', label: 'Result', icon: Activity },
];

const STEP_INDEX: Record<JobStatus, number> = { queued: 1, simulating: 1, predicting: 2, done: 3, failed: 0 };

function statusText(status: JobStatus | null, doses: number[]): string {
  switch (status) {
    case 'queued': return 'Waiting for a free slot';
    case 'simulating': return `Simulating the heart cell at ${joinList(doses)}× Cmax`;
    case 'predicting': return 'Checking the risk';
    case 'done': return 'Your result is ready';
    case 'failed': return 'The run stopped';
    default: return 'Ready when you are';
  }
}

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

/** Engine status Full Pipeline: selalu tampil di bawah header, sama seperti Digital Lab. */
export default function PipelineEngine({ job, loading, doses }: {
  /** Job yang sedang dibuka (null = belum ada run) */
  job: PipelineJob | null;
  /** true saat ?job= ada tapi datanya belum termuat */
  loading?: boolean;
  doses: number[];
}) {
  const status: JobStatus | null = job?.status ?? (loading ? 'queued' : null);
  const elapsed = useElapsed(job?.created_at, isRunning(status));

  return (
    <EngineStatus
      steps={STEPS}
      activeIndex={status ? STEP_INDEX[status] : 0}
      complete={status === 'done'}
      status={loading && !job ? 'Opening your run' : statusText(status, doses)}
      meta={isRunning(status) ? fmtElapsed(elapsed) : undefined}
    />
  );
}

const DETAIL: Partial<Record<JobStatus, string>> = {
  queued: 'One simulation runs at a time. Yours starts as soon as the server is free.',
  simulating: '1000 heartbeats per dose, two doses at a time.',
  predicting: 'Almost done. The same risk model as the Digital Lab is reading the 11 biomarkers.',
};

/** Isi halaman saat simulasi berjalan: keterangan singkat + skeleton hasil */
export function RunningDetails({ job, notice }: { job: PipelineJob | null; notice?: string | null }) {
  const status = job?.status ?? null;
  const elapsed = useElapsed(job?.created_at, isRunning(status));
  const showSlowNote = (status === 'queued' || status === 'simulating') && elapsed > SLOW_NOTE_MS;
  const drug = job?.request?.drug;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
      {notice && <p className="pl-4 border-l-2 border-amber-500/70 text-sm text-amber-800 leading-relaxed">{notice}</p>}

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-x-8 gap-y-1 px-1">
        <p className="text-sm text-foreground">
          {drug ? formatDrugName(drug) : 'Custom compound'}
          <span className="text-muted"> · {(status && DETAIL[status]) ?? 'This usually takes 1 to 2 minutes.'}</span>
        </p>
        <p className="text-xs text-muted shrink-0">You can leave this page. The result also appears in Activity Logs.</p>
      </div>

      <AnimatePresence>
        {showSlowNote && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-1 text-sm text-amber-700">
            The server is busy or just waking up. This can take a little longer.
          </motion.p>
        )}
      </AnimatePresence>

      <ResultSkeleton label="Simulating the heart cell" />
    </motion.div>
  );
}
