'use client';

// Laporan Digital Lab yang bertahan saat user berpindah tab di area lab.
// State disimpan di tingkat modul (bukan di komponen), jadi prediksi yang sedang berjalan tetap selesai
// & tersimpan walau halaman ditinggal, dan tampil lagi saat user kembali. Hasil yang selesai juga
// disalin ke sessionStorage supaya bertahan saat refresh. Laporan hanya hilang lewat "New prediction".

import { useSyncExternalStore } from 'react';
import { explainRisk, predictErrorMessage, predictRisk, type PredictionOutput, type ShapData } from '@/lib/predict';

export type Report = {
  inputs: number[];
  status: 'predicting' | 'done' | 'error';
  tier?: string;
  prediction?: PredictionOutput | null;
  predictionId?: string;
  error?: string;
  shap?: ShapData | null;
  explaining?: boolean;
  shapError?: string;
};

const STORAGE_KEY = 'digital-lab-report';

/** Dari sessionStorage: request yang terputus oleh refresh tidak bisa dilanjutkan, jadi status "jalan" dibuang. */
function readStored(): Report | null {
  if (typeof window === 'undefined') return null;
  try {
    const r = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as Report | null;
    if (!r || r.status === 'predicting') return null;
    return r.explaining ? { ...r, explaining: false } : r;
  } catch {
    return null;
  }
}

let current: Report | null = readStored();
/** Naik setiap laporan baru dimulai; hasil request lama tidak menimpa laporan yang lebih baru */
let runId = 0;
const listeners = new Set<() => void>();

function set(next: Report | null) {
  current = next;
  try {
    if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* storage penuh/diblokir: laporan tetap ada selama halaman terbuka */ }
  listeners.forEach(l => l());
}

function patch(id: number, next: Partial<Report>) {
  if (id === runId && current) set({ ...current, ...next });
}

async function explain(id: number, inputs: number[], tier: string, predictionId?: string) {
  patch(id, { explaining: true, shapError: undefined });
  try {
    const shap = await explainRisk(inputs, tier, predictionId);
    patch(id, { explaining: false, shap });
  } catch (err) {
    patch(id, { explaining: false, shapError: predictErrorMessage(err) });
  }
}

/** Tier dulu (langsung tampil), lalu SHAP otomatis: setiap prediksi tercatat bersama SHAP-nya */
export async function submitLabReport(inputs: number[]) {
  const id = ++runId;
  set({ inputs, status: 'predicting' });
  let p;
  try {
    p = await predictRisk(inputs);
    patch(id, { status: 'done', tier: p.tier, prediction: p.prediction, predictionId: p.predictionId });
  } catch (err) {
    console.error('Digital Lab prediction failed:', err);
    patch(id, { status: 'error', error: predictErrorMessage(err) });
    return;
  }
  if (p.tier !== 'unknown') await explain(id, inputs, p.tier, p.predictionId);
}

export function retryLabExplain() {
  const r = current;
  if (r?.tier && !r.explaining && !r.shap) void explain(runId, r.inputs, r.tier, r.predictionId);
}

/** "New prediction": satu-satunya cara laporan dihapus */
export function clearLabReport() {
  runId++;
  set(null);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

export function useLabReport(): Report | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
