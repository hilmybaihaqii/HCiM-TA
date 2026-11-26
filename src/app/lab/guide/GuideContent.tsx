'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, X } from 'lucide-react';
import LabContainer from '../components/LabContainer';
import LabPageHeader from '../components/LabPageHeader';
import GuideSectionHead from './GuideSectionHead';
import GuideNavigation from './GuideNavigation';
import GuideJourney from './GuideJourney';
import { Callout, Formula, Points } from './GuideParts';
import styles from './guide.module.css';
import visualStyles from './visual-guide.module.css';
import { cachedGet } from '@/lib/historyCache';

/*
 * Panduan membaca hasil. Satu kolom baca dengan daftar isi berkelompok di kiri.
 * Setiap bagian: kalimat pembuka (inti), poin-poin bertumpuk, lalu catatan/contoh bila perlu.
 * `id` setiap bagian sama dengan topik GuideLink, jadi tombol bantuan di halaman hasil
 * langsung membuka bagian yang menjawab pertanyaannya.
 */

interface SummaryData {
  total_predictions?: number;
  retention_policy?: { trace_retention_days?: number; trace_max_jobs_per_user?: number };
}

interface LatestPredictionData {
  items?: Array<{ alpha?: number | null; q_hat?: number | null }>;
}

const BIOMARKER_DEFINITIONS = [
  { key: 'qNet', name: 'Net Charge', signal: 'Action potential', type: 'positive', unchanged: '1.00', definition: 'Net charge carried by the major ionic currents during the action potential; the CiPA metric for TdP risk' },
  { key: 'dvdtmax', name: 'Max Upstroke Velocity', signal: 'Action potential', type: 'positive', unchanged: '1.00', definition: 'Maximum upstroke velocity of the action potential (dVm/dt max)' },
  { key: 'vmax', name: 'Peak Membrane Potential', signal: 'Action potential', type: 'positive', unchanged: '1.00', definition: 'Peak membrane potential' },
  { key: 'vrest', name: 'Resting Potential', signal: 'Action potential', type: 'negative', unchanged: '-1.00', definition: 'Resting membrane potential' },
  { key: 'APD50', name: 'Action Potential Duration 50%', signal: 'Action potential', type: 'positive', unchanged: '1.00', definition: 'Action potential duration at 50% repolarization' },
  { key: 'APD90', name: 'Action Potential Duration 90%', signal: 'Action potential', type: 'positive', unchanged: '1.00', definition: 'Action potential duration at 90% repolarization' },
  { key: 'max_dv', name: 'Max Repolarization Rate', signal: 'Action potential', type: 'negative', unchanged: '-1.00', definition: 'Maximum rate of change of membrane potential during repolarization' },
  { key: 'camax', name: 'Peak Calcium', signal: 'Calcium transient', type: 'positive', unchanged: '1.00', definition: 'Peak intracellular calcium concentration' },
  { key: 'carest', name: 'Resting Calcium', signal: 'Calcium transient', type: 'positive', unchanged: '1.00', definition: 'Resting (diastolic) intracellular calcium concentration' },
  { key: 'CaTD50', name: 'Calcium Transient Duration 50%', signal: 'Calcium transient', type: 'positive', unchanged: '1.00', definition: 'Calcium transient duration at 50% recovery' },
  { key: 'CaTD90', name: 'Calcium Transient Duration 90%', signal: 'Calcium transient', type: 'positive', unchanged: '1.00', definition: 'Calcium transient duration at 90% recovery' },
];

// Urutan = urutan membaca hasil: apa yang diukur -> cara membacanya -> apa yang masuk ke model -> hasilnya.
const SECTIONS = [
  { id: 'biomarkers', title: '1. The 11 biomarkers' },
  { id: 'ratios', title: '2. Reading a ratio' },
  { id: 'drug-inputs', title: '3. Drug inputs' },
  { id: 'simulation-graphs', title: '4. Simulation graphs' },
  { id: 'dose-averaging', title: '5. What the model reads' },
  { id: 'risk-prediction', title: '6. Risk tier and votes' },
  { id: 'prediction-set', title: '7. Prediction set' },
  { id: 'shap', title: '8. SHAP explanations' },
  { id: 'history-retention', title: '9. History and storage' },
];

