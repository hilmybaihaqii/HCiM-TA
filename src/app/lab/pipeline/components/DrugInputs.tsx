'use client';

import React from 'react';
import {
  DrugDb, HERG_KEYS, HergKey, IC50_CHANNELS, Ic50Key, PipelineJob, formatDrugName, isTrainingDrug,
} from '@/lib/pipeline';
import { getTierColor } from '@/lib/tierColor';
import type { DoseKey } from '../useDosePredictions';

const HERG_UNIT: Partial<Record<HergKey, string>> = { Vhalf: 'mV' };

const numFmt = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 5 });
const sciFmt = new Intl.NumberFormat('en-US', { notation: 'scientific', maximumSignificantDigits: 4 });
/** Angka sangat besar/kecil (mis. Kmax 1e8, Ku 2e-5) ditulis ilmiah: 1E8, 2.1E-5 */
const fmt = (v?: number | null) => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  return a !== 0 && (a >= 1e5 || a < 1e-3) ? sciFmt.format(v) : numFmt.format(v);
};

/** Asal nilai: database CiPA, diedit user (mode 3), atau diisi user (mode 2) */
type Source = 'database' | 'edited' | 'entered';
type Param = { value?: number; source: Source };

/**
 * Parameter yang dipakai simulasi. Prioritas: nilai dari user (request) > sim_params > database CiPA.
 * Mode 1 hanya mengirim nama obat, jadi nilainya diambil dari database.
 */
function resolveParams(job: PipelineJob, db: DrugDb | null) {
  const req = job.request ?? {};
  const sp = job.sim_params ?? {};
  const drug = req.drug ?? sp.drug;
  const entry = drug ? db?.drugs[drug.toLowerCase()] : undefined;

  const pick = (user?: number, sim?: number, base?: number): Param => {
    if (typeof user === 'number') {
      if (!drug) return { value: user, source: 'entered' };
      return { value: user, source: typeof base === 'number' && base !== user ? 'edited' : 'database' };
    }
    return { value: typeof sim === 'number' ? sim : base, source: drug ? 'database' : 'entered' };
  };

  const herg = Object.fromEntries(
    HERG_KEYS.map(k => [k, pick(req.herg?.[k], sp.herg?.[k], entry?.herg?.[k])]),
  ) as Record<HergKey, Param>;
  const ic50 = Object.fromEntries(
    IC50_CHANNELS.flatMap(({ ic50: a, hill: b }) => [
      [a, pick(req.ic50?.[a], sp.ic50?.[a], entry?.ic50?.[a])],
      [b, pick(req.ic50?.[b], sp.ic50?.[b], entry?.ic50?.[b])],
    ]),
  ) as Record<Ic50Key, Param>;

  return {
    drug,
    entry,
    cmax: pick(req.cmax_nM, sp.cmax_nM, entry?.cmax_nM),
    herg,
    ic50,
    source: !drug ? 'your own values' : req.herg || req.ic50 ? 'CiPA values with your edits' : 'CiPA values',
  };
}

function Row({ k, unit, p }: { k: string; unit?: string; p: Param }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-foreground/6 last:border-b-0 text-sm">
      <dt className="font-mono text-foreground/70">{k}</dt>
      <dd className={`font-mono text-right tabular-nums ${p.source === 'edited' ? 'text-accent' : 'text-foreground'}`}>
        {fmt(p.value)}{unit && typeof p.value === 'number' ? <span className="text-foreground/70"> {unit}</span> : null}
        {p.source === 'edited' && <span className="ml-2 font-sans text-[11px]">edited</span>}
      </dd>
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-foreground/70">{title}</span>
      {hint && <p className="mt-1 text-xs text-foreground/70 leading-relaxed">{hint}</p>}
      <dl className="mt-3">{children}</dl>
    </div>
  );
}

