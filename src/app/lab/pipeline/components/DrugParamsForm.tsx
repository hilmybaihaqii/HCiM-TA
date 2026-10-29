'use client';

import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import {
  DrugDb, HERG_KEYS, HergKey, IC50_CHANNELS, Ic50Key, PipelineRequest,
  formatDrugName, isTrainingDrug, joinList,
} from '@/lib/pipeline';
import {
  FieldErrors, FormState, Mode, ParamValues, buildRequest, emptyParams, isEdited, paramsFromEntry, validateForm,
} from '../form';
import { Bone } from '../../components/Skeletons';
import ModeSelector, { EnterList, STEP_LABEL, StepId, modeInfo } from './ModeSelector';

const HERG_META: Record<HergKey, { label: string; unit?: string; placeholder: string }> = {
  Kmax: { label: 'Kmax', placeholder: '25.67' },
  Ku: { label: 'Ku', placeholder: '0.01765' },
  n: { label: 'n', placeholder: '0.7128' },
  halfmax: { label: 'halfmax', placeholder: '797.7' },
  Vhalf: { label: 'Vhalf', unit: 'mV', placeholder: '-41.57' },
};

const EXAMPLE_DRUG = 'vandetanib';
const PAD = 'px-6 sm:px-10 md:px-16';
const linkBtn = 'text-sm text-muted hover:text-foreground underline-offset-4 hover:underline transition-colors disabled:opacity-40 disabled:no-underline disabled:hover:text-muted';

/** Field mana saja yang divalidasi di tiap checkpoint */
function errorKeysFor(step: StepId, errors: FieldErrors): string[] {
  return Object.keys(errors).filter(k =>
    step === 'drug' ? k === 'drug'
    : step === 'exposure' ? k === 'cmax'
    : step === 'herg' ? k.startsWith('herg.')
    : step === 'channels' ? k.startsWith('ic50.')
    : step === 'review');
}

/* =========================================================
   FIELD ANGKA — garis bawah saja
   ========================================================= */
function NumberField({
  id, label, unit, value, onChange, onBlur, error, showError, edited, placeholder,
}: {
  id: string; label: string; unit?: string; value: string;
  onChange: (v: string) => void; onBlur?: () => void;
  error?: string; showError?: boolean; edited?: boolean; placeholder?: string;
}) {
  const hasError = !!error && showError;
  return (
    <div className="flex flex-col min-w-0">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-muted">
        <span className="truncate">{label}</span>
        {edited && <span className="normal-case tracking-normal text-[11px] text-accent">edited</span>}
      </label>
      <div
        className={`mt-1 flex items-baseline gap-2 border-b transition-colors duration-300
          ${hasError ? 'border-rose-500/70' : edited ? 'border-accent' : 'border-foreground/15 hover:border-foreground/30'}
          focus-within:border-foreground`}
      >
        <input
          id={id}
          type="number"
          step="any"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={hasError || undefined}
          className="w-full min-w-0 bg-transparent py-1.5 text-lg font-mono text-foreground placeholder:text-foreground/15 focus:outline-none
            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="shrink-0 text-xs font-mono text-muted/70">{unit}</span>}
      </div>
      <span className={`mt-1 text-[11px] leading-tight min-h-4 ${hasError ? 'text-rose-600' : 'invisible'}`}>
        {hasError ? error : ' '}
      </span>
    </div>
  );
}

/* =========================================================
   PEMILIH OBAT
   ========================================================= */
