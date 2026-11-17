import React from 'react';
import LabContainer from './LabContainer';

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

/** Bentuk panel status (StageMonitor) */
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

/** Satu halaman lab utuh: header + engine + panel */
export function PageSkeleton() {
  return (
    <LabContainer className="flex flex-col gap-8">
      <HeaderSkeleton />
      <EngineSkeleton />
      <div className="w-full bg-surface-white/50 border border-foreground/6 rounded-sheet p-5 md:p-8" aria-hidden="true">
        <Bone className="h-5 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 8 }, (_, i) => <Bone key={i} className="h-24 rounded-card" />)}
        </div>
      </div>
    </LabContainer>
  );
}

/** Kerangka seluruh area lab (navbar + halaman), dipakai saat sesi sedang dicek */
export function LabShellSkeleton() {
  return (
    <div className="w-full min-h-dvh" role="status" aria-label="Loading">
      <div className="absolute inset-x-0 top-0 pt-[max(1rem,env(safe-area-inset-top))] md:pt-[max(1.5rem,env(safe-area-inset-top))] px-4 md:px-12 flex justify-center">
        <div className="w-full max-w-7xl h-12 rounded-full bg-surface-white/60 border border-foreground/5 flex items-center justify-between px-5">
          <Bone className="h-3 w-20" />
          <Bone className="h-7 w-48 md:w-80 rounded-full" />
          <Bone className="h-7 w-7 rounded-full" />
        </div>
      </div>
      <PageSkeleton />
    </div>
  );
}
