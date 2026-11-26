'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';

/* =========================================================
   Jejak ECG (PQRST) yang digambar seperti monitor jantung.
   Satu siklus = 5 detak dalam 4 detik, jadi jantung berdenyut tiap 0,8 detik (lihat .ecg-heart di globals.css).
   Lebar 1000 unit supaya jejak memenuhi panel lebar tanpa diregangkan.
   ========================================================= */

const W = 1000;
const H = 140;
const BASE = 92;
const BEATS = 5;
const CYCLE_S = 4;

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

/* =========================================================
   Adegan EKG untuk layar menunggu: jantung utuh (aorta, pembuluh, koroner) yang berdetak lembut,
   tiga elektroda dengan kabel menjuntai ke monitor EKG putih, dan sinyal kecil yang mengalir
   lewat kabel di setiap detak. Layar monitor menggambar jejak EKG terus-menerus.
   Semua gerak SMIL/CSS (tanpa JS per frame). Dua tata letak: lebar (desktop) dan tegak (HP).
   ========================================================= */

const ACCENT = '#d4505f';
const TAIL = 0.16; // ekor terang di belakang kursor (bagian dari satu siklus)
const GAP = 0.05; // celah penghapus di depan kursor

/** Jalur EKG (P, QRS, T) dengan ukuran persis layar, supaya tebal garis tetap rata (tanpa peregangan) */
function makeEcg(w: number, h: number, beats: number) {
  const bw = w / beats;
  const sx = bw / 200;
  const sy = h / 140;
  const b = h * 0.66;
  const X = (v: number) => (v * sx).toFixed(1);
  const Y = (v: number) => (b - v * sy).toFixed(1);
  let d = `M0 ${b.toFixed(1)}`;
  for (let i = 0; i < beats; i++) {
    const o = i * 200;
    d += ` L${X(o + 18)} ${Y(0)}`
      + ` C${X(o + 26)} ${Y(0)} ${X(o + 30)} ${Y(12)} ${X(o + 38)} ${Y(12)}`
      + ` C${X(o + 46)} ${Y(12)} ${X(o + 50)} ${Y(0)} ${X(o + 58)} ${Y(0)}`
      + ` L${X(o + 74)} ${Y(0)} L${X(o + 80)} ${Y(-10)} L${X(o + 90)} ${Y(76)} L${X(o + 100)} ${Y(-22)}`
      + ` L${X(o + 108)} ${Y(0)} L${X(o + 122)} ${Y(0)}`
      + ` C${X(o + 132)} ${Y(0)} ${X(o + 138)} ${Y(22)} ${X(o + 150)} ${Y(22)}`
      + ` C${X(o + 162)} ${Y(22)} ${X(o + 168)} ${Y(0)} ${X(o + 178)} ${Y(0)} L${X(o + 200)} ${Y(0)}`;
  }
  return d;
}

/** Jejak EKG di layar putih: kisi merah samar, jejak lama tipis, ekor terang, ujung berpendar */
function ScreenTrace({ uid, live, x, y, width, height }: { uid: string; live: boolean; x: number; y: number; width: number; height: number }) {
  const beats = Math.max(2, Math.round(width / 150));
  const cycle = (CYCLE_S / BEATS) * beats;
  const d = makeEcg(width, height, beats);
  return (
    <svg x={x} y={y} width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="hidden">
      <rect width={width} height={height} fill={`url(#scr-major-${uid})`} />
      <path
        d={d} pathLength={1} fill="none" stroke={ACCENT} strokeOpacity="0.22" strokeWidth="2" strokeLinejoin="round"
        strokeDasharray={`${1 - GAP} ${GAP}`} strokeDashoffset={-GAP}
      >
        {live && <animate attributeName="stroke-dashoffset" values={`${-GAP};${-GAP - 1}`} dur={`${cycle}s`} repeatCount="indefinite" />}
      </path>
      <path
        d={d} pathLength={1} fill="none" stroke={ACCENT} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray={`${TAIL} ${1 - TAIL}`} strokeDashoffset={TAIL} opacity={live ? 1 : 0}
      >
        {live && <animate attributeName="stroke-dashoffset" values={`${TAIL};${TAIL - 1}`} dur={`${cycle}s`} repeatCount="indefinite" />}
      </path>
      {live && (
        <circle r="4.5" fill={ACCENT} filter={`url(#scr-glow-${uid})`}>
          <animateMotion dur={`${cycle}s`} repeatCount="indefinite" path={d} />
        </circle>
      )}
    </svg>
  );
}

