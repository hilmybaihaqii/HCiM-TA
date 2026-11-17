'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform, MotionValue } from 'framer-motion';
import BubbleLink from '@/components/ui/BubbleLink';
import { WORLD_DOTS, NODES, ROUTES, AMBIENT_NODES, NodeKey } from '@/data/world-map-data';

const luxEase = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   TEXT REVEAL COMPONENT
   ========================================================= */
const RevealText = ({ children }: { children: string }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 95%', 'center 50%'] });
  const words = children.split(' ');

  return (
    <p ref={containerRef} className="flex flex-wrap justify-center text-3xl sm:text-5xl md:text-6xl lg:text-[72px] font-medium tracking-tighter text-foreground leading-[1.1] md:leading-[1.05]">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

const Word = ({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  const y = useTransform(progress, range, [12, 0]);

  return (
    <span className="mr-[1.5vw] md:mr-4 mb-1 md:mb-2 relative inline-block">
      <span className="absolute opacity-0">{children}</span>
      <motion.span style={{ opacity, y }} className="inline-block text-foreground">
        {children}
      </motion.span>
    </span>
  );
};

/* =========================================================
   PETA
   Peta utuh di semua ukuran layar. Nama negara selalu menempel di titiknya: peta ini
   menggambarkan bahwa Cardivex bisa dibuka dari mana saja, bukan daftar kantor.
   ========================================================= */
const MAP = { w: 1000, h: 460 };

function arcPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy) || 1;
  const bow = dist * 0.22;

  let nx = -dy / dist;
  let ny = dx / dist;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }

  const cx = mx + nx * bow;
  const cy = my + ny * bow;

  return `M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}

/** Garis dari Jakarta: tergambar saat terlihat, lalu titik kecil terus berjalan di atasnya. */
const Route = ({ from, to, delay, live }: { from: NodeKey; to: NodeKey; delay: number; live: boolean }) => {
  const a = NODES[from];
  const b = NODES[to];
  const d = arcPath(a.x, a.y, b.x, b.y);
  const gradId = `route-fade-${from}-${to}`;
  const dur = 3.2 + (delay % 1) * 1.4;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.05} />
          <stop offset="18%" stopColor="currentColor" stopOpacity={0.5} />
          <stop offset="85%" stopColor="currentColor" stopOpacity={0.5} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.15} />
        </linearGradient>
      </defs>

      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={1.25}
        strokeLinecap="round"
        className="text-foreground/70"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={live ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.6, ease: luxEase, delay }}
      />

      {/* titik berjalan: masuk pelan, keluar pelan, berulang */}
      {live && (
        <circle r={2.6} className="fill-accent" opacity={0}>
          <animateMotion dur={`${dur}s`} begin={`${delay + 1.4}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
          <animate attributeName="opacity" dur={`${dur}s`} begin={`${delay + 1.4}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.15;0.8;1" />
        </circle>
      )}

      <motion.circle
        cx={b.x}
        cy={b.y}
        r={4}
        className="fill-background stroke-foreground/60"
        strokeWidth={1.25}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={live ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.5, ease: luxEase, delay: delay + 1.3 }}
        style={{ transformOrigin: `${b.x}px ${b.y}px` }}
      />
    </g>
  );
};

const AmbientDots = ({ live }: { live: boolean }) => (
  <>
    {AMBIENT_NODES.map((n, i) => (
      <circle
        key={i}
        cx={n.x}
        cy={n.y}
        r={1.7}
        className={`fill-foreground/30 ${live ? 'map-twinkle' : 'opacity-0'}`}
        style={{ animationDelay: `${(i % 9) * 0.45}s` }}
      />
    ))}
  </>
);

function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useInView(ref, { once: true, amount: 0.3 });
  const jakarta = NODES.jakarta;
  const pos = (x: number, y: number) => ({ left: `${(x / MAP.w) * 100}%`, top: `${(y / MAP.h) * 100}%` });
  // Label di dekat tepi kiri/kanan disejajarkan ke dalam supaya tidak keluar layar (terutama di HP).
  const alignX = (x: number) => (x / MAP.w > 0.86 ? '-100%' : x / MAP.w < 0.14 ? '0%' : '-50%');

  return (
    <div ref={ref} className="relative w-full max-w-7xl">
      {/* peta utuh; di HP dibuat selebar layar (keluar dari padding) supaya titiknya lebih besar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={live ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.4, ease: luxEase }}
        className="relative -mx-6 w-[calc(100%+3rem)] md:mx-0 md:w-full"
        style={{ paddingTop: `${(MAP.h / MAP.w) * 100}%` }}
      >
        <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden preserveAspectRatio="xMidYMid meet">
          <path d={WORLD_DOTS} className="fill-foreground/20" />
          <AmbientDots live={live} />
          {ROUTES.map((key, i) => (
            <Route key={key} from="jakarta" to={key} delay={0.3 + i * 0.22} live={live} />
          ))}

          {/* Jakarta: titik rumah dengan denyut cincin yang terus berulang */}
          <g>
            {live && (
              <>
                <circle cx={jakarta.x} cy={jakarta.y} r={6} className="map-beacon fill-accent/30" />
                <circle cx={jakarta.x} cy={jakarta.y} r={6} className="map-beacon fill-accent/30" style={{ animationDelay: '1.2s' }} />
              </>
            )}
            <circle cx={jakarta.x} cy={jakarta.y} r={9} className="fill-background stroke-foreground/40" strokeWidth={1.25} />
            <circle cx={jakarta.x} cy={jakarta.y} r={4} className="fill-accent" />
          </g>
        </svg>

        {/* label negara menempel di titiknya, di desktop maupun HP */}
        <div className="pointer-events-none absolute inset-0">
          {/* pembungkus biasa = posisi; motion.span di dalamnya = animasi (framer menimpa transform) */}
          <span className="absolute" style={{ ...pos(jakarta.x, jakarta.y), transform: `translate(${alignX(jakarta.x)}, calc(-100% - 12px))` }}>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={live ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: luxEase, delay: 0.4 }}
              className="block whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[9px] font-medium text-surface-white md:px-3 md:py-1 md:text-[11px]"
            >
              {jakarta.label} · we are here
            </motion.span>
          </span>
          {ROUTES.map((key, i) => {
            const n = NODES[key];
            const above = n.y > 140;
            return (
              <span key={key} className="absolute" style={{ ...pos(n.x, n.y), transform: `translate(${alignX(n.x)}, ${above ? 'calc(-100% - 8px)' : '8px'})` }}>
                <motion.span
                  initial={{ opacity: 0, y: above ? 6 : -6 }}
                  animate={live ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.6, ease: luxEase, delay: 1.5 + i * 0.22 }}
                  className="block whitespace-nowrap rounded-full border border-foreground/10 bg-background/85 px-1.5 py-px text-[8px] text-foreground/80 backdrop-blur-sm md:px-2.5 md:py-0.5 md:text-[10px]"
                >
                  {n.label}
                </motion.span>
              </span>
            );
          })}
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes map-beacon {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(3.6); opacity: 0; }
        }
        @keyframes map-twinkle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.9; }
        }
        .map-beacon {
          transform-box: fill-box;
          transform-origin: center;
          animation: map-beacon 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .map-twinkle {
          animation: map-twinkle 3.6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .map-beacon, .map-twinkle { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   MAIN SECTION: GLOBAL ACCESS
   ========================================================= */
export default function CTASection() {
  return (
    <section className="relative w-full bg-background font-sans overflow-hidden pt-32 md:pt-48 pb-24 md:pb-40 flex flex-col items-center justify-center min-h-[70vh]">

      {/* Film-grain texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col items-center text-center">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: luxEase }}
          className="flex items-center gap-4 mb-10 md:mb-14 bg-background px-4 py-1"
        >
          <div className="w-1.5 h-1.5 bg-accent" />
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-muted font-semibold">
            04 — Global Access
          </span>
          <div className="w-1.5 h-1.5 bg-accent" />
        </motion.div>

        {/* Kinetic Headline */}
        <div className="max-w-7xl px-4 bg-background/50 backdrop-blur-[2px]">
          <RevealText>One digital lab. No borders, no downtime.</RevealText>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: luxEase }}
          className="mt-8 mb-14 md:mb-20 text-sm md:text-base text-muted max-w-lg leading-relaxed bg-background/50 backdrop-blur-[2px]"
        >
          Every simulation, biomarker, and SHAP-audited classification runs on
          the same pipeline — whether it&apos;s called from a lab in Jakarta or a
          clinic on the other side of the world.
        </motion.p>

        <div className="mb-14 flex w-full justify-center md:mb-20">
          <WorldMap />
        </div>

        {/* Tombol: efek gelembung yang sama dengan hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.2, ease: luxEase }}
          className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto"
        >
          <BubbleLink href="/register" primary>
            Create account
          </BubbleLink>
          <BubbleLink href="/login">Log in</BubbleLink>
        </motion.div>

      </div>
    </section>
  );
}
