// src/lib/pipeline.ts
// Tipe & lapisan API untuk halaman Full Pipeline (/lab/pipeline).
// Semua path diawali "/api/..." seperti endpoint history, karena BASE di api.ts sudah "/api".

import { api } from "@/lib/api";

export const FEATURES = ["qNet", "dvdtmax", "vmax", "vrest", "APD50", "APD90",
  "max_dv", "camax", "carest", "CaTD50", "CaTD90"] as const;

export const TRAINING_DRUGS = new Set(["bepridil", "dofetilide", "quinidine", "sotalol",
  "chlorpromazine", "cisapride", "ondansetron", "terfenadine",
  "diltiazem", "mexiletine", "ranolazine", "verapamil"]);

export const DEFAULT_DOSES = [1, 2, 3, 4];

export const HERG_KEYS = ["Kmax", "Ku", "n", "halfmax", "Vhalf"] as const;
export type HergKey = (typeof HERG_KEYS)[number];

export const IC50_CHANNELS = [
  { channel: "INa", ic50: "INa_IC50", hill: "INa_h" },
  { channel: "INaL", ic50: "INaL_IC50", hill: "INaL_h" },
  { channel: "ICaL", ic50: "ICaL_IC50", hill: "ICaL_h" },
] as const;
export type Ic50Key = "INa_IC50" | "INa_h" | "INaL_IC50" | "INaL_h" | "ICaL_IC50" | "ICaL_h";

export type HergParams = Record<HergKey, number>;
export type Ic50Params = Partial<Record<Ic50Key, number>>;

export type CipaRisk = "high" | "intermediate" | "low";
export type DrugEntry = { cmax_nM: number; cipa_risk: CipaRisk; herg: HergParams; ic50: Ic50Params };
export type DrugDb = { ok: boolean; doses: number[]; dose_mode: string; drugs: Record<string, DrugEntry> };

export type PipelineRequest = {
  drug?: string;
  cmax_nM?: number;
  herg?: Partial<HergParams>;
  ic50?: Ic50Params;
};

export type JobStatus = "queued" | "simulating" | "predicting" | "done" | "failed";
export type Trace = { time: number[]; voltage: number[]; cai: number[] };
export type Flags = { EADs: number; noDepols: number; noRepols: number };
export type DoseRun = {
  dose: number; conc_nM: number; kept_beat: number;
  ratios: (number | null)[]; raw_metrics: Record<string, number | null>; flags: Flags; elapsed_s: number;
};
export type SimResult = {
  dose_mode?: "mean_of_doses"; doses?: number[]; conc_nM: number[] | number;
  raw_metrics: Record<string, number | null>; control_metrics: Record<string, number | null>;
  flags: Flags; excluded_doses?: Record<string, number[]>;
  per_dose?: DoseRun[]; traces_by_dose?: (Trace & { dose: number })[];
  trace: Trace; control_trace: Trace; kept_beat?: number;
  elapsed_s: number; engine_version: string;
};
export type PipelineJob = {
  id: string; status: JobStatus; request: PipelineRequest; error: string | null;
  created_at: string; started_at: string | null; finished_at: string | null;
  sim_params: (PipelineRequest & { doses?: number[]; dose?: number }) | null;
  ratios?: number[]; sim_result?: SimResult; prediction?: unknown[];
  explanation?: unknown[]; prediction_id?: string | null; sim_latency_ms?: number | null;
};

export const ACTIVE_STATUSES: JobStatus[] = ["queued", "simulating", "predicting"];

/** Remove empty values so we never send null/NaN/"" to the server. */
export function cleanRequest(r: PipelineRequest): PipelineRequest {
  const strip = (o?: Record<string, unknown>) => {
    if (!o) return undefined;
    const out = Object.fromEntries(Object.entries(o).filter(
      ([, v]) => typeof v === "number" && Number.isFinite(v)));
    return Object.keys(out).length ? out : undefined;
  };
  const res: PipelineRequest = {};
  if (r.drug) res.drug = r.drug;
  if (typeof r.cmax_nM === "number" && Number.isFinite(r.cmax_nM)) res.cmax_nM = r.cmax_nM;
  const herg = strip(r.herg as Record<string, unknown>); if (herg) res.herg = herg;
  const ic50 = strip(r.ic50 as Record<string, unknown>); if (ic50) res.ic50 = ic50;
  return res;
}

/** Backend mem-proxy hasil Gradio, jadi payload bisa datang polos, sebagai array, atau dibungkus { data: [...] }. */
function unwrapGradio(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw[0];
  if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: unknown[] }).data[0];
  }
  return raw;
}

/** Database obat CiPA tidak berubah selama sesi: cukup diambil sekali per tab (gagal = coba lagi lain kali). */
let drugsRequest: Promise<DrugDb> | null = null;
export function getDrugs(): Promise<DrugDb> {
  drugsRequest ??= fetchDrugs().catch(err => { drugsRequest = null; throw err; });
  return drugsRequest;
}

async function fetchDrugs(): Promise<DrugDb> {
  const payload = unwrapGradio(await api("/api/pipeline/drugs")) as Partial<DrugDb> | undefined;
  if (!payload || typeof payload.drugs !== "object" || payload.drugs === null) {
    throw new Error("Unexpected drug database response");
  }
  return {
    ok: payload.ok ?? true,
    doses: Array.isArray(payload.doses) && payload.doses.length ? payload.doses : DEFAULT_DOSES,
    dose_mode: payload.dose_mode ?? "mean_of_doses",
    drugs: payload.drugs,
  };
}

