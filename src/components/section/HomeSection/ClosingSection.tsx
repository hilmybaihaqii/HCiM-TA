'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import Link from 'next/link';
import { MAP_VIEWBOX, WORLD_DOTS, NODES, ROUTES, AMBIENT_NODES, NodeKey } from '@/data/world-map-data';

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
   REUSABLE COMPONENT: ROLLING BUTTON (Strict / No Shadow)
   ========================================================= */
const RollingButton = ({ title, href, primary = false }: { title: string; href: string; primary?: boolean }) => {
  return (
    <Link
      href={href}
      className={`group relative flex items-center justify-center px-10 py-5 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden ${
        primary
          ? 'bg-foreground text-background hover:bg-accent hover:text-white'
          : 'bg-transparent border border-foreground/20 text-foreground hover:border-foreground'
      }`}
      style={{ borderRadius: '9999px' }}
    >
      <span className="relative flex flex-col h-[1.2em] overflow-hidden">
        <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
          {title}
        </span>
        <span className="absolute top-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
          {title}
        </span>
      </span>

      {primary && (
        <svg
          className="w-4 h-4 ml-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )}
    </Link>
  );
};

/* =========================================================
   ARC PATH HELPER
   Builds a single quadratic bezier that always bows "upward"
   (toward smaller y), independent of where the two nodes sit
   relative to each other — reads as a flight-path arc rather
   than a straight line or a random curve.
   ========================================================= */
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

/* =========================================================
   ROUTE — a single drawn arc + destination marker + a slow
   traveling square that rides the path (native SVG animateMotion,
   not a pulsing radar ring).
   ========================================================= */
const Route = ({ from, to, delay }: { from: NodeKey; to: NodeKey; delay: number }) => {
  const a = NODES[from];
  const b = NODES[to];
  const d = arcPath(a.x, a.y, b.x, b.y);
  const gradId = `route-fade-${from}-${to}`;

  return (
    <g>
      <defs>
        {/* Fades the line in near Jakarta and out near the destination —
            reads as a flight path instead of a hard-edged stroke. */}
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.05} />
          <stop offset="18%" stopColor="currentColor" stopOpacity={0.55} />
          <stop offset="85%" stopColor="currentColor" stopOpacity={0.55} />
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
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 1.6, ease: luxEase, delay }}
      />

      <motion.rect
        x={b.x - 3.5}
        y={b.y - 3.5}
        width={7}
        height={7}
        className="fill-background stroke-foreground/60"
        strokeWidth={1.25}
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.5, ease: luxEase, delay: delay + 1.3 }}
        style={{ transformOrigin: `${b.x}px ${b.y}px` }}
      />

      <motion.rect
        width={3.5}
        height={3.5}
        className="fill-accent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0 }}
        transition={{ delay: delay + 1.3, duration: 0.4 }}
      >
        <animateMotion
          path={d}
          dur={`${6 + delay}s`}
          begin={`${delay + 1.3}s`}
          repeatCount="indefinite"
          rotate="auto"
        />
      </motion.rect>
    </g>
  );
};

/* =========================================================
   AMBIENT LAYER — quiet, unlabeled pulses spread across every
   continent. Purely decorative texture so the map reads as "a
   connected world" instead of "six scattered pins." No lines,
   no labels, no claims — see the comment on AMBIENT_NODES in
   world-map-data.ts before adding to this list.
   ========================================================= */
const AmbientDots = () => (
  <>
    {AMBIENT_NODES.map((n, i) => (
      <motion.circle
        key={i}
        cx={n.x}
        cy={n.y}
        r={1.6}
        className="fill-foreground/25"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.6, 0.25] }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 2, delay: 0.4 + (i % 7) * 0.15, ease: luxEase }}
      />
    ))}
  </>
);

/* =========================================================
   MAIN SECTION: GLOBAL ACCESS
   ========================================================= */
