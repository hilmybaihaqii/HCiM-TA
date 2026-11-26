'use client';

import React, { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FEATURES, formatChange, ratioChange } from '@/lib/pipeline';
import { isStrongChange } from '@/lib/biomarkerHighlight';
import { SHORT_DESC } from './biomarkerText';
import { SectionHead } from './ui';
import styles from './CellDiagram.module.css';
import { edgeS, membranePath, useLivingCell } from './useLivingCell';

/*
 * Ilustrasi sederhana satu sel otot jantung. Sel di kiri, penjelasan bagian yang dipilih di kanan.
 * Gambarnya skematik dan tidak berubah; yang berasal dari hasil hanya perubahan biomarker di panel.
 */

type Feature = (typeof FEATURES)[number];
type PartId = 'na' | 'ca' | 'herg' | 'k' | 'membrane' | 'ttubule' | 'nucleus' | 'mito' | 'sr' | 'sarcomere';
type Part = {
  kind: string;
  title: string;
  subtitle: string;
  text: string;
  biomarkers: Feature[];
  flow?: { color: string; text: string };
};

const NA = '#2F76E6';
const CA = '#16856F';
const K = '#B8545C';

const PARTS: Record<PartId, Part> = {
  na: {
    kind: 'Ion channel', title: 'Sodium channel', subtitle: 'INa and INaL · Nav1.5',
    text: 'Sodium rushes in to start each beat. A small late current then helps hold the plateau.',
    biomarkers: ['dvdtmax', 'vmax', 'qNet'],
    flow: { color: NA, text: 'Na⁺ moves into the cell' },
  },
  ca: {
    kind: 'Ion channel', title: 'L-type calcium channel', subtitle: 'ICaL · Cav1.2',
    text: 'Calcium enters during the plateau and triggers the larger calcium release from the SR.',
    biomarkers: ['APD50', 'camax', 'qNet'],
    flow: { color: CA, text: 'Ca²⁺ moves into the cell' },
  },
  herg: {
    kind: 'Ion channel', title: 'hERG potassium channel', subtitle: 'IKr · Kv11.1',
    text: 'Potassium leaves the cell and brings it back to rest. When a drug blocks hERG, each beat can last longer.',
    biomarkers: ['APD90', 'max_dv', 'qNet'],
    flow: { color: K, text: 'K⁺ moves out of the cell' },
  },
  k: {
    kind: 'Ion channel', title: 'Other potassium channels', subtitle: 'IKs and IK1',
    text: 'IKs supports recovery when hERG is reduced. IK1 finishes recovery and keeps the resting voltage steady.',
    biomarkers: ['vrest', 'APD90', 'qNet'],
    flow: { color: K, text: 'K⁺ moves out of the cell' },
  },
  membrane: {
    kind: 'Cell structure', title: 'Cell membrane', subtitle: 'Sarcolemma',
    text: 'A thin lipid layer that separates the inside of the cell from the outside. The voltage across it is what the action potential measures.',
    biomarkers: ['vrest', 'vmax', 'dvdtmax'],
  },
  ttubule: {
    kind: 'Cell structure', title: 'T-tubules', subtitle: 'Folds of the membrane',
    text: 'Deep folds that carry the electrical signal into the cell, so calcium channels sit right next to the SR and the whole cell contracts together.',
    biomarkers: ['camax'],
  },
  sr: {
    kind: 'Calcium store', title: 'Sarcoplasmic reticulum', subtitle: 'SR',
    text: 'Stores calcium, releases it during the beat, and takes it back so the muscle can relax.',
    biomarkers: ['camax', 'carest', 'CaTD50', 'CaTD90'],
  },
  sarcomere: {
    kind: 'Contraction', title: 'Sarcomeres', subtitle: 'Contractile units',
    text: 'Calcium makes these repeating units shorten, which is how the heart muscle contracts. The simulation tracks the calcium, not the contraction itself.',
    biomarkers: ['camax'],
  },
  mito: {
    kind: 'Energy', title: 'Mitochondria', subtitle: 'ATP supply',
    text: 'Produce the ATP that powers contraction and ion pumps. They are shown for context and are not simulated here.',
    biomarkers: [],
  },
  nucleus: {
    kind: 'Cell structure', title: 'Nucleus', subtitle: 'Genetic material',
    text: 'Holds the DNA that codes for the cell’s proteins, including its ion channels. It is shown for context and is not simulated here.',
    biomarkers: [],
  },
};

