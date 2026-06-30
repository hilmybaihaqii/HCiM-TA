'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section id="about" className="relative w-full py-24 md:py-32 bg-white font-sans overflow-hidden">
      
      {/* Background Dot Grid Tipis */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* --- HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 mb-16 md:mb-24"
        >
          <div className="w-1.5 h-1.5 bg-[#E63946] rounded-full" />
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold">
            01 — Platform Overview
          </span>
        </motion.div>

        {/* --- SPLIT LAYOUT (TEKS & GAMBAR) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* KOLOM KIRI: The Manifesto */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tighter leading-[1.05] text-black mb-8"
            >
              A Digital Proxy For <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-neutral-400 to-neutral-800">
                Preclinical Screening.
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-base md:text-lg text-neutral-600 font-medium leading-relaxed mb-10"
            >
              Cardiotox is a fully integrated <span className="font-bold text-black italic">in-silico</span> environment. By fusing computational biology with Artificial Intelligence, we provide a virtual ecosystem to predict drug-induced cardiotoxicity—eliminating guesswork before a single compound enters a living organism.
            </motion.p>

            {/* Statistik / Key Features (Micro-components) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 md:gap-10 border-t border-neutral-200 pt-8"
            >
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black tracking-tighter text-black">100%</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Animal-Free Testing</span>
              </div>
              <div className="w-px h-10 bg-neutral-200 hidden sm:block" />
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black tracking-tighter text-black">O&apos;Hara-Rudy</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Cellular Data Base</span>
              </div>
            </motion.div>
          </div>

          {/* KOLOM KANAN: The Visual Asset & Floating Badges */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="lg:col-span-6 relative w-full aspect-square md:aspect-4/3 lg:aspect-square rounded-4xl lg:rounded-[3rem] overflow-hidden group"
          >
            {/* GAMBAR: Ganti src ini dengan gambar abstrak/molekuler yang kamu cari */}
            <img 
              src="/pictures/molecul.jpg" 
              alt="Computational Biology Visualization" 
              className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-105"
            />
            
            {/* Overlay gradient hitam tipis agar gambar tidak terlalu terang */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

            {/* FLOATING GLASS BADGE 1 (Sistem Aktif) */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-4 shadow-2xl transform transition-transform duration-500 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="flex flex-col pr-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-white/60">Engine Status</span>
                <span className="text-sm font-bold text-white tracking-tight">Machine Learning Active</span>
              </div>
            </div>

            {/* FLOATING GLASS BADGE 2 (Data Sinkronisasi) */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white font-medium">
                Syncing with Database...
              </span>
            </div>
          </motion.div>

        </div>

        {/* --- THE CLIFFHANGER (Klimaks Transisi ke Section Problem) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-24 md:mt-32 pt-16 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <p className="text-sm md:text-base font-medium text-neutral-500 max-w-md text-center md:text-left">
            But every revolutionary solution is born from a critical flaw in the existing system. <span className="font-bold text-black">Why did we build this?</span>
          </p>
          
          {/* Tombol Panah Bawah ke The Problem */}
          <a 
            href="#problem" 
            className="group flex items-center gap-4 px-8 py-4 rounded-full border border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all duration-300"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-black">Explore The Paradox</span>
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center transform group-hover:translate-y-1 transition-transform duration-300">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </a>
        </motion.div>

      </div>
    </section>
  );
}