/* ---------- Maskot jantung ----------
 * Love mengilap dengan wajah gaya anime. Diam: tersenyum, berkedip, sesekali melirik. Dipencet:
 * melompat, ekspresi berganti acak (senang ^^, jatuh cinta, mengedip ><), dan balon dialog muncul
 * sementara mulutnya "bicara". Bentuk mulut berpindah halus antar ekspresi (transisi `d`).
 */

type Expression = 'idle' | 'happy' | 'love' | 'wink';
const INK = '#3b2226';
const HEART_PATH = 'M105 66 C97 40 74 28 52 31 C24 35 11 62 18 90 C26 124 64 154 98 184 Q105 190 112 184 C146 154 184 124 192 90 C199 62 186 35 158 31 C136 28 113 40 105 66 Z';

/** Mulut: satu bentuk tertutup (bibir atas & bawah) supaya bisa ditransisikan antar ekspresi */
const MOUTHS: Record<Expression, string> = {
  idle: 'M95 119 Q105 124 115 119 Q105 131 95 119 Z',
  happy: 'M91 116 Q105 118 119 116 Q105 141 91 116 Z',
  love: 'M104 121 Q105 121 106 121 Q105 122 104 121 Z',
  wink: 'M94 118 Q105 121 116 118 Q105 136 94 118 Z',
};

/** Alis per ekspresi (diam: tanpa alis) */
const BROWS: Partial<Record<Expression, [string, string]>> = {
  happy: ['M70 84 Q80 78 90 83', 'M120 83 Q130 78 140 84'],
  love: ['M71 85 Q80 81 89 85', 'M121 85 Q130 81 139 85'],
  wink: ['M70 85 Q80 81 90 85', 'M120 80 Q130 72 140 79'],
};


/** Satu mata gaya anime: iris bergradasi, kilau oval besar di atas, kilau kecil di bawah */
function AnimeEye({ cx, uid, heart = false }: { cx: number; uid: string; heart?: boolean }) {
  const rx = 9;
  const ry = 12.5;
  return (
    <g>
      <ellipse cx={cx} cy="100" rx={rx} ry={ry} fill={`url(#eye-${uid})`} />
      {heart ? (
        // Pantulan hati kecil merah muda di dalam mata
        <path d={`M${cx + 3} 99 C${cx - 3} 94 ${cx - 1} 88 ${cx + 3} 91.5 C${cx + 7} 88 ${cx + 9} 94 ${cx + 3} 99 Z`} fill="#ffb3c1" />
      ) : (
        <ellipse cx={cx + 3} cy="94" rx="3.8" ry="4.6" fill="#fff" />
      )}
      <circle cx={cx - 3.5} cy="106" r="1.9" fill="#fff" opacity="0.9" />
      <circle cx={cx + 4} cy="107" r="1" fill="#fff" opacity="0.7" />
    </g>
  );
}

function Eyes({ expression, live, uid }: { expression: Expression; live: boolean; uid: string }) {
  if (expression === 'happy') {
    return (
      <g className="heart-pop" stroke={INK} strokeWidth="4.2" strokeLinecap="round" fill="none">
        <path d="M71 104 Q80 91 89 104" />
        <path d="M121 104 Q130 91 139 104" />
      </g>
    );
  }
  const heart = expression === 'love';
  return (
    <g className={expression === 'idle' && live ? 'heart-blink' : 'heart-pop'}>
      {/* Saat diam, mata sesekali melirik ke kiri lalu ke kanan */}
      <g className={expression === 'idle' && live ? 'heart-glance' : undefined}>
        <AnimeEye cx={80} uid={uid} heart={heart} />
        {expression === 'wink'
          ? <path d="M139 94 L122 101 L139 108" stroke={INK} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          : <AnimeEye cx={130} uid={uid} heart={heart} />}
      </g>
    </g>
  );
}

