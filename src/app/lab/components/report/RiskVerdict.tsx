'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getTierColor, getTierCssVar, normalizeTier } from '@/lib/tierColor';
import type { PredictionOutput } from '@/lib/predict';

const TIERS = ['low', 'intermediate', 'high'] as const;

/**
 * Model risiko adalah random forest 400 pohon. Confidence dari API = porsi vote pohon,
 * jadi selalu kelipatan 1/400 (mis. 0.2025 = 81 vote). Kalau pola itu tidak cocok, tampilkan persen.
 */
const TREES = 400;
function toVotes(values: number[]): number[] | null {
  const v = values.map(c => c * TREES);
  return v.every(x => Math.abs(x - Math.round(x)) < 1e-6) ? v.map(Math.round) : null;
}
const fmtPct = (c: number) => {
  const p = c * 100;
  return `${Number.isInteger(p) ? p : p.toFixed(1)}%`;
};

/** Vote pohon per tier. Juga dipakai riwayat prediksi (cukup confidences + label). */
export function VoteBar({ prediction }: { prediction: Pick<PredictionOutput, 'confidences' | 'predictedLabel'> }) {
  const values = TIERS.map(t =>
    prediction.confidences.find(c => /high|inter|low|medium|moderate/i.test(c.label) && normalizeTier(c.label) === t)?.confidence ?? 0,
  );
  const votes = toVotes(values);
  const winner = normalizeTier(prediction.predictedLabel);
  const unanimous = votes?.some(v => v === TREES);

  return (
    <figure className="w-full">
      <figcaption className="mb-3 text-center text-sm text-foreground/70">
        {votes
          ? unanimous ? `All ${TREES} trees in the model voted ${winner}.` : `How the ${TREES} trees in the model voted`
          : 'Model confidence'}
      </figcaption>
      <div className="flex w-full h-2 rounded-full overflow-hidden bg-foreground/10" aria-hidden="true">
        {TIERS.map((t, i) => (
          <motion.span
            key={t}
            initial={{ width: 0 }}
            animate={{ width: `${values[i] * 100}%` }}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: getTierCssVar(t), opacity: t === winner ? 1 : 0.55 }}
          />
        ))}
      </div>
      {/* Tiga kolom (kiri, tengah, kanan): angka di atas, nama tier di bawah. Tidak berdempet di ponsel. */}
      <dl className="mt-3 grid grid-cols-3">
        {TIERS.map((t, i) => (
          <div key={t} className={`flex flex-col ${i === 0 ? 'items-start' : i === 1 ? 'items-center' : 'items-end'}`}>
            {/* dt dulu di DOM (semantik), tampil di bawah angka */}
            <dt className={`order-last text-xs capitalize ${t === winner ? getTierColor(t).text : 'text-foreground/60'}`}>{t}</dt>
            <dd className={`font-mono tabular-nums text-base ${t === winner ? `font-semibold ${getTierColor(t).text}` : 'text-foreground/70'}`}>
              {votes ? votes[i] : fmtPct(values[i])}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

/** Keluaran conformal dari model, ditulis apa adanya (tanpa saran buatan) */
function ConformalFacts({ prediction }: { prediction: PredictionOutput }) {
  const c = prediction.conformal;
  const rows: { k: string; v: React.ReactNode }[] = [
    { k: 'Recommended action', v: <span className={`capitalize font-medium ${getTierColor(c.recommendedAction).text}`}>{c.recommendedAction}</span> },
    { k: 'Prediction set', v: <span className="capitalize">{c.predictionSet.length ? c.predictionSet.join(', ') : '—'}</span> },
    ...(c.isAmbiguous ? [{ k: 'Ambiguous', v: 'Yes, more than one group' }] : []),
    ...(c.outOfDistribution ? [{ k: 'Out of distribution', v: <span className="text-accent">Yes</span> }] : []),
  ];
  return (
    <div className="w-full max-w-md mx-auto">
      <dl>
        {rows.map(r => (
          <div key={r.k} className="flex items-baseline justify-between gap-6 px-3 py-2 rounded-chip odd:bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))] text-sm">
            <dt className="text-foreground/70">{r.k}</dt>
            <dd className="text-right text-foreground">{r.v}</dd>
          </div>
        ))}
      </dl>
      {c.warning && <p className="mt-3 text-center text-sm text-accent leading-relaxed text-balance">{c.warning}</p>}
    </div>
  );
}

/** Vonis risiko: tier besar di tengah, vote pohon, lalu keluaran conformal. Dipakai Digital Lab & Full Pipeline. */
export default function RiskVerdict({ tier, prediction }: { tier: string; prediction?: PredictionOutput | null }) {
  const known = tier !== 'unknown';
  return (
    <div className="flex flex-col items-center gap-8 md:gap-10">
      <h2 className={`text-center text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight capitalize ${known ? getTierColor(tier).text : 'text-foreground/70'}`}>
        {known ? `${tier} risk` : 'No rating'}
      </h2>
      {prediction && known && <VoteBar prediction={prediction} />}
      {prediction && known && <ConformalFacts prediction={prediction} />}
    </div>
  );
}