export const createJob = (req: PipelineRequest) =>
  api("/api/pipeline/jobs", { method: "POST", body: cleanRequest(req) }) as Promise<{ job_id: string }>;

export const getJob = (id: string) =>
  api(`/api/pipeline/jobs/${encodeURIComponent(id)}`) as Promise<PipelineJob>;

export async function listJobs(): Promise<PipelineJob[]> {
  const raw: unknown = await api("/api/pipeline/jobs");
  if (Array.isArray(raw)) return raw as PipelineJob[];
  // Jaga-jaga kalau list dibungkus objek
  const wrapped = raw as { jobs?: unknown; items?: unknown } | null;
  if (Array.isArray(wrapped?.jobs)) return wrapped.jobs as PipelineJob[];
  if (Array.isArray(wrapped?.items)) return wrapped.items as PipelineJob[];
  return [];
}

/* =========================================================
   HELPER TAMPILAN & ERROR
   ========================================================= */

/** "vandetanib" -> "Vandetanib" (yang dikirim ke server tetap lowercase). */
export function formatDrugName(name: string): string {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : name;
}

export function isTrainingDrug(name?: string | null): boolean {
  return !!name && TRAINING_DRUGS.has(name.toLowerCase());
}

/**
 * Perubahan ukuran biomarker relatif terhadap sel tanpa obat (0.16 = 16% lebih besar).
 * Rasio dari simulator = nilai obat / |nilai kontrol|, jadi biomarker yang nilainya negatif
 * (vrest, max_dv) bernilai -1 saat tidak berubah (lihat data CiPA: vrest ≈ -1.0).
 * Tanda kontrol diambil dari nilai kontrol kalau ada, kalau tidak dari tanda rasionya.
 */
export function ratioChange(ratio?: number | null, control?: number | null): number | null {
  if (typeof ratio !== "number" || !Number.isFinite(ratio)) return null;
  const negative = typeof control === "number" && control !== 0 ? control < 0 : ratio < 0;
  return negative ? -ratio - 1 : ratio - 1;
}

/** "+16%", "−8%", "0%" */
export function formatChange(change: number | null): string {
  if (change === null) return "n/a";
  const v = Math.round(change * 100);
  return v === 0 ? "0%" : `${v > 0 ? "+" : "−"}${Math.abs(v)}%`;
}

/** Biomarker dengan perubahan ukuran terbesar dari sel tanpa obat */
export function strongestChange(
  ratios?: (number | null)[] | null,
  control?: Record<string, number | null>,
): { key: string; change: number } | null {
  let best: { key: string; change: number } | null = null;
  for (let i = 0; i < (ratios?.length ?? 0); i++) {
    const key = FEATURES[i];
    const change = ratioChange(ratios?.[i], control?.[key]);
    if (change !== null && (!best || Math.abs(change) > Math.abs(best.change))) best = { key, change };
  }
  return best;
}

/** "1, 2, 3 and 4" */
export function joinList(items: (string | number)[]): string {
  const s = items.map(String);
  if (s.length <= 1) return s.join("");
  return `${s.slice(0, -1).join(", ")} and ${s[s.length - 1]}`;
}

/** Ambil status & pesan dari error yang dilempar api() ({ status, data }) atau TypeError jaringan. */
export function readApiError(err: unknown): { status?: number; message?: string; isNetwork: boolean } {
  const apiErr = (typeof err === "object" && err !== null ? err : {}) as Record<string, unknown>;
  const status = typeof apiErr.status === "number" ? apiErr.status : undefined;
  const data = apiErr.data as Record<string, unknown> | null | undefined;

  let message: string | undefined;
  if (data) {
    if (typeof data.error === "string") message = data.error;
    else if (typeof data.detail === "string") message = data.detail;
    else if (Array.isArray(data.detail) && data.detail.length > 0) {
      const first = data.detail[0] as Record<string, unknown> | string;
      message = typeof first === "string" ? first : (typeof first?.msg === "string" ? first.msg : undefined);
    } else if (typeof data.message === "string") message = data.message;
  }
  if (!message && err instanceof Error) message = err.message;

  return { status, message, isNetwork: err instanceof TypeError };
}

/** Error job yang sebenarnya validasi input: kembalikan ke form dengan nilai tetap. */
export function isFormError(error?: string | null): boolean {
  if (!error) return false;
  const e = error.toLowerCase();
  return e.includes("unknown drug") || e.includes("missing parameters") || e.includes("must be > 0");
}

/** Headline ramah untuk job yang gagal. `known: false` berarti tampilkan pesan mentah di "Details". */
export function describeFailure(error?: string | null): { headline: string; known: boolean } {
  const e = (error || "").toLowerCase();
  if (e.includes("no value for")) {
    return {
      known: true,
      headline: "The simulated cell did not repolarize normally, so the 11 biomarkers could not be computed. This can happen with very strong channel block. Try different parameters.",
    };
  }
  if (e.includes("not ready")) {
    return { known: true, headline: "The simulation engine is starting up. Please try again in a minute." };
  }
  if (e.includes("timed out")) {
    return { known: true, headline: "The simulation took too long. The server may be busy; please try again." };
  }
  if (e.includes("interrupted by server restart")) {
    return { known: true, headline: "The server restarted during your simulation. Please run it again." };
  }
  return { known: false, headline: "Something went wrong during the simulation." };
}