/** Detail kecil yang hanya muncul pada reaksi tertentu */
function ReactionDetails({ expression }: { expression: Expression }) {
  const brows = BROWS[expression];
  return (
    <g key={expression}>
      {brows && (
        <g className="heart-pop" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85">
          <path d={brows[0]} />
          <path d={brows[1]} />
        </g>
      )}
      {/* Jatuh cinta: mulut kucing "ω" dan hati kecil yang melayang di dekat kepala */}
      {expression === 'love' && (
        <>
          <path className="heart-pop" d="M95 119 Q100 126 105 120 Q110 126 115 119" stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path className="heart-float" d="M168 44 C160 38 161 30 168 33 C175 30 176 38 168 44 Z" fill="#ff8fa3" />
        </>
      )}
      {/* Senang & jatuh cinta: garis rona di pipi */}
      {(expression === 'happy' || expression === 'love') && (
        <g className="heart-pop" stroke="#e45a72" strokeWidth="1.8" strokeLinecap="round" opacity="0.7">
          <path d="M55 119 L52 125 M61 119 L58 125 M67 119 L64 125" />
          <path d="M143 119 L140 125 M149 119 L146 125 M155 119 L152 125" />
        </g>
      )}
      {/* Mengedip: kilau bintang di dekat mata yang mengedip */}
      {expression === 'wink' && (
        <path className="heart-pop" d="M152 86 L154.5 92 L161 94 L154.5 96 L152 102 L149.5 96 L143 94 L149.5 92 Z" fill="#fff6c9" stroke="#f3c969" strokeWidth="1" />
      )}
    </g>
  );
}

function Heart({ uid, live, expression, talking }: { uid: string; live: boolean; expression: Expression; talking: boolean }) {
  const mouth = MOUTHS[expression];
  const blushing = expression !== 'idle';
  return (
    <g data-heart>
      {/* Badan: warna dasar berlapis */}
      <path d={HEART_PATH} fill={`url(#heart-${uid})`} />
      <g clipPath={`url(#heart-clip-${uid})`}>
        {/* Bayangan bawah untuk volume, dan cahaya tepi di sisi dalam (kesan jeli tembus cahaya) */}
        <path d={HEART_PATH} fill={`url(#heart-shade-${uid})`} />
        {/* Kilap lembut bergradasi di kedua lobus */}
        <ellipse cx="58" cy="62" rx="34" ry="22" fill={`url(#heart-gloss-${uid})`} transform="rotate(-28 58 62)" />
        <ellipse cx="156" cy="62" rx="22" ry="13" fill={`url(#heart-gloss-${uid})`} opacity="0.55" transform="rotate(28 156 62)" />
      </g>
      <path d={HEART_PATH} fill="none" stroke="#b8384d" strokeOpacity="0.18" strokeWidth="1.2" />
      {/* Kilap: garis pantulan & kilau titik, sedikit buram supaya halus */}
      <g filter={`url(#heart-soft-${uid})`}>
        <path d="M38 60 C44 44 62 38 78 44" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        <circle cx="90" cy="50" r="3.4" fill="#ffffff" opacity="0.75" />
        <path d="M168 44 C182 54 188 72 182 94" stroke="#ffffff" strokeOpacity="0.24" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>

      {/* Wajah: mata, alis, pipi, dan mulut mengikuti ekspresi */}
      <Eyes key={expression} expression={expression} live={live} uid={uid} />
      <ellipse cx="62" cy="122" rx="12.5" ry="7.5" fill={`url(#heart-blush-${uid})`} opacity={blushing ? 1 : 0.65} className="heart-cheek" />
      <ellipse cx="148" cy="122" rx="12.5" ry="7.5" fill={`url(#heart-blush-${uid})`} opacity={blushing ? 1 : 0.65} className="heart-cheek" />
      <ReactionDetails expression={expression} />
      <g className={talking && live ? 'heart-talk' : undefined}>
        <path d={mouth} style={{ d: `path("${mouth}")` }} fill={INK} className="heart-mouth" />
        {(expression === 'happy' || expression === 'wink') && <ellipse cx="105" cy="131" rx="5.5" ry="3.2" fill="#ff8a9c" />}
      </g>

      {/* Bintang kecil yang berkelip */}
      <path
        className={live ? 'heart-sparkle' : undefined}
        d="M192 26 L195 35 L204 38 L195 41 L192 50 L189 41 L180 38 L189 35 Z"
        fill="#ffc2ca"
      />
    </g>
  );
}

function Electrode({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="11" fill="#ffffff" stroke="#e3dcda" strokeWidth="2" />
      <circle cx={x} cy={y} r="4" fill="#cfc5c3" />
    </g>
  );
}

function SceneDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <radialGradient id={`heart-${uid}`} cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#ffc9cf" />
        <stop offset="0.22" stopColor="#fdb0b9" />
        <stop offset="0.45" stopColor="#f5838f" />
        <stop offset="0.75" stopColor="#e66a7c" />
        <stop offset="1" stopColor="#d65266" />
      </radialGradient>
      {/* Bayangan lembut di bagian bawah badan, memberi kesan bulat */}
      <linearGradient id={`heart-shade-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.45" stopColor="#9e2b40" stopOpacity="0" />
        <stop offset="0.75" stopColor="#9e2b40" stopOpacity="0.1" />
        <stop offset="1" stopColor="#9e2b40" stopOpacity="0.24" />
      </linearGradient>
      <radialGradient id={`heart-gloss-${uid}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.22" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      {/* Sedikit buram untuk kilap, supaya menyatu dengan badan */}
      <filter id={`heart-soft-${uid}`} x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="0.9" />
      </filter>
      <linearGradient id={`eye-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#24141a" />
        <stop offset="0.6" stopColor="#3b2226" />
        <stop offset="1" stopColor="#7a3b4a" />
      </linearGradient>
      <radialGradient id={`heart-blush-${uid}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ff6f86" stopOpacity="0.75" />
        <stop offset="1" stopColor="#ff6f86" stopOpacity="0" />
      </radialGradient>
      <clipPath id={`heart-clip-${uid}`}>
        <path d={HEART_PATH} />
      </clipPath>
      <linearGradient id={`bezel-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#f1ecea" />
      </linearGradient>
      <pattern id={`scr-minor-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke={ACCENT} strokeOpacity="0.05" strokeWidth="0.6" />
      </pattern>
      <pattern id={`scr-major-${uid}`} width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill={`url(#scr-minor-${uid})`} />
        <path d="M100 0H0V100" fill="none" stroke={ACCENT} strokeOpacity="0.1" strokeWidth="0.8" />
      </pattern>
      <filter id={`scr-glow-${uid}`} x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`soft-${uid}`} x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#2b1f1d" floodOpacity="0.12" />
      </filter>
    </defs>
  );
}

/* ---------- Fisika: detak, gerak badan, dan kabel ----------
 * Jantung: pegas teredam yang dihentak dua kali tiap detak ("lub" lalu "dub"), jadi badan memipih,
 * memanjang, dan memantul. Badan juga melayang & bergoyang pelan (pegas mengejar target yang
 * bergeser), dan melompat saat dipencet. Bayangan di bawahnya mengecil saat badan naik.
 * Kabel: tali Verlet (titik bermassa + gravitasi + batasan panjang). Ujung di elektroda mengikuti
 * seluruh gerak badan, ujung lain terpasang di port monitor, jadi kabel menjuntai, berayun, dan meredam.
 * Sinyal kecil mengalir di sepanjang lengkung kabel yang sedang bergerak, tiap detak.
 * Satu requestAnimationFrame mengubah atribut SVG; berhenti saat adegan tidak terlihat.
 */

type Pt = { x: number; y: number };
/** `slack` = panjang kabel dibanding jarak lurus (makin kecil, makin sedikit menjuntai) */
type SceneLayout = { hx: number; hy: number; s: number; ports: Pt[]; electrodes: Pt[]; slack: number };
type Spring = { x: number; v: number };

const BEAT_MS = (CYCLE_S / BEATS) * 1000;
/** Titik tumpu pantulan: ujung bawah love (koordinat lokal) */
const BEAT_ORIGIN = { x: 105, y: 190 };
const ROPE_POINTS = 18;
const GRAVITY = 1100;
const SIGNAL_MS = 460;

/** Satu langkah pegas teredam menuju `target` */
function spring(s: Spring, target: number, k: number, c: number, dt: number) {
  s.v += (-k * (s.x - target) - c * s.v) * dt;
  s.x += s.v * dt;
}

/** Pose badan jantung: offset, rotasi (derajat), dan skala pantulan */
type Pose = { bx: number; by: number; rot: number; sx: number; sy: number };
const REST_POSE: Pose = { bx: 0, by: 0, rot: 0, sx: 1, sy: 1 };

/** Titik elektroda di koordinat adegan, sesudah badan memantul, berputar, dan bergeser */
function electrodeAt(l: SceneLayout, e: Pt, p: Pose): Pt {
  const lx = (e.x - BEAT_ORIGIN.x) * p.sx;
  const ly = (e.y - BEAT_ORIGIN.y) * p.sy;
  const a = (p.rot * Math.PI) / 180;
  const rx = BEAT_ORIGIN.x + lx * Math.cos(a) - ly * Math.sin(a) + p.bx;
  const ry = BEAT_ORIGIN.y + lx * Math.sin(a) + ly * Math.cos(a) + p.by;
  return { x: l.hx + rx * l.s, y: l.hy + ry * l.s };
}

