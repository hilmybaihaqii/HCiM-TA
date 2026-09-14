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
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
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
            {/* Judul tegas tanpa huruf miring (non-italic) */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.05]">
              Standards & <br className="hidden sm:block" />
              regulatory basis.
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-5">
            <p className="text-sm md:text-base text-muted leading-relaxed font-light mb-2">
              Our targets are not arbitrary. Every predictive cardiotoxicity workflow traces directly to recognized international, national, industrial, and scientific frameworks.
            </p>
          </motion.div>
        </motion.div>

        {/* --- EDITORIAL METRICS LEDGER (DENGAN ROUNDED-MD YANG RAPI) --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-12"
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
              // Menggunakan border tipis dengan sudut rounded-md sesuai permintaan
              className="group flex flex-col justify-between p-6 bg-foreground/1.5 border border-foreground/10 rounded-md hover:border-foreground/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between text-xs font-mono text-muted mb-12">
                <span>0{idx + 1}</span>
                <span className="uppercase tracking-widest text-[10px] px-2 py-0.5 bg-foreground/5 rounded-sm">
                  {stat.level}
                </span>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-medium text-foreground tracking-tight group-hover:text-accent transition-colors duration-300 mb-2">
                  {stat.code}
                </h3>
                <p className="text-xs text-muted font-light leading-relaxed">
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