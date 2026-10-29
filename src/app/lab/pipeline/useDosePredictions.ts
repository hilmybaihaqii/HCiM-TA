'use client';

// Prediksi risiko per dosis untuk hasil Full Pipeline.
// Backend sudah menghitung 11 rasio untuk tiap dosis (sim_result.per_dose), jadi prediksi per dosis
// cukup memanggil model risiko dengan rasio dosis itu, tanpa simulasi ulang. Hasil "mean" datang dari job.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PipelineJob } from '@/lib/pipeline';
import {
  explainRisk, parsePredictResponse, predictErrorMessage, predictRisk, type PredictionOutput, type ShapData,
} from '@/lib/predict';

export type DoseKey = 'mean' | number;

export type DoseOption = {
  key: DoseKey;
  /** "Mean" atau "3×" */
  label: string;
  /** 11 rasio, atau null kalau dosis ini tidak punya biomarker lengkap */
  ratios: number[] | null;
};

export type DoseResult = {
  status: 'idle' | 'predicting' | 'explaining' | 'done' | 'error';
  tier?: string;
  prediction?: PredictionOutput | null;
  shap?: ShapData | null;
  /** Gagal total (predict) */
  error?: string;
  /** Tier ada, tapi SHAP gagal */
  shapError?: string;
};

export const doseId = (key: DoseKey) => String(key);

const storageKey = (jobId: string) => `pipeline-doses:${jobId}`;

const isComplete = (r: (number | null)[] | undefined): r is number[] =>
  Array.isArray(r) && r.length === 11 && r.every(v => typeof v === 'number' && Number.isFinite(v));

/** Hasil mean dari job (dihitung backend saat simulasi selesai) */
function meanFromJob(job: PipelineJob): DoseResult {
  const raw = Array.isArray(job.prediction) ? job.prediction : null;
  if (!raw) return { status: 'error', error: 'The AI result for this run could not be read.' };
  const tier = String((raw[0] as { label?: string } | undefined)?.label ?? 'unknown').toLowerCase();
  const first = Array.isArray(job.explanation) ? (job.explanation[0] as Partial<ShapData> | undefined) : undefined;
  const shap = first && Array.isArray(first.contributions) && typeof first.base_value === 'number'
    ? { predicted_class: tier, base_value: first.base_value, contributions: first.contributions }
    : null;
  return { status: 'done', tier, prediction: parsePredictResponse(raw), shap };
}

function readStored(jobId: string): Record<string, DoseResult> {
  try {
    const raw = sessionStorage.getItem(storageKey(jobId));
    return raw ? (JSON.parse(raw) as Record<string, DoseResult>) : {};
  } catch {
    return {};
  }
}

export function useDosePredictions(job: PipelineJob) {
  const options: DoseOption[] = useMemo(() => {
    const perDose = [...(job.sim_result?.per_dose ?? [])].sort((a, b) => a.dose - b.dose);
    return [
      { key: 'mean' as const, label: 'Mean', ratios: isComplete(job.ratios) ? job.ratios : null },
      ...perDose.map(d => ({ key: d.dose, label: `${d.dose}×`, ratios: isComplete(d.ratios) ? d.ratios : null })),
    ];
  }, [job]);

  // Area lab hanya dirender di client, jadi sessionStorage aman dibaca saat init
  const [results, setResults] = useState<Record<string, DoseResult>>(() => ({
    ...readStored(job.id),
    mean: meanFromJob(job),
  }));

  const inFlight = useRef(new Set<string>());
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  // Simpan hasil per dosis yang sudah selesai, supaya tetap ada setelah refresh halaman
  useEffect(() => {
    const done = Object.fromEntries(
      Object.entries(results).filter(([k, r]) => k !== 'mean' && r.status === 'done'),
    );
    try {
      sessionStorage.setItem(storageKey(job.id), JSON.stringify(done));
    } catch { /* storage penuh/diblokir: hasil tetap ada selama halaman terbuka */ }
  }, [results, job.id]);

  const patch = useCallback((id: string, next: Partial<DoseResult>) => {
    if (!alive.current) return;
    setResults(prev => ({ ...prev, [id]: { ...(prev[id] ?? { status: 'idle' }), ...next } }));
  }, []);

  // prediction_id per dosis, supaya explain tercatat pada prediksi yang sama di Activity Logs
  const predictionIds = useRef(new Map<string, string>());

  /** SHAP untuk satu dosis yang sudah punya tier; dicatat pada prediction_id yang sama di Activity Logs. */
  const explainWith = useCallback(async (id: string, ratios: number[], tier: string) => {
    patch(id, { status: 'explaining', shapError: undefined });
    try {
      const shap = await explainRisk(ratios, tier, predictionIds.current.get(id));
      patch(id, { status: 'done', shap });
    } catch (err) {
      patch(id, { status: 'done', shapError: predictErrorMessage(err) });
    }
  }, [patch]);

  /**
   * Prediksi satu dosis: tier dulu (cepat, langsung tampil), lalu SHAP otomatis.
   * Setiap prediksi selalu punya SHAP-nya, jadi riwayat Prediction & SHAP di Activity Logs seimbang.
   * Dosis yang sudah punya tier tapi belum punya SHAP (mis. dari sesi lama) langsung dilengkapi.
   */
  const run = useCallback(async (key: DoseKey) => {
    const id = doseId(key);
    const option = options.find(o => doseId(o.key) === id);
    const current = results[id];
    if (!option?.ratios || inFlight.current.has(id) || current?.shap) return;

    inFlight.current.add(id);
    try {
      let tier = current?.tier;
      if (!tier) {
        patch(id, { status: 'predicting', error: undefined });
        try {
          const p = await predictRisk(option.ratios);
          if (p.predictionId) predictionIds.current.set(id, p.predictionId);
          tier = p.tier;
          patch(id, { status: 'done', tier: p.tier, prediction: p.prediction });
        } catch (err) {
          patch(id, { status: 'error', error: predictErrorMessage(err) });
          return;
        }
      }
      if (tier && tier !== 'unknown') await explainWith(id, option.ratios, tier);
    } finally {
      inFlight.current.delete(id);
    }
  }, [options, results, patch, explainWith]);

  return { options, results, run };
}
