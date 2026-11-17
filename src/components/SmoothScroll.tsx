'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis } from '@/lib/smoothScroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll halus untuk landing page. Roda mouse di Windows bergerak per langkah (±100px),
 * sehingga konten terasa "menyentak". Lenis meratakan langkah itu jadi luncuran halus,
 * dan digerakkan oleh ticker GSAP supaya ScrollTrigger membaca posisi yang sama persis.
 * Pengguna dengan prefers-reduced-motion otomatis mendapat scroll biasa (bawaan Lenis).
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08, // makin kecil makin "meluncur"
      wheelMultiplier: 0.9,
      anchors: true, // link #about, #architecture ikut meluncur halus
      autoRaf: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    setLenis(lenis);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