/** Lengkung awal kabel (juga tampilan diam untuk "kurangi gerakan"), kendurnya mengikuti `slack` */
function restCurve(a: Pt, b: Pt, slack: number, n = ROPE_POINTS): Pt[] {
  const sag = Math.hypot(b.x - a.x, b.y - a.y) * Math.min(0.36, (slack - 1) * 1.2);
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + Math.sin(Math.PI * t) * sag };
  });
}

/** Jalur halus melalui titik-titik tali (kuadratik di antara titik tengah) */
function ropePath(p: Pt[]) {
  let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i].x + p[i + 1].x) / 2;
    const my = (p[i].y + p[i + 1].y) / 2;
    d += ` Q${p[i].x.toFixed(1)} ${p[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const z = p[p.length - 1];
  return `${d} L${z.x.toFixed(1)} ${z.y.toFixed(1)}`;
}

/** Titik pada tali di posisi u (0..1) menurut panjang lintasan */
function pointAlong(p: Pt[], u: number): Pt {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
    seg.push(d);
    total += d;
  }
  let target = u * total;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) {
      const t = seg[i] ? target / seg[i] : 0;
      return { x: p[i].x + (p[i + 1].x - p[i].x) * t, y: p[i].y + (p[i + 1].y - p[i].y) * t };
    }
    target -= seg[i];
  }
  return p[p.length - 1];
}

/** Menjalankan fisika adegan; mengembalikan ref berisi fungsi "poke" (melompat saat dipencet) */
function useHeartPhysics(ref: React.RefObject<SVGSVGElement | null>, layout: SceneLayout, live: boolean) {
  const poke = useRef<(kind: Expression) => void>(() => {});
  useEffect(() => {
    const svg = ref.current;
    if (!svg || !live) return;
    const hearts = [...svg.querySelectorAll<SVGGElement>('[data-heart]')];
    const shadow = svg.querySelector<SVGEllipseElement>('[data-shadow]');
    const cables = layout.ports.map((_, i) => ({
      lines: [...svg.querySelectorAll<SVGPathElement>(`[data-cable="${i}"]`)],
      dot: svg.querySelector<SVGCircleElement>(`[data-signal="${i}"]`),
    }));

    // Tali: posisi sekarang & sebelumnya (Verlet), mulai dari lengkung diam
    const ropes = layout.electrodes.map((e, i) => {
      const a = electrodeAt(layout, e, REST_POSE);
      const b = layout.ports[i];
      const pts = restCurve(a, b, layout.slack);
      const rest = (Math.hypot(b.x - a.x, b.y - a.y) * layout.slack) / (ROPE_POINTS - 1);
      return { pts, prev: pts.map(p => ({ ...p })), rest };
    });

    const squash: Spring = { x: 0, v: 0 }; // > 0 memipih, < 0 memanjang
    const bx: Spring = { x: 0, v: 0 };
    const by: Spring = { x: 0, v: 0 };
    const rot: Spring = { x: 0, v: 0 };
    // Setiap reaksi punya gerak sendiri: senang melompat tinggi & memipih, jatuh cinta bergoyang pelan,
    // mengedip memiringkan badan
    poke.current = (kind: Expression) => {
      if (kind === 'happy') { by.v -= 340; squash.v += 3.6; rot.v += (Math.random() < 0.5 ? -1 : 1) * 40; }
      else if (kind === 'love') { by.v -= 120; squash.v += 1.6; rot.v += 120; }
      else { by.v -= 160; squash.v += 2; rot.v -= 140; }
    };

    let raf = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();
    let beatIndex = -1;
    let dubDone = true;
    let signalAt = -Infinity;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const t = now - start;
      const sec = t / 1000;

      // Detak: hentakan "lub" di awal tiap detak, "dub" yang lebih kecil 180 ms kemudian
      const b = Math.floor(t / BEAT_MS);
      if (b !== beatIndex) {
        beatIndex = b;
        squash.v += 2.1;
        dubDone = false;
        signalAt = now;
      }
      if (!dubDone && t - b * BEAT_MS > 180) {
        squash.v += 1.1;
        dubDone = true;
      }
      // Dua sub-langkah supaya pegas yang kaku tetap stabil
      for (let k = 0; k < 2; k++) {
        const h = dt / 2;
        spring(squash, 0, 320, 16, h);
        spring(by, -5 * Math.sin(sec * 1.7), 90, 7, h); // melayang naik-turun
        spring(bx, 2.5 * Math.sin(sec * 0.8), 60, 8, h);
        spring(rot, 3 * Math.sin(sec * 1.1), 80, 6, h); // bergoyang
      }
      const pose: Pose = { bx: bx.x, by: by.x, rot: rot.x, sx: 1 + 0.75 * squash.x, sy: 1 - 0.6 * squash.x };
      const bodyTransform = `translate(${pose.bx.toFixed(2)} ${pose.by.toFixed(2)}) rotate(${pose.rot.toFixed(2)} ${BEAT_ORIGIN.x} ${BEAT_ORIGIN.y}) `
        + `translate(${BEAT_ORIGIN.x} ${BEAT_ORIGIN.y}) scale(${pose.sx.toFixed(4)} ${pose.sy.toFixed(4)}) translate(${-BEAT_ORIGIN.x} ${-BEAT_ORIGIN.y})`;
      hearts.forEach(h => h.setAttribute('transform', bodyTransform));
      // Bayangan: makin kecil & samar saat badan naik
      if (shadow) {
        const lift = Math.max(0, -pose.by);
        shadow.setAttribute('rx', (58 * Math.max(0.55, 1 - lift / 90)).toFixed(1));
        shadow.setAttribute('opacity', (0.08 * Math.max(0.35, 1 - lift / 70)).toFixed(3));
      }

      // Tali Verlet: gravitasi + redaman, lalu batasan panjang; kedua ujung disematkan
      ropes.forEach((r, i) => {
        const a = electrodeAt(layout, layout.electrodes[i], pose);
        const end = layout.ports[i];
        const n = r.pts.length;
        for (let j = 1; j < n - 1; j++) {
          const p = r.pts[j];
          const o = r.prev[j];
          const vx = (p.x - o.x) * 0.992;
          const vy = (p.y - o.y) * 0.992;
          o.x = p.x;
          o.y = p.y;
          p.x += vx;
          p.y += vy + GRAVITY * dt * dt;
        }
        for (let it = 0; it < 6; it++) {
          r.pts[0].x = a.x; r.pts[0].y = a.y;
          r.pts[n - 1].x = end.x; r.pts[n - 1].y = end.y;
          for (let j = 0; j < n - 1; j++) {
            const p1 = r.pts[j];
            const p2 = r.pts[j + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            const diff = (dist - r.rest) / dist;
            // Hanya tarik saat teregang (tali, bukan batang): kabel boleh menekuk dan menjuntai
            if (diff <= 0) continue;
            const w1 = j === 0 ? 0 : 0.5;
            const w2 = j + 1 === n - 1 ? 0 : 0.5;
            const sum = w1 + w2 || 1;
            p1.x += dx * diff * (w1 / sum);
            p1.y += dy * diff * (w1 / sum);
            p2.x -= dx * diff * (w2 / sum);
            p2.y -= dy * diff * (w2 / sum);
          }
        }
        r.pts[0].x = a.x; r.pts[0].y = a.y;
        r.pts[n - 1].x = end.x; r.pts[n - 1].y = end.y;
        const d = ropePath(r.pts);
        cables[i].lines.forEach(el => el.setAttribute('d', d));

        // Sinyal: berjalan dari elektroda ke monitor di sepanjang tali, sedikit bergiliran
        const dot = cables[i].dot;
        if (dot) {
          const u = (now - signalAt - i * 40) / SIGNAL_MS;
          if (u >= 0 && u <= 1) {
            const e = 1 - (1 - u) * (1 - u);
            const pos = pointAlong(r.pts, e);
            dot.setAttribute('cx', pos.x.toFixed(1));
            dot.setAttribute('cy', pos.y.toFixed(1));
            dot.setAttribute('opacity', (u < 0.12 ? u / 0.12 : u > 0.85 ? (1 - u) / 0.15 : 1).toFixed(2));
          } else {
            dot.setAttribute('opacity', '0');
          }
        }
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      const on = entry.isIntersecting && svg.getBoundingClientRect().width > 0;
      if (on === visible) return;
      visible = on;
      cancelAnimationFrame(raf);
      last = 0;
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(svg);
    // Adegan yang disembunyikan CSS (tata letak HP/desktop yang tidak aktif) tidak dijalankan
    visible = svg.getBoundingClientRect().width > 0;
    if (visible) raf = requestAnimationFrame(frame);
    return () => {
      poke.current = () => {};
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref, layout, live]);
  return poke;
}

/** Kabel: garis lembut + kilau tipis, plus titik sinyal (posisi diisi fisika) */
function Cable({ i, d, live }: { i: number; d: string; live: boolean }) {
  return (
    <g>
      <path data-cable={i} d={d} fill="none" stroke="#ddd5d3" strokeWidth="4" strokeLinecap="round" />
      <path data-cable={i} d={d} fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.2" strokeLinecap="round" />
      {live && <circle data-signal={i} r="3.6" fill={ACCENT} opacity="0" filter="drop-shadow(0 0 3px rgba(212,80,95,0.6))" />}
    </g>
  );
}

/** Bingkai & layar monitor (tanpa tulisan; waktu ditampilkan di luar alat) */
function Monitor({ uid, live, x, y, w, h }: { uid: string; live: boolean; x: number; y: number; w: number; h: number }) {
  const pad = 18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="30" fill={`url(#bezel-${uid})`} stroke="#ebe4e2" filter={`url(#soft-${uid})`} />
      <rect x={x + pad} y={y + pad} width={w - pad * 2} height={h - pad * 2} rx="18" fill="#ffffff" stroke="#efe9e7" />
      <ScreenTrace uid={uid} live={live} x={x + pad + 8} y={y + pad + 8} width={w - pad * 2 - 16} height={h - pad * 2 - 16} />
    </g>
  );
}

