'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   TEXT REVEAL COMPONENT (Natural & Professional)
   ========================================================= */
const RevealText = ({ children }: { children: string }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: textRef, offset: ['start 85%', 'end 50%'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const words = children.split(' ');

  return (
    <p ref={textRef} className="flex flex-wrap text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-medium tracking-tight text-foreground leading-[1.3] md:leading-[1.25]">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(smoothProgress, [start, end], [0.15, 1]);
        return (
          <span key={i} className="relative mr-[1.2vw] md:mr-3 mb-1 md:mb-3">
            <motion.span style={{ opacity }} className="absolute inset-0 text-foreground">{word}</motion.span>
            <span className="opacity-15">{word}</span>
          </span>
        );
      })}
    </p>
  );
};

/* =========================================================
   REUSABLE COMPONENT: BIOMARKER CARD
   ========================================================= */
const BioCard = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center py-2.5 md:py-3.5 px-2 bg-foreground/[0.03] border border-foreground/10 rounded-lg text-[10px] md:text-xs font-mono text-muted hover:bg-foreground hover:text-background hover:border-foreground transition-colors duration-300 cursor-crosshair">
    {name}
  </div>
);

/* =========================================================
   MAIN SECTION: SOLUTION
   ========================================================= */
export default function SolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  // Animasi indikator garis vertikal pada sticky sidebar
  const { scrollYProgress: lineProgress } = useScroll({
    target: lineRef,
    offset: ['start center', 'end center']
  });
  const smoothLine = useSpring(lineProgress, { stiffness: 80, damping: 25 });

  const scrollToModel = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const target = document.getElementById('model-architecture');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section ref={containerRef} id="solution" className="relative w-full bg-background font-sans overflow-hidden">
      
      {/* =========================================================
          PART 1: THE OBJECTIVE 
          ========================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 pt-20 md:pt-32 pb-16 md:pb-24 border-b border-foreground/10">
        <div className="flex flex-col justify-center max-w-5xl">
          <div className="flex items-center gap-3 mb-8 md:mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-muted font-bold">
              03 — The Objective
            </span>
          </div>
          
          <RevealText>
            An ensemble machine learning system that translates 14 in-silico biomarkers into a reliable risk classification.
          </RevealText>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: luxEase }}
            className="mt-12 md:mt-16 flex items-center gap-6"
          >
            <a 
              href="#model-architecture" 
              onClick={scrollToModel}
              className="group flex items-center gap-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors duration-300"
            >
              Explore the Architecture
              <div className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center group-hover:border-accent transition-colors duration-300">
                <svg className="w-3 h-3 transform transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </a>
          </motion.div>
        </div>
      </div>

      {/* =========================================================
          PART 2: THE STICKY ARCHITECTURE 
          ========================================================= */}
      <div id="model-architecture" className="relative w-full bg-background">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          
          <div className="flex flex-col md:flex-row relative" ref={lineRef}>
            
            {/* PANEL KIRI: STICKY SIDEBAR */}
            <div className="w-full md:w-1/3 md:border-r border-foreground/10 relative">
              <div className="md:sticky md:top-32 pt-16 md:pt-24 pb-8 md:pb-10 flex flex-col">
                <h3 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">
                  Computational <br className="hidden md:block" /> Pipeline
                </h3>
                <p className="text-sm text-muted leading-relaxed max-w-[240px] mb-8 md:mb-12">
                  A structured approach designed for high-precision inference and clinical transparency.
                </p>

                {/* Vertical Scroll Indicator (Desktop Only) */}
                <div className="hidden md:block relative w-px h-32 bg-foreground/10 ml-1">
                  <motion.div 
                    style={{ scaleY: smoothLine, transformOrigin: 'top' }}
                    className="absolute top-0 left-0 w-full h-full bg-accent"
                  />
                </div>
              </div>
            </div>

            {/* PANEL KANAN: SCROLLING CONTENT */}
            <div className="w-full md:w-2/3 md:pl-16 lg:pl-24 pt-8 md:pt-24 pb-24 md:pb-32 flex flex-col gap-16 md:gap-24">
              
              {/* PHASE 01: INGESTION (BIOMARKER MATRIX 2-5-5-2) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, ease: luxEase }}
                className="flex flex-col"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-3 block">Phase 01</span>
                <h4 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-4">Data Ingestion</h4>
                <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl">
                  We extract 14 essential electrophysiological parameters directly from the O'Hara-Rudy cellular simulation. This structured feature matrix serves as the biological foundation for our prediction model.
                </p>
                
                {/* Visual Interaktif: Formasi Grid 2-5-5-2 sesuai referensi */}
                <div className="flex flex-col gap-2 md:gap-3 w-full max-w-lg">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <BioCard name="qNet" />
                    <BioCard name="APD90" />
                  </div>
                  {/* Row 2 (Responsif: Di HP jadi 3 kolom agar teks tidak tumpah, Desktop tetap 5) */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                    <BioCard name="INaL" />
                    <BioCard name="ICaL" />
                    <BioCard name="IKr" />
                    <BioCard name="IKs" />
                    <BioCard name="IK1" />
                  </div>
                  {/* Row 3 */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                    <BioCard name="Ito" />
                    <BioCard name="INaCa" />
                    <BioCard name="INaK" />
                    <BioCard name="IpCa" />
                    <BioCard name="ICab" />
                  </div>
                  {/* Row 4 */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <BioCard name="INab" />
                    <BioCard name="Vmax" />
                  </div>
                </div>
              </motion.div>

              {/* PHASE 02: INFERENCE */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, ease: luxEase }}
                className="flex flex-col"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-3 block">Phase 02</span>
                <h4 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-4">Model Inference</h4>
                <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl">
                  The extracted data is processed through three distinct machine learning models: Artificial Neural Network, XGBoost, and Random Forest[cite: 1]. This parallel approach ensures we capture both linear patterns and complex non-linear interactions accurately.
                </p>
                
                <div className="flex flex-col w-full border-t border-foreground/10">
                  {['Artificial Neural Network', 'XGBoost', 'Random Forest'].map((model, i) => (
                    <div key={model} className="group flex items-center justify-between py-4 border-b border-foreground/10 cursor-default hover:bg-foreground/[0.02] transition-colors px-2 rounded-sm">
                      <span className="text-sm md:text-base font-light tracking-tight text-foreground group-hover:translate-x-2 transition-transform duration-300">
                        {model}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-muted group-hover:text-accent transition-colors">
                        Layer 0{i+1}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* PHASE 03: SYNTHESIS */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, ease: luxEase }}
                className="flex flex-col"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-3 block">Phase 03</span>
                <h4 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-4">Risk Synthesis</h4>
                <p className="text-sm text-muted leading-relaxed mb-8 max-w-xl">
                  A Hard Voting mechanism aggregates the predictions from all three models to determine the final risk category[cite: 1] (Low, Intermediate, or High). Each result is supported by SHAP values to maintain full clinical transparency[cite: 1].
                </p>
                
                <div className="w-full p-6 md:p-8 rounded-2xl border border-foreground/10 bg-surface-white relative overflow-hidden group hover:border-foreground/30 hover:shadow-lg transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/15 transition-colors duration-700" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-muted mb-2">Final Output</span>
                      <span className="text-xl md:text-2xl font-medium tracking-tight text-foreground block">3-Tier Risk Classification</span>
                    </div>
                    
                    <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-foreground/10 bg-foreground/5 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-foreground">SHAP Audit Included</span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}