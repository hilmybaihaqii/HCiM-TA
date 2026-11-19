import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import BackToTop from "@/components/ui/BackToTop";

// Posisi & ukuran sama dengan versi blur sebelumnya, sedikit diperbesar karena gradien menggantikan sebaran blur
const AMBIENT: { pos: React.CSSProperties; size: string; color: string }[] = [
  { pos: { top: '-4%', left: '-16%' }, size: 'min(56vw, 44rem)', color: 'color-mix(in srgb, var(--accent-red) 24%, transparent)' },
  { pos: { top: '9%', right: '-14%' }, size: 'min(50vw, 40rem)', color: 'color-mix(in srgb, var(--accent-teal) 24%, transparent)' },
  { pos: { top: '28%', left: '-4%' }, size: 'min(42vw, 32rem)', color: 'color-mix(in srgb, var(--accent-amber) 21%, transparent)' },
  { pos: { top: '46%', right: '-16%' }, size: 'min(48vw, 38rem)', color: 'color-mix(in srgb, var(--accent-teal) 21%, transparent)' },
  { pos: { top: '63%', left: '-14%' }, size: 'min(46vw, 37rem)', color: 'color-mix(in srgb, var(--accent-red) 21%, transparent)' },
  { pos: { top: '80%', right: '0%' }, size: 'min(42vw, 32rem)', color: 'color-mix(in srgb, var(--accent-amber) 21%, transparent)' },
  { pos: { top: '95%', left: '10%' }, size: 'min(40vw, 31rem)', color: 'color-mix(in srgb, var(--accent-teal) 17%, transparent)' },
];

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient color layer: membentang sepanjang konten. Gradien radial biasa (bukan blur-[90px]):
          tampilannya sama, tapi tidak membuat lapisan filter raksasa yang berat di GPU HP murah. */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {AMBIENT.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{ ...b.pos, width: b.size, height: b.size, background: `radial-gradient(closest-side, ${b.color}, transparent)` }}
          />
        ))}
      </div>

      <SmoothScroll />
      <Navbar />
      <main className="relative z-10 flex flex-col w-full">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
