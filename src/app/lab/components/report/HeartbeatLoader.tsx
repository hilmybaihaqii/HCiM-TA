'use client';

import React, { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/* =========================================================
   Jejak ECG (PQRST) yang digambar seperti monitor jantung.
   Satu siklus = 5 detak dalam 4 detik (75 bpm), jadi jantung berdenyut tiap 0,8 detik.
   Lebar 1000 unit supaya jejak memenuhi panel lebar tanpa diregangkan.
   ========================================================= */

const W = 1000;
const H = 140;
const BASE = 92;
const BEATS = 5;
const CYCLE_S = 4;
const BEAT_S = CYCLE_S / BEATS;

/** Satu detak selebar 200 unit: garis dasar, gelombang P, kompleks QRS, gelombang T */
function beatPath(x: number): string {
  const b = BASE;
  return [
    `L${x + 18},${b}`,
    `C${x + 26},${b} ${x + 30},${b - 12} ${x + 38},${b - 12}`, // P
    `C${x + 46},${b - 12} ${x + 50},${b} ${x + 58},${b}`,
    `L${x + 74},${b}`,
    `L${x + 80},${b + 10}`, // Q
    `L${x + 90},${b - 76}`, // R
    `L${x + 100},${b + 22}`, // S
    `L${x + 108},${b}`,
    `L${x + 122},${b}`,
    `C${x + 132},${b} ${x + 138},${b - 22} ${x + 150},${b - 22}`, // T
    `C${x + 162},${b - 22} ${x + 168},${b} ${x + 178},${b}`,
    `L${x + 200},${b}`,
  ].join(' ');
}

const ECG_PATH = `M0,${BASE} ` + Array.from({ length: BEATS }, (_, i) => beatPath(i * (W / BEATS))).join(' ');

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Detik sejak `since`, atau sejak komponen tampil kalau `since` kosong */
function useElapsedSeconds(since?: number | null) {
  const [clock, setClock] = useState<{ mountedAt: number; now: number } | null>(null);
  useEffect(() => {
    const tick = () => setClock(c => {
      const now = Date.now();
      return { mountedAt: c?.mountedAt ?? now, now };
    });
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  if (!clock) return 0;
  return Math.max(0, Math.floor((clock.now - (since ?? clock.mountedAt)) / 1000));
}

export function EcgTrace({ className = '', animate = true }: { className?: string; animate?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const reduced = usePrefersReducedMotion();
  const live = animate && !reduced;

  return (
    // text-foreground di root: isi <pattern> mewarisi currentColor dari svg, bukan dari elemen pemakainya
    <svg viewBox={`0 0 ${W} ${H}`} className={`text-foreground ${className}`} role="presentation" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Kertas ECG: kotak kecil 10 unit, kotak besar 50 unit */}
        <pattern id={`ecg-minor-${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.6" />
        </pattern>
        <pattern id={`ecg-major-${uid}`} width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill={`url(#ecg-minor-${uid})`} />
          <path d="M50 0H0V50" fill="none" stroke="currentColor" strokeOpacity="0.09" strokeWidth="0.8" />
        </pattern>
        <linearGradient id={`ecg-fade-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.08" stopColor="white" stopOpacity="1" />
          <stop offset="0.92" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`ecg-mask-${uid}`}>
          <rect width={W} height={H} fill={`url(#ecg-fade-${uid})`} />
        </mask>
        <filter id={`ecg-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          {/* Glow tipis: blur kecil dengan alpha setengah, supaya jejak tetap tajam */}
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feComponentTransfer in="blur" result="soft">
            <feFuncA type="linear" slope="0.45" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="soft" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill={`url(#ecg-major-${uid})`} className="text-foreground" />

      <g mask={`url(#ecg-mask-${uid})`}>
        {/* Jejak samar sebagai latar */}
        <path d={ECG_PATH} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1.5" strokeLinejoin="round" className="text-foreground" />

        {/* Jejak aktif: tergambar kiri ke kanan, lalu memudar sebelum siklus berikutnya */}
        <path
          d={ECG_PATH}
          pathLength={1}
          fill="none"
          stroke="var(--accent-red)"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="1 1"
          strokeDashoffset={live ? 1 : 0}
          filter={`url(#ecg-glow-${uid})`}
        >
          {live && (
            <>
              <animate attributeName="stroke-dashoffset" values="1;0" dur={`${CYCLE_S}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.88;1" dur={`${CYCLE_S}s`} repeatCount="indefinite" />
            </>
          )}
        </path>

        {/* Titik di ujung jejak */}
        {live && (
          <circle r="3.5" fill="var(--accent-red)" filter={`url(#ecg-glow-${uid})`}>
            <animateMotion dur={`${CYCLE_S}s`} repeatCount="indefinite" path={ECG_PATH} />
            <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.88;1" dur={`${CYCLE_S}s`} repeatCount="indefinite" />
          </circle>
        )}
      </g>
    </svg>
  );
}

/** Jantung yang berdenyut seirama kompleks QRS */
function BeatingHeart({ animate }: { animate: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-5 h-5 text-accent"
      aria-hidden="true"
      animate={animate ? { scale: [1, 1.22, 1, 1.1, 1] } : undefined}
      transition={animate ? { duration: BEAT_S, times: [0, 0.14, 0.32, 0.46, 1], repeat: Infinity, ease: 'easeOut' } : undefined}
    >
      <path
        fill="currentColor"
        d="M12 21s-6.7-4.35-9.3-8.6C.8 9.3 2.2 5 6.1 4.3c2.1-.4 4 .6 5.9 2.8 1.9-2.2 3.8-3.2 5.9-2.8 3.9.7 5.3 5 3.4 8.1C18.7 16.65 12 21 12 21z"
      />
    </motion.svg>
  );
}

export type LoaderStep = { label: string; state: 'done' | 'active' | 'pending' };

/**
 * Tampilan menunggu untuk proses model (prediksi per dosis, simulasi). Pengganti skeleton.
 * Langkah yang tampil harus mencerminkan proses yang benar-benar berjalan, bukan progres karangan.
 */
export default function HeartbeatLoader({ eyebrow, title, detail, steps, since }: {
  eyebrow: string;
  title: string;
  detail?: string;
  steps?: LoaderStep[];
  /** Waktu mulai (ms) untuk penghitung detik */
  since?: number | null;
}) {
  const reduced = usePrefersReducedMotion();
  const seconds = useElapsedSeconds(since);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className="relative w-full overflow-hidden rounded-sheet border border-foreground/10 bg-surface-white/80 backdrop-blur-md"
    >
      <div className="relative px-6 sm:px-10 md:px-14 pt-8 md:pt-10 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <span className="text-xs font-mono uppercase tracking-wider text-muted">{eyebrow}</span>
          <p className="mt-2 text-xl md:text-2xl font-medium tracking-tight text-foreground">{title}</p>
          {detail && <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-xl">{detail}</p>}
        </div>
        <div className="shrink-0 flex items-center gap-2.5 pt-1">
          <BeatingHeart animate={!reduced} />
          <span className="font-mono text-sm tabular-nums text-muted">
            {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="relative px-2 sm:px-6 md:px-10 py-4 md:py-6">
        <EcgTrace className="w-full h-28 sm:h-36 md:h-40" />
      </div>

      {steps && steps.length > 0 && (
        // Satu baris: di ponsel langkah dibagi rata selebar kartu, di desktop berjajar dari kiri
        <ol
          className="relative grid sm:flex sm:gap-8 gap-2 px-6 sm:px-10 md:px-14 pb-8 md:pb-10"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
          {steps.map((s, i) => (
            <li
              key={s.label}
              className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-w-0
                ${steps.length > 1 && i === steps.length - 1 ? 'justify-end sm:justify-start' : steps.length > 2 && i > 0 ? 'justify-center sm:justify-start' : ''}`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors
                  ${s.state === 'done' ? 'bg-action text-surface-white'
                    : s.state === 'active' ? 'border border-action'
                    : 'border border-foreground/15'}`}
              >
                {s.state === 'done' && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                {s.state === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-action" />}
              </span>
              <span className={`truncate ${s.state === 'pending' ? 'text-foreground/50' : 'text-foreground'}`}>{s.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
