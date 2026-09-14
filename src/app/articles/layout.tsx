import React from 'react';
import Navbar from '@/components/Navbar'; // Sesuaikan jalur impor dengan struktur Anda
import Footer from '@/components/Footer'; // Sesuaikan jalur impor dengan struktur Anda

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent selection:text-surface-white relative">
      
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay z-50"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <Navbar />
      <main className="grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}