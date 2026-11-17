'use client';

import React, { useMemo, useState } from 'react';
import { FEATURES, PipelineJob, SimResult, Trace, joinList } from '@/lib/pipeline';
import { isStrongChange } from '@/lib/biomarkerHighlight';
import { SHORT_DESC } from '../../components/report/biomarkerText';
import TraceChart, { Series } from './TraceChart';
import type { DoseKey } from '../useDosePredictions';
import type { PredictionOutput } from '@/lib/predict';

// Palet sekuensial satu hue: makin gelap = dosis makin tinggi. Semua >= 3:1 terhadap surface
// (dicek dengan validator dataviz). Kontrol: abu-abu netral + garis putus sebagai pembeda kedua.
const DOSE_COLORS = ['#CF6A76', '#B0414E', '#862633', '#561119'];
const CONTROL_COLOR = '#7C828D';
const CONTROL_LABEL = 'Control';

const PRESETS: { label: string; domain: [number, number] }[] = [
  { label: '0–800 ms', domain: [0, 800] },
  { label: 'Full beat', domain: [0, 2000] },
];

const numFmt = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
export const fmtValue = (v?: number | null) => (typeof v === 'number' && Number.isFinite(v) ? numFmt.format(v) : '—');
const fmtRatio = (v?: number | null) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(4) : '—');

type DoseTrace = Trace & { dose: number };

/** Job lama (sebelum 19 Okt) cuma punya `trace` tunggal pada 2× Cmax. */
function getRuns(r: SimResult, fallbackDose: number): DoseTrace[] {
  if (Array.isArray(r.traces_by_dose) && r.traces_by_dose.length) return r.traces_by_dose;
  return r.trace ? [{ dose: fallbackDose, ...r.trace }] : [];
}

export const doseSeriesLabel = (dose: number) => `${dose}× Cmax`;

/* =========================================================
   TRACE: dua chart sinkron (hover, zoom, legend dipakai bersama)
   ========================================================= */

/** Data kurva AP & kalsium per dosis + kontrol */
export function useTraceSeries(job: PipelineJob) {
  const r = job.sim_result;
  const fallbackDose = job.sim_params?.dose ?? 2;
  return useMemo(() => {
    if (!r) return { apSeries: [] as Series[], caSeries: [] as Series[] };
    const runs = getRuns(r, fallbackDose);
    const control = r.control_trace;
    return {
      apSeries: [
        ...(control ? [{ label: CONTROL_LABEL, x: control.time, y: control.voltage, color: CONTROL_COLOR, dashed: true }] : []),
        ...runs.map((t, i) => ({ label: doseSeriesLabel(t.dose), x: t.time, y: t.voltage, color: DOSE_COLORS[i % 4] })),
      ],
      caSeries: [
        ...(control ? [{ label: CONTROL_LABEL, x: control.time, y: control.cai.map(v => v * 1e6), color: CONTROL_COLOR, dashed: true }] : []),
        ...runs.map((t, i) => ({ label: doseSeriesLabel(t.dose), x: t.time, y: t.cai.map(v => v * 1e6), color: DOSE_COLORS[i % 4] })),
      ],
    };
  }, [r, fallbackDose]);
}

