// State form, validasi, dan konversi ke request untuk halaman Full Pipeline.

import {
  DrugDb, DrugEntry, HERG_KEYS, HergKey, IC50_CHANNELS, Ic50Key, PipelineRequest,
} from '@/lib/pipeline';

export type Mode = 1 | 2 | 3;

/** Nilai disimpan sebagai string supaya input tetap bisa kosong / sedang diketik (mis. "-"). */
export type ParamValues = {
  cmax: string;
  herg: Record<HergKey, string>;
  ic50: Record<Ic50Key, string>;
};

export type FormState = {
  mode: Mode;
  drug: string;
  /** Mode 2: obat baru, semua diisi user */
  custom: ParamValues;
  /** Mode 3: nilai database CiPA yang bisa diedit */
  lab: ParamValues;
};

export type FieldErrors = Partial<Record<string, string>>;

const emptyHerg = (): Record<HergKey, string> => ({ Kmax: '', Ku: '', n: '', halfmax: '', Vhalf: '' });
const emptyIc50 = (): Record<Ic50Key, string> =>
  ({ INa_IC50: '', INa_h: '', INaL_IC50: '', INaL_h: '', ICaL_IC50: '', ICaL_h: '' });

export const emptyParams = (): ParamValues => ({ cmax: '', herg: emptyHerg(), ic50: emptyIc50() });

export const initialForm = (): FormState => ({ mode: 1, drug: '', custom: emptyParams(), lab: emptyParams() });

const str = (v: number | undefined | null) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : '');

export function paramsFromEntry(entry?: DrugEntry | null): ParamValues {
  const p = emptyParams();
  if (!entry) return p;
  p.cmax = str(entry.cmax_nM);
  for (const k of HERG_KEYS) p.herg[k] = str(entry.herg?.[k]);
  for (const { ic50, hill } of IC50_CHANNELS) {
    p.ic50[ic50] = str(entry.ic50?.[ic50]);
    p.ic50[hill] = str(entry.ic50?.[hill]);
  }
  return p;
}

/** Rekonstruksi form dari request job (untuk "Try again" setelah refresh). */
export function formFromRequest(req: PipelineRequest | null | undefined): FormState {
  const form = initialForm();
  if (!req) return form;
  const params = emptyParams();
  params.cmax = str(req.cmax_nM);
  for (const k of HERG_KEYS) params.herg[k] = str(req.herg?.[k]);
  for (const { ic50, hill } of IC50_CHANNELS) {
    params.ic50[ic50] = str(req.ic50?.[ic50]);
    params.ic50[hill] = str(req.ic50?.[hill]);
  }

  if (!req.drug) return { ...form, mode: 2, custom: params };
  if (req.herg || req.ic50) return { ...form, mode: 3, drug: req.drug, lab: params };
  return { ...form, mode: 1, drug: req.drug };
}

/** "" -> undefined, teks bukan angka -> NaN */
const parse = (s: string): number | undefined => (s.trim() === '' ? undefined : Number(s));

function validateParams(p: ParamValues, needCmax: boolean, errors: FieldErrors) {
  if (needCmax) {
    const v = parse(p.cmax);
    if (v === undefined) errors.cmax = 'Required';
    else if (!Number.isFinite(v)) errors.cmax = 'Enter a number';
    else if (v <= 0) errors.cmax = 'Must be > 0';
  }

  for (const k of HERG_KEYS) {
    const v = parse(p.herg[k]);
    const key = `herg.${k}`;
    if (v === undefined) errors[key] = 'Required';
    else if (!Number.isFinite(v)) errors[key] = 'Enter a number';
    // Vhalf boleh negatif
    else if (k !== 'Vhalf' && v <= 0) errors[key] = 'Must be > 0';
  }

  for (const { ic50, hill } of IC50_CHANNELS) {
    const a = parse(p.ic50[ic50]);
    const b = parse(p.ic50[hill]);
    for (const [k, v, other] of [[ic50, a, b], [hill, b, a]] as const) {
      const key = `ic50.${k}`;
      if (v === undefined) {
        if (other !== undefined) errors[key] = k === ic50 ? 'Required when Hill is set' : 'Required when IC50 is set';
      } else if (!Number.isFinite(v)) errors[key] = 'Enter a number';
      else if (v <= 0) errors[key] = 'Must be > 0';
    }
  }
}

export function validateForm(form: FormState, db: DrugDb | null): FieldErrors {
  const errors: FieldErrors = {};
  if (form.mode === 1 || form.mode === 3) {
    if (!form.drug) errors.drug = 'Select a drug';
    else if (db && !db.drugs[form.drug]) errors.drug = 'Unknown drug';
  }
  if (form.mode === 2) validateParams(form.custom, true, errors);
  if (form.mode === 3 && form.drug) validateParams(form.lab, false, errors);
  return errors;
}

function toNumbers(p: ParamValues) {
  const herg: Partial<Record<HergKey, number>> = {};
  for (const k of HERG_KEYS) {
    const v = parse(p.herg[k]);
    if (v !== undefined) herg[k] = v;
  }
  const ic50: Partial<Record<Ic50Key, number>> = {};
  for (const { ic50: a, hill: b } of IC50_CHANNELS) {
    const x = parse(p.ic50[a]);
    const y = parse(p.ic50[b]);
    if (x !== undefined) ic50[a] = x;
    if (y !== undefined) ic50[b] = y;
  }
  return { herg, ic50 };
}

/** Body request per mode. cleanRequest() di createJob tetap membuang nilai kosong. */
export function buildRequest(form: FormState): PipelineRequest {
  if (form.mode === 1) return { drug: form.drug };
  if (form.mode === 2) {
    return { cmax_nM: parse(form.custom.cmax), ...toNumbers(form.custom) };
  }
  // Mode 3: Cmax diambil server dari database
  return { drug: form.drug, ...toNumbers(form.lab) };
}

/** Bandingkan nilai yang diedit dengan nilai database (numerik, supaya "1.50" == "1.5"). */
export function isEdited(value: string, dbValue: string): boolean {
  const a = parse(value);
  const b = parse(dbValue);
  if (a === undefined && b === undefined) return false;
  if (a === undefined || b === undefined) return true;
  return a !== b;
}