const CHANNELS: { id: PartId; label: string; x: number; edge: number; light: string; color: string; dark: string; ion: string }[] = [
  { id: 'na', label: 'Na⁺', x: 205, edge: 90, light: '#7FB0F5', color: NA, dark: '#1C4FA6', ion: NA },
  { id: 'ca', label: 'Ca²⁺', x: 435, edge: 90, light: '#6B6B6B', color: '#2A2A2A', dark: '#111111', ion: CA },
  { id: 'herg', label: 'hERG', x: 205, edge: 310, light: '#DE8B92', color: K, dark: '#7F4046', ion: K },
  { id: 'k', label: 'K⁺', x: 435, edge: 310, light: '#DE8B92', color: K, dark: '#7F4046', ion: K },
];

/** Butiran sitoplasma: posisi tetap (deret sederhana, bukan acak) supaya render stabil */
const GRANULES = Array.from({ length: 30 }, (_, i) => ({
  x: 92 + ((i * 97) % 456),
  y: 104 + ((i * 59) % 192),
  r: 1.3 + (i % 4) * 0.45,
  o: 0.22 + (i % 3) * 0.1,
}));

/** Tetesan cipratan gooey: arah, jarak, ukuran (sedikit acak supaya terasa organik) */
const GOO_DROPS = [
  { angle: 12, dist: 36, r: 7.5 }, { angle: 75, dist: 29, r: 6 }, { angle: 138, dist: 38, r: 8 },
  { angle: 196, dist: 31, r: 6 }, { angle: 252, dist: 37, r: 7.5 }, { angle: 314, dist: 28, r: 5.5 },
];

const HOTSPOTS: { id: PartId; x: number; y: number }[] = [
  { id: 'membrane', x: 320, y: 90 },
  { id: 'ttubule', x: 370, y: 124 },
  { id: 'sarcomere', x: 112, y: 214 },
  { id: 'mito', x: 166, y: 162 },
  { id: 'nucleus', x: 296, y: 204 },
  { id: 'sr', x: 478, y: 251 },
];

const SARCOMERE_X = Array.from({ length: 10 }, (_, i) => 82 + i * 48);
const FIBRIL_Y = [122, 154, 186, 218, 250, 282];
const TUBULES: { x: number; top: [number, number]; bottom: [number, number] }[] = [
  { x: 130, top: [103, 150], bottom: [297, 250] },
  { x: 274, top: [92, 134], bottom: [308, 266] },
  { x: 370, top: [92, 134], bottom: [308, 266] },
  { x: 514, top: [105, 150], bottom: [295, 250] },
];
const CHROMATIN = Array.from({ length: 30 }, (_, i) => {
  const a = i * 2.4;
  const d = Math.sqrt(i / 30) * 0.84;
  return { x: (320 + Math.cos(a) * d * 72).toFixed(1), y: (200 + Math.sin(a) * d * 47).toFixed(1), r: (1.1 + (i % 3) * 0.55).toFixed(2) };
});
const PORES = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  return { x: (320 + Math.cos(a) * 80).toFixed(1), y: (200 + Math.sin(a) * 54).toFixed(1) };
});

/** Bentuk membran saat render pertama (server dan tanpa animasi) */
const BASE_PATH = membranePath(0);

