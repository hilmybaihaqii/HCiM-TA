'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function ModelFlowSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Kontainer diatur setinggi 300vh untuk pengalaman scroll yang panjang dan mulus
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20, restDelta: 0.001 });

  /* --- DATA FLOW ANIMATION MAPPING --- */
  // Fase 1: Input ke Base Learners
  const l1 = useTransform(smoothProgress, [0, 0.1], ['-100%', '0%']);
  const lSplit1 = useTransform(smoothProgress, [0.1, 0.2], ['0%', '100%']);
  const lToMods = useTransform(smoothProgress, [0.2, 0.3], ['-100%', '0%']);
  const modActive = useTransform(smoothProgress, [0.3, 0.35], [0.4, 1]);
  
  // Fase 2: Base Learners ke Consensus
  const lFromMods = useTransform(smoothProgress, [0.35, 0.45], ['-100%', '0%']);
  const lMerge1 = useTransform(smoothProgress, [0.45, 0.55], ['0%', '100%']);
  const lToCon = useTransform(smoothProgress, [0.55, 0.65], ['-100%', '0%']);
  const conActive = useTransform(smoothProgress, [0.65, 0.7], [0.4, 1]);
  
  // Fase 3: Consensus membelah ke 2 Output
  const lFromCon = useTransform(smoothProgress, [0.7, 0.8], ['-100%', '0%']);
  const lSplit2 = useTransform(smoothProgress, [0.8, 0.85], ['0%', '100%']);
  const lToOut = useTransform(smoothProgress, [0.85, 0.95], ['-100%', '0%']);
  const outActive = useTransform(smoothProgress, [0.95, 1], [0.4, 1]);

  return (
    <section ref={containerRef} id="data-flow" className="relative w-full h-[300vh] bg-background font-sans">
      
      {/* 
        STICKY WRAPPER: 
        top-20 & h-[calc(100vh-5rem)] menjamin konten selalu mulai di bawah navbar, 
        memberikan ruang atas/bawah yang sempurna tanpa resiko menabrak.
      */}
      <div className="sticky top-20 h-[calc(100vh-5rem)] w-full flex items-center justify-center overflow-hidden">
        
        <div className="w-full max-w-7xl mx-auto px-5 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
          
          {/* ==========================================
              KOLOM KIRI: TEKS (Memberi ruang luas di kanan)
              ========================================== */}
          <div className="lg:col-span-4 flex flex-col justify-center text-center lg:text-left z-20 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent mb-3 block">
              Data Flow Architecture
            </span>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground mb-4">
              The Computation Engine
            </h3>
            <p className="text-sm text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
              Scroll down to visualize the data flow. The system processes the biological feature matrix through parallel base learners before reaching a unified clinical synthesis.
            </p>
          </div>

          {/* ==========================================
              KOLOM KANAN: THE PIPELINE DIAGRAM
              ========================================== */}
          <div className="lg:col-span-8 flex justify-center w-full relative">
            
            {/* SCALE WRAPPER: Mengecilkan bagan secara proporsional agar muat di layar HP tanpa error */}
            <div className="flex flex-col items-center w-full max-w-2xl transform scale-[0.6] sm:scale-[0.7] md:scale-90 lg:scale-100 origin-center select-none">
              
              {/* --- 1. NODE: INPUT MATRIX --- */}
              <div className="w-full max-w-xs px-6 py-4 rounded-xl border border-foreground/10 bg-surface-white text-center shadow-sm relative z-10">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-muted mb-1">Input Matrix</span>
                <span className="text-sm font-medium text-foreground">14 In-Silico Biomarkers</span>
              </div>

              {/* Garis Turun 1 */}
              <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                <motion.div style={{ y: l1 }} className="absolute inset-0 bg-foreground/40" />
              </div>

              {/* --- 2. NODE: BASE LEARNERS (Grid 3 Kolom) --- */}
              <div className="w-full relative">
                
                {/* Garis Horizontal Absolut (Anti Lebar/Bocor) */}
                <div className="absolute top-0 left-[16.666%] right-[16.666%] h-px bg-foreground/10 overflow-hidden">
                  <motion.div style={{ scaleX: lSplit1, transformOrigin: 'center' }} className="absolute inset-0 bg-foreground/40" />
                </div>
                
                {/* Grid 3 Model dengan items-stretch menjamin tinggi ketiga kotak SAMA RATA */}
                <div className="grid grid-cols-3 items-stretch w-full">
                  
                  {/* Model 1: ANN */}
                  <div className="flex flex-col items-center h-full">
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lToMods }} className="absolute inset-0 bg-foreground/40" />
                    </div>
                    <motion.div style={{ opacity: modActive }} className="w-[90%] flex-1 flex flex-col justify-center p-4 rounded-xl border border-foreground/10 bg-surface-white text-center shadow-sm relative z-10">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-muted mb-1">Base Learner 01</span>
                      <span className="text-xs md:text-sm font-medium text-foreground leading-tight">Neural Network</span>
                    </motion.div>
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lFromMods }} className="absolute inset-0 bg-foreground/40" />
                    </div>
                  </div>

                  {/* Model 2: XGBoost */}
                  <div className="flex flex-col items-center h-full">
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lToMods }} className="absolute inset-0 bg-foreground/40" />
                    </div>
                    <motion.div style={{ opacity: modActive }} className="w-[90%] flex-1 flex flex-col justify-center p-4 rounded-xl border border-foreground/10 bg-surface-white text-center shadow-sm relative z-10">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-muted mb-1">Base Learner 02</span>
                      <span className="text-xs md:text-sm font-medium text-foreground leading-tight">XGBoost</span>
                    </motion.div>
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lFromMods }} className="absolute inset-0 bg-foreground/40" />
                    </div>
                  </div>

                  {/* Model 3: Random Forest */}
                  <div className="flex flex-col items-center h-full">
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lToMods }} className="absolute inset-0 bg-foreground/40" />
                    </div>
                    <motion.div style={{ opacity: modActive }} className="w-[90%] flex-1 flex flex-col justify-center p-4 rounded-xl border border-foreground/10 bg-surface-white text-center shadow-sm relative z-10">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-muted mb-1">Base Learner 03</span>
                      <span className="text-xs md:text-sm font-medium text-foreground leading-tight">Random Forest</span>
                    </motion.div>
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lFromMods }} className="absolute inset-0 bg-foreground/40" />
                    </div>
                  </div>

                </div>

                {/* Garis Horizontal Bawah Absolut */}
                <div className="absolute bottom-0 left-[16.666%] right-[16.666%] h-px bg-foreground/10 overflow-hidden">
                  <motion.div style={{ scaleX: lMerge1, transformOrigin: 'center' }} className="absolute inset-0 bg-foreground/40" />
                </div>

              </div>

              {/* Garis Turun ke Consensus */}
              <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                <motion.div style={{ y: lToCon }} className="absolute inset-0 bg-foreground/40" />
              </div>

              {/* --- 3. NODE: CONSENSUS AGGREGATOR --- */}
              <motion.div style={{ opacity: conActive }} className="w-full max-w-sm px-6 py-4 rounded-xl border border-accent/20 bg-accent/[0.02] text-center shadow-sm relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-accent">Synthesis Node</span>
                </div>
                <span className="text-sm font-medium text-foreground">Hard/Soft Voting Aggregator</span>
              </motion.div>

              {/* Garis Turun ke Percabangan Output */}
              <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                <motion.div style={{ y: lFromCon }} className="absolute inset-0 bg-accent/60" />
              </div>

              {/* --- 4. NODE: DUAL OUTPUT (Risk & SHAP) --- */}
              <div className="w-full relative">
                
                {/* Garis Horizontal Absolut 2 Cabang (Anti Bocor) */}
                <div className="absolute top-0 left-[25%] right-[25%] h-px bg-foreground/10 overflow-hidden">
                  <motion.div style={{ scaleX: lSplit2, transformOrigin: 'center' }} className="absolute inset-0 bg-accent/60" />
                </div>

                <div className="grid grid-cols-2 items-stretch w-full">
                  
                  {/* Output Kiri: 3-Tier Risk */}
                  <div className="flex flex-col items-center h-full">
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lToOut }} className="absolute inset-0 bg-accent/60" />
                    </div>
                    <motion.div style={{ opacity: outActive }} className="w-[90%] flex-1 p-5 rounded-2xl border border-foreground/10 bg-surface-white text-center flex flex-col justify-center items-center relative z-10">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-muted mb-2">Primary Output</span>
                      <h5 className="text-sm md:text-base font-medium text-foreground mb-3">3-Tier TdP Risk</h5>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <span className="px-2 py-1 bg-foreground/5 border border-foreground/10 rounded text-[9px] font-mono text-muted">Low</span>
                        <span className="px-2 py-1 bg-foreground/5 border border-foreground/10 rounded text-[9px] font-mono text-muted">Inter</span>
                        <span className="px-2 py-1 bg-accent/10 border border-accent/20 rounded text-[9px] font-mono text-accent font-bold">High</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Output Kanan: SHAP Explainability */}
                  <div className="flex flex-col items-center h-full">
                    <div className="w-px h-6 md:h-8 bg-foreground/10 overflow-hidden relative shrink-0">
                      <motion.div style={{ y: lToOut }} className="absolute inset-0 bg-accent/60" />
                    </div>
                    <motion.div style={{ opacity: outActive }} className="w-[90%] flex-1 p-5 rounded-2xl border border-accent/20 bg-accent/[0.03] text-center flex flex-col justify-center items-center relative z-10">
                      <span className="block text-[8px] font-mono uppercase tracking-widest text-accent mb-2">Secondary Output</span>
                      <h5 className="text-sm md:text-base font-medium text-foreground mb-2">SHAP Explanation</h5>
                      <p className="text-[9px] font-mono text-muted leading-relaxed max-w-[150px]">
                        Visual audit for model transparency and compliance.
                      </p>
                    </motion.div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}