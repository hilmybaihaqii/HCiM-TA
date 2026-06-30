'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Heart3D from '../ui/Heart3D'; 

export default function HeroSection() {
  return (
    <section className="relative w-full h-dvh bg-[#FAFAFA] font-sans overflow-hidden flex items-center justify-center"> 
      
      {/* === 1. GIANT BACKGROUND TYPOGRAPHY (Z-0) === */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden pt-10">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          // Ukuran teks disesuaikan untuk HP (22vw) dan Desktop (18vw)
          className="text-[22vw] md:text-[18vw] font-black uppercase leading-[0.85] md:leading-[0.8] tracking-tighter text-center"
        >
          <span 
            className="block text-transparent" 
            style={{ WebkitTextStroke: '2px rgba(0,0,0,0.05)' }}
          >
            IN-SILICO
          </span>
          <span className="block text-black/5">
            PRECISION
          </span>
        </motion.h1>
      </div>

      {/* === 2. THE CENTERPIECE: 3D MODEL (Z-10) === */}
      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing pointer-events-auto">
        <Heart3D />
      </div>

      {/* === 3. SPATIAL HUD INTERFACE (Z-20) === */}
      {/* PERBAIKAN NAVBAR: pt-24 md:pt-32 ditambahkan agar elemen tidak menabrak Navbar.
        px-4 md:px-10 agar jarak dari pinggir layar di HP tidak terlalu jauh. 
      */}
      <div className="absolute inset-0 z-20 px-4 pb-6 pt-24 md:px-10 md:pb-10 md:pt-32 flex flex-col justify-between pointer-events-none">
        
        {/* --- TOP ANCHORS --- */}
        <div className="flex justify-between items-start w-full">
          
          {/* Top Left */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col gap-1.5 md:gap-2"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#E63946] animate-pulse" />
              <div className="text-[8px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-800 font-bold">
                O&apos;Hara-Rudy Cell Data
              </div>
            </div>
            <div className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Protocol: ICH S7B & E14
            </div>
          </motion.div>

          {/* Top Right */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 rounded-full flex items-center gap-2 pointer-events-auto"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            <span className="text-[8px] md:text-[9px] font-mono font-medium text-black uppercase tracking-widest whitespace-nowrap">
              Live Render
            </span>
          </motion.div>

        </div>

        {/* --- BOTTOM ANCHORS --- */}
        {/* PERBAIKAN MOBILE: flex-col untuk HP (elemen menumpuk rapi di bawah), 
          flex-row untuk Desktop (berpisah ke kiri dan kanan). 
          items-stretch memastikan tombol di HP mengambil lebar 100%. 
        */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-end w-full gap-4 md:gap-6 lg:gap-8 relative">
          
          {/* Bottom Left: Glassmorphism Information Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="w-full lg:max-w-md bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_80px_rgba(0,0,0,0.06)] p-5 md:p-6 lg:p-8 rounded-3xl pointer-events-auto relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-2xl group-hover:bg-white/60 transition-colors duration-700" />
            
            <h2 className="text-lg md:text-xl font-bold text-black mb-2 md:mb-3 tracking-tight">
              Rescue Viable Therapeutics.
            </h2>
            <p className="text-[11px] sm:text-xs lg:text-sm text-neutral-700 font-medium leading-relaxed">
              False-positive hERG testing forces the pharmaceutical industry to abandon perfectly safe compounds. We utilize <span className="font-bold text-black">Stacking Ensemble ML</span> to predict TdP risk with precision—saving investments and expediting approvals.
            </p>
          </motion.div>

          {/* Bottom Center: SCROLL ARROW (Disembunyikan di HP untuk menghemat ruang) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-auto flex-col items-center gap-3 hidden xl:flex"
          >
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest rotate-90 opacity-0">.</span>
            <a 
              href="#problem" 
              className="w-12 h-12 flex items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-black hover:text-black hover:bg-black/5 transition-all duration-300"
            >
              <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
            </a>
          </motion.div>

          {/* Bottom Right: Action Controls */}
          {/* Di HP: Tombol akan menumpuk (flex-col) dan mengambil full width. Di Desktop: Bersampingan (flex-row) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 md:gap-3 pointer-events-auto shrink-0"
          >
            <button className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/70 backdrop-blur-md border border-neutral-200 text-neutral-600 hover:text-black hover:border-black transition-all duration-300 rounded-full sm:rounded-full">
              Architecture
            </button>
            <button className="group flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 bg-black text-white text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-full sm:rounded-full shadow-lg hover:shadow-black/30 hover:scale-[1.02]">
              Run Prediction
              <svg className="w-3.5 h-3.5 md:w-4 md:h-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}