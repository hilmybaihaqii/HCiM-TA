'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LabContainer from '../components/LabContainer';
import LabPageHeader from '../components/LabPageHeader';
import { SectionHead } from '../components/report/ui';
import { cachedGet } from '@/lib/historyCache';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Database,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface SummaryData {
  total_predictions?: number;
  total_explanations?: number;
  traces_available_count?: number;
  retention_policy?: {
    trace_retention_days?: number;
    trace_max_jobs_per_user?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface LatestPredictionData {
  items?: Array<{
    alpha?: number | null;
    q_hat?: number | null;
    [key: string]: unknown;
  }>;
}

const BIOMARKER_DEFINITIONS = [
  {
    key: 'qNet',
    name: 'Net Charge',
    signal: 'Action potential',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Net charge carried by the major ionic currents during the action potential; the CiPA metric for TdP risk',
  },
  {
    key: 'dvdtmax',
    name: 'Max Upstroke Velocity',
    signal: 'Action potential',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Maximum upstroke velocity of the action potential (dVm/dt max)',
  },
  {
    key: 'vmax',
    name: 'Peak Membrane Potential',
    signal: 'Action potential',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Peak membrane potential',
  },
  {
    key: 'vrest',
    name: 'Resting Potential',
    signal: 'Action potential',
    type: 'negative',
    unchanged: '-1.00',
    definition: 'Resting membrane potential',
  },
  {
    key: 'APD50',
    name: 'Action Potential Duration 50%',
    signal: 'Action potential',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Action potential duration at 50% repolarization',
  },
  {
    key: 'APD90',
    name: 'Action Potential Duration 90%',
    signal: 'Action potential',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Action potential duration at 90% repolarization',
  },
  {
    key: 'max_dv',
    name: 'Max Repolarization Rate',
    signal: 'Action potential',
    type: 'negative',
    unchanged: '-1.00',
    definition: 'Maximum rate of change of membrane potential during repolarization',
  },
  {
    key: 'camax',
    name: 'Peak Calcium',
    signal: 'Calcium transient',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Peak intracellular calcium concentration',
  },
  {
    key: 'carest',
    name: 'Resting Calcium',
    signal: 'Calcium transient',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Resting (diastolic) intracellular calcium concentration',
  },
  {
    key: 'CaTD50',
    name: 'Calcium Transient Duration 50%',
    signal: 'Calcium transient',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Calcium transient duration at 50% recovery',
  },
  {
    key: 'CaTD90',
    name: 'Calcium Transient Duration 90%',
    signal: 'Calcium transient',
    type: 'positive',
    unchanged: '1.00',
    definition: 'Calcium transient duration at 90% recovery',
  },
];

const SECTIONS = [
  { id: 'biomarkers', title: '1. The 11 Biomarkers' },
  { id: 'ratios', title: '2. Ratios vs Control' },
  { id: 'simulation-graphs', title: '3. Simulation Graphs' },
  { id: 'risk-prediction', title: '4. Risk & Probabilities' },
  { id: 'prediction-set', title: '5. Prediction Set' },
  { id: 'shap', title: '6. SHAP Explanations' },
  { id: 'history-retention', title: '7. History & Retention' },
];

export default function LabGuidePage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [latestPred, setLatestPred] = useState<{ alpha?: number | null; q_hat?: number | null } | null>(null);

  useEffect(() => {
    cachedGet<SummaryData>('/api/history/summary')
      .then((data) => {
        setSummary(data);
      })
      .catch(() => {
        setSummary(null);
      });

    cachedGet<LatestPredictionData>('/api/history/predictions?limit=1')
      .then((res) => {
        const item = res?.items?.[0];
        if (item && typeof item.alpha === 'number') {
          setLatestPred({ alpha: item.alpha, q_hat: item.q_hat });
        }
      })
      .catch(() => {});
  }, []);

  const alphaVal = typeof latestPred?.alpha === 'number' ? latestPred.alpha : 0.15384615384615383;
  const coveragePct = ((1 - alphaVal) * 100).toFixed(1);
  const qHatVal = typeof latestPred?.q_hat === 'number' ? latestPred.q_hat.toFixed(4) : null;
  const traceDays = summary?.retention_policy?.trace_retention_days;
  const maxJobs = summary?.retention_policy?.trace_max_jobs_per_user;

  return (
    <div className="w-full flex flex-col text-foreground">
      <LabContainer className="flex flex-col gap-12 md:gap-16">
        <LabPageHeader
          eyebrow="Documentation & Reference"
          title="Output Reading"
          accent="Guide."
          description="A complete guide to interpreting simulation waveforms, biomarker ratios, conformal prediction sets, and SHAP contributions."
        />

        {/* Quick Jump Navigation Rail */}
        <nav
          aria-label="Table of contents"
          className="p-4 rounded-card bg-surface-white/60 border border-foreground/8 backdrop-blur-sm -mt-4"
        >
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-wider text-muted">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>Guide Sections</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/4 hover:bg-foreground/8 text-foreground/80 hover:text-foreground transition-colors"
              >
                {sec.title}
              </a>
            ))}
          </div>
        </nav>

        {/* =========================================================
            SECTION 1: THE ELEVEN BIOMARKERS
            ========================================================= */}
        <section id="biomarkers" aria-labelledby="heading-biomarkers" className="scroll-mt-28">
          <SectionHead
            id="heading-biomarkers"
            title="1. The Eleven Biomarkers"
            meta="Biophysical definitions & baseline ratios"
          />
          <p className="mt-4 text-sm text-foreground/75 max-w-3xl leading-relaxed">
            The platform quantifies eleven biophysical biomarkers measured from the action potential and
            calcium transient of simulated human ventricular cardiomyocytes. These eleven features form the
            standardized vector read by the risk model:
          </p>

          <div className="mt-6 overflow-x-auto rounded-card border border-foreground/10 bg-surface-white/40">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/3 text-xs font-mono uppercase tracking-wider text-muted">
                  <th className="py-3 px-4 font-semibold">Biomarker</th>
                  <th className="py-3 px-4 font-semibold">Definition</th>
                  <th className="py-3 px-4 font-semibold">Signal</th>
                  <th className="py-3 px-4 font-semibold text-right">No-Change Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5 font-sans">
                {BIOMARKER_DEFINITIONS.map((bm, idx) => (
                  <tr
                    key={bm.key}
                    className={idx % 2 === 0 ? 'bg-surface-white/30' : 'bg-transparent'}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                      {bm.key}
                    </td>
                    <td className="py-3 px-4 text-foreground/85 leading-snug">
                      <div className="font-medium text-foreground">{bm.name}</div>
                      <div className="text-xs text-foreground/70 mt-0.5">{bm.definition}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted whitespace-nowrap">
                      {bm.signal}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums font-semibold">
                      <span className={bm.type === 'negative' ? 'text-amber-600' : 'text-teal-600'}>
                        {bm.unchanged}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: HOW TO READ A RATIO AGAINST CONTROL
            ========================================================= */}
        <section id="ratios" aria-labelledby="heading-ratios" className="scroll-mt-28">
          <SectionHead
            id="heading-ratios"
            title="2. How to Read a Ratio Against Control"
            meta="Understanding normalized drug effects"
          />

          <div className="mt-5 p-5 md:p-6 rounded-card border border-accent/25 bg-accent/3 relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-3 text-sm text-foreground/85 leading-relaxed">
                <h4 className="font-semibold text-foreground text-base">
                  Every input is a ratio of the drugged cell to the drug-free control simulation, not an absolute value.
                </h4>
                <p>
                  Inputs are normalized against a drug-free baseline simulation run under the exact same pacing protocol:
                </p>
                <div className="p-3 rounded-chip bg-surface-white/80 border border-foreground/10 font-mono text-xs sm:text-sm text-foreground inline-block">
                  ratio = with_drug ÷ |without_drug|
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Biomarkers */}
            <div className="p-5 rounded-card border border-foreground/10 bg-surface-white/50 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Nine Positive-Valued Biomarkers</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                qNet, dvdtmax, vmax, APD50, APD90, camax, carest, CaTD50, CaTD90.
              </p>
              <div className="text-sm text-foreground/80 space-y-2">
                <p>
                  <strong>1.00</strong> means unchanged compared to control.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-foreground/75 pl-1">
                  <li><strong>Above 1.00:</strong> Larger than control.</li>
                  <li><strong>Below 1.00:</strong> Smaller than control.</li>
                </ul>
                <div className="mt-2 p-3 rounded-chip bg-foreground/4 text-xs font-mono">
                  Worked example: APD90 of 1.038 is a 3.8% prolongation of repolarization.
                </div>
              </div>
            </div>

            {/* Negative Biomarkers */}
            <div className="p-5 rounded-card border border-foreground/10 bg-surface-white/50 flex flex-col gap-3">
              <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Negative-Valued Biomarkers (vrest, max_dv)</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                vrest and max_dv are negative quantities in the simulation.
              </p>
              <div className="text-sm text-foreground/80 space-y-2">
                <p>
                  Their unchanged value is <strong>-1.00</strong>, NOT 1.00.
                </p>
                <div className="mt-2 p-3 rounded-chip bg-foreground/4 text-xs font-mono space-y-2">
                  <div>• A vrest ratio of -0.99999 means essentially no change.</div>
                  <div>• A max_dv ratio moving from -1.00 toward 0 means the magnitude of the repolarization rate shrank. For example, a max_dv ratio of -0.631 means the magnitude of the repolarization rate shrank by 36.9%.</div>
                </div>
              </div>
            </div>
          </div>

          {/* qNet CiPA Metric */}
          <div className="mt-6 p-4 rounded-chip border border-foreground/10 bg-surface-white/60 flex items-start gap-3">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              <strong>qNet and Arrhythmia Risk:</strong> Reduced qNet is associated with higher TdP risk, since qNet is the CiPA risk metric.
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: READING THE SIMULATION GRAPHS
            ========================================================= */}
        <section id="simulation-graphs" aria-labelledby="heading-graphs" className="scroll-mt-28">
          <SectionHead
            id="heading-graphs"
            title="3. Reading the Simulation Graphs"
            meta="Action potential & calcium transients"
          />
          <p className="mt-4 text-sm text-foreground/75 max-w-3xl leading-relaxed">
            The action potential and calcium transient are plotted for each simulated concentration against the
            drug-free control (neutral dashed curve):
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-card border border-foreground/10 bg-surface-white/40 flex flex-col gap-3">
              <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <span>Drug Phenotypes on Waveforms</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-foreground/80 leading-relaxed">
                <li>
                  <strong>Potent hERG Blocker:</strong> Prolongs the action potential in a concentration-dependent way (broadened AP plateau and delayed repolarization).
                </li>
                <li>
                  <strong>Calcium Channel Blocker:</strong> Slightly shortens the action potential and lowers the calcium transient peak.
                </li>
                <li className="pt-2 border-t border-foreground/8 text-muted leading-normal">
                  The action potential is plotted in millivolts (mV). The simulator produces raw calcium transient (cai) in millimolar (mM; resting baseline around 0.000075 mM), which the chart multiplies by 10⁶ to plot on the vertical axis in nanomolar (nM).
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-card border border-foreground/10 bg-surface-white/40 flex flex-col gap-3">
              <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-accent" />
                <span>Simulation Flags & Excluded Doses</span>
              </h4>
              <p className="text-xs text-foreground/80 leading-relaxed">
                The simulation tracks physiological disruption through three flags:
              </p>
              <ul className="space-y-1.5 text-xs text-foreground/75 pl-2 border-l-2 border-foreground/15">
                <li><strong>EADs:</strong> Early afterdepolarizations during recovery.</li>
                <li><strong>Failed Depolarization (noDepols):</strong> The cell failed to fire an action potential upon stimulus.</li>
                <li><strong>Failed Repolarization (noRepols):</strong> The cell failed to return to resting potential.</li>
              </ul>
              <p className="text-xs text-foreground/75 mt-1 leading-relaxed">
                A biomarker undefined at one concentration is excluded from the average, and the simulation response lists the excluded concentration.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 4: RISK PREDICTION AND PROBABILITIES
            ========================================================= */}
        <section id="risk-prediction" aria-labelledby="heading-risk" className="scroll-mt-28">
          <SectionHead
            id="heading-risk"
            title="4. Risk Prediction and Probabilities"
            meta="Mean dose vector & tree probabilities"
          />

          <div className="mt-5 p-5 rounded-card border border-foreground/10 bg-surface-white/50 space-y-4">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-foreground/85 leading-relaxed">
                <h4 className="font-semibold text-foreground text-base">
                  One Risk Tier Per Run
                </h4>
                <p>
                  One risk tier per run, computed from the eleven biomarker ratios averaged over 1 to 4× Cmax.
                  Per-concentration graphs and biomarkers are simulation output, not separate predictions.
                </p>
                <p className="text-xs text-foreground/70">
                  The model evaluates only the mean exposure vector. Do not interpret individual dose rows as standalone risk calls.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-foreground/8">
              <h5 className="text-xs font-mono uppercase tracking-wider text-muted mb-2">Decision Forest Probabilities</h5>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                The forest averages the class probability vectors of its 400 decision trees. Because the trees are grown to pure leaves, each vector is one-hot and the average equals the share of trees choosing that tier, so the figure can be read as a vote count. The interface displays exact counts when they are whole numbers and percentages otherwise.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: THE PREDICTION SET (CONFORMAL PREDICTION)
            ========================================================= */}
        <section id="prediction-set" aria-labelledby="heading-set" className="scroll-mt-28">
          <SectionHead
            id="heading-set"
            title="5. The Prediction Set"
            meta="Conformal coverage & uncertainty"
          />
          <p className="mt-4 text-sm text-foreground/75 max-w-3xl leading-relaxed">
            The prediction set outputs statistical coverage derived from calibration. Three cases occur in practice:
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Case 1: Single Tier */}
            <div className="p-5 rounded-card border border-foreground/10 bg-surface-white/40 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Single Tier</span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">Committed Tier</h4>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  The model commits to one tier.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-foreground/8 text-[11px] font-mono text-muted">
                What to do: Follow recommended protocol for that tier.
              </div>
            </div>

            {/* Case 2: Ambiguous */}
            <div className="p-5 rounded-card border border-foreground/10 bg-surface-white/40 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Two or Three Tiers</span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">Ambiguous Output</h4>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  More than one tier cannot be ruled out; the most severe in the set is recommended and the recommendation is provisional.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-foreground/8 text-[11px] font-mono text-muted">
                What to do: Treat recommendation as provisional; review SHAP.
              </div>
            </div>

            {/* Case 3: Empty Set */}
            <div className="p-5 rounded-card border border-accent/25 bg-accent/3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Empty Set ([ ])</span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">Out of Distribution</h4>
                <p className="text-xs text-foreground/75 leading-relaxed">
                  No tier was probable enough; the model abstains, High is recommended, and the input should be checked.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-foreground/8 text-[11px] font-mono text-accent">
                What to do: Check input parameters and simulation flags.
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-chip border border-foreground/10 bg-surface-white/60 text-xs text-foreground/70 leading-relaxed space-y-1">
            <p>
              <strong>Conformal Parameters from Model:</strong> α = 2/13 (≈ {alphaVal.toFixed(4)}), providing {coveragePct}% nominal coverage
              {qHatVal ? ` with non-conformity threshold q̂ = ${qHatVal}` : ''}.
            </p>
            <p>
              <strong>Calibration Caveat:</strong> Coverage was calibrated on drug-averaged data, so for a single input it is an indication rather than a guarantee.
            </p>
          </div>
        </section>

        {/* =========================================================
            SECTION 6: SHAP (LOCAL VS. GLOBAL)
            ========================================================= */}
        <section id="shap" aria-labelledby="heading-shap" className="scroll-mt-28">
          <SectionHead
            id="heading-shap"
            title="6. SHAP"
            meta="Per-run drivers vs. overall model importances"
          />

          <p className="mt-4 text-sm text-foreground/75 max-w-3xl leading-relaxed">
            This section distinguishes two things that are both called SHAP:
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-card border border-foreground/15 bg-surface-white/60 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h4 className="font-semibold text-sm text-foreground">Local (What the App Shows)</h4>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                Computed for one run, on its own input vector. The base value plus the eleven contributions equals the predicted probability of the predicted tier.
              </p>
              <div className="p-3 rounded-chip bg-foreground/4 font-mono text-xs text-foreground">
                Base Value + Sum(11 Contributions) = Predicted Probability
              </div>
              <ul className="text-xs text-foreground/75 space-y-1 pl-3 list-disc">
                <li>Bars toward the result increased that probability.</li>
                <li>Bars away decreased it.</li>
              </ul>
              <p className="text-[11px] text-muted italic">
                The app&apos;s explanation is per-run. A biomarker important globally may be unimportant in a given run and vice versa.
              </p>
            </div>

            <div className="p-5 rounded-card border border-foreground/10 bg-surface-white/30 space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted" />
                <h4 className="font-semibold text-sm text-foreground">Global (What Appears in the Research Report)</h4>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                The mean absolute SHAP value over many samples, describing the model overall rather than any one run.
              </p>
              <p className="text-xs text-muted leading-relaxed">
                <strong>The app does not display this.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 7: HISTORY AND RETENTION
            ========================================================= */}
        <section id="history-retention" aria-labelledby="heading-retention" className="scroll-mt-28">
          <SectionHead
            id="heading-retention"
            title="7. History and Retention"
            meta="Storage limits, trace reclamation & job caps"
          />

          <div className="mt-5 p-5 md:p-6 rounded-card border border-foreground/10 bg-surface-white/50 space-y-4">
            <div className="flex items-start gap-3.5">
              <Database className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-foreground/85 leading-relaxed">
                <h4 className="font-semibold text-foreground text-base">
                  What Activity Logs Keeps
                </h4>
                <p>
                  Predictions, biomarker ratios, and SHAP explanations are kept in Activity Logs, while waveform traces
                  are reclaimed under the retention policy.
                  {typeof traceDays === 'number' && typeof maxJobs === 'number' ? (
                    <>
                      {' '}Waveform traces are kept for <strong>{traceDays} days</strong>, and pipeline runs have a storage cap of <strong>{maxJobs} jobs</strong>.
                    </>
                  ) : null}
                </p>
                <p className="text-xs text-foreground/70">
                  Once high-resolution traces are reclaimed, the log entry retains its full input method details,
                  biomarker ratios, tree probabilities, conformal set, and SHAP contributions.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-foreground/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-chip bg-foreground/4">
                <div className="text-muted text-[10px] uppercase tracking-wider">Traces Retention</div>
                <div className={`text-base font-semibold mt-0.5 ${typeof traceDays === 'number' ? 'text-accent' : 'text-foreground/60 text-sm'}`}>
                  {typeof traceDays === 'number' ? `${traceDays} days` : 'Policy unavailable'}
                </div>
                <div className="text-[11px] text-foreground/60 mt-1 font-sans">
                  {typeof traceDays === 'number' ? 'Waveforms reclaimed after retention period' : 'Awaiting retention policy from API'}
                </div>
              </div>
              <div className="p-3 rounded-chip bg-foreground/4">
                <div className="text-muted text-[10px] uppercase tracking-wider">Pipeline Storage Cap</div>
                <div className={`text-base font-semibold mt-0.5 ${typeof maxJobs === 'number' ? 'text-foreground' : 'text-foreground/60 text-sm'}`}>
                  {typeof maxJobs === 'number' ? `${maxJobs} jobs` : 'Policy unavailable'}
                </div>
                <div className="text-[11px] text-foreground/60 mt-1 font-sans">
                  {typeof maxJobs === 'number' ? 'Active pipeline runs stored per user' : 'Awaiting job limit from API'}
                </div>
              </div>
              <div className="p-3 rounded-chip bg-foreground/4">
                <div className="text-muted text-[10px] uppercase tracking-wider">Activity Logs Records</div>
                <div className="text-base font-semibold text-foreground mt-0.5">
                  {summary?.total_predictions != null
                    ? `${summary.total_predictions} saved`
                    : 'Kept'}
                </div>
                <div className="text-[11px] text-foreground/60 mt-1 font-sans">
                  Predictions, ratios & SHAP kept while waveform traces are reclaimed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation Back to Lab */}
        <div className="pt-6 border-t border-foreground/10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/lab/pipeline"
            className="inline-flex items-center gap-2 text-sm font-medium text-action hover:underline"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Full Pipeline</span>
          </Link>
          <Link
            href="/lab"
            className="inline-flex items-center gap-2 text-sm font-medium text-action hover:underline"
          >
            <span>Open Digital Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </LabContainer>
    </div>
  );
}
