import React from 'react';

/**
 * Skeleton loading bersama untuk area /lab. Semua loading memakai bentuk ini,
 * bukan spinner, supaya layout tidak lompat saat konten asli muncul.
 */

/** Satu balok abu-abu */
export function Bone({ className = '' }: { className?: string }) {
  return <div className={`bg-foreground/6 rounded-chip animate-pulse ${className}`} />;
}

/** Bentuk LabPageHeader */
export function HeaderSkeleton() {
  return (
    <div className="px-1" aria-hidden="true">
      <Bone className="h-3 w-24" />
      <Bone className="mt-5 h-10 md:h-14 w-full max-w-md rounded-control" />
      <Bone className="mt-3 h-10 md:h-14 w-2/3 max-w-sm rounded-control" />
      <div className="mt-8 md:mt-10 h-px bg-foreground/10" />
    </div>
  );
}

/** Bentuk EngineStatus */
export function EngineSkeleton() {
  return (
    <div className="w-full bg-surface-white/50 border border-foreground/6 rounded-sheet px-5 py-6 md:px-10 md:py-8" aria-hidden="true">
      <Bone className="h-3 w-48 mb-10" />
      <div className="grid grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-3">
            <Bone className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
            <Bone className="h-2.5 w-14 md:w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Bentuk hasil prediksi (verdict, keyakinan, baris SHAP) */
export function ResultSkeleton({ label = 'Preparing your result' }: { label?: string }) {
  return (
    <div className="w-full bg-surface-white/50 border border-foreground/6 rounded-sheet px-6 sm:px-10 md:px-16 py-10 md:py-14" role="status" aria-label={label}>
      <Bone className="h-3 w-20" />
      <Bone className="mt-4 h-12 md:h-16 w-64 md:w-96 rounded-control" />
      <Bone className="mt-6 h-3 w-full max-w-lg" />
      <div className="mt-10 pt-8 border-t border-foreground/6">
        <Bone className="h-1.5 w-full rounded-full" />
        <div className="mt-5 flex gap-8">
          {[0, 1, 2].map(i => <Bone key={i} className="h-6 w-20" />)}
        </div>
      </div>
      <div className="mt-10 pt-8 border-t border-foreground/6 flex flex-col gap-4">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-6">
            <Bone className="h-3 w-24 shrink-0" />
            <Bone className="h-1.5 flex-1 rounded-full" />
            <Bone className="h-3 w-12 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Satu halaman lab utuh: header + engine + panel */
export function PageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-28 md:pt-36 pb-20 flex flex-col gap-8">
      <HeaderSkeleton />
      <EngineSkeleton />
      <div className="w-full bg-surface-white/50 border border-foreground/6 rounded-sheet p-5 md:p-8" aria-hidden="true">
        <Bone className="h-5 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 8 }, (_, i) => <Bone key={i} className="h-24 rounded-card" />)}
        </div>
      </div>
    </div>
  );
}

/** Kerangka seluruh area lab (navbar + halaman), dipakai saat sesi sedang dicek */
export function LabShellSkeleton() {
  return (
    <div className="w-full min-h-screen" role="status" aria-label="Loading">
      <div className="pt-4 md:pt-6 px-4 md:px-12 flex justify-center">
        <div className="w-full max-w-7xl h-12 rounded-full bg-surface-white/60 border border-foreground/5 flex items-center justify-between px-5">
          <Bone className="h-3 w-20" />
          <Bone className="h-7 w-48 md:w-80 rounded-full" />
          <Bone className="h-7 w-7 rounded-full" />
        </div>
      </div>
      <div className="-mt-4">
        <PageSkeleton />
      </div>
    </div>
  );
}
