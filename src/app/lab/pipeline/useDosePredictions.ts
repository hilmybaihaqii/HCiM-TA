'use client';

// Prediksi risiko per dosis untuk hasil Full Pipeline.
// Backend sudah menghitung 11 rasio untuk tiap dosis (sim_result.per_dose), jadi prediksi per dosis
// cukup memanggil model risiko dengan rasio dosis itu, tanpa simulasi ulang. Hasil "mean" datang dari job.
// Hasil disimpan di tingkat modul (per job), bukan di komponen: prediksi yang sedang berjalan tetap
// selesai & tersimpan walau user pindah tab, dan tampil lagi saat kembali. Salinannya di sessionStorage.

import { useCallback, useMemo, useSyncExternalStore } from 'react';
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

type Results = Record<string, DoseResult>;

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

/* ---------- Store per job (tingkat modul) ---------- */

const store = new Map<string, Results>();
const inFlight = new Set<string>();
/** prediction_id per dosis, supaya explain tercatat pada prediksi yang sama di Activity Logs */
const predictionIds = new Map<string, string>();
const listeners = new Set<() => void>();

/** Dosis yang selesai dari sesi sebelumnya; status "jalan" yang terputus oleh refresh dibuang */
function readStored(jobId: string): Results {
  try {
    const raw = sessionStorage.getItem(storageKey(jobId));
    return raw ? (JSON.parse(raw) as Results) : {};
  } catch {
    return {};
  }
}

function resultsFor(job: PipelineJob): Results {
  let r = store.get(job.id);
  if (!r) {
    r = { ...readStored(job.id), mean: meanFromJob(job) };
    store.set(job.id, r);
  }
  return r;
}

function patch(jobId: string, id: string, next: Partial<DoseResult>) {
  const prev = store.get(jobId) ?? {};
  const updated = { ...prev, [id]: { ...(prev[id] ?? { status: 'idle' as const }), ...next } };
  store.set(jobId, updated);
  // Simpan hasil per dosis yang sudah selesai, supaya tetap ada setelah refresh halaman
  const done = Object.fromEntries(Object.entries(updated).filter(([k, r]) => k !== 'mean' && r.status === 'done'));
  try {
    sessionStorage.setItem(storageKey(jobId), JSON.stringify(done));
  } catch { /* storage penuh/diblokir: hasil tetap ada selama halaman terbuka */ }
  listeners.forEach(l => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

export function useDosePredictions(job: PipelineJob) {
  const options: DoseOption[] = useMemo(() => {
    const perDose = [...(job.sim_result?.per_dose ?? [])].sort((a, b) => a.dose - b.dose);
    return [
      { key: 'mean' as const, label: 'Mean', ratios: isComplete(job.ratios) ? job.ratios : null },
      ...perDose.map(d => ({ key: d.dose, label: `${d.dose}×`, ratios: isComplete(d.ratios) ? d.ratios : null })),
    ];
  }, [job]);

  const snapshot = useCallback(() => resultsFor(job), [job]);
  const results = useSyncExternalStore(subscribe, snapshot, snapshot);

  /**
   * Prediksi satu dosis: tier dulu (cepat, langsung tampil), lalu SHAP otomatis.
   * Setiap prediksi selalu punya SHAP-nya, jadi riwayat Prediction & SHAP di Activity Logs seimbang.
   * Dosis yang sudah punya tier tapi belum punya SHAP (mis. dari sesi lama) langsung dilengkapi.
   */
  const run = useCallback(async (key: DoseKey) => {
    const id = doseId(key);
    const flight = `${job.id}:${id}`;
    const option = options.find(o => doseId(o.key) === id);
    const current = resultsFor(job)[id];
    if (!option?.ratios || inFlight.has(flight) || current?.shap) return;

    inFlight.add(flight);
    try {
      let tier = current?.tier;
      if (!tier) {
        patch(job.id, id, { status: 'predicting', error: undefined });
        try {
          const p = await predictRisk(option.ratios);
          if (p.predictionId) predictionIds.set(flight, p.predictionId);
          tier = p.tier;
          patch(job.id, id, { status: 'done', tier: p.tier, prediction: p.prediction });
        } catch (err) {
          patch(job.id, id, { status: 'error', error: predictErrorMessage(err) });
          return;
        }
      }
      if (tier && tier !== 'unknown') {
        patch(job.id, id, { status: 'explaining', shapError: undefined });
        try {
          const shap = await explainRisk(option.ratios, tier, predictionIds.get(flight));
          patch(job.id, id, { status: 'done', shap });
        } catch (err) {
          patch(job.id, id, { status: 'done', shapError: predictErrorMessage(err) });
        }
      }
    } finally {
      inFlight.delete(flight);
    }
  }, [job, options]);

  return { options, results, run };
}
