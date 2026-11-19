'use client';

import React, { useMemo } from 'react';
import { FEATURES } from '@/lib/pipeline';
import { normalizeTier } from '@/lib/tierColor';
import type { PredictionOutput, ShapData } from '@/lib/predict';
import RiskVerdict from './RiskVerdict';
import BiomarkerList from './BiomarkerList';

/*
 * Tampilan satu catatan riwayat di panel admin, dibuat dari komponen yang sama dengan hasil
 * prediksi milik user: vonis risiko, keterangan apa yang diterima model, lalu 11 biomarker
 * (dengan main drivers bila SHAP-nya ada). Jadi riwayat admin terbaca persis seperti riwayat user.
 */

export type Confidence = { confidence: number; label: string };

/** probabilities bisa berupa daftar {label, confidence} atau objek {high: 0.9, ...} */
export function toConfidences(p: Confidence[] | Record<string, number> | null | undefined): Confidence[] {
  if (Array.isArray(p)) return p;
  if (p && typeof p === 'object') {
    return Object.entries(p).map(([label, confidence]) => ({
      label,
      confidence: typeof confidence === 'number' ? confidence : Number(confidence) || 0,
    }));
  }
  return [];
}

/** Bentuk hasil model dari sebuah catatan riwayat (tanpa bagian konformal bila tidak tersimpan) */
export function toPredictionOutput(log: {
  predicted_tier?: string | null;
  probabilities?: Confidence[] | Record<string, number> | null;
  prediction_set?: string[] | null;
  recommended_action?: string | null;
  is_ambiguous?: boolean | null;
  out_of_distribution?: boolean | null;
  alpha?: number | null;
  q_hat?: number | null;
}): PredictionOutput {
  const predictedLabel = (log.predicted_tier || 'unknown').toLowerCase();
  const predictionSet = Array.isArray(log.prediction_set) ? log.prediction_set.map(s => String(s).toLowerCase()) : [];
  return {
    confidences: toConfidences(log.probabilities),
    predictedLabel,
    conformal: {
      alpha: log.alpha ?? 0.05,
      calibrationNote: '',
      isAmbiguous: Boolean(log.is_ambiguous),
      outOfDistribution: Boolean(log.out_of_distribution),
      predictionSet,
      qHat: log.q_hat ?? 0,
      recommendedAction: (log.recommended_action || predictedLabel).toLowerCase(),
      setSize: predictionSet.length,
    },
  };
}

/** Susun 11 rasio dari kontribusi SHAP (tiap kontribusi membawa nilai biomarkernya) */
export function ratiosFromShap(contributions: { biomarker?: string; feature?: string; value?: number }[] = []): number[] {
  const byName = new Map(contributions.map(c => [c.biomarker || c.feature || '', c.value]));
  return FEATURES.map(k => byName.get(k) ?? NaN);
}

export type MetaItem = { k: string; v: React.ReactNode };

/** Keterangan teknis kecil di bawah laporan */
function Meta({ items }: { items: MetaItem[] }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-1.5 border-t border-foreground/10 pt-5 text-xs text-foreground/55">
      {items.map(it => (
        <div key={it.k} className="flex min-w-0 gap-2">
          <dt>{it.k}</dt>
          <dd className="truncate font-mono text-foreground/80">{it.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function LogReport({ tier, prediction, ratios, shap, note, meta }: {
  tier?: string | null;
  prediction: PredictionOutput | null;
  /** 11 rasio biomarker; nilai bukan angka ditampilkan sebagai "—" */
  ratios: number[];
  shap?: ShapData | null;
  /** Satu kalimat: apa yang diterima model untuk catatan ini */
  note: React.ReactNode;
  meta: MetaItem[];
}) {
  const known = !!tier && /high|inter|low|medium|moderate/i.test(tier);
  const level = known ? normalizeTier(tier!) : 'unknown';
  const hasRatios = useMemo(() => ratios.some(v => Number.isFinite(v)), [ratios]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:gap-14">
      <RiskVerdict tier={level} prediction={prediction} compact />

      <section aria-label="What the model received" className="border-y border-foreground/10 py-6">
        <h3 className="text-base font-medium tracking-tight text-foreground md:text-lg">What the model received</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/70">{note}</p>
      </section>

      {hasRatios ? (
        <BiomarkerList
          ratios={ratios}
          tier={level}
          shap={shap ?? undefined}
          explaining={false}
          emptyDriversMessage="No driver analysis (SHAP) is stored with this record."
        />
      ) : (
        <p className="text-sm text-foreground/70">No biomarker values were stored with this record.</p>
      )}

      <Meta items={meta} />
    </div>
  );
}
