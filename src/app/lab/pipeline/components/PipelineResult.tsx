'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { DrugDb, PipelineJob, describeFailure, formatDrugName, joinList } from '@/lib/pipeline';
import { getTierColor, normalizeTier } from '@/lib/tierColor';
import { DoseKey, DoseOption, DoseResult, doseId, useDosePredictions } from '../useDosePredictions';
import HeartbeatLoader from '../../components/report/HeartbeatLoader';
import RiskVerdict from '../../components/report/RiskVerdict';
import BiomarkerList from '../../components/report/BiomarkerList';
import { SectionHead, SlideIndicator, TabRail, primaryBtn, textLink } from '../../components/report/ui';
import DrugInputs from './DrugInputs';
import { BiomarkerMatrix, MethodNote, TracesSection, doseSeriesLabel, useTraceSeries } from './SimulationPanel';

/*
 * Halaman hasil Full Pipeline, dibaca dari atas seperti laporan singkat:
 * 1. vonis dosis terpilih  2. strip dosis  3. 11 biomarker  4. satu pilihan detail.
 * Semua angka dari API (job, predict, explain). Tanpa kartu bertumpuk; pemisah cukup garis tipis.
 */

const SEVERITY = { low: 1, intermediate: 2, high: 3 } as const;
const severity = (tier?: string) => (tier && tier !== 'unknown' ? SEVERITY[normalizeTier(tier)] : 0);

const doseLabel = (key: DoseKey) => (key === 'mean' ? 'Mean' : `${key}× Cmax`);

/* =========================================================
   1. VONIS (atau loader / error untuk dosis yang sedang dihitung)
   ========================================================= */
function Verdict({ option, result, onRetry }: { option: DoseOption; result?: DoseResult; onRetry: () => void }) {
  if (!option.ratios && option.key !== 'mean') {
    return (
      <p className="text-center text-base text-foreground/70 max-w-xl mx-auto leading-relaxed text-balance">
        The simulation returned no value for some biomarkers at {doseLabel(option.key)}, so the risk model was not run
        for this dose.
      </p>
    );
  }
  if (result?.status === 'error') {
    return (
      <div className="text-center">
        <p className="text-base text-foreground max-w-xl mx-auto leading-relaxed text-balance">{result.error}</p>
        <button type="button" onClick={onRetry} className={`${primaryBtn} mt-6`}>Try again</button>
      </div>
    );
  }
  if (!result?.tier || result.status === 'predicting' || result.status === 'idle') {
    return (
      <HeartbeatLoader
        eyebrow={doseLabel(option.key)}
        title="Checking the risk"
        detail={`The model is reading the 11 biomarkers at ${option.key === 'mean' ? 'the mean of all doses' : doseLabel(option.key)}.`}
        steps={[{ label: 'Risk group', state: 'active' }]}
      />
    );
  }
  return <RiskVerdict tier={result.tier} prediction={result.prediction} />;
}

/* =========================================================
   2. STRIP DOSIS: kolom selebar layar, penanda bergeser mulus
   ========================================================= */
