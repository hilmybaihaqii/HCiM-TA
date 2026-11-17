'use client';

import { createContext, useContext, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

const GuideDestination = createContext('/lab/guide');

export function GuideLinkPreview({ children }: { children: ReactNode }) {
  return <GuideDestination.Provider value="/preview/guide">{children}</GuideDestination.Provider>;
}

const TOPICS = {
  biomarkers: 'biomarker definitions',
  ratios: 'biomarker ratios',
  'simulation-graphs': 'simulation graphs',
  'risk-prediction': 'risk and probabilities',
  'prediction-set': 'prediction sets',
  shap: 'SHAP explanations',
  'history-retention': 'history and retention',
} as const;

export type GuideTopic = keyof typeof TOPICS;
type GuideLinkVariant = 'soft' | 'text' | 'outline';

const VARIANTS: Record<GuideLinkVariant, string> = {
  soft: 'rounded-full border border-accent/15 bg-accent/5 px-3.5 text-accent-dark hover:border-accent/35 hover:bg-accent/10',
  text: 'text-accent-dark underline decoration-accent/30 underline-offset-4 hover:decoration-accent',
  outline: 'rounded-lg border border-foreground/15 bg-surface-white/70 px-3 text-foreground hover:border-accent/40 hover:bg-accent/5 hover:text-accent-dark',
};

export default function GuideLink({ topic, variant = 'soft', label = 'How to read this' }: { topic: GuideTopic; variant?: GuideLinkVariant; label?: string }) {
  const destination = useContext(GuideDestination);
  return (
    <Link href={`${destination}#${topic}`} prefetch={false}
      aria-label={`${label}: ${TOPICS[topic]}`}
      title={`Open guide: ${TOPICS[topic]}`}
      className={`group/guide inline-flex min-h-10 shrink-0 items-center justify-center gap-2 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action ${VARIANTS[variant]}`}>
      {variant !== 'text' && <BookOpen className="h-3.5 w-3.5 shrink-0 text-accent-dark" aria-hidden="true" />}
      <span>{label}</span>
      <ArrowRight className="ml-1 h-3.5 w-3.5 shrink-0 text-foreground/50 transition-transform group-hover/guide:translate-x-0.5 group-hover/guide:text-accent-dark motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
    </Link>
  );
}
