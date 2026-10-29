'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DrawnCheck, GoogleMark } from './AuthShell';

/*
 * Isi panel hitam halaman login setelah kembali dari Google atau dari link konfirmasi email
 * (di halaman yang sama dengan formulir, bukan layar penuh):
 * 1. AuthWaiting   : sesi sedang dicek (/auth/me)
 * 2. SignedInNotice: "Login successful", sapaan dengan nama & email asli, lalu "please wait" sampai lab terbuka.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Tiga titik yang berdenyut bergantian (opacity saja, ringan) */
function Dots() {
  return (
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
  );
}

export function AuthWaiting({ label, google = false }: { label: string; google?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center gap-7 py-10 text-center"
    >
      {/* Lingkaran tipis dengan satu busur yang berputar; logo Google di tengah saat kembali dari Google */}
      <span className="relative flex h-20 w-20 items-center justify-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="40" cy="40" r="37" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="1.5" />
        </svg>
        <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full animate-spin [animation-duration:1.4s]" aria-hidden="true">
          <circle cx="40" cy="40" r="37" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="56 232" />
        </svg>
        {google
          ? <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white"><GoogleMark /></span>
          : <span className="h-2 w-2 rounded-full bg-white/70" />}
      </span>
      <p className="text-sm text-white/65" role="status">{label}<Dots /></p>
    </motion.div>
  );
}

export default function SignedInNotice({ via, name, email, seconds }: {
  via: 'google' | 'email';
  name?: string;
  email?: string;
  /** Lama sebelum pindah otomatis ke lab */
  seconds: number;
}) {
  const first = name?.trim().split(/\s+/)[0];
  return (
    <div className="flex w-full flex-col items-center text-center" role="status" aria-live="polite">
      <motion.span
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="text-white"
      >
        <DrawnCheck size={64} />
      </motion.span>

      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1 text-xs text-white/70"
      >
        {via === 'google' && <GoogleMark />}
        {via === 'google' ? 'Login successful' : 'Email confirmed'}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
        className="mt-5 text-3xl font-medium tracking-tight"
      >
        {first ? `Welcome, ${first}.` : 'Welcome back.'}
      </motion.h1>
      {email && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-2 max-w-full truncate text-sm text-white/50"
        >
          {email}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.95 }}
        className="mt-12 w-full"
      >
        <p className="text-sm text-white/55">Please wait, opening your lab<Dots /></p>
        <div className="mx-auto mt-4 h-[2px] w-full max-w-60 overflow-hidden rounded-full bg-white/10">
          {/* scaleX (bukan width): dianimasikan GPU, tidak memicu layout ulang tiap frame */}
          <motion.div
            className="h-full origin-left rounded-full bg-white"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: seconds, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      </motion.div>
    </div>
  );
}
