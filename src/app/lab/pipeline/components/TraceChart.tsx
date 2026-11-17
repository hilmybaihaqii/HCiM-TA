'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type Series = { x: number[]; y: number[]; color: string; dashed?: boolean; label: string };

/** Padding plot (px). Kiri cukup untuk label sumbu Y. */
const P = { l: 48, r: 16, t: 16, b: 30 };

const fmtTick = (v: number) => {
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
};

/** Tick "bulat" untuk rentang [lo, hi] */
function niceTicks(lo: number, hi: number, count = 5): number[] {
  const span = hi - lo || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}

/** Index titik terdekat ke t (array waktu terurut) */
function nearestIndex(xs: number[], t: number): number {
  let lo = 0, hi = xs.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] < t) lo = mid; else hi = mid;
  }
  return Math.abs(xs[lo] - t) <= Math.abs(xs[hi] - t) ? lo : hi;
}

/**
 * Line chart inline SVG tanpa dependency (recharts sengaja dihapus dari proyek).
 * Interaktif: crosshair + tooltip semua seri, drag untuk zoom sumbu waktu.
 * State hover/zoom/legend dipegang parent supaya dua chart (AP & kalsium) sinkron.
 */
export default function TraceChart({
  series, unit, domain, onZoom, hoverT, onHover, hidden, focus, height = 233, label, digits = 1,
}: {
  series: Series[];
  unit: string;
  domain: [number, number];
  onZoom: (d: [number, number]) => void;
  hoverT: number | null;
  onHover: (t: number | null) => void;
  hidden: Set<string>;
  focus: string | null;
  height?: number;
  label: string;
  digits?: number;
}) {
  const [width, setWidth] = useState(640);
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);

  // Ukur lebar asli supaya teks SVG tidak ikut terskala. Diukur langsung saat elemen terpasang
  // (render pertama sudah pas di ponsel), lalu diikuti ResizeObserver.
  const roRef = useRef<ResizeObserver | null>(null);
  const wrapRef = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    if (!el) return;
    setWidth(Math.max(260, el.getBoundingClientRect().width));
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, entry.contentRect.width)));
    ro.observe(el);
    roRef.current = ro;
  }, []);
  useEffect(() => () => roRef.current?.disconnect(), []);

  const H = height;
  const [x0, x1] = domain;
  const visible = useMemo(() => series.filter(s => !hidden.has(s.label)), [series, hidden]);

  const { yMin, yMax, yTicks } = useMemo(() => {
    let lo = Infinity, hi = -Infinity;
    for (const s of visible) {
      for (let i = 0; i < s.x.length; i++) {
        if (s.x[i] < x0 || s.x[i] > x1) continue;
        const y = s.y[i];
        if (!Number.isFinite(y)) continue;
        if (y < lo) lo = y;
        if (y > hi) hi = y;
      }
    }
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    const pad = (hi - lo) * 0.06 || 1;
    const ticks = niceTicks(lo - pad, hi + pad, 4);
    return { yMin: lo - pad, yMax: hi + pad, yTicks: ticks };
  }, [visible, x0, x1]);

  const sx = (x: number) => P.l + ((x - x0) / (x1 - x0)) * (width - P.l - P.r);
  const sy = (y: number) => P.t + (1 - (y - yMin) / (yMax - yMin)) * (H - P.t - P.b);
  const invX = (px: number) => x0 + ((px - P.l) / (width - P.l - P.r)) * (x1 - x0);

  const paths = useMemo(() => series.map(s => {
    let d = '';
    for (let i = 0; i < s.x.length; i++) {
      const x = s.x[i];
      // Satu titik di luar domain di tiap sisi supaya garis tidak terputus di tepi
      if (x < x0 && s.x[i + 1] !== undefined && s.x[i + 1] < x0) continue;
      if (x > x1 && s.x[i - 1] !== undefined && s.x[i - 1] > x1) break;
      const y = s.y[i];
      if (!Number.isFinite(y)) continue;
      const px = P.l + ((x - x0) / (x1 - x0)) * (width - P.l - P.r);
      const py = P.t + (1 - (y - yMin) / (yMax - yMin)) * (H - P.t - P.b);
      d += `${d ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
    }
    return { label: s.label, d };
  }), [series, x0, x1, width, yMin, yMax, H]);

  const xTicks = niceTicks(x0, x1, width < 480 ? 4 : 6);

  /* ---------- pointer ---------- */
  const localX = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    return Math.min(Math.max(e.clientX - rect.left, P.l), width - P.r);
  };

  const onPointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const px = localX(e);
    onHover(invX(px));
    if (drag) setDrag({ ...drag, to: px });
  };
  const onPointerDown = (e: React.PointerEvent<SVGRectElement>) => {
    if (e.pointerType === 'touch') return; // di layar sentuh: tap = baca nilai, tanpa zoom
    e.currentTarget.setPointerCapture(e.pointerId);
    const px = localX(e);
    setDrag({ from: px, to: px });
  };
  const onPointerUp = () => {
    if (drag && Math.abs(drag.to - drag.from) > 8) {
      const a = invX(Math.min(drag.from, drag.to));
      const b = invX(Math.max(drag.from, drag.to));
      if (b - a >= 10) onZoom([Math.round(a), Math.round(b)]);
    }
    setDrag(null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = (x1 - x0) / 100;
    if (e.key === 'ArrowRight') { e.preventDefault(); onHover(Math.min(x1, (hoverT ?? x0) + step)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); onHover(Math.max(x0, (hoverT ?? x0) - step)); }
    if (e.key === 'Escape') onHover(null);
  };

  /* ---------- tooltip ---------- */
  const showHover = hoverT !== null && hoverT >= x0 && hoverT <= x1;
  const readout = showHover
    ? visible.map(s => {
        const i = nearestIndex(s.x, hoverT!);
        return { label: s.label, color: s.color, dashed: s.dashed, t: s.x[i], y: s.y[i] };
      })
    : [];
  const hx = showHover ? sx(readout[0]?.t ?? hoverT!) : 0;
  const tipOnLeft = hx > width * 0.62;

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        width={width}
        height={H}
        role="img"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onBlur={() => onHover(null)}
        className="block text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded-control"
      >
        {/* Grid & sumbu: tipis dan resesif */}
        {yTicks.map(t => (
          <g key={`y${t}`}>
            <line x1={P.l} x2={width - P.r} y1={sy(t)} y2={sy(t)} className="stroke-current" strokeOpacity={0.06} />
            <text x={P.l - 8} y={sy(t) + 3.5} textAnchor="end" fontSize={10} className="fill-current font-mono" fillOpacity={0.45}>
              {fmtTick(t)}
            </text>
          </g>
        ))}
        {xTicks.map(t => (
          <text key={`x${t}`} x={sx(t)} y={H - 10} textAnchor="middle" fontSize={10} className="fill-current font-mono" fillOpacity={0.45}>
            {Math.round(t)}
          </text>
        ))}
        <text x={P.l - 8} y={H - 10} textAnchor="end" fontSize={10} className="fill-current font-mono" fillOpacity={0.45}>ms</text>
        <line x1={P.l} x2={width - P.r} y1={H - P.b} y2={H - P.b} className="stroke-current" strokeOpacity={0.15} />
        <text x={P.l - 8} y={P.t - 4} textAnchor="end" fontSize={10} className="fill-current font-mono" fillOpacity={0.45}>{unit}</text>

        <defs>
          <clipPath id={`clip-${label.replace(/\W/g, '')}`}>
            <rect x={P.l} y={P.t - 2} width={width - P.l - P.r} height={H - P.t - P.b + 4} />
          </clipPath>
        </defs>

        <g clipPath={`url(#clip-${label.replace(/\W/g, '')})`}>
          {paths.map(p => {
            const s = series.find(x => x.label === p.label)!;
            if (hidden.has(p.label)) return null;
            const dim = focus !== null && focus !== p.label;
            return (
              <path
                key={p.label}
                d={p.d}
                fill="none"
                stroke={s.color}
                strokeWidth={focus === p.label ? 2.5 : s.dashed ? 1.5 : 2}
                strokeDasharray={s.dashed ? '5 4' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={dim ? 0.15 : 1}
                style={{ transition: 'opacity 200ms' }}
              />
            );
          })}
        </g>

        {/* Crosshair + titik di tiap seri */}
        {showHover && (
          <g pointerEvents="none">
            <line x1={hx} x2={hx} y1={P.t} y2={H - P.b} className="stroke-current" strokeOpacity={0.35} />
            {readout.map(r => Number.isFinite(r.y) && (
              <circle key={r.label} cx={sx(r.t)} cy={sy(r.y)} r={4} fill={r.color} stroke="var(--surface-white)" strokeWidth={2} />
            ))}
          </g>
        )}

        {/* Seleksi zoom */}
        {drag && Math.abs(drag.to - drag.from) > 2 && (
          <rect
            x={Math.min(drag.from, drag.to)} y={P.t}
            width={Math.abs(drag.to - drag.from)} height={H - P.t - P.b}
            fill="var(--accent-red)" fillOpacity={0.08} stroke="var(--accent-red)" strokeOpacity={0.4} strokeDasharray="3 3"
            pointerEvents="none"
          />
        )}

        {/* Area hit: seluruh plot, lebih besar dari garisnya */}
        <rect
          x={P.l} y={P.t} width={width - P.l - P.r} height={H - P.t - P.b}
          fill="transparent"
          className="cursor-crosshair"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => { if (!drag) onHover(null); }}
        />
      </svg>

      {/* Tooltip: nilai di depan (kuat), label di belakang */}
      {showHover && readout.length > 0 && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-40 rounded-card border border-foreground/10 bg-surface-white/95 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.08)] px-3 py-2.5"
          style={tipOnLeft ? { right: width - hx + 12 } : { left: hx + 12 }}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted mb-1.5">
            {Math.round(readout[0].t)} ms · {unit}
          </div>
          <ul className="flex flex-col gap-1">
            {readout.map(r => (
              <li key={r.label} className="flex items-center gap-2 text-xs">
                <svg width="14" height="4" aria-hidden="true" className="shrink-0">
                  <line x1="0" y1="2" x2="14" y2="2" stroke={r.color} strokeWidth="2" strokeDasharray={r.dashed ? '3 2' : undefined} />
                </svg>
                <span className="font-mono font-medium text-foreground tabular-nums">
                  {Number.isFinite(r.y) ? r.y.toFixed(digits) : '—'}
                </span>
                <span className="text-muted">{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
