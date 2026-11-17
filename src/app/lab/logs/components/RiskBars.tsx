"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export type RiskSlice = { key: string; label: string; count: number; color: string };

/**
 * Sebaran hasil risiko sebagai bar chart horizontal: satu baris per tier
 * (nama | bar | jumlah & persen). Panjang bar relatif terhadap tier terbanyak.
 * Hover/fokus satu baris menonjolkannya; angka selalu tertulis, jadi tidak bergantung pada warna saja.
 */
export default function RiskBars({ slices }: { slices: RiskSlice[] }) {
  const [active, setActive] = useState<string | null>(null);
  const total = slices.reduce((n, s) => n + s.count, 0);
  const max = Math.max(1, ...slices.map(s => s.count));
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <ul className="flex flex-col gap-1" aria-label="Risk results">
      {slices.map((s, i) => (
        <li key={s.key}>
          <button
            type="button"
            onMouseEnter={() => setActive(s.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(s.key)}
            onBlur={() => setActive(null)}
            aria-label={`${s.label}: ${s.count} (${pct(s.count)}%)`}
            className={`w-full grid grid-cols-[6.5rem_1fr_4.75rem] sm:grid-cols-[7.5rem_1fr_5.5rem] items-center gap-3 rounded-chip px-2 py-2 text-left transition-[opacity,background-color] duration-200
              hover:bg-foreground/4 ${active && active !== s.key ? "opacity-40" : "opacity-100"}`}
          >
            <span className="flex items-center gap-2 text-sm text-foreground min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="relative h-2.5 rounded-full bg-foreground/6 overflow-hidden" aria-hidden="true">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: s.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(s.count / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
            <span className="flex items-baseline justify-end gap-1.5">
              <span className="font-mono text-sm font-medium tabular-nums text-foreground">{s.count}</span>
              <span className="font-mono text-xs tabular-nums text-foreground/55 w-9 text-right">{pct(s.count)}%</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
