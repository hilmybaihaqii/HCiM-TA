import { notFound } from 'next/navigation';
import GuideLink, { GuideLinkPreview, type GuideTopic } from '../../lab/components/GuideLink';
import RiskVerdict from '../../lab/components/report/RiskVerdict';
import { SectionHead } from '../../lab/components/report/ui';
import LabContainer from '../../lab/components/LabContainer';

const EXAMPLES: { title: string; meta: string; topic: GuideTopic; description: string }[] = [
  { title: 'Activity records', meta: 'One record per run', topic: 'history-retention', description: 'The history list appears below this heading. The help link explains history storage and retention.' },
  { title: 'SHAP driver analysis', meta: 'Feature importance', topic: 'shap', description: 'The help link opens the SHAP section, directly beside the analysis it explains.' },
  { title: 'Biomarker ratios', meta: 'Relative to drug-free control', topic: 'ratios', description: 'The help link explains how to read ratios against control.' },
  { title: 'Simulation graphs', meta: 'Action potential & calcium', topic: 'simulation-graphs', description: 'The help link opens the explanation of waveforms and simulation flags.' },
  { title: 'Risk result', meta: 'Risk & probabilities', topic: 'risk-prediction', description: 'The help link explains the risk tier and decision forest probabilities.' },
  { title: 'Prediction set', meta: 'Conformal prediction', topic: 'prediction-set', description: 'The help link opens the explanation of single, ambiguous, and empty sets.' },
];

export default function GuideLinksPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <GuideLinkPreview>
      <main className="min-h-dvh bg-background text-foreground">
        <LabContainer className="space-y-10">
          <header className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted">Local preview · No account data</p>
            <h1 className="text-3xl font-medium tracking-tight">Help, right where you need it.</h1>
            <p className="text-sm leading-relaxed text-muted">Preview of the help links beside each section heading. Select “How to read this” to open its guide section. These are layout examples, not saved results.</p>
          </header>
          <section className="space-y-5 border-t border-foreground/15 pt-6">
            <h2 className="text-xl font-medium">Compare link styles</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-3"><h3 className="text-sm font-medium">A / Soft pill</h3><GuideLink topic="shap" variant="soft" /><p className="text-xs leading-relaxed text-muted">Current choice for section headings: a subtle accent, with a clear clickable shape.</p></div>
              <div className="space-y-3"><h3 className="text-sm font-medium">B / Text & arrow</h3><GuideLink topic="shap" variant="text" /><p className="text-xs leading-relaxed text-muted">A lighter option for supporting links beneath results.</p></div>
              <div className="space-y-3"><h3 className="text-sm font-medium">C / Outline</h3><GuideLink topic="shap" variant="outline" /><p className="text-xs leading-relaxed text-muted">The previous style, kept here for comparison.</p></div>
            </div>
          </section>
          <section className="space-y-8 border-t border-foreground/15 pt-6">
            <div><h2 className="text-xl font-medium">Risk result placement</h2><p className="mt-2 text-xs text-muted">Illustrative data only. The actual result component is shown below.</p></div>
            <div className="mx-auto max-w-md">
              <RiskVerdict tier="low" compact prediction={{
                predictedLabel: 'low',
                confidences: [{ label: 'low', confidence: 369 / 400 }, { label: 'intermediate', confidence: 31 / 400 }, { label: 'high', confidence: 0 }],
                conformal: { alpha: 2 / 13, calibrationNote: '', isAmbiguous: false, outOfDistribution: false, predictionSet: ['low'], qHat: 0, recommendedAction: 'low', setSize: 1 },
              }} />
            </div>
          </section>
          {EXAMPLES.map(example => (
            <section key={example.topic} className="border-t border-foreground/15 pt-6">
              <SectionHead title={example.title} meta={example.meta} guideTopic={example.topic} />
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{example.description}</p>
            </section>
          ))}
        </LabContainer>
      </main>
    </GuideLinkPreview>
  );
}
