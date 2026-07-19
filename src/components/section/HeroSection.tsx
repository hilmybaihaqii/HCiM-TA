'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useSplash } from '../SplashProvider';

// ssr:false → tidak dicoba di-render di server (menghindari WebGL API
// yang gak ada di Node), dan module three/fiber/drei baru di-load
// begitu chunk ini benar-benar diminta oleh browser.
const Heart3D = dynamic(() => import('../ui/Heart3D'), {
  ssr: false,
  loading: () => <Heart3DPlaceholder />,
});

// Placeholder elegan selagi chunk 3D belum dimount — cuma denyut lembut,
// biar area kosongnya gak kelihatan "hilang" tiba-tiba.
function Heart3DPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-24 h-24 rounded-full bg-accent/5 animate-pulse blur-xl" />
    </div>
  );
}

export default function HeroSection() {
  const { splashStarted } = useSplash();

  return (
    <section className="relative w-full h-svh bg-background font-sans overflow-hidden flex items-center justify-center">

      <div className="absolute top-[40%] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none select-none z-0 w-full">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[17vw] md:text-[14vw] font-black uppercase leading-[0.85] md:leading-[0.8] tracking-tighter text-center"
        >
          <span
            className="block text-transparent"
            style={{ WebkitTextStroke: '2px rgba(43, 34, 35, 0.06)' }}
          >
            IN-SILICO
          </span>
          <span className="block text-foreground/5 mt-1 md:mt-0">
            PRECISION
          </span>
        </motion.h1>
      </div>

      {/* Heart3D baru dimount setelah splash mulai berjalan, supaya
          WebGL init tidak bentrok dengan frame pertama GSAP splash. */}
      <div className="absolute top-24 bottom-[38vh] left-0 right-0 md:inset-0 z-10 cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-center">
        {splashStarted ? <Heart3D /> : <Heart3DPlaceholder />}
      </div>

      {/* === SISA JSX SAMA PERSIS, TIDAK DIUBAH === */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none pt-28 pb-8 md:pt-36 md:pb-12">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col gap-1.5 md:gap-2"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-accent animate-pulse" />
              <div className="text-[9px] md:text-xs font-mono uppercase tracking-[0.2em] text-foreground font-medium">
                O&apos;Hara-Rudy Cell Data
              </div>
            </div>
            <div className="text-[9px] md:text-xs font-mono uppercase tracking-widest text-muted">
              Protocol: ICH S7B & E14
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="px-4 py-2 bg-surface-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-foreground/5 rounded-full flex items-center gap-2 pointer-events-auto"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
            <span className="text-[9px] font-mono font-medium text-foreground uppercase tracking-widest whitespace-nowrap">
              Live Render
            </span>
          </motion.div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between items-stretch lg:items-end gap-6 relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full lg:max-w-md bg-surface-white/60 backdrop-blur-2xl border border-foreground/5 shadow-[0_20px_80px_rgba(0,0,0,0.04)] p-5 md:p-6 lg:p-8 rounded-3xl pointer-events-auto relative overflow-hidden group"
          >
            <h2 className="text-lg md:text-xl font-medium text-foreground mb-2 md:mb-3 tracking-tight">
              Rescue Viable Therapeutics.
            </h2>
            <p className="text-[11px] sm:text-xs lg:text-sm text-muted font-normal leading-relaxed">
              False-positive hERG testing forces the pharmaceutical industry to abandon perfectly safe compounds. We utilize <span className="font-medium text-foreground">Ensemble ML</span> to predict TdP risk with precision, saving investments and expediting approvals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-auto flex-col items-center gap-3 hidden xl:flex"
          >
            <span className="text-[9px] font-mono text-muted uppercase tracking-widest rotate-90 opacity-0">.</span>
            <a href="#about" className="w-12 h-12 flex items-center justify-center rounded-full border border-foreground/20 text-muted hover:border-foreground hover:text-foreground transition-all duration-300">
              <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 md:gap-3 pointer-events-auto shrink-0"
          >
            <button className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 text-[10px] md:text-xs font-normal uppercase tracking-widest bg-surface-white/60 backdrop-blur-md border border-foreground/10 text-foreground hover:bg-foreground hover:text-surface-white transition-all duration-300 rounded-full">
              Architecture
            </button>
            <button className="group flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-foreground text-surface-white text-[10px] md:text-xs font-normal uppercase tracking-widest transition-all duration-300 rounded-full shadow-lg hover:shadow-foreground/20 hover:scale-[1.02]">
              Run Prediction
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}