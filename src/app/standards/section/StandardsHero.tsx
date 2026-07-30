'use client';

import React from 'react';
import { motion } from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function StandardsHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.9, ease: luxEase } 
    },
  };

  return (
    <section className="relative w-full pt-36 md:pt-48 pb-16 md:pb-24 bg-background overflow-hidden border-b border-foreground/10 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- MAIN EDITORIAL HEADER --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end pb-12 md:pb-16 border-b border-foreground/10"
        >
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="flex items-center gap-3 text-xs font-mono text-muted mb-4">
              <span className="text-accent font-medium">03</span>
              <span className="text-foreground/20">/</span>
              <span>Regulatory compliance & foundation</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.02]">
              Standards & <br className="hidden sm:block" />
              <span className="italic font-normal text-muted">regulatory basis.</span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-5">
            <p className="text-sm md:text-base text-muted leading-relaxed font-light mb-6">
              Our targets are not arbitrary. Every predictive cardiotoxicity workflow traces directly to recognized international, national, industrial, and scientific frameworks.
            </p>
          </motion.div>
        </motion.div>

        {/* --- EDITORIAL METRICS LEDGER (BORDERLESS RULES, ROUNDED-NONE) --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-10"
        >
          {[
            { level: 'International', code: 'ICH S7B / E14', label: 'In-Silico Clinical Benchmark' },
            { level: 'National Law', code: 'BPOM No. 15 / 2022', label: 'Indonesian ADR Integrity' },
            { level: 'Industrial', code: 'CiPA Protocol', label: '11 Ion Current Parameters' },
            { level: 'Scientific', code: 'Ensemble ML + MaaS', label: 'Peer-Reviewed Precision' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.code}
              variants={itemVariants}
              className="group flex flex-col justify-between border-l border-foreground/15 pl-6 py-1"
            >
              <span className="text-xs font-mono text-muted mb-8">
                0{idx + 1} — {stat.level}
              </span>
              <div>
                <h3 className="text-base md:text-lg font-medium text-foreground tracking-tight group-hover:text-accent transition-colors duration-300">
                  {stat.code}
                </h3>
                <p className="text-xs text-muted font-light mt-1.5 leading-relaxed">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}