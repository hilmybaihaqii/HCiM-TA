'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   1. TEXT REVEAL COMPONENT 
   ========================================================= */
const RevealText = ({ children }: { children: string }) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ['start 85%', 'end 50%'], 
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const words = children.split(' ');

  return (
    <p ref={textRef} className="flex flex-wrap text-xl sm:text-2xl md:text-4xl lg:text-[44px] font-medium tracking-tight text-foreground leading-[1.3] md:leading-tight">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(smoothProgress, [start, end], [0.15, 1]);

        return (
          <span key={i} className="relative mr-[1.2vw] md:mr-3 mb-1 md:mb-3">
            <motion.span style={{ opacity }} className="absolute inset-0 text-foreground">
              {word}
            </motion.span>
            <span className="opacity-15">{word}</span>
          </span>
        );
      })}
    </p>
  );
};

/* =========================================================
   2. MEDIA REVEAL COMPONENT
   ========================================================= */
const MediaReveal = ({ caption, fallbackText }: { caption: string, fallbackText: string }) => {
  const mediaRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ['start 95%', 'center 60%'], 
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  
  const scale = useTransform(smoothProgress, [0, 1], [0.65, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.5], [0, 1]); 

  return (
    <motion.div 
      ref={mediaRef} 
      style={{ scale, opacity }} 
      className="w-full flex flex-col items-center mt-6 mb-12 md:mt-10 md:mb-16"
    >
      <div className="w-full aspect-video md:aspect-21/9 rounded-2xl md:rounded-4xl overflow-hidden bg-foreground/5 border border-foreground/10 relative flex items-center justify-center group">
        
        <div className="absolute inset-0 bg-linear-to-br from-foreground/5 to-transparent opacity-50" />
        <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-muted group-hover:text-accent transition-colors duration-500">
          [ {fallbackText} ]
        </span>
        
      </div>
      
      <div className="mt-4 md:mt-6 flex items-center gap-3">
        <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-accent" />
        <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.15em] text-muted text-center">
          {caption}
        </p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   3. MAIN SECTION
   ========================================================= */
export default function ProblemSection() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const crosshairRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section ref={containerRef} id="problem" className="relative w-full bg-background font-sans overflow-hidden">
      
      {/* --- STICKY BACKGROUND --- */}
      <div className="sticky top-0 w-full h-screen overflow-hidden pointer-events-none flex items-center justify-center">
        
        {/* Teks raksasa THE FALSE POSITIVE PARADOX telah dihapus agar lebih clean */}

        <motion.div 
          style={{ rotate: crosshairRotate }}
          className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 border border-foreground/5 rounded-full hidden lg:flex items-center justify-center"
        >
          <div className="w-full h-px bg-foreground/5" />
          <div className="h-full w-px bg-foreground/5 absolute" />
        </motion.div>

        <div className="absolute left-4 md:left-12 top-0 bottom-0 w-px bg-foreground/10">
          <motion.div 
            style={{ scaleY: lineScaleY, transformOrigin: 'top' }}
            className="w-full h-full bg-accent"
          />
        </div>
      </div>

      {/* --- SCROLLING CONTENT --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-12 mt-[-100vh] pb-[10vh]">
        
        {/* ACT 1: The Intro */}
        <div className="pt-[15vh] pb-8 md:pb-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-10">
            <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-muted font-bold">
              02 — The Flaw
            </span>
          </div>
          <div className="max-w-7xl">
            <RevealText>
              Many promising therapies fail not because they are ineffective, but because their cardiac risks are discovered too late.
            </RevealText>
          </div>
        </div>

        <MediaReveal 
          fallbackText="Insert Video/Image: Drug Attrition Graph" 
          caption="Fig 1. Compound Attrition Rate Due To Toxicity" 
        />

        {/* ACT 2: The Problem */}
        <div className="py-8 md:py-12 flex flex-col justify-center">
          <div className="max-w-7xl">
            <RevealText>
              For decades, animal studies and conventional safety assays have been the foundation of preclinical drug evaluation. Yet many promising compounds still fail because these models often struggle to predict human cardiac responses accurately, creating a costly gap between laboratory findings and clinical reality.
            </RevealText>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: luxEase }}
            className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 border-t border-foreground/10 pt-8 md:pt-10"
          >
            <div>
              <span className="block text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-accent mb-2">The Attrition Rate</span>
              <span className="text-3xl md:text-5xl font-light tracking-tight text-foreground tabular-nums">30%</span>
              <p className="mt-3 text-[11px] md:text-xs text-muted leading-relaxed max-w-70">
                Over 30% of drug candidates are discarded owing to toxicity, making it the leading cause of costly drug discovery failures.
              </p>
            </div>
            <div>
              <span className="block text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-foreground mb-2">The Translational Gap</span>
              <span className="text-3xl md:text-5xl font-light tracking-tight text-foreground tabular-nums">&lt;30%</span>
              <p className="mt-3 text-[11px] md:text-xs text-muted leading-relaxed max-w-70">
                Animal models successfully predict human target organ adverse reactions in less than 30% of cases, highlighting the flaw in in-vivo testing.
              </p>
            </div>
          </motion.div>
        </div>

        <MediaReveal 
          fallbackText="Insert Video/Image: In-Vivo Assay vs Human Translation Gap" 
          caption="Fig 2. The Translatability Gap in Traditional Testing" 
        />

        {/* ACT 3: The Solution / Paradigm Shift */}
        <div className="py-8 md:py-12 flex flex-col justify-center relative">
          <div className="absolute -left-6 md:-left-12 top-1/2 w-4 md:w-8 border-b-2 border-dashed border-foreground/30" />
          
          <div className="max-w-7xl">
            <RevealText>
              To address this gap, we combine the O&apos;Hara-Rudy electrophysiological model with Ensemble Machine Learning to estimate cardiac risk directly from simulated cellular responses, providing a faster and more human-relevant approach to safety assessment.
            </RevealText>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="mt-12 md:mt-16 flex items-center gap-3 md:gap-4"
          >
            <div className="flex-1 h-px bg-foreground/10" />
            <a 
              href="#architecture" 
              className="group flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors duration-300"
            >
              Analyze the Architecture
              <svg className="w-3 h-3 md:w-4 md:h-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div className="flex-1 h-px bg-foreground/10" />
          </motion.div>
        </div>

      </div>
    </section>
  );
}