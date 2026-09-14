'use client';
import { useState, type PointerEvent, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;

const PHASE_DATA = [
  { label: 'Phase I → II', withB: 52.4, withoutB: 52.0 },
  { label: 'Phase II → III', withB: 46.3, withoutB: 28.3 },
  { label: 'Phase III → NDA', withB: 68.2, withoutB: 57.1 },
  { label: 'NDA → Approval', withB: 96.0, withoutB: 90.3 },
  { label: 'Phase I → Approval', withB: 15.9, withoutB: 7.6 },
];

const COST_DATA = [
  { year: 2013, cost: 1.30 }, { year: 2014, cost: 1.35 }, { year: 2015, cost: 1.51 },
  { year: 2016, cost: 1.51 }, { year: 2017, cost: 1.82 }, { year: 2018, cost: 2.20 },
  { year: 2019, cost: 2.43 }, { year: 2020, cost: 2.36 }, { year: 2021, cost: 1.99 },
  { year: 2022, cost: 2.28 }, { year: 2023, cost: 2.21 }, { year: 2024, cost: 2.23 },
];

export const AttritionChart = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const scale = 1.6;
  const baseline = 200;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-foreground/5">
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted">Pipeline Survival Rate</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-foreground">
            <span className="w-2 h-2 bg-accent rounded-full" /> Biomarker-guided
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted">
            <span className="w-2 h-2 bg-foreground/20 rounded-full" /> Conventional
          </span>
        </div>
      </div>

      <svg viewBox="-20 0 640 230" className="w-full h-auto overflow-visible" onMouseLeave={() => setActiveIdx(null)}>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = baseline - v * scale;
          return (
            <g key={v}>
              <line x1={0} y1={y} x2={620} y2={y} className="stroke-foreground/6" strokeWidth="1" strokeDasharray={v === 0 ? 'none' : '2 4'} />
              <text x={-10} y={y + 3} textAnchor="end" className="fill-muted text-[9px] font-mono">{v}%</text>
            </g>
          );
        })}

        {PHASE_DATA.map((d, i) => {
          const gx = 45 + i * 115;
          const hWith = d.withB * scale;
          const hWithout = d.withoutB * scale;
          const isFaded = activeIdx !== null && activeIdx !== i;
          const isActive = activeIdx === i;

          return (
            <g
              key={d.label}
              tabIndex={0}
              role="button"
              aria-label={`${d.label}: ${d.withB}% with biomarkers, ${d.withoutB}% conventional`}
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
              onBlur={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(i)}
              className="cursor-pointer transition-opacity duration-300 focus-visible:outline-none"
              style={{ opacity: isFaded ? 0.3 : 1 }}
            >
              <rect x={gx - 10} y={10} width={80} height={210} fill="transparent" />

              {isActive && (
                <rect x={gx - 10} y={10} width={80} height={210} className="fill-foreground/3" rx={6} />
              )}

              <motion.rect
                x={gx}
                y={baseline - hWith}
                width={20}
                height={hWith}
                className="fill-accent"
                style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: luxEase, delay: i * 0.08 }}
              />
              <motion.rect
                x={gx + 22}
                y={baseline - hWithout}
                width={20}
                height={hWithout}
                className="fill-foreground/12"
                style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: luxEase, delay: i * 0.08 + 0.06 }}
              />

              <text x={gx + 21} y={baseline + 20} textAnchor="middle" className="fill-foreground font-medium text-[9px]">{d.label}</text>
              <text x={gx + 10} y={baseline - hWith - 8} textAnchor="middle" className="fill-accent font-mono text-[9.5px] font-semibold">{d.withB}%</text>
              <text x={gx + 32} y={baseline - hWithout - 8} textAnchor="middle" className="fill-muted font-mono text-[9.5px]">{d.withoutB}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const CostTimeline = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const w = 640;
  const h = 220;
  const paddingY = 30;
  const paddingX = 20;
  const maxCost = 2.6;
  const minCost = 1.0;

  const mapX = (idx: number) => paddingX + (idx / (COST_DATA.length - 1)) * (w - paddingX * 2);
  const mapY = (cost: number) => h - paddingY - ((cost - minCost) / (maxCost - minCost)) * (h - paddingY * 2);

  let linePath = `M ${mapX(0)} ${mapY(COST_DATA[0].cost)}`;
  let areaPath = `M ${mapX(0)} ${h - paddingY} L ${mapX(0)} ${mapY(COST_DATA[0].cost)}`;

  COST_DATA.forEach((d, i) => {
    if (i > 0) {
      linePath += ` L ${mapX(i)} ${mapY(d.cost)}`;
      areaPath += ` L ${mapX(i)} ${mapY(d.cost)}`;
    }
  });
  areaPath += ` L ${mapX(COST_DATA.length - 1)} ${h - paddingY} Z`;

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (x - paddingX) / (rect.width - paddingX * 2)));
    const idx = Math.round(ratio * (COST_DATA.length - 1));
    setHoveredIdx(Math.max(0, Math.min(COST_DATA.length - 1, idx)));
  };

  const handleKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const current = hoveredIdx ?? COST_DATA.length - 1;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setHoveredIdx(Math.max(0, current - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setHoveredIdx(Math.min(COST_DATA.length - 1, current + 1));
    }
  };

  const activeIdx = hoveredIdx !== null ? hoveredIdx : COST_DATA.length - 1;
  const activeData = COST_DATA[activeIdx];
  const activeX = mapX(activeIdx);
  const activeY = mapY(activeData.cost);

  return (
    <div className="w-full relative">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-foreground/5 h-10">
        <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted transition-colors duration-300">
          Selected: {activeData.year}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light text-foreground tabular-nums tracking-tight">
            ${activeData.cost.toFixed(2)}B
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent">Per Drug</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto cursor-crosshair overflow-visible touch-none focus-visible:outline-none"
        tabIndex={0}
        role="slider"
        aria-valuemin={COST_DATA[0].year}
        aria-valuemax={COST_DATA[COST_DATA.length - 1].year}
        aria-valuenow={activeData.year}
        aria-valuetext={`${activeData.year}: $${activeData.cost.toFixed(2)} billion`}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredIdx(null)}
        onKeyDown={handleKeyDown}
      >
        <defs>
          <linearGradient id="costArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[1.0, 1.5, 2.0, 2.5].map((val) => (
          <g key={val}>
            <line x1={0} y1={mapY(val)} x2={w} y2={mapY(val)} className="stroke-foreground/5" strokeWidth="1" strokeDasharray="3 4" />
            <text x={0} y={mapY(val) - 4} className="fill-muted/50 text-[9px] font-mono">${val.toFixed(1)}B</text>
          </g>
        ))}

        <text x={mapX(0)} y={h} textAnchor="start" className="fill-muted text-[9px] font-mono">2013</text>
        <text x={mapX(6)} y={h} textAnchor="middle" className="fill-accent font-medium text-[9px] font-mono">2019 (Peak)</text>
        <text x={mapX(11)} y={h} textAnchor="end" className="fill-muted text-[9px] font-mono">2024</text>

        <motion.path
          d={areaPath} fill="url(#costArea)"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.2 }}
        />
        <motion.path
          d={linePath} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/40" strokeLinejoin="round" strokeLinecap="round"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: luxEase }}
        />

        <g className="transition-transform duration-150 ease-out" style={{ transform: `translate(${activeX}px, 0)` }}>
          <line x1={0} y1={paddingY - 10} x2={0} y2={h - paddingY + 10} className="stroke-accent opacity-50" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx={0} cy={activeY} r={4} className="fill-accent" />
          <circle cx={0} cy={activeY} r={12} className="fill-accent opacity-15" />
        </g>
      </svg>
    </div>
  );
};