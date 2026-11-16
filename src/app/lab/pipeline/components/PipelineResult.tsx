'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  DoseKey, DrugDb, FEATURES, PipelineJob, describeFailure, doseId, formatChange, formatDrugName, joinList, ratioChange,
} from '@/lib/pipeline';
import { getTierColor } from '@/lib/tierColor';
import { parsePredictResponse, type ShapData } from '@/lib/predict';
import RiskVerdict from '../../components/report/RiskVerdict';
import BiomarkerList from '../../components/report/BiomarkerList';
import { SectionHead, SlideIndicator, TabRail, primaryBtn, textLink } from '../../components/report/ui';
import DrugInputs from './DrugInputs';
import { BiomarkerMatrix, MethodNote, TracesSection, doseSeriesLabel, useTraceSeries } from './SimulationPanel';

/*
 * Halaman hasil Full Pipeline, dibaca dari atas seperti laporan singkat:
 * 1. vonis hasil run (mean ratios)  2. strip dosis  3. 11 biomarker dosis terpilih  4. satu pilihan detail.
 * Prediksi risiko & SHAP hanya berjalan sekali per run atas rata-rata biomarker.
 */

export type DoseOption = {
  key: DoseKey;
  label: string;
  ratios: (number | null)[] | null;
};

/* =========================================================
   2. STRIP DOSIS: kolom selebar layar, penanda bergeser mulus
   ========================================================= */
