"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/*
 * Kursor kustom (hanya perangkat dengan mouse). Ditulis tanpa state React & tanpa framer-motion:
 * posisi diperbarui langsung lewat transform di requestAnimationFrame, dan loop berhenti sendiri
 * saat cincin sudah menyusul titik. Tidak ada render ulang di setiap gerakan mouse.
 */

const FINE = "(pointer: fine)";
const HOVER_SELECTOR = "a, button, [role='button'], label, select, summary, .cursor-pointer";

function useFinePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(FINE);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(FINE).matches,
    () => false,
  );
}

export default function CustomCursor() {
  const fine = useFinePointer();
  if (!fine) return null;
  return <Cursor />;
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let shown = false;

    const tick = () => {
      // Cincin menyusul 30% jarak tiap frame; berhenti bila sudah < 0.1px
      pos.x += (target.x - pos.x) * (reduced ? 1 : 0.3);
      pos.y += (target.y - pos.y) * (reduced ? 1 : 0.3);
      r.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.1 ? requestAnimationFrame(tick) : 0;
    };

    const show = (v: boolean) => {
      if (shown === v) return;
      shown = v;
      d.style.opacity = r.style.opacity = v ? "1" : "0";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      d.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      if (!shown) { pos.x = target.x; pos.y = target.y; }
      show(true);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const hover = !!(e.target as Element | null)?.closest?.(HOVER_SELECTOR);
      r.dataset.hover = d.dataset.hover = hover ? "1" : "0";
    };
    const onLeave = () => show(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* Cincin: membesar & terisi saat di atas elemen yang bisa diklik */}
      <div
        ref={ring}
        aria-hidden="true"
        data-hover="0"
        className="pointer-events-none fixed left-0 top-0 z-99998 h-9 w-9 rounded-full border-[1.5px] border-white opacity-0 mix-blend-difference
          transition-[width,height,background-color,border-width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          data-[hover=1]:h-20 data-[hover=1]:w-20 data-[hover=1]:border-0 data-[hover=1]:bg-white"
      />
      {/* Titik: mengikuti mouse tanpa jeda */}
      <div
        ref={dot}
        aria-hidden="true"
        data-hover="0"
        className="pointer-events-none fixed left-0 top-0 z-99999 h-2 w-2 rounded-full bg-white opacity-0 mix-blend-difference
          transition-[width,height,opacity] duration-200 data-[hover=1]:h-0 data-[hover=1]:w-0"
      />
    </>
  );
}