/* ---------- Interaksi: dipencet -> ekspresi & balon dialog ---------- */

const LINES = ['Hi there!', 'Thump thump!', 'Hehe, that tickles!', 'Still beating for you!', 'Boop!', 'Thanks for waiting!', 'I am working on it!'];
const REACTIONS: Expression[] = ['happy', 'love', 'wink'];
/** Ekspresi & balon dialog untuk satu maskot. Kembali tersenyum setelah reaksi selesai. */
function useHeartReactions() {
  const [expression, setExpression] = useState<Expression>('idle');
  const [line, setLine] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const lastLine = useRef(-1);

  useEffect(() => () => timers.current.forEach(t => clearTimeout(t)), []);

  const lastExpression = useRef<Expression>('idle');
  /** Pilih reaksi baru (berbeda dari sebelumnya), tampilkan, dan kembalikan supaya gerak badan cocok */
  const react = (): Expression => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
    const options = REACTIONS.filter(e => e !== lastExpression.current);
    const next = options[Math.floor(Math.random() * options.length)];
    lastExpression.current = next;
    setExpression(next);
    let i = Math.floor(Math.random() * LINES.length);
    if (i === lastLine.current) i = (i + 1) % LINES.length;
    lastLine.current = i;
    setLine(LINES[i]);
    timers.current.push(window.setTimeout(() => { setExpression('idle'); setLine(null); }, 2600));
    return next;
  };

  return { expression, line, react };
}

