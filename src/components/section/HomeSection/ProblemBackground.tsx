'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { RevealText } from '@/components/RevealText';
import { DataFrame } from '@/components/DataFrame';
import { AttritionChart, CostTimeline } from '@/components/InteractiveChart';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function ProblemBackground() {
  const sectionRef = useRef<HTMLElement>(null);
  
  const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 } };

  return (
    <section id="problem" ref={sectionRef} className="relative w-full py-24 md:py-40 bg-background font-sans overflow-hidden">
      
      {/* Film-grain texture — Konsisten dengan AboutSection */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- EYEBROW / CHAPTER NAME --- */}
        <motion.div {...reveal} transition={{ duration: 0.7, ease: luxEase }} className="flex items-center gap-4 mb-10 md:mb-24 pt-8">
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-muted">
            02 — The Flaw
          </span>
          <motion.span
            initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
            transition={{ duration: 1, ease: luxEase, delay: 0.15 }}
            className="h-px flex-1 bg-foreground/15 origin-left"
          />
        </motion.div>

        {/* ACT 1: ATTRITION / THE FLAW */}
        <div className="mb-20 md:mb-32">
          <RevealText>
            Many promising therapies fail not because they are ineffective, but because their cardiac risks are discovered too late.
          </RevealText>
        </div>

        <DataFrame
          title="Translational Failure"
          subtitle="Success rates mapped across pipeline phases. Highlights compounds selected with biomarkers against conventional screening."
          insight="The critical drop-off occurs at Phase II → III. Biomarker-guided candidates survive at a 1.6× higher rate, exposing the inefficiency of conventional screening."
          caption="Fig 1. Success Rate With vs. Without Biomarkers"
        >
          <AttritionChart />
        </DataFrame>

        {/* ACT 2: DATA METRICS (Format Tabel Grid) */}
        <div className="mb-20 md:mb-32 mt-24">
          <RevealText>
            For decades, animal models have anchored preclinical evaluation. Yet they fail to accurately predict human electrophysiological responses, creating a costly gap between laboratory assays and clinical outcomes.
          </RevealText>
          
          <motion.div {...reveal} transition={{ duration: 0.9, ease: luxEase }} className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 md:py-16 border-t border-b border-foreground/10 mt-16 md:mt-24">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-4">Attrition Due To Toxicity</span>
              <span className="text-4xl md:text-5xl font-light tabular-nums tracking-tight text-foreground">30%</span>
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-4">In-vivo Predictivity</span>
              <span className="text-4xl md:text-5xl font-light tabular-nums tracking-tight text-foreground">&lt;30%</span>
            </div>
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-4">Animal Subject Increase</span>
              <span className="text-4xl md:text-5xl font-light tabular-nums tracking-tight text-foreground">+39%</span>
            </div>
          </motion.div>
        </div>

        {/* ACT 3: COST TIMELINE */}
        <DataFrame
          title="The Financial Burden"
          subtitle="The average investment required to bring a single drug to market has surged over the past decade, heavily driven by late-stage failures."
          insight="Development costs peaked in 2019 and remain nearly double what they were a decade earlier, demanding a more cost-effective screening approach."
          caption="Fig 2. Mean Drug Development Cost (Billions USD)"
        >
          <CostTimeline />
        </DataFrame>

        {/* ACT 4: THE ARCHITECTURE TRANSITION */}
        <div className="py-10 mt-16 md:mt-24">
          <RevealText>
            To resolve this gap, we combine the O&apos;Hara-Rudy in-silico model with Ensemble Machine Learning to estimate cardiotoxicity directly from cellular action potentials.
          </RevealText>

          <motion.div {...reveal} transition={{ duration: 0.9, delay: 0.3, ease: luxEase }} className="mt-16 inline-flex">
            <a href="#architecture" className="group relative overflow-hidden inline-flex items-center gap-3 rounded-full border border-foreground/15 px-7 py-3.5 shrink-0">
              <span className="absolute inset-0 bg-foreground translate-y-[101%] group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10 text-[11px] font-mono uppercase tracking-[0.15em] text-foreground group-hover:text-surface-white transition-colors duration-500 whitespace-nowrap">Examine the Architecture</span>
              <svg className="relative z-10 w-4 h-4 text-foreground group-hover:text-surface-white transition-all duration-500 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
}