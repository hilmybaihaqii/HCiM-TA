import React from 'react';
import LabNavbar from './components/LabNavbar';
import LabFooter from './components/LabFooter';
import SessionGuard from '@/components/SessionGuard';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
    <div className="relative min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-white overflow-x-hidden">

      {/* Ambient color layer — sama seperti splash screen & landing page,
          dipasang fixed supaya tetap terasa di seluruh sub-halaman /lab. */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-accent/10 blur-[120px] animate-[blob-drift-1_16s_ease-in-out_infinite]" />
        <div className="absolute top-[45%] -right-40 w-[28rem] h-[28rem] rounded-full bg-teal/10 blur-[120px] animate-[blob-drift-2_20s_ease-in-out_-4s_infinite]" />
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 rounded-full bg-amber/10 blur-[110px] animate-[blob-drift-3_14s_ease-in-out_-2s_infinite]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(#0000000A 1px, transparent 1px), linear-gradient(90deg, #0000000A 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
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