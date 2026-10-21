'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import LabResults, { parsePredictResponse } from '../../components/LabResults';
import { DrugDb, PipelineJob, describeFailure, formatDrugName, isTrainingDrug } from '@/lib/pipeline';
import { getTierColor } from '@/lib/tierColor';
import SimulationPanel from './SimulationPanel';

type ShapPayload = { base_value: number; contributions: { biomarker: string; value: number; shap: number }[] };

function readShap(explanation: unknown): ShapPayload | null {
  const first = Array.isArray(explanation) ? (explanation[0] as Partial<ShapPayload> | undefined) : undefined;
  if (!first || !Array.isArray(first.contributions) || typeof first.base_value !== 'number') return null;
  return { base_value: first.base_value, contributions: first.contributions };
}

const primaryBtn = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-accent text-surface-white text-sm font-medium hover:bg-accent-dark active:scale-[0.98] transition-all duration-300 shrink-0';
const textLink = 'text-sm text-muted hover:text-foreground underline-offset-4 hover:underline transition-colors';

export default function PipelineResult({ job, db, onRunAnother }: {
  job: PipelineJob; db: DrugDb | null; onRunAnother: () => void;
}) {
  const predictionRaw = Array.isArray(job.prediction) ? job.prediction : null;
  const prediction = predictionRaw ? parsePredictResponse(predictionRaw) : null;
  const shap = readShap(job.explanation);
  const tier = String((predictionRaw?.[0] as { label?: string } | undefined)?.label ?? 'unknown').toLowerCase();

  // Kategori referensi CiPA hanya untuk mode 1 & 3 (ada nama obat), dan baru tampil setelah hasil model
  const drug = job.request?.drug ?? job.sim_params?.drug;
  const cipaRisk = drug ? db?.drugs[drug.toLowerCase()]?.cipa_risk : undefined;

  return (
    <div className="flex flex-col gap-[34px] pb-20">
      {/* Header hasil: satu-satunya tombol untuk mulai simulasi baru */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 px-1">
        <div className="min-w-0">
          <span className="text-xs font-mono uppercase tracking-wider text-muted">Result</span>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">
              {drug ? formatDrugName(drug) : 'Custom compound'}
            </span>
            {predictionRaw && (
              <span className={`text-2xl md:text-3xl font-medium tracking-tight capitalize ${getTierColor(tier).text}`}>{tier} risk</span>
            )}
          </p>
          {drug && cipaRisk && (
            <p className="mt-1.5 text-xs text-muted">
              CiPA reference category: <span className={`capitalize ${getTierColor(cipaRisk).text}`}>{cipaRisk}</span>
              {isTrainingDrug(drug) && <> · this drug was in the training set</>}
            </p>
          )}
        </div>
        <button type="button" onClick={onRunAnother} className={primaryBtn}>
          New simulation
        </button>
      </div>

      {/* A. Output simulasi (bagian baru) */}
      <SimulationPanel job={job} />

      {/* B. Prediksi risiko AI (UI yang sama dengan Digital Lab) */}
      <div>
        <div className="mb-5 px-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-muted">03 · AI risk prediction</span>
          <span className="text-xs text-muted">The same risk model as the Digital Lab.</span>
        </div>

        {shap && predictionRaw ? (
          <LabResults
            tier={tier}
            shap={{ predicted_class: tier, base_value: shap.base_value, contributions: shap.contributions }}
            prediction={prediction}
            onReset={onRunAnother}
            hideReset
          />
        ) : (
          <p className="pl-4 border-l-2 border-amber-500/70 text-sm text-amber-800 leading-relaxed">
            The simulation finished, but the AI result for this job could not be read.
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   JOB GAGAL / TIMEOUT / ERROR POLLING
   ========================================================= */
export function PipelineFailure({ headline, details, onRetry, retryLabel = 'Try again', secondary }: {
  headline: string;
  details?: string | null;
  onRetry: () => void;
  retryLabel?: string;
  secondary?: { label: string; onClick: () => void };
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-surface-white/70 backdrop-blur-md border border-foreground/10 rounded-sheet shadow-sm px-6 sm:px-10 md:px-16 py-10 md:py-14 mb-20"
    >
      <span className="text-xs font-mono uppercase tracking-wider text-accent">Simulation failed</span>
      <p className="mt-4 text-xl md:text-2xl font-medium tracking-tight text-foreground leading-snug max-w-3xl">{headline}</p>

      {details && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            aria-expanded={open}
          >
            Details <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.pre
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-3 pl-4 border-l-2 border-rose-500/50 text-xs font-mono text-rose-700 whitespace-pre-wrap break-words max-w-2xl"
              >
                {details}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={onRetry} className={primaryBtn}>{retryLabel}</button>
        {secondary && (
          <button type="button" onClick={secondary.onClick} className={textLink}>{secondary.label}</button>
        )}
      </div>
    </motion.div>
  );
}

/** Headline untuk job berstatus failed (pemetaan dari panduan, Section 6.6). */
export function failureCopy(error?: string | null) {
  const { headline, known } = describeFailure(error);
  return { headline, details: known ? null : error };
}
