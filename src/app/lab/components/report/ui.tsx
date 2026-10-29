import React from 'react';

/*
 * Gaya dasar area lab. Satu fungsi = satu warna:
 *   merah        tombol yang menjalankan model (Predict risk di LabForm, Run full pipeline di DrugParamsForm)
 *   primaryBtn   hitam: aksi utama lain (Next, New simulation, Try again)
 *   secondaryBtn garis hitam: aksi kedua (Back, Prev/Next halaman)
 *   pilihan aktif (tab, dosis, filter) memakai warna action (hitam)
 */

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action';

/** Tombol utama: hitam */
export const primaryBtn = `inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-control bg-action text-surface-white text-sm font-medium shadow-sm shadow-action/20 hover:bg-action-dark active:scale-[0.98] transition-all duration-200 shrink-0 disabled:bg-foreground/10 disabled:text-foreground/40 disabled:shadow-none disabled:pointer-events-none ${focus}`;
/** Tombol kedua: garis & teks warna aksi */
export const secondaryBtn = `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-control border border-action/30 bg-surface-white text-sm font-medium text-action hover:border-action hover:bg-action/5 active:scale-[0.98] transition-all duration-200 ${focus}`;
export const textLink = 'text-sm text-foreground/70 hover:text-action underline-offset-4 hover:underline transition-colors';

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

/* ---------- Rel tab: satu pola untuk semua pilihan tampilan di area lab ---------- */

export type RailTab = { id: string; label: string; /** titik warna kecil di depan label (mis. warna tier) */ dot?: string };

/**
 * Tab di atas satu garis tipis; garis aktif tebal bergeser di bawah tab terpilih. Tanpa angka/kotak.
 * Posisi garis = CSS var `--rail-pos` (index, boleh pecahan). Tanpa `railRef`, var diisi dari `value`
 * dan garis bergeser dengan transisi. Dengan `railRef`, pemilik mengisi var sendiri (mis. ikut geseran jari),
 * jadi garis bergerak bersama konten tanpa transisi tambahan.
 */
export function TabRail({ tabs, value, onChange, label, railRef, panelPrefix }: {
  tabs: readonly RailTab[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  railRef?: React.Ref<HTMLDivElement>;
  /** id panel = `${panelPrefix}-${tab.id}` (untuk aria-controls) */
  panelPrefix?: string;
}) {
  const index = Math.max(0, tabs.findIndex(t => t.id === value));
  const driven = !!railRef;

  // Panah kiri/kanan berpindah tab (pola tablist standar)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    (e.currentTarget.querySelectorAll('[role="tab"]')[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <div
      ref={railRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="relative grid w-full border-b border-foreground/12"
      style={{
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
        ...(driven ? {} : { '--rail-pos': index }),
      } as React.CSSProperties}
    >
      {tabs.map((t, i) => {
        const active = i === index;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelPrefix ? `${panelPrefix}-${t.id}` : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={`flex items-center justify-center sm:justify-start gap-2 min-w-0 px-1 sm:px-0 sm:pr-4 pt-1.5 pb-3.5 rounded-chip
              text-[13px] sm:text-sm md:text-base font-medium tracking-tight whitespace-nowrap transition-colors duration-300 ${focus} focus-visible:outline-offset-0
              ${active ? 'text-foreground' : 'text-foreground/50 hover:text-foreground/80'}`}
          >
            {t.dot && <span className="hidden xs:block h-1.5 w-1.5 rounded-full shrink-0" style={{ background: t.dot }} />}
            <span className="truncate">{t.label}</span>
          </button>
        );
      })}
      {/* Garis aktif: menutup hairline di bawahnya; ujung membulat, sedikit menjorok dari tepi kolom */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 -bottom-px h-[3px] pr-4 max-sm:px-3 will-change-transform
          before:block before:h-full before:rounded-full before:bg-action
          ${driven ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'}`}
        style={{ width: `${100 / tabs.length}%`, transform: 'translateX(calc(var(--rail-pos, 0) * 100%))' }}
      />
    </div>
  );
}
