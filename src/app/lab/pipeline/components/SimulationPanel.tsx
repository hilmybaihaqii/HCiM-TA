'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FEATURES, PipelineJob, SimResult, Trace, formatDrugName, joinList } from '@/lib/pipeline';
import TraceChart, { Series } from './TraceChart';

// Palet sekuensial satu hue: makin gelap = dosis makin tinggi. Semua >= 3:1 terhadap surface
// (dicek dengan validator dataviz). Kontrol: abu-abu netral + garis putus sebagai pembeda kedua.
const DOSE_COLORS = ['#CF6A76', '#B0414E', '#862633', '#561119'];
const CONTROL_COLOR = '#7C828D';
const CONTROL_LABEL = 'Control';

const PRESETS: { label: string; domain: [number, number] }[] = [
  { label: '0–800 ms', domain: [0, 800] },
  { label: 'Full beat', domain: [0, 2000] },
];

const DESCRIPTIONS: Record<(typeof FEATURES)[number], string> = {
  qNet: 'Net charge carried by the main ionic currents during the beat (CiPA risk metric; lower = higher risk)',
  dvdtmax: 'Maximum upstroke velocity of the action potential',
  vmax: 'Peak membrane potential',
  vrest: 'Resting membrane potential',
  APD50: 'Action potential duration at 50% repolarization',
  APD90: 'Action potential duration at 90% repolarization (longer = QT-prolonging)',
  max_dv: 'Maximum rate of voltage change during repolarization',
  camax: 'Peak intracellular calcium',
  carest: 'Resting intracellular calcium',
  CaTD50: 'Calcium transient duration at 50% recovery',
  CaTD90: 'Calcium transient duration at 90% recovery',
};

/** Rasio dianggap "bergerak kuat" kalau menyimpang >= 10% dari kontrol (mis. APD90 > 1.1, qNet < 0.9). */
const isStrongShift = (r?: number | null) => typeof r === 'number' && Math.abs(r - 1) >= 0.1;

const numFmt = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 });
const fmtValue = (v?: number | null) => (typeof v === 'number' && Number.isFinite(v) ? numFmt.format(v) : '—');
const fmtRatio = (v?: number | null) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(4) : '—');

type DoseTrace = Trace & { dose: number };

/** Job lama (sebelum 19 Okt) cuma punya `trace` tunggal pada 2× Cmax. */
function getRuns(r: SimResult, fallbackDose: number): DoseTrace[] {
  if (Array.isArray(r.traces_by_dose) && r.traces_by_dose.length) return r.traces_by_dose;
  return r.trace ? [{ dose: fallbackDose, ...r.trace }] : [];
}

/** Peringatan proaritmia: teks dengan garis kiri, bukan chip berikon. */
function Warning({ children }: { children: React.ReactNode }) {
  return <li className="pl-4 border-l-2 border-amber-500/70 text-sm text-amber-800 leading-relaxed">{children}</li>;
}

/* =========================================================
   TRACE: dua chart sinkron (hover, zoom, legend dipakai bersama)
   ========================================================= */
