'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { GoogleMark } from './AuthShell';

/*
 * Isi panel hitam halaman login setelah kembali dari Google atau dari link konfirmasi email:
 * logo di tengah -> lingkaran terisi pelan mengitarinya (minimal LOAD_S, jadi selalu selesai dengan
 * tenang walau backend cepat) -> saat penuh logo berganti centang, kembang api kecil memercik,
 * "Login successful" + sapaan -> setelah HOLD_S lab dibuka (lab menampilkan "Please wait").
 * Semua gerak hanya opacity & transform.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const LOAD_S = 2.6;
const FINISH_S = 0.8;
const HOLD_S = 2.4;
const R = 62;

/** Spinner sederhana untuk saat halaman masih dimuat (fallback Suspense) */
export function AuthWaiting({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span aria-hidden="true" className="h-9 w-9 animate-spin rounded-full border-[1.5px] border-white/15 border-t-white" />
      <p className="text-sm text-white/60" role="status">{label}</p>
    </div>
  );
}

/** Tiga titik yang berdenyut bergantian */
export function Dots() {
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

// Percikan kembang api: sudut & jarak tetap (bukan acak) supaya render stabil
const SPARKS = Array.from({ length: 20 }, (_, i) => ({
  angle: i * 18 + (i % 2 ? 7 : -4),
  far: i % 2 ? 108 : 96,
  color: ['#FFFFFF', '#B8545C', '#FFFFFF', '#D98B1E', '#16856F'][i % 5],
  delay: (i % 4) * 0.035,
}));
const DOTS = Array.from({ length: 12 }, (_, i) => ({
  angle: i * 30 + 15,
  far: 122 + (i % 3) * 8,
  color: ['#B8545C', '#FFFFFF', '#D98B1E'][i % 3],
}));

function Fireworks() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {/* Gelombang cincin */}
      <motion.span
        className="absolute -left-[62px] -top-[62px] h-[124px] w-[124px] rounded-full border border-white/50"
        initial={{ scale: 1, opacity: 0.7 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      {SPARKS.map((s, i) => (
        <span key={`s${i}`} className="absolute left-0 top-0" style={{ transform: `rotate(${s.angle}deg)` }}>
          <motion.span
            className="absolute -left-px block h-3 w-[2px] rounded-full"
            style={{ background: s.color }}
            initial={{ y: -70, opacity: 0, scaleY: 0.3 }}
            animate={{ y: -s.far, opacity: [0, 1, 0], scaleY: [0.3, 1, 0.2] }}
            transition={{ duration: 1, ease: EASE, delay: 0.05 + s.delay }}
          />
        </span>
      ))}
      {DOTS.map((d, i) => (
        <span key={`d${i}`} className="absolute left-0 top-0" style={{ transform: `rotate(${d.angle}deg)` }}>
          <motion.span
            className="absolute -left-[2px] block h-1 w-1 rounded-full"
            style={{ background: d.color }}
            initial={{ y: -80, opacity: 0, scale: 0.4 }}
            animate={{ y: -d.far, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.2 + (i % 3) * 0.05 }}
          />
        </span>
      ))}
    </span>
  );
}

export default function SignInCelebration({ via, ready, name, email, onDone }: {
  via: 'google' | 'email';
  /** Sesi sudah terverifikasi (/auth/me berhasil) */
  ready: boolean;
  name?: string;
  email?: string;
  /** Dipanggil setelah animasi selesai & sapaan sempat terbaca */
  onDone?: () => void;
}) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [done, setDone] = useState(false);
  const finishing = ready && minElapsed;
  const first = name?.trim().split(/\s+/)[0];

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), LOAD_S * 1000);
    return () => clearTimeout(t);
  }, []);

  // Lingkaran penuh -> centang. Dipicu timer (bukan onAnimationComplete), supaya alur tetap lanjut
  // walau tab sedang di latar belakang dan animasi browser dijeda.
  useEffect(() => {
    if (!finishing) return;
    const t = setTimeout(() => setDone(true), FINISH_S * 1000 + 60);
    return () => clearTimeout(t);
  }, [finishing]);

  useEffect(() => {
    if (!done || !onDone) return;
    const t = setTimeout(onDone, HOLD_S * 1000);
    return () => clearTimeout(t);
  }, [done, onDone]);

  return (
    <div className="flex w-full flex-col items-center text-center" role="status" aria-live="polite">
      <span className="relative flex h-[140px] w-[140px] items-center justify-center">
        {/* Lingkaran: jejak tipis + busur yang terisi mengitari logo */}
        <svg viewBox="0 0 140 140" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="70" cy="70" r={R} fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
          <motion.circle
            cx="70" cy="70" r={R} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: finishing ? 1 : 0.86 }}
            transition={finishing
              ? { duration: FINISH_S, ease: [0.65, 0, 0.35, 1] }
              : { duration: LOAD_S, ease: [0.33, 0, 0.2, 1] }}
          />
        </svg>

        {/* Logo -> centang */}
        <motion.span
          className="absolute flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={done ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: done ? 0.35 : 0.9, ease: EASE }}
        >
          {via === 'google' ? <GoogleMark className="h-8 w-8" /> : <Mail className="h-7 w-7 text-black" />}
        </motion.span>
        {done && (
          <motion.span
            className="absolute flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white"
            initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
              <motion.path
                d="M11 21 L17.5 27.5 L29 14" fill="none" stroke="#0A0A0A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
              />
            </svg>
          </motion.span>
        )}
        {done && <Fireworks />}
      </span>

      {/* Teks: tinggi tetap supaya pergantian tidak menggeser tata letak */}
      <div className="relative mt-10 grid w-full place-items-center [grid-template-areas:'stack'] min-h-[7.5rem]">
        <motion.div
          className="[grid-area:stack] self-start"
          animate={{ opacity: done ? 0 : 1, y: done ? -6 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <p className="text-sm text-white/65">
            {via === 'google' ? 'Verifying your Google sign-in' : 'Confirming your email'}<Dots />
          </p>
        </motion.div>
        {done && (
          <div className="[grid-area:stack] self-start flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1 text-xs text-white/75"
            >
              {via === 'google' ? 'Login successful' : 'Email confirmed'}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
              className="mt-4 text-3xl font-medium tracking-tight"
            >
              {first ? `Welcome, ${first}.` : 'Welcome back.'}
            </motion.h1>
            {email && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-2 max-w-full truncate text-sm text-white/50"
              >
                {email}
              </motion.p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