function DoseStrip({ options, results, selected, onSelect, eadsByDose }: {
  options: DoseOption[];
  results: Record<string, DoseResult>;
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
        const r = results[doseId(o.key)];
        const isSel = doseId(o.key) === doseId(selected);
        const unavailable = !o.ratios && o.key !== 'mean';
        const tier = r?.tier && r.tier !== 'unknown' ? r.tier : null;
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
            <span className={`block mt-1 text-xs capitalize ${tier ? getTierColor(tier).text : ''}`}>
              {unavailable ? 'n/a' : r?.status === 'predicting' ? (
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>checking</motion.span>
              ) : r?.status === 'error' ? 'failed' : tier ?? '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   CATATAN SIMULASI: temuan dirangkai jadi satu kalimat
   ========================================================= */
function simFinding(job: PipelineJob): React.ReactNode | null {
  const perDose = [...(job.sim_result?.per_dose ?? [])].sort((a, b) => a.dose - b.dose);
  const eads = perDose.filter(d => (d.flags?.EADs ?? 0) > 0).map(d => d.dose);
  const failed = perDose.filter(d => (d.flags?.noDepols ?? 0) + (d.flags?.noRepols ?? 0) > 0).map(d => d.dose);
  const anyEads = eads.length > 0 || (job.sim_result?.flags?.EADs ?? 0) > 0;
  if (!anyEads && !failed.length) return null;
  // Hanya istilah kuncinya yang diberi warna
  return (
    <>
      The simulated cell also showed
      {anyEads && <> <span className="text-amber-700">extra beats during recovery (EADs)</span>{eads.length > 0 && <> at {joinList(eads)}× Cmax</>}</>}
      {anyEads && failed.length > 0 && ', and'}
      {failed.length > 0 && <> <span className="text-amber-700">beats that failed</span> at {joinList(failed)}× Cmax</>}
      .
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
  const { options, results, run } = useDosePredictions(job);
  const { apSeries, caSeries } = useTraceSeries(job);
  const [selected, setSelected] = useState<DoseKey>('mean');
  const [detail, setDetail] = useState<DetailId>('traces');

  const perDose = useMemo(() => job.sim_result?.per_dose ?? [], [job.sim_result]);
  const eadsByDose = useMemo(() => new Map(perDose.map(d => [d.dose, d.flags?.EADs ?? 0])), [perDose]);
  const finding = useMemo(() => simFinding(job), [job]);
  const doses = job.sim_result?.doses ?? job.sim_params?.doses ?? perDose.map(d => d.dose);

  const mean = results.mean;
  const drug = job.request?.drug ?? job.sim_params?.drug;
  const cipaRisk = drug ? db?.drugs[drug.toLowerCase()]?.cipa_risk : undefined;

  const selectedOption = options.find(o => doseId(o.key) === doseId(selected)) ?? options[0];
  const selectedResult = results[doseId(selected)];
  const selectedRun = perDose.find(d => d.dose === selected);
  const selectedRatios = selected === 'mean' ? job.ratios ?? [] : selectedRun?.ratios ?? [];

  // Pilih dosis = prediksi + SHAP (kalau belum ada). Mean memakai hasil job; SHAP-nya dilengkapi kalau kosong.
  const select = (key: DoseKey) => {
    setSelected(key);
    void run(key);
  };

  // Dosis dengan tier lebih berat dari rata-rata
  const above = options
    .filter(o => o.key !== 'mean' && severity(results[doseId(o.key)]?.tier) > severity(mean?.tier))
    .map(o => ({ dose: o.key as number, tier: results[doseId(o.key)]!.tier! }));
  const untested = options.some(o => o.key !== 'mean' && o.ratios && !results[doseId(o.key)]?.tier);

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

      {/* ---------- 1. Vonis (key unik per bagian: jangan sama dengan key BiomarkerList) ---------- */}
      <motion.div
        key={`verdict-${doseId(selected)}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-[var(--verdict-h)] flex flex-col justify-center [--verdict-h:20rem] sm:[--verdict-h:18rem]"
      >
        <Verdict option={selectedOption} result={selectedResult} onRetry={() => void run(selected)} />
      </motion.div>

      {/* ---------- 2. Dosis ---------- */}
      <section aria-labelledby="doses-heading">
        <SectionHead id="doses-heading" title="Risk at each dose" meta={`${doses.length} doses simulated`} />
        <div className="mt-5">
          <DoseStrip options={options} results={results} selected={selected} onSelect={select} eadsByDose={eadsByDose} />
        </div>
        {(above.length > 0 || untested || finding) && (
          <p className="mt-5 mx-auto max-w-2xl text-center text-sm text-foreground/70 leading-relaxed text-balance">
            {above.length > 0 && mean?.tier ? (
              <span className="text-foreground">
                {above.map((a, i) => (
                  <span key={a.dose}>
                    {i > 0 && (i === above.length - 1 ? ' and ' : ', ')}
                    {a.dose}× Cmax rates <span className={`font-medium ${getTierColor(a.tier).text}`}>{a.tier}</span>
                  </span>
                ))}
                , higher than the mean.
              </span>
            ) : untested ? (
              <>Tap a dose to see its risk on its own.</>
            ) : null}
            {finding && <> {finding}</>}
          </p>
        )}
      </section>

      {/* ---------- 3. 11 biomarker dosis terpilih ---------- */}
      <BiomarkerList
        key={`biomarkers-${doseId(selected)}`}
        ratios={selectedRatios}
        control={job.sim_result?.control_metrics}
        drug={selectedRun ? selectedRun.raw_metrics : job.sim_result?.raw_metrics}
        tier={selectedResult?.tier}
        shap={selectedResult?.shap}
        explaining={selectedResult?.status === 'explaining'}
        shapError={selectedResult?.shapError}
        onExplain={() => void run(selected)}
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
              <BiomarkerMatrix job={job} selected={selected} onSelect={select} />
              <DrugInputs job={job} db={db} selected={selected} onSelect={select} parts="doses" />
            </div>
          )}
          {detail === 'drug' && (
            <div className="flex flex-col gap-12">
              <DrugInputs job={job} db={db} selected={selected} parts="params" />
              <div className="border-t border-foreground/10 pt-10">
                <MethodNote job={job} prediction={selectedResult?.prediction} />
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
