'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

/*
 * 404: angka "404" sebagai pusat, angka "0" berupa kompas yang jarumnya pelan mencari arah.
 * Latar: satu garis putus-putus tipis yang meliuk dari pojok kiri bawah ke pojok kanan atas,
 * seperti jalan yang tersesat. Putih, hitam, satu aksen. Semua gerak pelan & lembut.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
/** Easing lembut untuk gambar garis: mulai & berhenti pelan, tanpa hentakan */
const DRAW_EASE = [0.45, 0, 0.25, 1] as const;
const DRAW_S = 8;
const START_S = 0.8;

// Garis meliuk dari pojok kiri bawah ke pojok kanan atas, di bidang 1440×900 yang direntang penuh ke
// layar (preserveAspectRatio="none"), jadi selalu tepat di kedua pojok. Ketebalan & putus-putusnya
// tetap dalam piksel layar berkat vector-effect="non-scaling-stroke".
const ROUTE =
  'M0 900 C 150 820, 110 700, 250 680 S 440 740, 500 640 S 400 480, 560 450 S 790 520, 850 420 S 760 270, 930 240 S 1150 300, 1190 200 S 1110 90, 1270 70 S 1410 40, 1440 0';

/** Satu garis putus-putus tipis yang tergambar pelan, lalu bergeser halus terus-menerus */
function LostBackdrop() {
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        {/* Topeng: garis padat yang tergambar; garis putus-putus hanya terlihat di bagian yang sudah tergambar */}
        <mask id="nf-draw" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="900">
          <motion.path
            d={ROUTE}
            fill="none" stroke="#fff" strokeWidth="24" strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: DRAW_S, delay: START_S, ease: DRAW_EASE }}
          />
        </mask>
        {/* Garis memudar di tengah layar supaya teks tetap bersih */}
        <radialGradient id="nf-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </radialGradient>
        <mask id="nf-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="900">
          <rect width="1440" height="900" fill="url(#nf-center)" />
        </mask>
      </defs>
      <g mask="url(#nf-fade)">
        <path
          d={ROUTE}
          mask="url(#nf-draw)"
          className="lost-route"
          fill="none" stroke="#0A0A0A" strokeOpacity="0.32" strokeWidth="1.25"
          strokeDasharray="6 9" strokeLinecap="round" vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}

/** Kompas sebagai angka "0": cincin setebal goresan angka, jarum terus mencari arah */
function CompassZero() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7, rotate: -40 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.8, ease: EASE, delay: 0.35 }}
      className="relative mx-[0.04em] inline-block h-[0.74em] w-[0.74em] translate-y-[0.02em] align-baseline"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#0A0A0A" strokeWidth="11" />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#0A0A0A" strokeOpacity="0.12" strokeWidth="1.2" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          const r1 = i % 3 === 0 ? 24 : 27;
          return (
            <line key={i} x1={50 + Math.sin(a) * r1} y1={50 - Math.cos(a) * r1} x2={50 + Math.sin(a) * 31} y2={50 - Math.cos(a) * 31}
              stroke="#0A0A0A" strokeOpacity={i % 3 === 0 ? 0.5 : 0.2} strokeWidth={i % 3 === 0 ? 1.6 : 1} strokeLinecap="round" />
          );
        })}
        <g className="compass-needle">
          <path d="M50 24 L56 50 L44 50 Z" fill="#B8545C" />
          <path d="M50 76 L56 50 L44 50 Z" fill="#0A0A0A" />
        </g>
        <circle cx="50" cy="50" r="3.5" fill="#fff" stroke="#0A0A0A" strokeWidth="1.5" />
      </svg>
    </motion.span>
  );
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.4, ease: EASE, delay },
});

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  return (
    <main className="relative z-10 flex min-h-dvh w-full flex-col overflow-hidden bg-white text-[#0A0A0A]
      px-6 sm:px-10 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <LostBackdrop />

      <motion.header {...rise(0)} className="relative flex items-center justify-between gap-4">
        <Link href="/" className="text-lg md:text-xl font-medium tracking-tight transition-opacity hover:opacity-60">
          cardivex<span className="text-accent">.</span>
        </Link>
        <span className="font-mono text-xs tracking-[0.2em] text-black/45">ERROR 404</span>
      </motion.header>

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-10 text-center">
        {/* 404 besar: angka 4 naik dari bawah garis, 0 = kompas */}
        <h1 className="sr-only">404, page not found</h1>
        <p aria-hidden="true" className="flex items-baseline justify-center text-[26vw] sm:text-[17vw] lg:text-[10.5rem] font-medium leading-[0.85] tracking-[-0.05em]">
          <span className="inline-block overflow-hidden pb-[0.04em]">
            <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease: EASE, delay: 0.15 }}>4</motion.span>
          </span>
          <CompassZero />
          <span className="inline-block overflow-hidden pb-[0.04em]">
            <motion.span className="inline-block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}>4</motion.span>
          </span>
        </p>

        <motion.p {...rise(0.6)} className="mt-7 font-mono text-[11px] uppercase tracking-[0.3em] text-black/50">Page not found</motion.p>
        <motion.h2 {...rise(0.75)} className="mt-4 text-2xl sm:text-3xl md:text-[2.5rem] font-medium leading-[1.1] tracking-tight">
          You&apos;ve wandered <span className="text-accent">off the map.</span>
        </motion.h2>
        <motion.p {...rise(0.9)} className="mt-4 max-w-sm text-[15px] leading-relaxed text-black/55">
          The page you were looking for has moved, been renamed, or never existed. Let&apos;s get you back to familiar ground.
        </motion.p>

        {pathname && pathname !== '/' && (
          <motion.p {...rise(1.0)} className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="text-black/40">Nothing at</span>
            <span className="truncate font-mono text-black/75">{pathname}</span>
          </motion.p>
        )}

        <motion.div {...rise(1.1)} className="mt-9 flex w-full flex-col-reverse items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-black/12 bg-white px-6 text-sm font-medium transition-colors duration-200 hover:border-black/35 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Go back
          </button>
          <Link
            href="/"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#0A0A0A] px-8 text-sm font-medium text-white transition-all duration-200 hover:bg-black/80 active:scale-[0.98] sm:w-auto"
          >
            Take me home
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
