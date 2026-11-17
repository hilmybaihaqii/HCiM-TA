'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';

/*
 * Layar "Please wait" tepat setelah login, saat lab dibuka. Ditandai lewat sessionStorage oleh halaman
 * login (markOpeningLab) dan dibaca SessionGuard: tampil minimal MIN_MS sambil sesi dicek, lalu lab muncul.
 * Membuka /lab dengan cara lain (reload, link) tidak memunculkannya.
 */

const KEY = 'cardivex-opening-lab';
const MIN_MS = 2000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function markOpeningLab() {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* storage diblokir: lewati layar ini */ }
}

const noop = () => () => {};

/** true selama layar "Please wait" perlu tampil (baru login & belum lewat MIN_MS) */
export function useOpeningLab(): boolean {
  const flagged = useSyncExternalStore(
    noop,
    () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } },
    () => false,
  );
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    if (!flagged) return;
    const t = setTimeout(() => {
      try { sessionStorage.removeItem(KEY); } catch { /* abaikan */ }
      setElapsed(true);
    }, MIN_MS);
    return () => clearTimeout(t);
  }, [flagged]);
  return flagged && !elapsed;
}

export default function OpeningLab() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 text-foreground
        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      role="status"
      aria-live="polite"
    >
      <motion.span
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="text-2xl font-medium tracking-tight"
      >
        cardivex<span className="text-accent">.</span>
      </motion.span>

      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        className="mt-10 text-sm text-foreground/60"
      >
        Please wait, opening your lab
        <span aria-hidden="true" className="ml-1 inline-flex gap-[3px] align-middle">
          {[0, 0.18, 0.36].map(d => (
            <motion.span
              key={d}
              className="h-[3px] w-[3px] rounded-full bg-current"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: d }}
            />
          ))}
        </span>
      </motion.p>

      {/* Garis tipis terisi selama layar ini tampil */}
      <div className="mt-5 h-[2px] w-52 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          className="h-full origin-left rounded-full bg-foreground"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: MIN_MS / 1000, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
        />
      </div>
    </motion.div>
  );
}