/** Tab "Drug & doses": parameter obat yang disimulasikan + detail run tiap dosis */
export default function DrugInputs({ job, db, selected, onSelect, parts = 'all' }: {
  job: PipelineJob;
  db: DrugDb | null;
  selected: DoseKey;
  onSelect?: (key: DoseKey) => void;
  /** "params" = obat & parameter saja, "doses" = tabel run per dosis saja */
  parts?: 'all' | 'params' | 'doses';
}) {
  const p = resolveParams(job, db);
  const r = job.sim_result;
  const perDose = [...(r?.per_dose ?? [])].sort((a, b) => a.dose - b.dose);
  const conc = r ? (Array.isArray(r.conc_nM) ? r.conc_nM : [r.conc_nM]) : [];
  const doses = r?.doses ?? job.sim_params?.doses ?? perDose.map(d => d.dose);

  return (
    <div className="flex flex-col gap-10">
      {parts !== 'doses' && (<>
      {/* ---------- Asal nilai: satu baris, kiri & kanan terisi ---------- */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 text-sm">
        <p className="text-foreground/70">
          {p.drug ? formatDrugName(p.drug) : 'Custom compound'} · <span className="text-foreground">{p.source}</span>
        </p>
        {p.drug && p.entry && (
          <p className="text-foreground/70">
            CiPA reference{' '}
            <span className={`capitalize font-medium ${getTierColor(p.entry.cipa_risk).text}`}>{p.entry.cipa_risk}</span>
            {isTrainingDrug(p.drug) && <> · in training set</>}
          </p>
        )}
      </div>

      {/* ---------- Parameter ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        <Group title="Exposure" hint="Therapeutic Cmax, and the concentrations simulated from it.">
          <Row k="Cmax" unit="nM" p={p.cmax} />
          {doses.map((d, i) => (
            <Row key={d} k={`${d}× Cmax`} unit="nM" p={{ value: typeof conc[i] === 'number' ? conc[i] : undefined, source: 'database' }} />
          ))}
        </Group>

        <Group title="hERG binding" hint="Dynamic hERG model parameters (CiPA fitting).">
          {HERG_KEYS.map(k => <Row key={k} k={k} unit={HERG_UNIT[k]} p={p.herg[k]} />)}
        </Group>

        <Group title="Other channels" hint="IC50 and Hill coefficient. Empty means the drug does not block that channel.">
          {IC50_CHANNELS.map(({ channel, ic50, hill }) => {
            const blocked = typeof p.ic50[ic50].value === 'number';
            return (
              <div key={channel} className="py-2 border-b border-foreground/6 last:border-b-0">
                <p className="text-sm font-medium text-foreground">{channel}</p>
                {blocked ? (
                  <dl className="mt-1">
                    <Row k="IC50" unit="nM" p={p.ic50[ic50]} />
                    <Row k="Hill" p={p.ic50[hill]} />
                  </dl>
                ) : (
                  <p className="mt-0.5 text-sm text-foreground/70">No block</p>
                )}
              </div>
            );
          })}
        </Group>
      </div>
      </>)}

      {/* ---------- Run per dosis ---------- */}
      {parts !== 'params' && perDose.length > 0 && (
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-foreground/70">Each dose run</span>
          <p className="mt-1 text-xs text-foreground/70 leading-relaxed max-w-2xl">
            Each dose is a separate simulation run. The beat used, EAD count and failed beats come straight from the simulator.
          </p>
          <div className="mt-4 overflow-x-auto -mx-2 overscroll-x-contain">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-foreground/60 border-b border-foreground/10">
                  <th className="px-2 py-2.5 font-medium text-left">Dose</th>
                  <th className="px-2 py-2.5 font-medium text-right">Concentration</th>
                  <th className="px-2 py-2.5 font-medium text-right">Beat used</th>
                  <th className="px-2 py-2.5 font-medium text-right">EADs</th>
                  <th className="px-2 py-2.5 font-medium text-right">Failed beats</th>
                  <th className="px-2 py-2.5 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {perDose.map(d => {
                  const failed = (d.flags?.noDepols ?? 0) + (d.flags?.noRepols ?? 0);
                  const isSel = selected === d.dose;
                  return (
                    <tr
                      key={d.dose}
                      onClick={onSelect ? () => onSelect(d.dose) : undefined}
                      className={`transition-colors odd:bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]
                        ${onSelect ? 'cursor-pointer hover:bg-foreground/6' : ''} ${isSel ? 'shadow-[inset_0_0_0_9999px_rgb(184_84_92/0.07)]' : ''}`}
                    >
                      <td className={`px-2 py-2.5 font-medium ${isSel ? 'text-accent' : 'text-foreground'}`}>{d.dose}× Cmax</td>
                      <td className="px-2 py-2.5 text-right font-mono tabular-nums text-foreground">{fmt(d.conc_nM)} nM</td>
                      <td className="px-2 py-2.5 text-right font-mono tabular-nums text-foreground/70">{fmt(d.kept_beat)}</td>
                      <td className={`px-2 py-2.5 text-right font-mono tabular-nums ${d.flags?.EADs > 0 ? 'text-amber-700 font-semibold' : 'text-foreground/70'}`}>
                        {fmt(d.flags?.EADs ?? 0)}
                      </td>
                      <td className={`px-2 py-2.5 text-right font-mono tabular-nums ${failed > 0 ? 'text-amber-700 font-semibold' : 'text-foreground/70'}`}>
                        {fmt(failed)}
                      </td>
                      <td className="px-2 py-2.5 text-right font-mono tabular-nums text-foreground/70">{fmt(d.elapsed_s)} s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