function Mitochondrion({ cx, cy, w, h, angle, fill, active }: { cx: number; cy: number; w: number; h: number; angle: number; fill: string; active: boolean }) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const count = Math.max(3, Math.floor(w / 11));
  const folds = Array.from({ length: count }, (_, i) => {
    const fx = x + 9 + (i * (w - 18)) / (count - 1);
    return i % 2 ? `M${fx} ${y + h - 4}V${y + h * 0.42}` : `M${fx} ${y + 4}V${y + h * 0.58}`;
  }).join('');
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} stroke={active ? 'var(--action)' : '#D98484'} strokeWidth={active ? 1.5 : 1} />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={(h - 6) / 2} fill="#F9D3CD" fillOpacity="0.55" />
      <path d={folds} stroke="#D47F7F" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Plus({ x, y, active }: { x: number; y: number; active: boolean }) {
  return (
    <g pointerEvents="none" className={styles.plus}>
      <circle cx={x} cy={y} r="10.5" fill="#2B1F1D" fillOpacity="0.1" transform="translate(0 1)" />
      <circle cx={x} cy={y} r="10" fill={active ? 'var(--action)' : 'var(--surface-white)'} stroke="var(--action)" strokeOpacity={active ? 1 : 0.24} />
      <path d={`M${x - 4} ${y}H${x + 4}M${x} ${y - 4}V${y + 4}`} stroke={active ? 'var(--surface-white)' : 'var(--action)'} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export default function CellDiagram({ ratios, control }: {
  ratios: (number | null)[];
  control?: Record<string, number | null>;
}) {
  const [selected, setSelected] = useState<PartId>('herg');
  // Cipratan "gooey" di titik yang ditekan; key baru memutar ulang animasinya
  const [splash, setSplash] = useState<{ x: number; y: number; color: string; key: number } | null>(null);
  const part = PARTS[selected];
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ref = (name: string) => `url(#${uid}-${name})`;
  const dim = (id: PartId) => (selected === id ? 1 : 0.92);

  // Gerak sel hidup: elemen bertanda data-* diperbarui langsung oleh useLivingCell
  const svgRef = useRef<SVGSVGElement>(null);
  useLivingCell(svgRef);

  /** Pilih bagian sel dan munculkan cipratan di titik tekan (keyboard: di penanda bagian itu) */
  const choose = (id: PartId, e?: React.MouseEvent<SVGGElement>) => {
    setSelected(id);
    const channel = CHANNELS.find(c => c.id === id);
    let point = channel ? { x: channel.x, y: channel.edge } : HOTSPOTS.find(h => h.id === id) ?? { x: 320, y: 200 };
    const ctm = e?.currentTarget.ownerSVGElement?.getScreenCTM();
    if (e && ctm) {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      point = { x: p.x, y: p.y };
    }
    setSplash(prev => ({ x: point.x, y: point.y, color: channel?.color ?? '#E0787E', key: (prev?.key ?? 0) + 1 }));
  };

  const hit = (id: PartId) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': PARTS[id].title,
    'aria-pressed': selected === id,
    className: styles.part,
    onClick: (e: React.MouseEvent<SVGGElement>) => choose(id, e.detail ? e : undefined),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        choose(id);
      }
    },
  });

  return (
    <section aria-labelledby="cell-diagram-heading">
      <SectionHead id="cell-diagram-heading" title="Inside the cell" />
      <p className="mt-2 text-sm text-foreground/70">Select a part of the cell to see what it does.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 md:gap-12 items-center">
        <svg ref={svgRef} viewBox="30 20 580 365" className="block w-full h-auto" role="group" aria-label="Simplified heart muscle cell">
          <defs>
            <clipPath id={`${uid}-body`}><path data-membrane d={BASE_PATH} /></clipPath>
            <linearGradient id={`${uid}-cell`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FCE7E4" />
              <stop offset="0.55" stopColor="#F8D5D2" />
              <stop offset="1" stopColor="#F2C1BF" />
            </linearGradient>
            {/* Kilap agar-agar di bagian atas sel */}
            <radialGradient id={`${uid}-gloss`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${uid}-nucleus`} cx="0.38" cy="0.32" r="0.8">
              <stop offset="0" stopColor="#F7CFCC" />
              <stop offset="0.65" stopColor="#ECA9A8" />
              <stop offset="1" stopColor="#DE9293" />
            </radialGradient>
            <radialGradient id={`${uid}-nucleolus`} cx="0.36" cy="0.32" r="0.75">
              <stop offset="0" stopColor="#D57C83" />
              <stop offset="1" stopColor="#8F444C" />
            </radialGradient>
            <linearGradient id={`${uid}-mito`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F4B4AE" />
              <stop offset="1" stopColor="#E58D8B" />
            </linearGradient>
            <linearGradient id={`${uid}-sr`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#F4E4E0" />
            </linearGradient>
            {/* Efek gooey: blur lalu pertajam tepi alfa, sehingga tetesan menyatu seperti cairan */}
            <filter id={`${uid}-goo`} x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="4.5" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
            </filter>
            {CHANNELS.map(c => (
              <linearGradient key={c.id} id={`${uid}-ch-${c.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={c.dark} />
                <stop offset="0.38" stopColor={c.light} />
                <stop offset="0.68" stopColor={c.color} />
                <stop offset="1" stopColor={c.dark} />
              </linearGradient>
            ))}
          </defs>

          <g data-body>

          {/* Badan sel + miofibril dengan pola sarkomer */}
          <g {...hit('sarcomere')}>
            <path data-membrane d={BASE_PATH} fill={ref('cell')} />
            <g clipPath={ref('body')} opacity={selected === 'sarcomere' ? 1 : 0.78} className={styles.lift}>
              {SARCOMERE_X.map(x => (
                <g key={x}>
                  <rect x={x + 10} y="90" width="28" height="220" fill="#E59B9B" fillOpacity="0.2" />
                  <line x1={x + 24} x2={x + 24} y1="90" y2="310" stroke="#D98484" strokeOpacity="0.32" />
                  <line x1={x} x2={x} y1="90" y2="310" stroke="#D47F7F" strokeOpacity="0.62" strokeWidth="1.6" />
                </g>
              ))}
              {FIBRIL_Y.map(y => <line key={y} x1="70" x2="570" y1={y} y2={y} stroke="#FCE7E4" strokeWidth="3" strokeOpacity="0.72" />)}
            </g>
          </g>

          {/* Butiran sitoplasma (ribosom, glikogen) yang melayang pelan di dalam sel */}
          <g clipPath={ref('body')} pointerEvents="none" aria-hidden="true">
            {GRANULES.map((g, i) => <circle key={i} data-granule cx={g.x} cy={g.y} r={g.r} fill="#C9787C" fillOpacity={g.o} />)}
          </g>

          {/* T-tubule: lipatan membran ke dalam sel */}
          <g {...hit('ttubule')}>
            {TUBULES.flatMap(t => [
              { key: `${t.x}-top`, s: edgeS(t.x, true), d: `M${t.x} ${t.top[0]}V${t.top[1]}` },
              { key: `${t.x}-bottom`, s: edgeS(t.x, false), d: `M${t.x} ${t.bottom[0]}V${t.bottom[1]}` },
            ]).map(tube => (
              // Setiap lipatan ikut bergerak bersama titik membran tempatnya berawal
              <g key={tube.key} data-edge-s={tube.s} strokeLinecap="round" fill="none">
                <path d={tube.d} stroke="transparent" strokeWidth="18" />
                <path d={tube.d} stroke={selected === 'ttubule' ? 'var(--action)' : '#DE8F90'} strokeWidth="6" className={styles.lift} />
                <path d={tube.d} stroke="#FFF3F0" strokeWidth="2.6" />
              </g>
            ))}
          </g>

          <g {...hit('mito')}>
            <g data-floater><Mitochondrion cx={166} cy={162} w={76} h={26} angle={-18} fill={ref('mito')} active={selected === 'mito'} /></g>
            <g data-floater><Mitochondrion cx={472} cy={158} w={76} h={26} angle={26} fill={ref('mito')} active={selected === 'mito'} /></g>
            <g data-floater><Mitochondrion cx={438} cy={270} w={54} h={21} angle={-14} fill={ref('mito')} active={selected === 'mito'} /></g>
            <g data-floater><Mitochondrion cx={166} cy={254} w={58} h={22} angle={14} fill={ref('mito')} active={selected === 'mito'} /></g>
          </g>

          {/* SR: kantong penyimpan kalsium dengan cabang tubulus */}
          <g {...hit('sr')}>
            <g data-floater>
            <path d="M516 238c14-5 24-2 34 6M438 262c-12 3-22 2-32-5" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" fill="none" />
            <g transform="rotate(-14 478 251)">
              <rect x="438" y="239" width="80" height="24" rx="12" fill={ref('sr')} stroke={selected === 'sr' ? 'var(--action)' : '#E5A9A8'} strokeWidth="1.5" />
              {[450, 460, 497, 507].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 255 : 247} r="2.1" fill={CA} fillOpacity="0.78" />)}
            </g>
            </g>
          </g>

          {/* Inti: selubung, pori, kromatin, nukleolus */}
          <g {...hit('nucleus')}>
            <g data-floater>
            <ellipse cx="320" cy="200" rx="80" ry="54" fill={ref('nucleus')} stroke={selected === 'nucleus' ? 'var(--action)' : '#D98484'} strokeWidth="1.6" />
            <ellipse cx="320" cy="200" rx="75" ry="49.5" fill="none" stroke="#FBE0DC" strokeOpacity="0.8" />
            {PORES.map(p => <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="1.5" fill="#FBE7E3" />)}
            {CHROMATIN.map(c => <circle key={`${c.x}-${c.y}`} cx={c.x} cy={c.y} r={c.r} fill="#C76F75" fillOpacity="0.42" />)}
            <circle cx="352" cy="198" r="15" fill={ref('nucleolus')} />
            <circle cx="347" cy="192" r="3.6" fill="#FFFFFF" fillOpacity="0.32" />
            </g>
          </g>

          {/* Kesan jeli tembus pandang: cahaya tepi di dalam membran, bayangan lembut di bawah, dan kilap di atas */}
          <g clipPath={ref('body')} pointerEvents="none" aria-hidden="true">
            <path data-membrane d={BASE_PATH} fill="none" stroke="#7A2E36" strokeOpacity="0.07" strokeWidth="34" transform="translate(0 -12)" />
            <path data-membrane d={BASE_PATH} fill="none" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="26" />
            <ellipse cx="250" cy="118" rx="150" ry="30" fill={ref('gloss')} opacity="0.55" />
            <ellipse cx="196" cy="112" rx="34" ry="9" fill="#FFFFFF" opacity="0.5" />
          </g>

          {/* Membran: dua lapis, kepala fosfolipid sebagai titik */}
          <g {...hit('membrane')}>
            <path data-membrane d={BASE_PATH} fill="none" stroke="transparent" strokeWidth="16" pointerEvents="stroke" />
            <path data-membrane d={BASE_PATH} fill="none" stroke={selected === 'membrane' ? 'var(--action)' : '#E49A9A'} strokeWidth="8" pointerEvents="none" className={styles.lift} />
            <path data-membrane d={BASE_PATH} fill="none" stroke="#FFF6F3" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.1 5.4" pointerEvents="none" />
          </g>

          {HOTSPOTS.map(h => <Plus key={h.id} x={h.x} y={h.y} active={selected === h.id} />)}

          {/* Channel menembus membran */}
          {CHANNELS.map(c => {
            const active = selected === c.id;
            const top = c.edge < 200;
            const fill = ref(`ch-${c.id}`);
            const helix = [-16, -4, 8].map(o => `M${c.x - 16} ${c.edge + o + 5}l12 -5M${c.x + 4} ${c.edge + o + 5}l12 -5`).join('');
            return (
              <g key={c.id} data-edge-s={edgeS(c.x, top)} {...hit(c.id)} opacity={dim(c.id)}>
                <rect className={styles.focus} x={c.x - 44} y={c.edge - (top ? 66 : 38)} width="88" height="104" rx="16" fill="transparent" />
                {active && <circle className={styles.halo} cx={c.x} cy={c.edge} r="40" fill={c.color} fillOpacity="0.13" />}
                <ellipse cx={c.x} cy={c.edge} rx="27" ry="7" fill={c.dark} fillOpacity="0.2" />
                <rect x={c.x - 3} y={c.edge - 25} width="6" height="50" fill="#FFF3F0" fillOpacity="0.9" />
                <rect x={c.x - 18} y={c.edge - 28} width="15" height="56" rx="7.5" fill={fill} />
                <rect x={c.x + 3} y={c.edge - 28} width="15" height="56" rx="7.5" fill={fill} />
                <path d={helix} stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                {active && (
                  <>
                    <g transform={`translate(${c.x} ${c.edge})`} pointerEvents="none">
                      <circle className={styles.ion} r="4.2" fill="#fff" stroke={c.ion} strokeWidth="2.2" />
                      <circle className={styles.ion} r="4.2" fill="#fff" stroke={c.ion} strokeWidth="2.2" />
                      <circle className={styles.ion} r="4.2" fill="#fff" stroke={c.ion} strokeWidth="2.2" />
                    </g>
                    <path
                      d={`M${c.x + 29} ${c.edge - 10}v20m-5 -5l5 5l5 -5`}
                      stroke={c.ion} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    />
                  </>
                )}
                <text
                  x={c.x} y={top ? 46 : 368} textAnchor="middle" fontSize="17"
                  fontWeight={active ? 600 : 500} fill="var(--foreground)" fillOpacity={active ? 1 : 0.72}
                >
                  {c.label}
                </text>
              </g>
            );
          })}
          </g>

          {splash && (
            <g
              key={splash.key}
              transform={`translate(${splash.x.toFixed(1)} ${splash.y.toFixed(1)})`}
              filter={`url(#${uid}-goo)`}
              fill={splash.color}
              pointerEvents="none"
              className={styles.goo}
              aria-hidden="true"
            >
              <circle r="14" className={styles.gooCore} />
              {GOO_DROPS.map((d, i) => (
                <circle key={i} r={d.r} className={styles.gooDrop} style={{ '--a': `${d.angle}deg`, '--d': `${d.dist}px` } as React.CSSProperties} />
              ))}
            </g>
          )}
        </svg>

        <div aria-live="polite" className="min-w-0 md:min-h-[21rem] md:border-l md:border-foreground/10 md:pl-10 flex flex-col justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs text-foreground/60">{part.kind}</p>
              <h4 className="mt-1 text-xl md:text-2xl font-medium tracking-tight text-foreground">{part.title}</h4>
              <p className="mt-0.5 text-sm text-foreground/60">{part.subtitle}</p>
              <p className="mt-4 text-sm md:text-base text-foreground/80 leading-relaxed">{part.text}</p>
              {part.flow && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: part.flow.color }} aria-hidden="true" />
                  {part.flow.text}
                </p>
              )}

              {part.biomarkers.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-foreground/60">Related biomarkers in this result</p>
                  <ul className="mt-1">
                    {part.biomarkers.map(key => {
                      const i = FEATURES.indexOf(key);
                      const strong = isStrongChange(key, ratios[i]);
                      return (
                        <li key={key} className="flex items-baseline justify-between gap-3 py-2 border-b border-foreground/8 last:border-b-0 text-sm">
                          <span className="min-w-0 truncate">
                            <span className="font-medium text-foreground">{key}</span>
                            <span className="ml-2 text-xs text-foreground/60">{SHORT_DESC[key]}</span>
                          </span>
                          <span className={`shrink-0 font-mono tabular-nums ${strong ? 'text-accent font-semibold' : 'text-foreground/75'}`}>
                            {formatChange(ratioChange(ratios[i], control?.[key]))}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
