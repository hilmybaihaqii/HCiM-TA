'use client';

import React from 'react';
import { motion } from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function AboutPhilosophy() {
  return (
    <section className="relative w-full bg-background pt-24 pb-12 md:pt-32 md:pb-16 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center flex flex-col items-center">
        
        {/* Garis Pemicu (Muncul mekar dari tengah) */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: luxEase }}
          className="w-16 h-px bg-foreground/10 mb-12 md:mb-16 origin-center" 
        />

        {/* Teks Utama yang Terpecah dari 3 Arah */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight tracking-tight text-foreground leading-tight max-w-5xl mb-8">
          
          {/* Bagian 1: Turun dari ATAS */}
          <motion.span
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: luxEase }}
            className="inline-block mr-2 lg:mr-3"
          >
            Driving the convergence of
          </motion.span>
          
          {/* Bagian 2: Menabrak dari KIRI */}
          <motion.span
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: luxEase }}
            className="font-normal text-accent inline-block mr-2 lg:mr-3"
          >
            computational rigor
          </motion.span>
          
          {/* Bagian 3: Menabrak dari KANAN */}
          <motion.span
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3, ease: luxEase }}
            className="inline-block"
          >
            and cardiac safety.
          </motion.span>

        </h2>

        {/* Paragraf Sub-teks: Naik dari BAWAH */}
        <motion.p 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: luxEase }}
          className="text-base md:text-lg text-muted font-light leading-relaxed max-w-2xl"
        >
          We are united by a singular focus: to engineer reliable, predictive in-silico models that redefine pharmacovigilance and accelerate safe therapeutic discovery.
        </motion.p>
        
      </div>
    </section>
  );
}