function TracesSection({ apSeries, caSeries }: { apSeries: Series[]; caSeries: Series[] }) {
  const [domain, setDomain] = useState<[number, number]>(PRESETS[0].domain);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [focus, setFocus] = useState<string | null>(null);

  const labels = apSeries.map(s => s.label);
  const isPreset = PRESETS.some(p => p.domain[0] === domain[0] && p.domain[1] === domain[1]);

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
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-6">
        <div className="flex flex-wrap gap-x-1 gap-y-1 -ml-2">
          {apSeries.map(s => {
            const off = hidden.has(s.label);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => toggle(s.label)}
                onMouseEnter={() => !off && setFocus(s.label)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => !off && setFocus(s.label)}
                onBlur={() => setFocus(null)}
                aria-pressed={!off}
                title={off ? 'Show' : 'Hide'}
                className={`flex items-center gap-2 px-2 py-1 rounded-chip text-xs transition-colors hover:bg-foreground/4 ${off ? 'text-muted/40' : 'text-foreground'}`}
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
            <button type="button" onClick={() => setDomain(PRESETS[0].domain)} className="font-mono text-accent hover:underline underline-offset-4">
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
      <p className="mt-4 text-[11px] text-muted/80">
        <span className="hidden md:inline">Hover to read values. Drag across a chart to zoom.</span>
        <span className="md:hidden">Tap a chart to read values.</span>
      </p>
    </div>
  );
}

export default function SimulationPanel({ job }: { job: PipelineJob }) {
  const r = job.sim_result;
  const [showPerDose, setShowPerDose] = useState(false);
  const [showMethod, setShowMethod] = useState(false);

  const fallbackDose = job.sim_params?.dose ?? 2;
  const runs = useMemo(() => (r ? getRuns(r, fallbackDose) : []), [r, fallbackDose]);

  const apSeries: Series[] = useMemo(() => {
    if (!r) return [];
    return [
      ...(r.control_trace ? [{ label: CONTROL_LABEL, x: r.control_trace.time, y: r.control_trace.voltage, color: CONTROL_COLOR, dashed: true }] : []),
      ...runs.map((t, i) => ({ label: `${t.dose}× Cmax`, x: t.time, y: t.voltage, color: DOSE_COLORS[i % 4] })),
    ];
  }, [r, runs]);

  const caSeries: Series[] = useMemo(() => {
    if (!r) return [];
    return [
      ...(r.control_trace ? [{ label: CONTROL_LABEL, x: r.control_trace.time, y: r.control_trace.cai.map(v => v * 1e6), color: CONTROL_COLOR, dashed: true }] : []),
      ...runs.map((t, i) => ({ label: `${t.dose}× Cmax`, x: t.time, y: t.cai.map(v => v * 1e6), color: DOSE_COLORS[i % 4] })),
    ];
  }, [r, runs]);

  if (!r) return null;

  const drugName = job.sim_params?.drug || job.request?.drug;
  const drugLabel = drugName ? formatDrugName(drugName) : 'Custom compound';
  const doses = r.doses ?? job.sim_params?.doses ?? runs.map(t => t.dose);
  const conc = Array.isArray(r.conc_nM) ? r.conc_nM : [r.conc_nM];
  const isMean = doses.length > 1;
  const seconds = typeof job.sim_latency_ms === 'number' ? (job.sim_latency_ms / 1000).toFixed(1) : null;
  const ratios = job.ratios ?? [];
  const perDose = r.per_dose ?? [];

  const excluded = Object.entries(r.excluded_doses ?? {}).filter(([, d]) => Array.isArray(d) && d.length);
  const flags = r.flags ?? { EADs: 0, noDepols: 0, noRepols: 0 };

  return (
    <div className="w-full bg-surface-white/70 backdrop-blur-md border border-foreground/10 rounded-sheet overflow-hidden shadow-sm">
      {/* ---------- Ringkasan ---------- */}
      <div className="px-6 sm:px-10 md:px-16 pt-10 md:pt-12 pb-8">
        <span className="text-xs font-mono uppercase tracking-wider text-muted">01 · Heart-cell simulation</span>
        <p className="mt-3 text-lg md:text-xl text-foreground max-w-3xl leading-snug">
          {isMean ? (
            <>
              {drugLabel} at {joinList(doses)}× Cmax
              {conc.length > 1 && <span className="text-muted"> ({fmtValue(conc[0])}–{fmtValue(conc[conc.length - 1])} nM)</span>}
              , biomarkers averaged over the {doses.length} doses.
            </>
          ) : (
            <>{drugLabel} at {doses[0] ?? fallbackDose}× Cmax{conc[0] != null && <span className="text-muted"> ({fmtValue(conc[0])} nM)</span>}.</>
          )}
          {seconds && <span className="text-muted"> {seconds} s.</span>}
        </p>

        {(flags.EADs > 0 || flags.noDepols > 0 || flags.noRepols > 0 || excluded.length > 0) && (
          <ul className="mt-6 flex flex-col gap-2.5 max-w-3xl">
            {flags.EADs > 0 && <Warning>Early afterdepolarizations detected</Warning>}
            {(flags.noDepols > 0 || flags.noRepols > 0) && <Warning>Depolarization/repolarization failure in some beats</Warning>}
            {excluded.map(([metric, d]) => (
              <Warning key={metric}>
                At {joinList(d)}× Cmax the cell failed to repolarize; {metric} averaged over the other doses.
              </Warning>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- Grafik ---------- */}
      <div className="px-6 sm:px-10 md:px-16 pb-10 md:pb-12">
        <TracesSection apSeries={apSeries} caSeries={caSeries} />
      </div>

      <div className="border-t border-foreground/8" />

      {/* ---------- Tabel biomarker ---------- */}
      <div className="px-6 sm:px-10 md:px-16 py-8 md:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted">02 · 11 biomarkers</span>
            <p className="mt-2 text-base text-foreground max-w-xl">
              The {isMean ? 'mean ratio' : 'ratio'} to the drug-free control is what the AI model used.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-muted border-b border-foreground/8">
                <th className="px-2 py-2.5 font-medium">Biomarker</th>
                <th className="px-2 py-2.5 font-medium text-right">Control</th>
                <th className="px-2 py-2.5 font-medium text-right">{isMean ? 'Drug (mean)' : 'Drug'}</th>
                <th className="px-2 py-2.5 font-medium text-right">{isMean ? 'Mean ratio' : 'Ratio'}</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((key, i) => {
                const ratio = ratios[i];
                const strong = isStrongShift(ratio);
                return (
                  <tr key={key} className="border-b border-foreground/6 last:border-b-0 align-top">
                    <td className="px-2 py-3">
                      <span className="font-medium text-foreground">{key}</span>
                      <span className="block text-[11px] text-muted leading-snug mt-0.5 max-w-sm">{DESCRIPTIONS[key]}</span>
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-muted">{fmtValue(r.control_metrics?.[key])}</td>
                    <td className="px-2 py-3 text-right font-mono text-foreground">{fmtValue(r.raw_metrics?.[key])}</td>
                    <td className={`px-2 py-3 text-right font-mono ${strong ? 'text-accent font-semibold' : 'text-foreground'}`}>
                      {fmtRatio(ratio)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {perDose.length > 0 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowPerDose(v => !v)}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
              aria-expanded={showPerDose}
            >
              Per dose ratios
              <ChevronDown className={`w-4 h-4 transition-transform ${showPerDose ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {showPerDose && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto -mx-2 mt-4">
                    <table className="w-full min-w-[36rem] text-sm">
                      <thead>
                        <tr className="text-[10px] font-mono uppercase tracking-wider text-muted border-b border-foreground/8">
                          <th className="px-2 py-2.5 font-medium text-left">Biomarker</th>
                          {perDose.map(d => <th key={d.dose} className="px-2 py-2.5 font-medium text-right">{d.dose}×</th>)}
                          <th className="px-2 py-2.5 font-medium text-right">Mean</th>
                        </tr>
                      </thead>
                      <tbody>
                        {FEATURES.map((key, i) => (
                          <tr key={key} className="border-b border-foreground/6 last:border-b-0">
                            <td className="px-2 py-2 font-medium text-foreground">{key}</td>
                            {perDose.map(d => (
                              <td key={d.dose} className="px-2 py-2 text-right font-mono text-muted">{fmtRatio(d.ratios?.[i])}</td>
                            ))}
                            <td className={`px-2 py-2 text-right font-mono ${isStrongShift(ratios[i]) ? 'text-accent font-semibold' : 'text-foreground'}`}>
                              {fmtRatio(ratios[i])}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ---------- Catatan metode ---------- */}
      <div className="px-6 sm:px-10 md:px-16 py-5 border-t border-foreground/8">
        <button
          type="button"
          onClick={() => setShowMethod(v => !v)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
          aria-expanded={showMethod}
        >
          How this was simulated
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMethod ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {showMethod && (
            <motion.p
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-3 text-xs text-muted leading-relaxed max-w-3xl"
            >
              Single virtual cell with fixed (optimal) drug parameters, FDA CiPA IKr-dynamic O&apos;Hara-Rudy model, 1000 beats
              at 2000 ms cycle length, simulated at 1, 2, 3 and 4× Cmax. Biomarkers are expressed as ratios to a drug-free
              control cell and averaged over the 4 concentrations, the same way as the training data. The conformal
              prediction set is a calibrated heuristic for single inputs.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