export function TracesSection({ apSeries, caSeries, highlight = null }: {
  apSeries: Series[];
  caSeries: Series[];
  /** Label kurva yang ditonjolkan (dosis yang dipilih); kurva lain diredupkan */
  highlight?: string | null;
}) {
  const [domain, setDomain] = useState<[number, number]>(PRESETS[0].domain);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [hoverFocus, setHoverFocus] = useState<string | null>(null);

  const labels = apSeries.map(s => s.label);
  const isPreset = PRESETS.some(p => p.domain[0] === domain[0] && p.domain[1] === domain[1]);
  const focus = hoverFocus ?? (highlight && labels.includes(highlight) ? highlight : null);

  const toggle = (label: string) => setHidden(prev => {
    const next = new Set(prev);
    if (next.has(label)) next.delete(label);
    else if (labels.length - next.size > 1) next.add(label); // minimal satu kurva tetap tampil
    return next;
  });

  const chartProps = { domain, onZoom: setDomain, hoverT, onHover: setHoverT, hidden, focus };
  const charts = [
    { id: 'ap', title: 'Action potential', unit: 'mV', series: apSeries },
    { id: 'ca', title: 'Calcium transient', unit: 'nM', series: caSeries },
  ];

  return (
    <div>
      {/* Satu baris kontrol: legend di kiri, rentang waktu di kanan */}
      {/* Ponsel: legend & rentang waktu rata tengah; desktop: kiri & kanan */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-3 mb-6">
        <div className="flex flex-wrap justify-center sm:justify-start gap-x-1 gap-y-1 sm:-ml-2">
          {apSeries.map(s => {
            const off = hidden.has(s.label);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => toggle(s.label)}
                onMouseEnter={() => !off && setHoverFocus(s.label)}
                onMouseLeave={() => setHoverFocus(null)}
                onFocus={() => !off && setHoverFocus(s.label)}
                onBlur={() => setHoverFocus(null)}
                aria-pressed={!off}
                title={off ? 'Show' : 'Hide'}
                className={`flex items-center gap-2 px-2 py-1 rounded-chip text-xs transition-colors hover:bg-foreground/4
                  ${off ? 'text-muted/40' : 'text-foreground'} ${focus === s.label ? 'bg-foreground/4 font-medium' : ''}`}
              >
                <svg width="16" height="6" aria-hidden="true">
                  <line x1="0" y1="3" x2="16" y2="3" stroke={off ? 'currentColor' : s.color} strokeWidth="2" strokeDasharray={s.dashed ? '4 3' : undefined} />
                </svg>
                <span className={off ? 'line-through' : ''}>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs">
          {PRESETS.map(p => {
            const active = p.domain[0] === domain[0] && p.domain[1] === domain[1];
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setDomain(p.domain)}
                className={`transition-colors ${active ? 'text-foreground font-medium' : 'text-muted hover:text-foreground'}`}
              >
                {p.label}
              </button>
            );
          })}
          {!isPreset && (
            <button type="button" onClick={() => setDomain(PRESETS[0].domain)} className="font-mono text-action hover:underline underline-offset-4">
              {domain[0]}–{domain[1]} ms · reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {charts.map(c => (
          <figure key={c.id} className="min-w-0">
            <figcaption className="mb-2 text-sm font-medium text-foreground">{c.title}</figcaption>
            <TraceChart {...chartProps} series={c.series} unit={c.unit} label={`${c.title} versus time`} />
          </figure>
        ))}
      </div>

      {/* Di layar sentuh drag tidak dipakai untuk zoom (bentrok dengan scroll) */}
      <p className="mt-4 text-[11px] text-muted/80 text-center sm:text-left">
        <span className="hidden md:inline">Hover to read values. Drag across a chart to zoom. Click a legend entry to hide it.</span>
        <span className="md:hidden">Tap a chart to read values. Tap a legend entry to hide it.</span>
      </p>
    </div>
  );
}

/* =========================================================
   MATRIKS BIOMARKER: rasio tiap dosis + rata-rata, kolom dosis terpilih ditonjolkan
   ========================================================= */
export function BiomarkerMatrix({ job, selected, onSelect }: {
  job: PipelineJob;
  selected: DoseKey;
  onSelect?: (key: DoseKey) => void;
}) {
  const r = job.sim_result;
  const perDose = useMemo(() => [...(r?.per_dose ?? [])].sort((a, b) => a.dose - b.dose), [r]);
  if (!r) return null;

  const meanRatios = job.ratios ?? [];
  const selectedRun = selected === 'mean' ? null : perDose.find(d => d.dose === selected) ?? null;
  const drugRaw = selectedRun ? selectedRun.raw_metrics : r.raw_metrics;
  const columns: { key: DoseKey; label: string; ratios: (number | null)[] }[] = [
    ...perDose.map(d => ({ key: d.dose as DoseKey, label: `${d.dose}×`, ratios: d.ratios ?? [] })),
    { key: 'mean', label: 'Mean', ratios: meanRatios },
  ];
  const isSel = (k: DoseKey) => k === selected;

  return (
    <div>
      <p className="text-sm text-foreground/70 max-w-3xl leading-relaxed">
        The first two columns are the raw values from the simulation. The dose columns are ratios to the drug-free
        cell (drug value ÷ |drug-free value|), and these are what the risk model reads. No change is 1, or −1 for
        biomarkers that are negative, such as vrest. Marked: qNet below 0.9, APD50 or APD90 above 1.1, and any
        other biomarker that moved more than 10%. The highlighted column is the dose you are
        looking at{onSelect ? '; click a column header to switch' : ''}.
      </p>

      <div className="mt-6 overflow-x-auto -mx-2 overscroll-x-contain">
        <table className="w-full min-w-[44rem] text-sm border-separate border-spacing-0">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-wider text-foreground/60">
              <th className="sticky left-0 z-10 bg-background shadow-[inset_-1px_0_0_rgb(42_42_42/0.1)] px-2 py-2.5 font-medium text-left border-b border-foreground/8">Biomarker</th>
              <th className="px-2 py-2.5 font-medium text-right border-b border-foreground/8">Drug-free</th>
              <th className="px-2 py-2.5 font-medium text-right border-b border-foreground/8">
                With drug {selected === 'mean' ? '(mean)' : `(${selected}×)`}
              </th>
              {columns.map(c => (
                <th
                  key={String(c.key)}
                  className={`px-2 py-2.5 font-medium text-right border-b border-foreground/8 ${isSel(c.key) ? 'bg-action/8 text-action rounded-t-card' : ''}`}
                >
                  {onSelect ? (
                    <button type="button" onClick={() => onSelect(c.key)} className="uppercase tracking-wider hover:text-action transition-colors">
                      {c.label}
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((key, i) => {
              // Baris selang-seling dengan warna solid, supaya kolom sticky ikut tertutup rapi
              const zebra = i % 2 === 0 ? 'bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]' : 'bg-background';
              const control = r.control_metrics?.[key];
              return (
                <tr key={key} className="align-top">
                  <td className={`sticky left-0 z-10 ${zebra} px-2 py-3 max-w-56 rounded-l-chip shadow-[inset_-1px_0_0_rgb(42_42_42/0.1)]`}>
                    <span className="font-medium text-foreground">{key}</span>
                    <span className="hidden sm:block text-[11px] text-foreground/60 leading-snug mt-0.5">{SHORT_DESC[key]}</span>
                  </td>
                  <td className={`${zebra} px-2 py-3 text-right font-mono text-foreground/70`}>{fmtValue(control)}</td>
                  <td className={`${zebra} px-2 py-3 text-right font-mono text-foreground`}>{fmtValue(drugRaw?.[key])}</td>
                  {columns.map((c, ci) => {
                    const v = c.ratios[i];
                    return (
                      <td
                        key={String(c.key)}
                        className={`${zebra} px-2 py-3 text-right font-mono tabular-nums ${ci === columns.length - 1 ? 'rounded-r-chip' : ''}
                          ${isSel(c.key) ? 'shadow-[inset_0_0_0_9999px_rgb(42_42_42/0.06)]' : ''}
                          ${isStrongChange(key, v) ? 'text-accent font-semibold' : isSel(c.key) ? 'text-foreground' : 'text-foreground/70'}`}
                      >
                        {fmtRatio(v)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   CATATAN RUN: data run & keluaran conformal
   ========================================================= */

const fmtStat = (v: number) => (Number.isFinite(v) ? String(Number(v.toPrecision(4))) : '—');

/**
 * Data run & model, hanya dari respons API (job + predict). Tidak ada angka protokol yang ditulis tangan.
 * Catatan kalibrasi conformal ditampilkan apa adanya dari model.
 */
export function MethodNote({ job, prediction }: { job: PipelineJob; prediction?: PredictionOutput | null }) {
  const r = job.sim_result;
  const doses = r?.doses ?? job.sim_params?.doses ?? [];
  const conc = r ? (Array.isArray(r.conc_nM) ? r.conc_nM : [r.conc_nM]) : [];
  const seconds = typeof job.sim_latency_ms === 'number' ? (job.sim_latency_ms / 1000).toFixed(1) : null;
  const c = prediction?.conformal;

  const facts: { k: string; v: string }[] = [
    { k: 'Doses', v: doses.length ? `${joinList(doses)}× Cmax` : '—' },
    ...(conc.length ? [{ k: 'Concentrations', v: conc.map(x => `${fmtValue(x)} nM`).join(', ') }] : []),
    ...(r?.dose_mode ? [{ k: 'Dose mode', v: r.dose_mode.replace(/_/g, ' ') }] : []),
    ...(seconds ? [{ k: 'Simulation time', v: `${seconds} s` }] : []),
    ...(r?.engine_version ? [{ k: 'Simulation engine', v: r.engine_version }] : []),
    ...(c ? [
      { k: 'Prediction set', v: c.predictionSet.join(', ') || '—' },
      { k: 'Alpha (α)', v: fmtStat(c.alpha) },
      { k: 'Threshold (q̂)', v: fmtStat(c.qHat) },
    ] : []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-14">
      <dl>
        {facts.map(f => (
          <div key={f.k} className="flex items-baseline justify-between gap-4 py-2 border-b border-foreground/10 last:border-b-0 text-sm">
            <dt className="text-foreground/70">{f.k}</dt>
            <dd className="text-right text-foreground">{f.v}</dd>
          </div>
        ))}
      </dl>
      {c?.calibrationNote || c?.warning ? (
        <div className="flex flex-col gap-3 text-sm text-foreground/70 leading-relaxed">
          <span className="text-xs font-mono uppercase tracking-wider text-foreground/60">From the risk model</span>
          {c.calibrationNote && <p>{c.calibrationNote}</p>}
          {c.warning && <p className="text-accent">{c.warning}</p>}
        </div>
      ) : null}
    </div>
  );
}
