import React from 'react';

/* Gaya dasar laporan risiko (Digital Lab & Full Pipeline). */

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';

/** Tombol utama gelap: kontras tinggi di atas latar hangat (merah aksen mudah tenggelam di latar ini) */
export const primaryBtn = `inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-control bg-foreground text-surface-white text-sm font-medium hover:bg-foreground/85 active:scale-[0.98] transition-all duration-200 shrink-0 ${focus}`;
export const secondaryBtn = `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-control border border-foreground/25 bg-surface-white text-sm font-medium text-foreground hover:border-foreground/60 transition-colors ${focus}`;
export const textLink = 'text-sm text-foreground/70 hover:text-foreground underline-offset-4 hover:underline transition-colors';

/** Judul bagian: judul di kiri, keterangan di kanan, satu baris */
export function SectionHead({ id, title, meta }: { id?: string; title: string; meta?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <h3 id={id} className="text-lg md:text-xl font-medium tracking-tight text-foreground">{title}</h3>
      {meta && <span className="text-xs md:text-sm text-foreground/70 text-right">{meta}</span>}
    </div>
  );
}

/**
 * Indikator geser untuk pilihan yang lebarnya sama (grid). Posisi dihitung dari index
 * (translateX), bukan dari pengukuran layout, jadi tetap mulus walau konten di atasnya berubah tinggi.
 */
export function SlideIndicator({ index, count, className }: { index: number; count: number; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${className}`}
      style={{ width: `${100 / count}%`, transform: `translateX(${Math.max(0, index) * 100}%)` }}
    />
  );
}