// Desktop: jantung di kiri, monitor di kanan (port di sisi kiri monitor)
const WIDE = { hx: 34, hy: 40, s: 1.18, mx: 380, my: 24, mw: 596, mh: 272, bubble: { x: 150, y: -6 }, viewBox: [0, -70, 1000, 390] };
const WIDE_LAYOUT: SceneLayout = {
  hx: WIDE.hx, hy: WIDE.hy, s: WIDE.s,
  // Kanan -> port atas, tengah -> port tengah, kiri -> port bawah (kabel tidak bersilangan)
  ports: [126, 158, 190].map(p => ({ x: WIDE.mx, y: WIDE.my + p })),
  electrodes: [{ x: 172, y: 108 }, { x: 105, y: 146 }, { x: 38, y: 108 }],
  slack: 1.22,
};
// HP: jantung di atas, monitor di bawah (port di sisi atas monitor)
const TALL = { hx: 186, hy: 36, s: 1.08, mx: 24, my: 340, mw: 552, mh: 240, bubble: { x: 140, y: -18 }, viewBox: [0, -90, 600, 690] };
const TALL_LAYOUT: SceneLayout = {
  hx: TALL.hx, hy: TALL.hy, s: TALL.s,
  ports: [236, 300, 364].map(p => ({ x: TALL.mx + p, y: TALL.my })),
  // Kiri, tengah sedikit di bawah mulut, kanan; kabel menjuntai ke port di bawahnya
  electrodes: [{ x: 38, y: 108 }, { x: 105, y: 146 }, { x: 172, y: 108 }],
  // Jarak ke monitor pendek: kabel hampir lurus dengan sedikit lengkung
  slack: 1.05,
};