/** Kelompok daftar isi: indeks ke SECTIONS */
const GROUPS = [
  { label: 'Simulation', indexes: [0, 1, 2, 3] },
  { label: 'Prediction', indexes: [4, 5, 6, 7] },
  { label: 'Your records', indexes: [8] },
];

const CASES = [
  { tone: 'teal', label: 'One tier', text: 'The model commits to that tier.', todo: 'Follow the protocol for that tier.' },
  { tone: 'amber', label: 'Two or three tiers', text: 'The model cannot rule out more than one tier. The app recommends the most severe tier in the set as a provisional call.', todo: 'Treat the call as provisional and check the SHAP drivers.' },
  { tone: 'red', label: 'Empty set', text: 'No tier reached the threshold, so the model abstains. The app recommends High.', todo: 'Check the drug inputs and the simulation flags.' },
] as const;

export default function GuideContent({ loadHistory = true, visual = false }: { loadHistory?: boolean; visual?: boolean }) {
  const [activeTopic, setActiveTopic] = useState(0);
  const [biomarkerQuery, setBiomarkerQuery] = useState('');
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [latestPred, setLatestPred] = useState<{ alpha?: number | null; q_hat?: number | null } | null>(null);

  const selectTopic = (index: number) => {
    setActiveTopic(index);
    setBiomarkerQuery('');
  };
  const turnPage = (index: number) => {
    selectTopic(index);
    requestAnimationFrame(() => {
      const section = document.getElementById(SECTIONS[index].id);
      section?.scrollIntoView({ behavior: 'instant', block: 'start' });
      section?.focus({ preventScroll: true });
    });
  };
  /** Mode visual (halaman pratinjau) menampilkan satu bagian sekaligus */
  const sectionProps = (id: string) => ({
    id,
    hidden: visual && SECTIONS[activeTopic].id !== id,
    tabIndex: visual ? -1 : undefined,
    className: styles.section,
  });

  const normalizedQuery = biomarkerQuery.trim().toLowerCase();
  const visibleBiomarkers = BIOMARKER_DEFINITIONS.filter(bm =>
    [bm.key, bm.name, bm.definition, bm.signal].some(v => v.toLowerCase().includes(normalizedQuery)));

  useEffect(() => {
    if (!loadHistory) return;
    cachedGet<SummaryData>('/api/history/summary').then(setSummary).catch(() => setSummary(null));
    cachedGet<LatestPredictionData>('/api/history/predictions?limit=1')
      .then(res => {
        const item = res?.items?.[0];
        if (item && typeof item.alpha === 'number') setLatestPred({ alpha: item.alpha, q_hat: item.q_hat });
      })
      .catch(() => {});
  }, [loadHistory]);

  const alphaVal = typeof latestPred?.alpha === 'number' ? latestPred.alpha : 2 / 13;
  const coveragePct = ((1 - alphaVal) * 100).toFixed(1);
  const qHatVal = typeof latestPred?.q_hat === 'number' ? latestPred.q_hat.toFixed(4) : null;
  const traceDays = summary?.retention_policy?.trace_retention_days;
  const maxJobs = summary?.retention_policy?.trace_max_jobs_per_user;

  return (
    <div className={`${styles.guide} w-full flex flex-col text-foreground`}>
      <LabContainer className="flex flex-col gap-10 md:gap-14">
        <div className={styles.hero}>
          <LabPageHeader
            eyebrow="Guide"
            title="Reading your"
            accent="results."
            description="What each part of a result page means: the biomarkers, the graphs, the risk tier and the reasons behind it."
          />
          <div className={styles.heroFooter}>
            <span>9 topics</span>
            <span>11 biomarkers</span>
            <a href={visual ? `#${SECTIONS[activeTopic].id}` : '#biomarkers'}>Start reading <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </div>

        {visual && <GuideJourney sections={SECTIONS} active={activeTopic} onSelect={selectTopic} />}
        <div className={visual ? visualStyles.visual : styles.layout}>
          {!visual && <GuideNavigation sections={SECTIONS} groups={GROUPS} />}

          <article className={styles.content}>
            {/* ---------- 1. Biomarker ---------- */}
            <section {...sectionProps('biomarkers')} aria-labelledby="heading-biomarkers">
              <GuideSectionHead id="heading-biomarkers" number={1} title="The 11 biomarkers" meta="Reference" />
              <p className={styles.lead}>
                The simulation measures 11 values from the action potential and calcium transient of a human ventricular
                cell. The risk model reads these 11 values and nothing else.
              </p>

              <div className={styles.searchBar}>
                <div className={styles.searchField}>
                  <Search size={17} aria-hidden="true" />
                  <label className="sr-only" htmlFor="biomarker-search">Search biomarkers</label>
                  <input
                    id="biomarker-search"
                    type="search"
                    value={biomarkerQuery}
                    onChange={e => setBiomarkerQuery(e.target.value)}
                    placeholder="Search a biomarker or signal"
                    aria-controls="biomarker-reference"
                  />
                  {biomarkerQuery && (
                    <button type="button" aria-label="Clear biomarker search" onClick={() => setBiomarkerQuery('')}>
                      <X size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <span className={styles.resultCount} role="status">{visibleBiomarkers.length} of 11 biomarkers</span>
              </div>
              <div className={styles.biomarkerTable} id="biomarker-reference">
                <table aria-label="Biomarker definitions and baseline ratios">
                  <thead>
                    <tr>
                      <th scope="col">Biomarker</th>
                      <th scope="col">Definition</th>
                      <th scope="col">Signal</th>
                      <th scope="col">No-Change Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBiomarkers.map(bm => (
                      <tr key={bm.key}>
                        <td className={styles.biomarkerKey} data-i18n-skip>{bm.key}</td>
                        <td>
                          <div className={styles.biomarkerName}>{bm.name}</div>
                          <div className={styles.biomarkerDefinition}>{bm.definition}</div>
                        </td>
                        <td><span className={styles.signal}>{bm.signal}</span></td>
                        <td>
                          <span className={styles.mobileLabel} aria-hidden="true">No change</span>
                          <span className={styles.baseline} data-negative={bm.type === 'negative'}>{bm.unchanged}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {visibleBiomarkers.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No biomarkers match &ldquo;{biomarkerQuery}&rdquo;.</p>
                    <button type="button" onClick={() => setBiomarkerQuery('')}>Show all 11 biomarkers</button>
                  </div>
                )}
              </div>
            </section>

            {/* ---------- 2. Rasio ---------- */}
            <section {...sectionProps('ratios')} aria-labelledby="heading-ratios">
              <GuideSectionHead id="heading-ratios" number={2} title="Reading a ratio" meta="Drug versus control" />
              <p className={styles.lead}>
                You read every biomarker as a ratio: the value with the drug divided by the value without it, from the
                same pacing protocol.
              </p>
              <Formula>ratio = with_drug ÷ |without_drug|</Formula>
              <Points
                items={[
                  {
                    title: 'Nine positive biomarkers',
                    text: 'qNet, dvdtmax, vmax, APD50, APD90, camax, carest, CaTD50 and CaTD90. A ratio of 1.00 means no change. Above 1.00 the value grew, below 1.00 it shrank.',
                    example: 'APD90 at 1.038 means repolarization took 3.8% longer.',
                  },
                  {
                    title: 'Two negative biomarkers',
                    text: 'vrest and max_dv are negative numbers in the simulation, so their no-change ratio is -1.00. A vrest ratio of -0.99999 means no change.',
                    example: 'max_dv at -0.631 means the repolarization rate fell by 36.9%.',
                  },
                ]}
              />
              <Callout tone="key" title="qNet and TdP risk">
                qNet is the CiPA risk metric. A lower qNet points to a higher TdP risk.
              </Callout>
            </section>

            {/* ---------- 3. Input obat ---------- */}
            <section {...sectionProps('drug-inputs')} aria-labelledby="heading-drug-inputs">
              <GuideSectionHead id="heading-drug-inputs" number={3} title="Drug inputs" meta="Cmax and ion channels" />
              <p className={styles.lead}>
                These numbers describe the drug. They tell the simulation how much drug reaches the cell and how strongly
                it blocks each ion channel.
              </p>
              <Points
                items={[
                  { title: 'Cmax (exposure)', text: 'The free peak plasma concentration, in nM. The pipeline simulates the cell at 1×, 2×, 3× and 4× this value.' },
                  { title: 'hERG binding', text: 'Kmax, Ku, n, halfmax and Vhalf describe how the drug binds to hERG, the channel most tied to TdP risk. The values come from the CiPA fits.' },
                  { title: 'Other channels', text: 'IC50 and Hill coefficient for the sodium and calcium currents. Leave a field empty when the drug does not block that channel, and the simulation leaves the channel as it is.' },
                ]}
              />
              <Callout tone="note" title="Where the numbers come from">
                A CiPA drug loads them from the reference database. A new drug uses your values. A CiPA drug with your own
                lab data starts from the database and keeps the fields you changed. The result page marks which is which.
              </Callout>
            </section>

            {/* ---------- 4. Grafik ---------- */}
            <section {...sectionProps('simulation-graphs')} aria-labelledby="heading-graphs">
              <GuideSectionHead id="heading-graphs" number={4} title="Simulation graphs" meta="Action potential and calcium" />
              <p className={styles.lead}>
                Each graph draws one curve per concentration over the drug-free control, which appears as a grey dashed line.
              </p>
              <Points
                items={[
                  { title: 'hERG blocker', text: 'The plateau widens and repolarization comes later as the concentration rises.' },
                  { title: 'Calcium channel blocker', text: 'The action potential shortens a little and the calcium peak drops.' },
                  { title: 'Units', text: 'Voltage is in millivolts. The simulator reports calcium in mM, around 0.000075 mM at rest, and the chart multiplies it by 10⁶ to show nM.' },
                ]}
              />
              <h3 className={styles.subhead}>Simulation flags</h3>
              <Points
                compact
                items={[
                  { title: 'EADs', text: 'Early afterdepolarizations during recovery.' },
                  { title: 'noDepols', text: 'The cell did not fire after a stimulus.' },
                  { title: 'noRepols', text: 'The cell did not return to its resting potential.' },
                ]}
              />
              <Callout tone="note" title="A missing value">
                When a biomarker has no value at one concentration, the pipeline leaves that concentration out of the
                average and lists it in the result.
              </Callout>
            </section>

            {/* ---------- 5. Input model ---------- */}
            <section {...sectionProps('dose-averaging')} aria-labelledby="heading-dose-averaging">
              <GuideSectionHead id="heading-dose-averaging" number={5} title="What the model reads" meta="Four concentrations, one input" />
              <p className={styles.lead}>
                The model reads 11 numbers: each biomarker ratio averaged over the simulated concentrations.
              </p>
              <p className={styles.body}>
                A Full Pipeline run simulates the cell at 1×, 2×, 3× and 4× Cmax, so each biomarker gets four ratios. The
                pipeline averages them into one ratio per biomarker, and the model classifies those 11 averages.
              </p>

              <figure className={styles.example}>
                <figcaption>Example: APD90</figcaption>
                <div className="overflow-x-auto overscroll-x-contain">
                  <table>
                    <thead>
                      <tr>
                        <th>1× Cmax</th>
                        <th>2× Cmax</th>
                        <th>3× Cmax</th>
                        <th>4× Cmax</th>
                        <th>Mean → model</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1.012</td>
                        <td>1.031</td>
                        <td>1.048</td>
                        <td>1.061</td>
                        <td>1.038</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Only the last column reaches the model. The other columns show how the effect grows with exposure. They
                  are simulation output, and the model makes no prediction from them.
                </p>
              </figure>

              <Points
                items={[
                  { title: 'A missing concentration', text: 'If the cell fails to depolarize or repolarize at one concentration, that biomarker has no value there. The average uses the other concentrations.' },
                  { title: 'Digital Lab', text: 'Digital Lab runs no simulation. The model reads the 11 ratios you type. If your values come from several concentrations, average them first.' },
                ]}
              />
            </section>

            {/* ---------- 6. Risiko ---------- */}
            <section {...sectionProps('risk-prediction')} aria-labelledby="heading-risk">
              <GuideSectionHead id="heading-risk" number={6} title="Risk tier and votes" meta="One tier per run" />
              <p className={styles.lead}>
                Each run gets one risk tier, computed from the averaged ratios. The graphs and the biomarkers per dose are
                simulation output.
              </p>
              <Points
                items={[
                  { title: '400 trees vote', text: 'The model is a random forest of 400 decision trees. Each tree picks one tier, so the probability of a tier equals the share of trees that picked it.' },
                  { title: 'Votes on the result page', text: 'The page shows the vote count when it is a whole number, and a percentage otherwise.' },
                ]}
              />
              <Callout tone="warn" title="Read the run as a whole">
                A single dose row is not a risk call. The model only sees the average.
              </Callout>
            </section>

            {/* ---------- 7. Prediction set ---------- */}
            <section {...sectionProps('prediction-set')} aria-labelledby="heading-set">
              <GuideSectionHead id="heading-set" number={7} title="Prediction set" meta="Conformal coverage" />
              <p className={styles.lead}>
                The prediction set lists each tier the model cannot rule out at its calibrated confidence. You will see one
                of three cases.
              </p>
              <ol className={styles.cases}>
                {CASES.map(c => (
                  <li key={c.label}>
                    <span className={styles.caseLabel} data-tone={c.tone}>{c.label}</span>
                    <p>{c.text}</p>
                    <p className={styles.caseTodo}>{c.todo}</p>
                  </li>
                ))}
              </ol>
              <Callout tone="note" title="Calibration">
                <span className="block" data-i18n-skip>
                  {`α = 2/13 (≈ ${alphaVal.toFixed(4)}) · ${coveragePct}% coverage${qHatVal ? ` · q̂ = ${qHatVal}` : ''}`}
                </span>
                <span className="mt-1.5 block">
                  The calibration used drug-averaged data, so for a single run treat the coverage as an estimate.
                </span>
              </Callout>
            </section>

            {/* ---------- 8. SHAP ---------- */}
            <section {...sectionProps('shap')} aria-labelledby="heading-shap">
              <GuideSectionHead id="heading-shap" number={8} title="SHAP explanations" meta="Why the model chose a tier" />
              <p className={styles.lead}>
                Two different numbers share the name SHAP. The app shows the first one.
              </p>
              <Points
                items={[
                  {
                    title: 'Per run, in the app',
                    text: 'SHAP splits one run’s prediction across the 11 biomarkers. A bar toward the result raised the probability of that tier, and a bar away lowered it.',
                  },
                  {
                    title: 'Across the model, in the research report',
                    text: 'The mean absolute SHAP value over many samples. It describes the whole model, and the app does not show it.',
                  },
                ]}
              />
              <Formula>base value + sum of 11 contributions = probability of the predicted tier</Formula>
              <Callout tone="note" title="Two different views">
                A biomarker can matter a lot in one run and little across the model, or the other way round.
              </Callout>
            </section>

            {/* ---------- 9. Riwayat ---------- */}
            <section {...sectionProps('history-retention')} aria-labelledby="heading-retention">
              <GuideSectionHead id="heading-retention" number={9} title="History and storage" meta="Activity Logs" />
              <p className={styles.lead}>
                Activity Logs keeps each prediction with its ratios, tree votes, prediction set and SHAP drivers. Waveform
                traces take the most space, so the server deletes them after a while.
              </p>
              <dl className={styles.stats}>
                <div>
                  <dt>Trace storage</dt>
                  <dd>{typeof traceDays === 'number' ? `${traceDays} days` : '—'}</dd>
                  <p>{typeof traceDays === 'number' ? 'Waveforms are deleted after this period' : 'Not reported by the server'}</p>
                </div>
                <div>
                  <dt>Pipeline storage cap</dt>
                  <dd>{typeof maxJobs === 'number' ? `${maxJobs} jobs` : '—'}</dd>
                  <p>{typeof maxJobs === 'number' ? 'Pipeline runs kept per account' : 'Not reported by the server'}</p>
                </div>
                <div>
                  <dt>Activity Logs records</dt>
                  <dd>{summary?.total_predictions != null ? `${summary.total_predictions} saved` : '—'}</dd>
                  <p>Kept after the traces are deleted</p>
                </div>
              </dl>
            </section>

            {visual && (
              <div className={visualStyles.pager}>
                <button type="button" disabled={activeTopic === 0} onClick={() => turnPage(activeTopic - 1)}>Previous topic</button>
                <span>{activeTopic + 1} / {SECTIONS.length}</span>
                <button type="button" disabled={activeTopic === SECTIONS.length - 1} onClick={() => turnPage(activeTopic + 1)}>Next topic</button>
              </div>
            )}

            {/* Penutup: dua jalan untuk mencoba */}
            <nav aria-label="Run a prediction" className={styles.next}>
              <Link href="/lab/pipeline">
                <span>Full Pipeline</span>
                <strong>Start from a drug</strong>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/lab">
                <span>Digital Lab</span>
                <strong>Start from 11 ratios</strong>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </nav>
          </article>
        </div>
      </LabContainer>
    </div>
  );
}