function DoseStrip({ options, selected, onSelect, eadsByDose }: {
  options: DoseOption[];
  selected: DoseKey;
  onSelect: (key: DoseKey) => void;
  eadsByDose: Map<number, number>;
}) {
  const index = options.findIndex(o => doseId(o.key) === doseId(selected));
  return (
    <div
      role="radiogroup"
      aria-label="Dose"
      className="relative grid border-y border-foreground/10"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <SlideIndicator index={index} count={options.length} className="left-0 -bottom-px h-0.5 px-3 before:block before:h-full before:rounded-full before:bg-action" />
      {options.map(o => {
        const isSel = doseId(o.key) === doseId(selected);
        const eads = o.key === 'mean' ? 0 : eadsByDose.get(o.key) ?? 0;
        return (
          <button
            key={doseId(o.key)}
            type="button"
            role="radio"
            aria-checked={isSel}
            onClick={() => onSelect(o.key)}
            className={`relative py-4 md:py-5 text-center transition-colors duration-300 ${isSel ? 'text-action' : 'text-foreground/60 hover:text-foreground'}`}
          >
            <span className="block text-sm font-medium">
              {o.key === 'mean' ? 'Mean' : <>{o.key}×<span className="hidden sm:inline"> Cmax</span></>}
              {eads > 0 && (
                <span title="Early afterdepolarizations at this dose" className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-500 align-middle" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   CATATAN SIMULASI: temuan simulasi (EADs, gagal, divergensi)
   ========================================================= */
function simFindings(job: PipelineJob): React.ReactNode | null {
  const perDose = [...(job.sim_result?.per_dose ?? [])].sort((a, b) => a.dose - b.dose);
  const eads = perDose.filter(d => (d.flags?.EADs ?? 0) > 0).map(d => d.dose);
  const noRepols = perDose.filter(d => (d.flags?.noRepols ?? 0) > 0).map(d => d.dose);
  const noDepols = perDose.filter(d => (d.flags?.noDepols ?? 0) > 0).map(d => d.dose);
  const anyEads = eads.length > 0 || (job.sim_result?.flags?.EADs ?? 0) > 0;
  const anyNoRepols = noRepols.length > 0;
  const anyNoDepols = noDepols.length > 0;

  // Cek divergensi biomarker antar dosis
  let maxSpread = 0;
  let divergentBm: { key: string; min: number; max: number; minDose: number; maxDose: number } | null = null;
  if (perDose.length > 1) {
    for (let i = 0; i < FEATURES.length; i++) {
      const key = FEATURES[i];
      let minVal = Infinity;
      let maxVal = -Infinity;
      let minD = 0;
      let maxD = 0;
      for (const d of perDose) {
        const r = d.ratios?.[i];
        if (typeof r === 'number' && Number.isFinite(r)) {
          if (r < minVal) { minVal = r; minD = d.dose; }
          if (r > maxVal) { maxVal = r; maxD = d.dose; }
        }
      }
      if (minVal !== Infinity && maxVal !== -Infinity) {
        const spread = maxVal - minVal;
        if (spread > maxSpread) {
          maxSpread = spread;
          divergentBm = { key, min: minVal, max: maxVal, minDose: minD, maxDose: maxD };
        }
      }
    }
  }

  const flags: React.ReactNode[] = [];
  if (anyEads) {
    flags.push(
      <span key="eads">
        <span className="text-amber-700 font-medium">extra beats during recovery (EADs)</span>
        {eads.length > 0 && <> at {joinList(eads)}× Cmax</>}
      </span>,
    );
  }
  if (anyNoRepols) {
    flags.push(
      <span key="norepols">
        <span className="text-amber-700 font-medium">repolarization failures</span> at {joinList(noRepols)}× Cmax
      </span>,
    );
  }
  if (anyNoDepols) {
    flags.push(
      <span key="nodepols">
        <span className="text-amber-700 font-medium">depolarization failures</span> at {joinList(noDepols)}× Cmax
      </span>,
    );
  }

  if (flags.length > 0) {
    return (
      <>
        Simulation flags: {flags.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && (i === flags.length - 1 ? ' and ' : ', ')}
            {p}
          </React.Fragment>
        ))}
        . Select a dose above to inspect its action potential traces and biomarker values.
      </>
    );
  }

  if (divergentBm && maxSpread >= 0.15) {
    const minChg = formatChange(ratioChange(divergentBm.min));
    const maxChg = formatChange(ratioChange(divergentBm.max));
    return (
      <>
        Biomarker response across doses varied most in <span className="font-mono text-foreground">{divergentBm.key}</span> ({minChg} at {divergentBm.minDose}× to {maxChg} at {divergentBm.maxDose}× Cmax), with no early afterdepolarizations. Select a dose above to inspect traces and biomarkers.
      </>
    );
  }

  return (
    <>
      All {perDose.length || 4} doses simulated with stable repolarization. Select a dose above to inspect its action potential traces and biomarker values.
    </>
  );
}

/* =========================================================
   HALAMAN HASIL
   ========================================================= */
type DetailId = 'traces' | 'doses' | 'drug';
const DETAILS: { id: DetailId; label: string }[] = [
  { id: 'traces', label: 'AP & calcium' },
  { id: 'doses', label: 'All doses' },
  { id: 'drug', label: 'Drug & method' },
];

export default function PipelineResult({ job, db, onRunAnother }: {
  job: PipelineJob; db: DrugDb | null; onRunAnother: () => void;
}) {
  const { apSeries, caSeries } = useTraceSeries(job);
  const [selected, setSelected] = useState<DoseKey>('mean');
  const [detail, setDetail] = useState<DetailId>('traces');

  const perDose = useMemo(() => job.sim_result?.per_dose ?? [], [job.sim_result]);
  const eadsByDose = useMemo(() => new Map(perDose.map(d => [d.dose, d.flags?.EADs ?? 0])), [perDose]);
  const finding = useMemo(() => simFindings(job), [job]);
  const doses = job.sim_result?.doses ?? job.sim_params?.doses ?? perDose.map(d => d.dose);

  const options: DoseOption[] = useMemo(() => {
    const runs = [...perDose].sort((a, b) => a.dose - b.dose);
    return [
      { key: 'mean' as const, label: 'Mean', ratios: job.ratios ?? null },
      ...runs.map(d => ({ key: d.dose, label: `${d.dose}×`, ratios: d.ratios ?? null })),
    ];
  }, [job, perDose]);

  // Run-level AI prediction & explanation dari payload job (dihitung sekali oleh backend atas mean ratios)
  const rawPrediction = Array.isArray(job.prediction) ? job.prediction : null;
  const runTier = rawPrediction
    ? String((rawPrediction[0] as { label?: string } | undefined)?.label ?? 'unknown').toLowerCase()
    : 'unknown';
  const runPrediction = useMemo(() => (rawPrediction ? parsePredictResponse(rawPrediction) : null), [rawPrediction]);

  const runShap = useMemo((): ShapData | null => {
    const first = Array.isArray(job.explanation) ? (job.explanation[0] as Partial<ShapData> | undefined) : undefined;
    return first && Array.isArray(first.contributions) && typeof first.base_value === 'number'
      ? { predicted_class: runTier, base_value: first.base_value, contributions: first.contributions }
      : null;
  }, [job.explanation, runTier]);

  const drug = job.request?.drug ?? job.sim_params?.drug;
  const cipaRisk = drug ? db?.drugs[drug.toLowerCase()]?.cipa_risk : undefined;

  const selectedRun = perDose.find(d => d.dose === selected);
  const selectedRatios = selected === 'mean' ? job.ratios ?? [] : selectedRun?.ratios ?? [];

  return (
    // Satu kolom konten yang konsisten; di layar lebar baris tidak melebar berlebihan
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-14 md:gap-20 pb-20">
      {/* ---------- Baris atas: obat di kiri, simulasi baru di kanan ---------- */}
      <div className="flex items-center justify-between gap-4 px-1">
        {/* Ponsel: "CiPA" saja & tombol ringkas, supaya nama obat tidak terpotong */}
        <p className="min-w-0 text-sm text-foreground/70 leading-snug">
          <span className="font-medium text-foreground">{drug ? formatDrugName(drug) : 'Custom compound'}</span>
          {cipaRisk && (
            <> · CiPA<span className="hidden sm:inline"> reference</span>{' '}
              <span className={`capitalize ${getTierColor(cipaRisk).text}`}>{cipaRisk}</span>
            </>
          )}
        </p>
        <button type="button" onClick={onRunAnother} className={`${primaryBtn} max-sm:px-3.5 max-sm:py-2 max-sm:text-xs`}>
          New simulation
        </button>
      </div>

      {/* ---------- 1. Vonis hasil run (selalu dari mean ratios job, dirender sekali per run) ---------- */}
      <div className="min-h-[var(--verdict-h)] flex flex-col justify-center [--verdict-h:20rem] sm:[--verdict-h:18rem]">
        {rawPrediction ? (
          <RiskVerdict tier={runTier} prediction={runPrediction} />
        ) : (
          <p className="text-center text-base text-foreground/70 max-w-xl mx-auto leading-relaxed text-balance">
            The AI result for this run could not be read.
          </p>
        )}
      </div>

      {/* ---------- 2. Dosis ---------- */}
      <section aria-labelledby="doses-heading">
        <SectionHead id="doses-heading" title="Simulated doses" meta={`${doses.length} doses simulated`} />
        <div className="mt-5">
          <DoseStrip options={options} selected={selected} onSelect={setSelected} eadsByDose={eadsByDose} />
        </div>
        {finding && (
          <p className="mt-5 mx-auto max-w-2xl text-center text-sm text-foreground/70 leading-relaxed text-balance">
            {finding}
          </p>
        )}
      </section>

      {/* ---------- 3. 11 biomarker dosis terpilih ---------- */}
      <BiomarkerList
        ratios={selectedRatios}
        control={job.sim_result?.control_metrics}
        drug={selectedRun ? selectedRun.raw_metrics : job.sim_result?.raw_metrics}
        tier={runTier}
        shap={runShap}
        explaining={false}
        driversNote="Calculated for the overall run from the mean biomarker profile across simulated doses."
        meta={selected === 'mean' ? 'Showing mean across doses' : `Showing ${selected}× Cmax`}
        emptyDriversMessage="The driver analysis (SHAP) is not available for this simulation run."
      />

      {/* ---------- 4. Detail: satu pilihan, bukan banyak tab ---------- */}
      <section aria-label="More detail">
        <SectionHead title="Behind the result" />
        <div className="mt-5">
          <TabRail tabs={DETAILS} value={detail} onChange={id => setDetail(id as DetailId)} label="More detail" panelPrefix="detail" />
        </div>

        <motion.div
          key={detail}
          id={`detail-${detail}`}
          role="tabpanel"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 md:pt-10"
        >
          {detail === 'traces' && (
            <TracesSection apSeries={apSeries} caSeries={caSeries} highlight={selected === 'mean' ? null : doseSeriesLabel(selected)} />
          )}
          {detail === 'doses' && (
            <div className="flex flex-col gap-12">
              <BiomarkerMatrix job={job} selected={selected} onSelect={setSelected} />
              <DrugInputs job={job} db={db} selected={selected} onSelect={setSelected} parts="doses" />
            </div>
          )}
          {detail === 'drug' && (
            <div className="flex flex-col gap-12">
              <DrugInputs job={job} db={db} selected={selected} parts="params" />
              <div className="border-t border-foreground/10 pt-10">
                <MethodNote job={job} prediction={runPrediction} />
              </div>
            </div>
          )}
        </motion.div>
      </section>
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
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-surface-white/70 border border-foreground/10 rounded-sheet shadow-sm px-6 sm:px-10 md:px-16 py-10 md:py-14 mb-20"
    >
      <span className="text-xs font-mono uppercase tracking-wider text-accent">Simulation failed</span>
      <p className="mt-4 text-xl md:text-2xl font-medium tracking-tight text-foreground leading-snug max-w-3xl">{headline}</p>

      {details && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors"
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
