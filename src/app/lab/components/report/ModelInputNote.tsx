import React from 'react';
import { FEATURES, strongestChange, type PipelineJob } from '@/lib/pipeline';
import GuideLink from '../GuideLink';

/*
 * Menjelaskan apa yang benar-benar masuk ke model risiko pada Full Pipeline:
 * simulasi berjalan di 1×, 2×, 3×, 4× Cmax, tiap biomarker punya rasio di setiap dosis,
 * lalu keempat rasio itu dirata-rata. 11 rata-rata inilah input model (satu prediksi per run).
 * Contoh memakai angka run ini sendiri: biomarker yang berubah paling besar.
 */

const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const show = (v?: number | null) => (typeof v === 'number' && Number.isFinite(v) ? fmt.format(v) : '—');

export default function ModelInputNote({ job }: { job: PipelineJob }) {
  const r = job.sim_result;
  const perDose = [...(r?.per_dose ?? [])].sort((a, b) => a.dose - b.dose);
  const doses = r?.doses ?? job.sim_params?.doses ?? perDose.map(d => d.dose);
  const mean = job.ratios ?? [];
  const example = strongestChange(mean);
  const idx = example ? FEATURES.indexOf(example.key as (typeof FEATURES)[number]) : -1;
  const excluded = example ? r?.excluded_doses?.[example.key] ?? [] : [];
  const doseText = doses.length ? doses.map(d => `${d}×`).join(', ') : '1×, 2×, 3× and 4×';

  return (
    <section aria-labelledby="model-input-heading" className="border-y border-foreground/10 py-6 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
          <h3 id="model-input-heading" className="text-base md:text-lg font-medium tracking-tight text-foreground">
            What the model received
          </h3>
          <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
            The cell was simulated at {doses.length || 4} concentrations ({doseText} Cmax). Each of the 11 biomarkers gets
            a ratio at every concentration, and the model reads the <span className="text-foreground font-medium">average of those ratios</span>:
            one set of 11 numbers, one prediction for the whole run.
          </p>
        </div>
        <GuideLink topic="dose-averaging" />
      </div>

      {example && idx >= 0 && perDose.length > 0 && (
        <div className="mt-6 overflow-x-auto -mx-1 px-1 overscroll-x-contain">
          <p className="mb-2 text-xs text-foreground/55">
            Example from this run: <span className="font-mono text-foreground/80">{example.key}</span>, the biomarker that moved most
          </p>
          <dl className="grid min-w-[30rem] gap-px rounded-card overflow-hidden bg-foreground/10" style={{ gridTemplateColumns: `repeat(${perDose.length}, minmax(0,1fr)) 1.5rem minmax(0,1.2fr)` }}>
            {perDose.map(d => {
              const out = excluded.includes(d.dose);
              return (
                <div key={d.dose} className="bg-background px-3 py-3">
                  <dt className="text-[11px] text-foreground/55">{d.dose}× Cmax</dt>
                  <dd className={`mt-1 font-mono text-sm tabular-nums ${out ? 'text-foreground/35 line-through' : 'text-foreground'}`}>
                    {show(d.ratios?.[idx])}
                  </dd>
                </div>
              );
            })}
            <div className="bg-background flex items-center justify-center text-foreground/40" aria-hidden="true">=</div>
            <div className="bg-foreground/[0.04] px-3 py-3">
              <dt className="text-[11px] text-foreground/70">Mean (model input)</dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">{show(mean[idx])}</dd>
            </div>
          </dl>
          {excluded.length > 0 && (
            <p className="mt-2 text-xs text-foreground/55">
              Crossed out: undefined at that concentration, so it was left out of the average.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/** Digital Lab: 11 rasio dari pengguna langsung menjadi input model, tanpa simulasi dosis */
export function ManualInputNote() {
  return (
    <section aria-labelledby="manual-input-heading" className="border-y border-foreground/10 py-6 md:py-8 flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
      <div className="max-w-2xl">
        <h3 id="manual-input-heading" className="text-base md:text-lg font-medium tracking-tight text-foreground">
          What the model received
        </h3>
        <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
          The 11 ratios entered here went straight into the model; no doses were simulated for this result. If the values
          come from several concentrations, they should already be averaged, the same way the Full Pipeline averages 1× to 4× Cmax.
        </p>
      </div>
      <GuideLink topic="dose-averaging" />
    </section>
  );
}
