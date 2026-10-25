'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getLenis } from '@/lib/smoothScroll';

/**
 * Tombol kembali ke atas. Diam: bulatan dengan panah ke atas. Hover: melebar dan memunculkan
 * tulisan "Back to top", dengan gelembung gelap yang mengembang dari titik masuk kursor
 * (efek yang sama dengan tombol di hero). Muncul setelah pengunjung melewati satu layar.
 */
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const setOrigin = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bubble =
    'pointer-events-none absolute left-[var(--x,50%)] top-[var(--y,50%)] -z-10 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100';

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={toTop}
          onMouseEnter={setOrigin}
          onMouseLeave={setOrigin}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed bottom-5 right-5 z-40 isolate flex h-12 items-center overflow-hidden rounded-full border border-foreground/15 bg-surface-white/80 px-[15px] text-foreground shadow-[0_10px_30px_-12px_rgba(43,34,35,0.35)] backdrop-blur-md transition-[color,border-color] duration-500 hover:border-foreground hover:text-surface-white md:bottom-8 md:right-8"
        >
          {/* riak tipis lalu gelembung gelap, mengembang dari titik masuk kursor */}
          <span aria-hidden className={`${bubble} bg-foreground/25 duration-500`} />
          <span aria-hidden className={`${bubble} bg-foreground delay-75 duration-700`} />

          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 19V5m-6 6 6-6 6 6" />
          </svg>
          {/* tulisan muncul dengan melebarkan tombol secara halus */}
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-[max-width,opacity,margin] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:ml-2.5 group-hover:max-w-[7rem] group-hover:opacity-100">
            Back to top
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
