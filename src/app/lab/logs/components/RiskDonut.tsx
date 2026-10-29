"use client";

import React, { useState } from "react";

export type RiskSlice = { key: string; label: string; count: number; color: string };

const SIZE = 128;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const GAP = 2; // celah 2px antar segmen (warna surface)

/**
 * Donut distribusi risiko. Hover segmen atau legend: angka & persentase tampil di tengah.
 * Legend selalu menampilkan jumlah, jadi identitas tidak bergantung pada warna saja.
 */
export default function RiskDonut({ slices, centerLabel = "total" }: { slices: RiskSlice[]; centerLabel?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const total = slices.reduce((n, s) => n + s.count, 0);
  const shown = slices.filter((s) => s.count > 0);
  const current = slices.find((s) => s.key === active) ?? null;

  const gap = shown.length > 1 ? GAP : 0;
  const lengths = shown.map((s) => (s.count / total) * C);
  const arcs = shown.map((s, i) => ({
    ...s,
    dash: Math.max(lengths[i] - gap, 0.001),
    // Posisi awal = jumlah panjang segmen sebelumnya
    offset: lengths.slice(0, i).reduce((a, b) => a + b, 0),
  }));

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Risk distribution">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="currentColor" strokeOpacity={0.06} strokeWidth={STROKE} />
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={a.color}
                strokeWidth={active === a.key ? STROKE + 3 : STROKE}
                strokeDasharray={`${a.dash} ${C - a.dash}`}
                strokeDashoffset={-a.offset}
                opacity={active && active !== a.key ? 0.25 : 1}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setActive(a.key)}
                onMouseLeave={() => setActive(null)}
              >
                <title>{`${a.label}: ${a.count} (${pct(a.count)}%)`}</title>
              </circle>
            ))}
          </g>
        </svg>

        {/* Tengah: total, atau segmen yang di-hover */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-semibold tabular-nums text-foreground leading-none">
            {current ? current.count : total}
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-widest text-foreground/70">
            {current ? `${current.label} · ${pct(current.count)}%` : centerLabel}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 min-w-0">
        {slices.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              onMouseEnter={() => s.count > 0 && setActive(s.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => s.count > 0 && setActive(s.key)}
              onBlur={() => setActive(null)}
              className={`flex w-full items-center justify-between gap-4 rounded-chip px-1.5 py-0.5 text-xs transition-colors hover:bg-foreground/4
                ${active && active !== s.key ? "opacity-50" : ""}`}
            >
              <span className="flex items-center gap-2 text-foreground/70">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">{s.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
