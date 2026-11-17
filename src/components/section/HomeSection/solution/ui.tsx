'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { accentSerif } from '@/lib/fonts';

/* Bagian kecil yang dipakai bersama oleh semua blok di section Solution. */

export const EASE = [0.16, 1, 0.3, 1] as const;
/** Pegas untuk latar yang "meluncur" antar pilihan: cepat tapi tanpa memantul. */
export const PILL = { type: 'spring', stiffness: 380, damping: 34, mass: 0.8 } as const;

export const CARD = 'rounded-sheet border border-foreground/10 bg-surface-white/60';
export const LABEL = 'block text-xs font-medium uppercase tracking-[0.2em] text-muted';

/**
 * Teks naik dari balik "jendela" saat masuk layar (sama dengan gaya section sebelumnya).
 * Yang dipantau adalah jendelanya, bukan teksnya: teks yang masih tersembunyi di bawah
 * jendela terpotong overflow, jadi tidak pernah dianggap "terlihat" oleh browser.
 */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`overflow-hidden pb-[0.12em] -mb-[0.12em] ${className}`}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.div
        variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Judul blok: label kecil, judul dengan aksen serif miring, lalu satu paragraf pendek. */
export function SubHead({ label, title, accent, body, className = '' }: { label: string; title: string; accent: string; body?: string; className?: string }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <Reveal>
        <span className={`${LABEL} mb-5`}>{label}</span>
      </Reveal>
      <Reveal delay={0.06}>
        <h3 className="text-[clamp(1.9rem,3.6vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.03em] text-foreground">
          {title} <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>{accent}</em>
        </h3>
      </Reveal>
      {body && (
        <Reveal delay={0.12} className="mt-4 md:mt-5">
          <p className="max-w-xl text-sm leading-relaxed text-muted md:text-base">{body}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Muncul pelan dari bawah saat masuk layar. */
export function FadeUp({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
