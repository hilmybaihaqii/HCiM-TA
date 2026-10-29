'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DrawnCheck } from './AuthShell';

/*
 * Layar penuh hitam (sama dengan panel formulir) setelah login lewat Google atau konfirmasi email:
 * 1. AuthWaiting  : sesi sedang dicek (/auth/me)
 * 2. SignedInNotice: berhasil, menyapa user dengan nama & email aslinya, lalu membuka lab.
 * Garis progres = waktu sampai pindah otomatis; tombol "Open now" untuk yang tidak mau menunggu.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-[#0A0A0A] px-6 text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <span className="absolute left-1/2 top-[max(1.5rem,env(safe-area-inset-top))] -translate-x-1/2 text-lg font-medium tracking-tight">
        cardivex<span className="text-white/35">.</span>
      </span>
      {children}
    </main>
  );
}

export function AuthWaiting({ label }: { label: string }) {
  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-5 text-center"
      >
        <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-[1.5px] border-white/15 border-t-white" />
        <p className="text-[15px] text-white/60" role="status">{label}</p>
      </motion.div>
    </Screen>
  );
}

export default function SignedInNotice({ via, name, email, seconds, onOpen }: {
  via: 'google' | 'email';
  name?: string;
  email?: string;
  /** Lama sebelum pindah otomatis ke lab */
  seconds: number;
  onOpen: () => void;
}) {
  const first = name?.trim().split(/\s+/)[0];
  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
        className="flex w-full max-w-sm flex-col items-center text-center"
      >
        <DrawnCheck size={72} />
        <p className="mt-9 text-sm text-white/50">{via === 'google' ? 'Signed in with Google' : 'Email confirmed'}</p>
        <h1 className="mt-2 text-[2rem] sm:text-[2.5rem] font-medium leading-tight tracking-tight">
          {first ? `Welcome, ${first}.` : 'You are signed in.'}
        </h1>
        {email && (
          <p className="mt-4 inline-flex max-w-full items-center rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/65">
            <span className="truncate">{email}</span>
          </p>
        )}

        <div className="mt-12 w-full">
          <div className="flex items-center justify-between text-sm text-white/50">
            <span>Opening your lab</span>
            <button type="button" onClick={onOpen} className="font-medium text-white underline-offset-4 hover:underline">
              Open now
            </button>
          </div>
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            {/* scaleX (bukan width): dianimasikan GPU, tidak memicu layout ulang tiap frame */}
            <motion.div
              className="h-full origin-left rounded-full bg-white"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: seconds, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    </Screen>
  );
}
