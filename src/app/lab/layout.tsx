import React from 'react';
import LabNavbar from './components/LabNavbar';
import LabFooter from './components/LabFooter';
import SessionGuard from '@/components/SessionGuard';
import UserViewSplash from './components/UserViewSplash';
import { LabShellSkeleton } from './components/Skeletons';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard fallback={<LabShellSkeleton />}>
    <div className="relative min-h-dvh flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-white overflow-x-clip">

      {/* Ambient color layer — sama seperti splash screen & landing page,
          dipasang fixed supaya tetap terasa di seluruh sub-halaman /lab. */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Gradien radial statis: tanpa blur & tanpa animasi tak berujung, jadi tidak ada repaint terus-menerus */}
        <div className="absolute -top-56 -left-56 w-[44rem] h-[44rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent-red)_7%,transparent),transparent)]" />
        <div className="absolute top-[40%] -right-56 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent-teal)_7%,transparent),transparent)]" />
        <div className="absolute bottom-[-18%] left-[14%] w-[36rem] h-[36rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent-amber)_7%,transparent),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(#0000000A 1px, transparent 1px), linear-gradient(90deg, #0000000A 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* min-h-dvh (bukan 100vh): tinggi ikut berubah saat toolbar Safari muncul/hilang */}
      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Sambutan saat admin kembali ke user view; layout ini tetap terpasang selama pindah halaman */}
        <UserViewSplash />
        <LabNavbar />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <LabFooter />
      </div>

    </div>
    </SessionGuard>
  );
}