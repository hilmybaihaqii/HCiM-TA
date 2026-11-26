'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { SessionUser } from '@/components/SessionGuard';

const EASE = [0.16, 1, 0.3, 1] as const;

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
};

/**
 * Kartu identitas: bentuk kartu anggota yang bersih (nama, email, peran).
 * Latar gelap dengan cahaya lembut di sudut; saat disentuh kursor, kilau tipis menyapu sekali.
 */
export default function IdentityCard({ user }: { user: SessionUser }) {
  const isAdmin = user.role === 'admin';
  const name = user.display_name || 'No name';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="group relative isolate flex aspect-[1.58] min-h-[15rem] w-full flex-col justify-between overflow-hidden rounded-sheet bg-[#0B0A0A] p-6 sm:p-7 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/10"
    >
      {/* Cahaya lembut warna merek di sudut kanan atas dan kiri bawah */}
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent-red)_38%,transparent),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent)]" />
      {/* Kilau tipis yang menyapu kartu saat kursor masuk (gerak di dalam kartu, tidak mengikuti kursor) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent opacity-0 transition-[left,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:left-[120%] group-hover:opacity-100 motion-reduce:hidden"
      />

      <div className="flex items-center justify-between gap-4">
        <span className="text-base font-medium tracking-tight">cardivex<span className="text-[var(--accent-red)]">.</span></span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">{isAdmin ? 'Administrator' : 'User'}</span>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-xl font-medium tracking-tight text-black shadow-[0_0_0_6px_rgba(255,255,255,0.06)]"
        >
          {initials(name)}
        </motion.span>
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
          className="min-w-0"
        >
          <p className="truncate text-xl sm:text-2xl font-medium tracking-tight" data-i18n-skip>{name}</p>
          <p className="truncate text-sm text-white/55" data-i18n-skip>{user.email || 'No email'}</p>
        </motion.div>
      </div>

      <p className="text-[11px] tracking-wide text-white/40">Cardiotoxicity Prediction</p>
    </motion.div>
  );
}