export default function CTASection() {
  const jakarta = NODES.jakarta;
  // 460 / 1000 as a percentage, used for the bulletproof padding-box
  // technique below instead of relying solely on the `aspect-ratio` CSS
  // property (which needs a bracketed Tailwind value — `aspect-1000/460`
  // silently fails to compile — and which some mobile WebViews still
  // handle inconsistently inside flex layouts). The padding-top trick
  // works identically on every browser, so the map can never collapse to
  // zero height again.
  const mapAspectPercent = (460 / 1000) * 100;

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

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center">

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
          className="mt-8 mb-16 md:mb-20 text-sm md:text-base text-muted max-w-lg leading-relaxed bg-background/50 backdrop-blur-[2px]"
        >
          Every simulation, biomarker, and SHAP-audited classification runs on
          the same pipeline — whether it&apos;s called from a lab in Jakarta or a
          clinic on the other side of the world.
        </motion.p>

        {/* World Map — bulletproof responsive wrapper.
            The outer div's height is driven by padding-top (a percentage
            of its own width), which every browser computes the same way,
            mobile included. The inner div is absolutely positioned to
            fill that box, and the SVG scales via viewBox as before. */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0 }}
          transition={{ duration: 1.2, ease: luxEase }}
          className="relative w-full max-w-7xl mb-16 md:mb-20"
          style={{ paddingTop: `${mapAspectPercent}%` }}
        >
          <div className="absolute inset-0">
            <svg viewBox={MAP_VIEWBOX} className="w-full h-full overflow-visible" aria-hidden preserveAspectRatio="xMidYMid meet">
              {/* Land silhouette — one path, generated offline */}
              <motion.path
                d={WORLD_DOTS}
                className="fill-foreground/[0.24]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 1.4, ease: luxEase }}
              />

              {/* Ambient global texture — decorative only, see AmbientDots */}
              <AmbientDots />

              {/* Routes out of Jakarta */}
              {ROUTES.map((key, i) => (
                <Route key={key} from="jakarta" to={key} delay={0.3 + i * 0.22} />
              ))}

              {/* Origin node */}
              <motion.g
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.6, ease: luxEase, delay: 0.15 }}
                style={{ transformOrigin: `${jakarta.x}px ${jakarta.y}px` }}
              >
                <rect
                  x={jakarta.x - 7}
                  y={jakarta.y - 7}
                  width={14}
                  height={14}
                  className="fill-none stroke-foreground/40"
                  strokeWidth={1.25}
                />
                <rect
                  x={jakarta.x - 3}
                  y={jakarta.y - 3}
                  width={6}
                  height={6}
                  className="fill-accent"
                />
              </motion.g>

            </svg>
          </div>

          {/* Node labels as an HTML overlay, not native SVG <text>.
              SVG <text> font-size is measured in viewBox user-units, so it
              scales DOWN with the container — fine on a ~1200px desktop
              container, but on a ~360px mobile width the same units render
              at a third of the size (unreadably thin). Positioning plain
              HTML spans by percentage keeps the CSS font-size in real px
              at every breakpoint. */}
          <div className="absolute inset-0 pointer-events-none">
            <span
              className="absolute -translate-x-1/2 -translate-y-full font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground whitespace-nowrap"
              style={{
                left: `${(jakarta.x / 1000) * 100}%`,
                top: `${(jakarta.y / 460) * 100 - 2}%`,
              }}
            >
              {jakarta.label}
            </span>
            {ROUTES.map((key) => {
              const n = NODES[key];
              const above = n.y > 40;
              return (
                <span
                  key={key}
                  className={`absolute -translate-x-1/2 font-mono text-[9px] sm:text-[10px] tracking-[0.12em] uppercase text-foreground/55 whitespace-nowrap ${
                    above ? '-translate-y-full' : ''
                  }`}
                  style={{
                    left: `${(n.x / 1000) * 100}%`,
                    top: `${(n.y / 460) * 100 + (above ? -1.5 : 2.5)}%`,
                  }}
                >
                  {n.label}
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.4, ease: luxEase }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <div className="w-full sm:w-auto">
            <RollingButton title="Create Account" href="/register" primary />
          </div>
          <div className="w-full sm:w-auto">
            <RollingButton title="Log In" href="/login" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}