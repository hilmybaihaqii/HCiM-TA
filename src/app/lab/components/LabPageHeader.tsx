import React from 'react';

/**
 * Header halaman lab yang sama bentuknya di Full Pipeline dan Activity Logs.
 * Rasio emas: judul di kiri (1.618), deskripsi di kanan (1). Tanpa italic, satu aksen warna.
 */
export default function LabPageHeader({ eyebrow, title, accent, description }: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
}) {
  return (
    <header className="px-1">
      <div className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-5 lg:gap-16 items-end">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-muted">{eyebrow}</span>
          <h1 className="mt-4 text-[2.5rem] leading-[1.04] sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground">
            {title}
            <span className="block text-accent">{accent}</span>
          </h1>
        </div>
        <p className="text-base text-muted leading-relaxed max-w-sm lg:pb-1.5">{description}</p>
      </div>
      <div className="mt-8 md:mt-10 h-px bg-foreground/10" />
    </header>
  );
}