/** Satu tata letak adegan: monitor, jantung interaktif, kabel, elektroda, port, dan balon dialog */
function SceneLayer({ uid, live, layout, box, className }: {
  uid: string; live: boolean; layout: SceneLayout; box: typeof WIDE; className: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const poke = useHeartPhysics(ref, layout, live);
  const { expression, line, react } = useHeartReactions();
  const press = () => {
    poke.current(react());
  };
  const heartSpace = `translate(${layout.hx} ${layout.hy}) scale(${layout.s})`;
  const [vx, vy, vw, vh] = box.viewBox;
  // Posisi balon dalam persen dari kotak SVG, jadi ikut skala tanpa memperbesar hurufnya
  const bubbleLeft = ((layout.hx + box.bubble.x * layout.s - vx) / vw) * 100;
  const bubbleTop = ((layout.hy + box.bubble.y * layout.s - vy) / vh) * 100;

  return (
    <div className={`relative ${className}`}>
    <svg ref={ref} viewBox={box.viewBox.join(' ')} className="block w-full touch-manipulation" role="group" aria-label="A smiling heart connected to an ECG monitor">
      <SceneDefs uid={uid} />
      <Monitor uid={uid} live={live} x={box.mx} y={box.my} w={box.mw} h={box.mh} />

      <g transform={heartSpace}>
        {/* Bayangan di lantai (ukurannya diatur fisika saat melompat) */}
        <ellipse data-shadow cx="105" cy="206" rx="58" ry="7" fill="#2b1f1d" opacity="0.08" />
        <g
          role="button"
          tabIndex={0}
          aria-label="Poke the heart"
          onClick={press}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              press();
            }
          }}
          className="cursor-pointer outline-none [&:focus-visible_path:first-of-type]:stroke-[#3b2226] [&:focus-visible_path:first-of-type]:stroke-2"
        >
          <Heart uid={uid} live={live} expression={expression} talking={!!line} />
        </g>
      </g>

      {/* Kabel di depan hati, dari elektroda ke port monitor */}
      {layout.electrodes.map((e, i) => (
        <Cable key={i} i={i} live={live} d={ropePath(restCurve(electrodeAt(layout, e, REST_POSE), layout.ports[i], layout.slack))} />
      ))}
      {/* Stiker elektroda paling depan, bergerak bersama badan hati */}
      <g transform={heartSpace} pointerEvents="none">
        <g data-heart>
          {layout.electrodes.map((e, i) => <Electrode key={i} x={e.x} y={e.y} />)}
        </g>
      </g>
      {layout.ports.map((p, i) => (
        <rect key={i} x={p.x - 7} y={p.y - 6} width="14" height="12" rx="4" fill="#d6cdcb" />
      ))}

    </svg>
      {/* Balon dialog: lapisan HTML di atas gambar (animasi dikerjakan GPU, ukuran huruf tetap) */}
      {line && (
        <div
          key={line}
          role="status"
          className="comic-pop pointer-events-none absolute w-max max-w-[60%] sm:max-w-[16rem]"
          style={{ left: `${bubbleLeft}%`, top: `${bubbleTop}%`, translate: '0 -100%' }}
        >
          <span className="block rounded-full border border-[#3b2226]/10 bg-white px-3 py-1.5 text-xs font-medium leading-snug text-[#3b2226] shadow-[0_6px_16px_-8px_rgba(43,31,29,0.45)] sm:text-[13px]">
            {line}
          </span>
          <span aria-hidden="true" className="absolute -bottom-1.5 left-2.5 h-2 w-2 rounded-full border border-[#3b2226]/10 bg-white" />
          <span aria-hidden="true" className="absolute -bottom-3.5 left-1 h-1 w-1 rounded-full border border-[#3b2226]/10 bg-white" />
        </div>
      )}
    </div>
  );
}

/** Adegan lengkap untuk desktop dan HP */
function EcgScene({ live }: { live: boolean }) {
  const uid = useId().replace(/:/g, '');
  return (
    <>
      <SceneLayer uid={`${uid}w`} live={live} layout={WIDE_LAYOUT} box={WIDE} className="hidden w-full sm:block" />
      <SceneLayer uid={`${uid}t`} live={live} layout={TALL_LAYOUT} box={TALL} className="w-full sm:hidden" />
    </>
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
        <span className="shrink-0 pt-1 font-mono text-sm tabular-nums text-muted" data-i18n-skip>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </span>
      </div>

      <div className="relative px-4 sm:px-8 md:px-12 py-5 md:py-7">
        <EcgScene live={!reduced} />
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














