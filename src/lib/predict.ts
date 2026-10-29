// src/lib/predict.ts
// Panggilan ke model risiko (predict + explain) yang dipakai Digital Lab dan Full Pipeline (prediksi per dosis).
// Path diawali "/api/..." karena BASE di api.ts sudah "/api".

import { api } from "@/lib/api";
import { readApiError } from "@/lib/pipeline";
import { invalidateHistory } from "@/lib/historyCache";

/* =========================================================
   TIPE & PARSER UNTUK RESPONSE /api/predict
   data[0] = Label Gradio (label + confidences), data[2] = conformal prediction
   ========================================================= */
export type PredictionOutput = {
  confidences: { confidence: number; label: string }[];
  predictedLabel: string;
  conformal: {
    alpha: number;
    calibrationNote: string;
    isAmbiguous: boolean;
    outOfDistribution: boolean;
    predictionSet: string[];
    qHat: number;
    recommendedAction: string;
    setSize: number;
    warning?: string;
  };
};

export function parsePredictResponse(raw: unknown[]): PredictionOutput | null {
  try {
    const confPart = raw[0] as { confidences: { confidence: number; label: string }[]; label: string };
    const conformalPart = raw[2] as {
      alpha: number;
      calibration_note: string;
      is_ambiguous: boolean;
      out_of_distribution: boolean;
      prediction_set: string[];
      q_hat: number;
      recommended_action: string;
      set_size: number;
      warning?: string;
    };

    return {
      confidences: confPart.confidences || [],
      predictedLabel: (confPart.label || 'unknown').toLowerCase(),
      conformal: {
        alpha: conformalPart.alpha,
        calibrationNote: conformalPart.calibration_note?.replace(/\s+/g, ' ').trim() || '',
        isAmbiguous: conformalPart.is_ambiguous,
        outOfDistribution: conformalPart.out_of_distribution,
        predictionSet: Array.isArray(conformalPart.prediction_set)
          ? conformalPart.prediction_set.map((s) => s.toLowerCase())
          : [],
        qHat: conformalPart.q_hat,
        recommendedAction: (conformalPart.recommended_action || confPart.label || 'high').toLowerCase(),
        setSize: conformalPart.set_size ?? (Array.isArray(conformalPart.prediction_set) ? conformalPart.prediction_set.length : 0),
        warning: conformalPart.warning?.trim() || undefined,
      },
    };
  } catch {
    return null;
  }
}

export type ShapContribution = { biomarker: string; value: number; shap: number };
export type ShapData = { predicted_class: string; base_value: number; contributions: ShapContribution[] };

export type RiskPrediction = {
  /** "high" | "intermediate" | "low" (huruf kecil) */
  tier: string;
  prediction: PredictionOutput | null;
  /** Dipakai explain supaya SHAP tercatat pada prediksi yang sama di Activity Logs */
  predictionId?: string;
};

const RETRY_DELAY_MS = 3000;

/** Hanya error sementara yang layak diulang: jaringan putus atau backend sedang bangun (502/503/504). */
export function isTransient(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  const status = (err as { status?: unknown } | null)?.status;
  return status === 502 || status === 503 || status === 504;
}

// Error input (422), sesi (401) dan rate limit (429) langsung dilempar; tidak ada gunanya diulang.
async function postWithRetry(endpoint: string, body: { data: number[]; prediction_id?: string }, retries = 3) {
  for (let i = 0; ; i++) {
    try {
      const res = await api(endpoint, { method: "POST", body });
      invalidateHistory(); // ada catatan baru di riwayat
      return res;
    } catch (err: unknown) {
      if (i >= retries - 1 || !isTransient(err)) throw err;
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    }
  }
}

/** Tier risiko dari 11 rasio biomarker (urutan FEATURES). Cepat. */
export async function predictRisk(data: number[]): Promise<RiskPrediction> {
  const res = await postWithRetry("/api/predict", { data });
  const raw: unknown[] = Array.isArray(res?.data) ? res.data : [];
  const id = typeof res?.prediction_id === "string" && res.prediction_id.trim() !== "" ? res.prediction_id.trim() : undefined;
  return {
    tier: String((raw[0] as { label?: string } | undefined)?.label || "unknown").toLowerCase(),
    prediction: parsePredictResponse(raw),
    predictionId: id,
  };
}

/** SHAP untuk tier yang diprediksi. Lebih lambat dari predict (beberapa detik, terlama setelah server bangun). */
export async function explainRisk(data: number[], tier: string, predictionId?: string): Promise<ShapData> {
  const res = await postWithRetry("/api/explain", { data, ...(predictionId ? { prediction_id: predictionId } : {}) });
  const first = (Array.isArray(res?.data) ? res.data[0] : null) as Partial<ShapData> | null;
  if (!first || !Array.isArray(first.contributions) || typeof first.base_value !== "number") {
    throw new Error("Unexpected explanation response");
  }
  return { predicted_class: tier, base_value: first.base_value, contributions: first.contributions };
}

/** Pesan error predict/explain yang bisa dibaca user (dipakai Digital Lab & prediksi per dosis). */
export function predictErrorMessage(err: unknown): string {
  const { status, message, isNetwork } = readApiError(err);
  if (status === 401) return "Session expired. Reload the page to sign in again.";
  if (status === 422) return message ? `Invalid input: ${message}` : "Invalid input.";
  if (status === 429) return "Too many requests. Wait a few seconds and try again.";
  if (status === 502 || status === 503 || status === 504) return "The risk model is starting up. Try again in about a minute.";
  if (isNetwork) return "Could not reach the risk model. Check your connection and try again.";
  return message ? `The risk model returned an error: ${message}` : "The risk model returned an error.";
}
