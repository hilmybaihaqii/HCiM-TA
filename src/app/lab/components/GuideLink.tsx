'use client';

import { createContext, useContext, type ReactNode } from 'react';
import Link from 'next/link';

const GuideDestination = createContext('/lab/guide');

export function GuideLinkPreview({ children }: { children: ReactNode }) {
  return <GuideDestination.Provider value="/preview/guide">{children}</GuideDestination.Provider>;
}

/*
 * Satu topik = satu kebingungan = satu bagian di halaman guide (id bagian = nama topik).
 * `ask` adalah label tombol bawaan, ditulis sebagai pertanyaan yang sedang dipikirkan pengguna,
 * jadi tiap tombol jelas mengarah ke jawaban yang berbeda.
 */
const TOPICS = {
  biomarkers: { about: 'what each of the 11 biomarkers measures', ask: 'What does each biomarker mean?' },
  ratios: { about: 'how to read a ratio against the drug-free cell', ask: 'How do I read these ratios?' },
  'drug-inputs': { about: 'Cmax and the ion channel parameters', ask: 'What are these drug inputs?' },
  'dose-averaging': { about: 'how the simulated concentrations become one model input', ask: 'Which values go into the model?' },
  'simulation-graphs': { about: 'reading the action potential and calcium graphs', ask: 'How do I read these graphs?' },
  'risk-prediction': { about: 'how the risk tier and probabilities are decided', ask: 'How is the risk decided?' },
  'prediction-set': { about: 'what the prediction set means', ask: 'What is a prediction set?' },
  shap: { about: 'what the SHAP drivers mean', ask: 'What do the drivers mean?' },
  'history-retention': { about: 'what is saved in history and for how long', ask: 'What is kept in my history?' },
} as const;

export type GuideTopic = keyof typeof TOPICS;
type GuideLinkVariant = 'soft' | 'text' | 'outline';

/*
 * Satu gaya untuk semua tombol bantuan: tombol putih berbingkai tipis, teks gelap, tanpa ikon.
 * Bentuk pill + bingkai + bayangan halus membuatnya jelas bisa diklik tanpa warna merah
 * (merah di aplikasi ini berarti risiko tinggi). `variant` dipertahankan supaya pemanggil lama tetap jalan.
 */
const BUTTON = `inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-surface-white px-4
  text-xs font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)]
  transition-[border-color,box-shadow,translate,scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]
  hover:-translate-y-px hover:border-foreground/35 hover:shadow-[0_6px_16px_-8px_rgba(0,0,0,0.25)] active:translate-y-0 active:scale-[0.97]
  motion-reduce:translate-none motion-reduce:scale-100
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GuideLink({ topic, variant: _variant, label }: { topic: GuideTopic; variant?: GuideLinkVariant; label?: string }) {
  const destination = useContext(GuideDestination);
  const text = label ?? TOPICS[topic].ask;
  return (
    <Link href={`${destination}#${topic}`} prefetch={false}
      aria-label={`${text} Open the guide on ${TOPICS[topic].about}`}
      title={`Guide: ${TOPICS[topic].about}`}
      className={BUTTON}>
      {text}
    </Link>
  );
}
