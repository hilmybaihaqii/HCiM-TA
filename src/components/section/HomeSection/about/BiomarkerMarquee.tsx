'use client';

import { motion } from 'framer-motion';

/* 11 biomarker yang dibaca model, dikelompokkan supaya pengunjung awam tahu tiap angka itu soal apa. */
const GROUPS = {
  charge: { label: 'Charge', dot: 'bg-accent' },
  voltage: { label: 'Voltage', dot: 'bg-foreground/50' },
  timing: { label: 'Timing', dot: 'bg-amber' },
  calcium: { label: 'Calcium', dot: 'bg-teal' },
} as const;

const BIOMARKERS: { name: string; group: keyof typeof GROUPS }[] = [
  { name: 'qNet', group: 'charge' },
  { name: 'dV/dt Max', group: 'voltage' },
  { name: 'V Max', group: 'voltage' },
  { name: 'V Rest', group: 'voltage' },
  { name: 'Max dV', group: 'voltage' },
  { name: 'APD50', group: 'timing' },
  { name: 'APD90', group: 'timing' },
  { name: 'Ca Max', group: 'calcium' },
  { name: 'Ca Rest', group: 'calcium' },
  { name: 'CaTD50', group: 'calcium' },
  { name: 'CaTD90', group: 'calcium' },
];

/** Pita berjalan berisi 11 biomarker. Berhenti saat di-hover; diam (dan membungkus) bila reduced motion. */
export default function BiomarkerMarquee() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 md:py-28"
    >
      <div className="mx-auto mb-10 md:mb-14 flex w-full max-w-7xl flex-col items-center gap-4 px-6 text-center md:px-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">What the model reads</p>
        <p className="max-w-md text-sm md:text-base text-muted leading-relaxed">
          Every simulated heartbeat gives 11 measurements. Cardivex looks at all of them together.
        </p>
      </div>

      <div className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <ul className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
          {[...BIOMARKERS, ...BIOMARKERS].map((b, i) => (
            <li
              key={i}
              aria-hidden={i >= BIOMARKERS.length}
              // Hover: item yang ditunjuk menebal & naik, label kelompoknya bergeser dan garis bawahnya tergambar.
              className="group/item flex shrink-0 cursor-default flex-col items-start gap-3 px-8 md:px-14 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-40 hover:!opacity-100"
            >
              <span className="whitespace-nowrap text-[2rem] md:text-[2.75rem] font-medium leading-none tracking-[-0.02em] text-foreground/85 transition-[transform,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:-translate-y-1 group-hover/item:text-foreground">
                {b.name}
              </span>
              <span className="relative flex items-center gap-2 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted transition-[color,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:translate-x-1 group-hover/item:text-foreground">
                <span className={`h-1.5 w-1.5 rounded-full transition-transform duration-700 group-hover/item:scale-150 ${GROUPS[b.group].dot}`} />
                {GROUPS[b.group].label}
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-foreground/40 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:scale-x-100" />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee 60s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
            width: 100%;
            flex-wrap: wrap;
            justify-content: center;
            row-gap: 2rem;
          }
          .marquee-track > li[aria-hidden='true'] {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
