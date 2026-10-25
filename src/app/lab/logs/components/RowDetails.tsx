"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { getTierCssVar } from "@/lib/tierColor";

/** Tombol "View data" yang sama untuk tabel Prediction dan SHAP. Teks biasa, bukan pil. */
export function DetailsToggle({ open, disabled, onClick }: { open: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={open}
      className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-40
        ${open ? "text-accent" : "text-foreground hover:text-accent"}`}
    >
      {open ? "Hide data" : "View data"}
      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

/**
 * Panel detail di dalam baris.
 * - `w-0 min-w-full`: isi panel tidak ikut menentukan lebar kolom, jadi tabel tidak bergeser saat dibuka.
 * - Transisi `grid-template-rows` 0fr -> 1fr: tinggi berubah mulus tanpa mengukur ulang lewat JS.
 */
export function DetailsPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid w-0 min-w-full transition-[grid-template-rows,opacity] duration-300 ease-out
        ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="pt-3 text-left">
          <div className="border-l border-foreground/10 pl-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Hasil tier: titik warna + teks (bukan pil), sama di kedua tabel. */
export function TierLabel({ tier }: { tier?: string | null }) {
  // normalizeTier memetakan teks tak dikenal ke "low", jadi cek dulu supaya "Unknown" tetap netral
  const known = /high|inter|low|medium|moderate/i.test(tier || "");
  const color = known ? getTierCssVar(tier!) : "currentColor";
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground capitalize">
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
      {tier || "Unknown"}
    </span>
  );
}
