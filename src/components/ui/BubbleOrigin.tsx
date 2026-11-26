'use client';

import { useEffect } from 'react';

/**
 * Titik asal gelembung untuk semua tombol `.bubble` (efek yang sama dengan tombol "Run prediction"
 * di halaman utama): saat kursor masuk atau keluar, posisinya disimpan sebagai --x / --y di tombol itu,
 * jadi gelembung membesar dari titik masuk dan mengecil ke titik keluar. Satu listener untuk seluruh
 * halaman, hanya saat kursor melintasi batas tombol (bukan mengikuti kursor terus-menerus).
 */
export default function BubbleOrigin() {
  useEffect(() => {
    const mark = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('.bubble');
      if (!el) return;
      // Abaikan perpindahan di antara anak-anak tombol yang sama
      const other = e.relatedTarget as Node | null;
      if (other && el.contains(other)) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${e.clientX - r.left}px`);
      el.style.setProperty('--y', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointerover', mark, { passive: true });
    document.addEventListener('pointerout', mark, { passive: true });
    return () => {
      document.removeEventListener('pointerover', mark);
      document.removeEventListener('pointerout', mark);
    };
  }, []);
  return null;
}