function DrugPicker({ db, value, onSelect, error }: {
  db: DrugDb | null; value: string; onSelect: (name: string) => void; error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const names = useMemo(() => (db ? Object.keys(db.drugs).sort((a, b) => a.localeCompare(b)) : []), [db]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? names.filter(n => n.toLowerCase().includes(q)) : names;
  }, [names, query]);

  const choose = (name: string) => {
    onSelect(name);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHighlight(h => Math.min(h + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && matches[highlight]) choose(matches[highlight]);
    } else if (e.key === 'Escape') { setOpen(false); }
  };

  // Database obat belum termuat: skeleton, bukan teks "loading"
  if (!db) {
    return (
      <div className="w-full max-w-xl border-b border-foreground/10 py-3" aria-label="Loading the drug list">
        <Bone className="h-7 md:h-8 w-64 rounded-control" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className={`flex items-center gap-3 border-b transition-colors duration-300
        ${error && !open ? 'border-rose-500/70' : 'border-foreground/15 hover:border-foreground/30 focus-within:border-foreground'}`}>
        <input
          ref={inputRef}
          id="pipeline-drug"
          role="combobox"
          aria-label="CiPA drug"
          aria-expanded={open}
          aria-controls="pipeline-drug-list"
          autoComplete="off"
          disabled={!db}
          placeholder={db ? 'Search, e.g. bepridil' : 'Loading the drug database…'}
          value={open ? query : (value ? formatDrugName(value) : '')}
          onFocus={() => { setOpen(true); setQuery(''); setHighlight(0); }}
          onBlur={() => setOpen(false)}
          onChange={e => { setQuery(e.target.value); setHighlight(0); setOpen(true); }}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-0 bg-transparent py-2 text-2xl md:text-3xl font-medium tracking-tight text-foreground placeholder:text-foreground/20 placeholder:font-normal focus:outline-none disabled:cursor-not-allowed"
        />
        {value && !open && isTrainingDrug(value) && <span className="shrink-0 text-[11px] text-amber-700">training set</span>}
        <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {open && db && (
          <motion.ul
            id="pipeline-drug-list"
            role="listbox"
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
            className="absolute z-30 left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-surface-white border border-foreground/8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-card py-2"
          >
            {matches.length === 0 && <li className="px-4 py-2.5 text-sm text-muted">No drug matches “{query}”.</li>}
            {matches.map((name, i) => (
              <li
                key={name}
                role="option"
                aria-selected={name === value}
                // mousedown supaya pilihan tercatat sebelum input blur
                onMouseDown={e => { e.preventDefault(); choose(name); }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex items-baseline justify-between gap-3 px-4 py-2 text-sm cursor-pointer transition-colors
                  ${i === highlight ? 'bg-foreground/4' : ''} ${name === value ? 'text-action' : 'text-foreground'}`}
              >
                <span className="truncate">{formatDrugName(name)}</span>
                {isTrainingDrug(name) && <span className="shrink-0 text-[11px] text-amber-700">training set</span>}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && !open && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

/* =========================================================
   OVERVIEW MODE: yang diisi → yang disimulasikan → yang didapat
   ========================================================= */
function OverviewColumn({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <li className="min-w-0">
      <span className="font-mono text-[11px] text-accent">0{index}</span>
      <h4 className="mt-1 text-base font-medium text-foreground">{title}</h4>
      <div className="mt-3">{children}</div>
    </li>
  );
}

function Overview({ mode, doses }: { mode: Mode; doses: number[] }) {
  const info = modeInfo(mode);
  const steps = info.steps.filter(s => s !== 'overview');
  return (
    <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
      <OverviewColumn index={1} title="You enter">
        <EnterList info={info} />
        <p className="mt-3 text-xs text-muted">{steps.map(s => STEP_LABEL[s]).join(' → ')}</p>
      </OverviewColumn>

      <OverviewColumn index={2} title="We simulate">
        <p className="text-sm text-muted leading-relaxed">
          One virtual heart cell at {joinList(doses)}× Cmax. The 11 biomarkers are the mean over the doses.
        </p>
      </OverviewColumn>

      <OverviewColumn index={3} title="You get">
        <ul className="text-sm">
          {['Action potential and calcium traces', '11 biomarker ratios', 'TdP risk tier with SHAP'].map(t => (
            <li key={t} className="py-2 border-b border-foreground/6 last:border-b-0 text-foreground">{t}</li>
          ))}
        </ul>
      </OverviewColumn>
    </ol>
  );
}

/* =========================================================
   RINGKASAN (review)
   ========================================================= */
function SummaryGroup({ title, rows }: { title: string; rows: { k: string; v: string; edited?: boolean }[] }) {
  return (
    <div>
      <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted">{title}</span>
      <dl className="mt-2">
        {rows.map(r => (
          <div key={r.k} className="flex items-baseline justify-between gap-4 py-1.5 border-b border-foreground/6 last:border-b-0 text-sm">
            <dt className="font-mono text-muted">{r.k}</dt>
            <dd className={`font-mono text-right ${r.edited ? 'text-accent' : 'text-foreground'}`}>
              {r.v || '—'}{r.edited && <span className="ml-2 font-sans text-[11px]">edited</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* =========================================================
   WIZARD UTAMA
   ========================================================= */
export default function DrugParamsForm({
  form, onChange, db, dbError, doses, submitting, serverError, onSubmit, startAt = 'choose',
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  db: DrugDb | null;
  dbError: string | null;
  doses: number[];
  submitting: boolean;
  serverError: string | null;
  onSubmit: (req: PipelineRequest) => void;
  /** "review" dipakai saat "Try again" supaya langsung ke ringkasan dengan nilai yang sama */
  startAt?: 'choose' | 'review';
}) {
  const steps = modeInfo(form.mode).steps;
  const [stepIndex, setStepIndex] = useState<number | null>(() => (startAt === 'review' ? steps.length - 1 : null));
  const [maxVisited, setMaxVisited] = useState(() => (startAt === 'review' ? steps.length - 1 : 0));
  const [revealed, setRevealed] = useState<Set<StepId>>(() => new Set());
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const touch = (key: string) => setTouched(prev => (prev.has(key) ? prev : new Set(prev).add(key)));

  const errors: FieldErrors = useMemo(() => validateForm(form, db), [form, db]);
  const needsDb = form.mode !== 2;
  const canSubmit = Object.keys(errors).length === 0 && !submitting && (!needsDb || !!db);

  const entry = db && form.drug ? db.drugs[form.drug] : undefined;
  const dbParams = useMemo(() => paramsFromEntry(entry), [entry]);

  const step: StepId | null = stepIndex === null ? null : steps[stepIndex];

  /* ---------- navigasi ---------- */
  const chooseMode = (mode: Mode) => {
    let next: FormState = { ...form, mode };
    // Masuk mode 3 dengan obat terpilih tapi parameter belum terisi -> prefill dari database
    if (mode === 3 && entry && HERG_KEYS.every(k => form.lab.herg[k] === '')) next = { ...next, lab: paramsFromEntry(entry) };
    if (mode !== form.mode) { setRevealed(new Set()); setTouched(new Set()); }
    onChange(next);
    setStepIndex(0);
    setMaxVisited(0);
  };

  const goTo = (i: number) => {
    setStepIndex(i);
    setMaxVisited(m => Math.max(m, i));
  };

  const next = () => {
    if (stepIndex === null || !step) return;
    if (errorKeysFor(step, errors).length > 0) {
      // Checkpoint belum lolos: tampilkan semua error di langkah ini
      setRevealed(prev => new Set(prev).add(step));
      return;
    }
    goTo(stepIndex + 1);
  };

  const back = () => {
    if (stepIndex === null) return;
    setStepIndex(stepIndex === 0 ? null : stepIndex - 1);
  };

  /* ---------- nilai ---------- */
  const target: 'custom' | 'lab' = form.mode === 2 ? 'custom' : 'lab';
  const values: ParamValues = form[target];

  const setParam = (group: 'herg' | 'ic50' | 'cmax', key: string, v: string) => {
    const cur = form[target];
    let updated: ParamValues;
    if (group === 'cmax') updated = { ...cur, cmax: v };
    else if (group === 'herg') updated = { ...cur, herg: { ...cur.herg, [key as HergKey]: v } };
    else updated = { ...cur, ic50: { ...cur.ic50, [key as Ic50Key]: v } };
    onChange({ ...form, [target]: updated });
  };

  const selectDrug = (name: string) => onChange({ ...form, drug: name, lab: paramsFromEntry(db?.drugs[name]) });

  const fillExample = () => {
    const ex = db?.drugs[EXAMPLE_DRUG] ?? (db ? Object.values(db.drugs)[0] : undefined);
    if (ex) onChange({ ...form, custom: paramsFromEntry(ex) });
  };

  const clearCustom = () => {
    onChange({ ...form, custom: emptyParams() });
    setTouched(new Set());
    setRevealed(new Set());
  };

  const resetLab = () => { if (entry) onChange({ ...form, lab: paramsFromEntry(entry) }); };

  const showErr = (key: string, value: string) => {
    const e = errors[key];
    if (!e || !step) return false;
    return revealed.has(step) || value !== '' || touched.has(key) || e.startsWith('Required when');
  };

  const editedHerg = HERG_KEYS.filter(k => form.mode === 3 && isEdited(values.herg[k], dbParams.herg[k])).length;
  const editedIc50 = IC50_CHANNELS.reduce((n, c) => n
    + (form.mode === 3 && isEdited(values.ic50[c.ic50], dbParams.ic50[c.ic50]) ? 1 : 0)
    + (form.mode === 3 && isEdited(values.ic50[c.hill], dbParams.ic50[c.hill]) ? 1 : 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 'review') { next(); return; }
    if (canSubmit) onSubmit(buildRequest(form));
  };

  /* ---------- isi tiap langkah ---------- */
  const resetHint = (count: number) => form.mode === 3 && entry && (
    <p className="mt-2 text-sm text-muted">
      {count > 0 ? <span className="text-accent">{count} edited · </span> : 'Prefilled from the database. '}
      <button type="button" onClick={resetLab} disabled={count === 0 && editedHerg + editedIc50 === 0} className={linkBtn}>
        Reset to database values
      </button>
    </p>
  );

  const STEP_HEAD: Record<StepId, { title: string; hint?: React.ReactNode }> = {
    overview: { title: modeInfo(form.mode).question, hint: modeInfo(form.mode).useWhen },
    drug: { title: 'Choose a drug', hint: form.mode === 1 ? 'All 28 CiPA drugs. Parameters come from the database.' : 'Its database values will be loaded for you to edit.' },
    exposure: { title: 'Exposure', hint: 'Therapeutic Cmax of the compound.' },
    herg: { title: 'hERG binding', hint: 'Dynamic hERG binding parameters (Kmax, Ku, n, halfmax, Vhalf) from the CiPA hERG fitting.' },
    channels: { title: 'Other channels', hint: 'Optional. Leave a row empty if the drug does not block that channel.' },
    review: { title: 'Review & run', hint: `Simulated at ${joinList(doses)}× Cmax, biomarkers taken as the mean over doses.` },
  };

  const body = (() => {
    switch (step) {
      case 'overview':
        return <Overview mode={form.mode} doses={doses} />;

      case 'drug':
        return (
          <>
            <DrugPicker db={db} value={form.drug} onSelect={selectDrug} error={revealed.has('drug') || form.drug ? errors.drug : undefined} />
            {entry && (
              <p className="mt-4 text-sm text-muted">
                Cmax <span className="font-mono text-foreground">{dbParams.cmax} nM</span> · from the CiPA database
              </p>
            )}
          </>
        );

      case 'exposure':
        return (
          <>
            <div className="max-w-xs">
              <NumberField
                id="f-cmax" label="Cmax" unit="nM" placeholder="255.4"
                value={values.cmax}
                onChange={v => setParam('cmax', 'cmax', v)}
                onBlur={() => touch('cmax')}
                error={errors.cmax} showError={showErr('cmax', values.cmax)}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              <button type="button" onClick={fillExample} disabled={!db} className={linkBtn}>
                Fill every step with an example ({formatDrugName(EXAMPLE_DRUG)})
              </button>
              <span className="mx-2 text-muted/40">·</span>
              <button type="button" onClick={clearCustom} className={linkBtn}>Clear all</button>
            </p>
          </>
        );

      case 'herg':
        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8">
              {HERG_KEYS.map(k => {
                const key = `herg.${k}`;
                return (
                  <NumberField
                    key={k} id={`f-herg-${k}`} label={HERG_META[k].label} unit={HERG_META[k].unit}
                    placeholder={HERG_META[k].placeholder}
                    value={values.herg[k]}
                    onChange={v => setParam('herg', k, v)}
                    onBlur={() => touch(key)}
                    error={errors[key]} showError={showErr(key, values.herg[k])}
                    edited={form.mode === 3 && isEdited(values.herg[k], dbParams.herg[k])}
                  />
                );
              })}
            </div>
            {resetHint(editedHerg)}
          </>
        );

      case 'channels':
        return (
          <>
            <div className="flex flex-col max-w-3xl">
              {IC50_CHANNELS.map(({ channel, ic50, hill }) => (
                <div key={channel} className="grid grid-cols-[4.5rem_1fr_1fr] gap-x-6 sm:gap-x-8 items-end">
                  <span className="pb-7 text-sm font-medium text-foreground">{channel}</span>
                  {([[ic50, 'IC50', 'nM'], [hill, 'Hill', undefined]] as const).map(([k, label, unit]) => {
                    const key = `ic50.${k}`;
                    return (
                      <NumberField
                        key={k} id={`f-${k}`} label={label} unit={unit}
                        value={values.ic50[k]}
                        onChange={v => setParam('ic50', k, v)}
                        onBlur={() => touch(key)}
                        error={errors[key]} showError={showErr(key, values.ic50[k])}
                        edited={form.mode === 3 && isEdited(values.ic50[k], dbParams.ic50[k])}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            {resetHint(editedIc50)}
          </>
        );

      case 'review': {
        const p = form.mode === 1 ? dbParams : values;
        const cmax = form.mode === 2 ? values.cmax : dbParams.cmax;
        const ed = (v: string, d: string) => form.mode === 3 && isEdited(v, d);
        return (
          <>
            <p className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">
              {form.mode === 2 ? 'New compound' : formatDrugName(form.drug)}
              {form.drug && isTrainingDrug(form.drug) && <span className="ml-3 align-middle text-[11px] font-normal text-amber-700">training set</span>}
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6">
              <SummaryGroup title="Exposure" rows={[{ k: 'Cmax', v: cmax ? `${cmax} nM` : '' }]} />
              <SummaryGroup
                title="hERG binding"
                rows={HERG_KEYS.map(k => ({
                  k: HERG_META[k].label,
                  v: p.herg[k] ? `${p.herg[k]}${HERG_META[k].unit ? ` ${HERG_META[k].unit}` : ''}` : '',
                  edited: ed(p.herg[k], dbParams.herg[k]),
                }))}
              />
              <SummaryGroup
                title="Other channels"
                rows={IC50_CHANNELS.map(({ channel, ic50, hill }) => ({
                  k: channel,
                  v: p.ic50[ic50] ? `${p.ic50[ic50]} nM, h ${p.ic50[hill] || '—'}` : 'no block',
                  edited: ed(p.ic50[ic50], dbParams.ic50[ic50]) || ed(p.ic50[hill], dbParams.ic50[hill]),
                }))}
              />
            </div>
          </>
        );
      }

      default:
        return null;
    }
  })();

  /* ---------- render ---------- */
  if (stepIndex === null) {
    return (
      <div className="w-full bg-surface-white/70 backdrop-blur-md border border-foreground/10 rounded-sheet shadow-sm">
        <ModeSelector onSelect={chooseMode} current={startAt === 'review' ? form.mode : undefined} />
      </div>
    );
  }

  const isLast = step === 'review';
  const head = step ? STEP_HEAD[step] : null;

  return (
    <div className="w-full bg-surface-white/70 backdrop-blur-md border border-foreground/10 rounded-sheet shadow-sm">
      {/* Mode + checkpoint */}
      <div className={`${PAD} pt-8 md:pt-10 pb-6 border-b border-foreground/8`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-muted">
            Mode 0{form.mode} · {modeInfo(form.mode).title}
          </span>
        </div>

        <ol className="mt-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => {
            const done = i < stepIndex || (i <= maxVisited && i !== stepIndex && errorKeysFor(s, errors).length === 0 && s !== 'review');
            const active = i === stepIndex;
            const reachable = i <= maxVisited && !submitting;
            return (
              <li key={s}>
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => goTo(i)}
                  className="w-full text-left group disabled:cursor-default"
                  aria-current={active ? 'step' : undefined}
                >
                  <span className={`block h-0.5 rounded-full transition-colors duration-300 ${active || done ? 'bg-action' : 'bg-foreground/10'}`} />
                  <span className={`mt-2.5 flex items-center gap-1.5 text-[10px] md:text-[11px] font-mono uppercase tracking-wider
                    ${active ? 'text-foreground' : done ? 'text-foreground/60' : 'text-muted/50'} ${reachable && !active ? 'group-hover:text-foreground' : ''}`}>
                    {done && !active ? <Check className="w-3 h-3 text-action shrink-0" /> : <span className="text-action/80">{i + 1}</span>}
                    {/* Di layar kecil nama langkah tampil di baris terpisah di bawah */}
                    <span className="hidden md:inline truncate">{STEP_LABEL[s]}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {step && (
          <p className="md:hidden mt-3 text-[11px] font-mono uppercase tracking-wider text-foreground">
            Step {stepIndex + 1} of {steps.length} · {STEP_LABEL[step]}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Animasi masuk saja (tanpa AnimatePresence mode="wait", yang bisa macet di opacity 0) */}
        <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`${PAD} py-8 md:py-10 min-h-72`}
          >
            {head && (
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground">{head.title}</h3>
                {head.hint && <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">{head.hint}</p>}
              </div>
            )}
            {needsDb && dbError && step !== 'overview' && <p className="mb-6 text-sm text-rose-600">{dbError}</p>}
            {body}
          </motion.div>

        {/* Navigasi */}
        <div className={`${PAD} py-6 border-t border-foreground/8 flex items-center justify-between gap-4`}>
          {/* Satu-satunya tombol kembali: jelas, berbentuk tombol */}
          <button
            type="button"
            onClick={back}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-control border border-action/30 bg-surface-white text-sm font-medium text-action hover:border-action hover:bg-action/5 active:scale-[0.98] transition-all duration-300 disabled:opacity-40"
          >
            <span aria-hidden="true">←</span> {stepIndex === 0 ? 'Back to modes' : 'Back'}
          </button>

          {isLast ? (
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex items-center justify-center gap-2.5 px-7 py-3 rounded-control text-sm font-medium transition-all duration-300
                ${canSubmit ? 'bg-accent text-surface-white shadow-sm shadow-accent/20 hover:bg-accent-dark active:scale-[0.98]' : 'bg-foreground/8 text-muted/60 cursor-not-allowed'}`}
            >
              {submitting ? 'Starting…' : (
                <>Run full pipeline <span aria-hidden="true">→</span></>
              )}
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 px-7 py-3 rounded-control bg-action text-surface-white text-sm font-medium shadow-sm shadow-action/20 hover:bg-action-dark active:scale-[0.98] transition-all duration-300"
            >
              {step === 'overview' ? 'Start' : 'Next'} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        {serverError && (
          <p role="alert" className={`${PAD} pb-6 -mt-2 text-sm text-rose-600 leading-relaxed text-right`}>{serverError}</p>
        )}
      </form>
    </div>
  );
}
