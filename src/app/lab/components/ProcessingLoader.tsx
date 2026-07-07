'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';

type LoaderStage = 'inference' | 'consensus';

const subStepLogs: Record<LoaderStage, string[]> = {
  inference: [
    'MAPPING APD90 VENTRICULAR REPOLARIZATION',
    'EVALUATING S-WAVE OVERLAP RATIOS',
    'EXTRACTING hERG CHANNEL COEFFICIENTS'
  ],
  consensus: [
    'CALCULATING ENSEMBLE VARIANCE MATRIX',
    'SYNCHRONIZING INTER-OBSERVER VOTES',
    'CONSOLIDATING SHAPLEY CONFIDENCE VALUES'
  ]
};

export default function ProcessingLoader({ stage }: { stage: LoaderStage }) {
  // SVG Path gelombang PQRST Elektrokardiogram yang akurat secara medis
  const ECG_PATH = "M 0 50 L 40 50 L 45 40 L 50 50 L 65 50 L 70 65 L 85 10 L 100 90 L 115 50 L 135 50 L 145 35 L 155 50 L 200 50";

  // --- SINGLE TELEMETRY TICKER (Solusi Mutakhir Kasus Cascading Render) ---
  const [ticker, setTicker] = useState<number>(0);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('--:--:--');

  useEffect(() => {
    const startTime = performance.now();
    
    // Set stempel waktu riil saat fasa berganti
    const now = new Date();
    setLiveTimestamp(`${now.toLocaleTimeString()}. ${String(now.getMilliseconds()).padStart(3, '0')}`);

    const telemetryInterval = setInterval(() => {
      const delta = performance.now() - startTime;
      setTicker(delta);
    }, 90);

    return () => clearInterval(telemetryInterval);
  }, [stage]); // Timer otomatis mereset dari nol dengan aman setiap kali stage berubah

  // --- SYSTEM DERIVED STATES (0% Statis, No Component-Lag) ---
  const currentLogs = subStepLogs[stage];
  const logIndex = Math.floor(ticker / 2500) % currentLogs.length;
  const activeSubLog = currentLogs[logIndex];

  // Fluktuasi BPM murni berbasis gelombang matematik ticker
  const noiseBpm = Math.sin(ticker / 400) * 1.8 + (Math.random() * 0.3);
  const displayBpm = parseFloat((71.4 + noiseBpm).toFixed(1));

  // Fluktuasi beban matriks tensor terenkripsi
  const baseTensor = stage === 'inference' ? 1420 : 2840;
  const noiseTensor = Math.floor(Math.sin(ticker / 200) * 14 + (Math.random() * 4));
  const displayTensor = baseTensor + noiseTensor;

  return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden select-none">
      
      {/* Container Utama (Borderless & Transparan) */}
      <div className="w-full max-w-xl flex flex-col items-center relative z-10">
        
        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-8 bg-foreground/2 px-3 py-1.5 border border-foreground/4 rounded-full">
          <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="text-[9px] font-mono text-foreground/70 uppercase tracking-[0.25em] font-bold">
            Biomarker Synthesis Engine
          </span>
        </div>
        
        {/* =========================================================
            HEARTBEAT VECTOR ANIMATION (EVALUATION TRACK)
            ========================================================= */}
        <div className="relative h-20 w-full max-w-md flex items-center justify-center mb-10">
          
          {/* Tailwind v4 Canonical Linear Gradients Edge-fading */}
          <div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

          <svg 
            className="w-full h-full text-accent drop-shadow-[0_0_12px_rgba(0,0,0,0.15)]" 
            viewBox="0 0 200 100" 
            preserveAspectRatio="none"
          >
            {/* 1. Jalur Latar (Ground Rail) */}
            <path
              d={ECG_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* 2. Nadi Laser Utama (Dynamic Glowing Tracer) */}
            <motion.path
              d={ECG_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 0.35, 0], 
                pathOffset: [0, 0.65, 1], 
                opacity: [0, 1, 0] 
              }}
              transition={{ 
                duration: 2.0, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </svg>
        </div>

        {/* =========================================================
            DYNAMIC METADATA & MICRO-PROGRESS
            ========================================================= */}
        <div className="text-center flex flex-col items-center w-full">
          
          {/* Judul Utama Prosedur */}
          <AnimatePresence mode="wait">
            <motion.h3 
              key={stage}
              initial={{ opacity: 0, y: 6 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-base md:text-lg font-bold text-foreground tracking-tight mb-2 uppercase"
            >
              {stage === 'inference' ? 'Evaluating TdP Risk Geometry' : 'Consolidating Global Vectors'}
            </motion.h3>
          </AnimatePresence>

          {/* Sub-log Berputar Otomatis */}
          <div className="h-4 flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.p 
                key={activeSubLog}
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className="text-[10px] font-mono text-muted/60 tracking-widest uppercase"
              >
                {activeSubLog}
              </motion.p>
            </AnimatePresence>
          </div>
          
          {/* Minimalist Laser Progress Line */}
          <div className="w-32 h-0.5 bg-foreground/5 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute top-0 bottom-0 w-12 bg-accent/80 filter blur-[0.5px]"
              initial={{ x: '-150%' }}
              animate={{ x: '350%' }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* =========================================================
              BOTTOM REAL-TIME TELEMETRY HUD (THE EXPENSIVE LOOK)
              ========================================================= */}
          <div className="flex items-center gap-8 mt-10 border-t border-foreground/5 pt-6 font-mono text-[10px] text-muted/40 w-full max-w-sm justify-center">
            
            <div className="flex flex-col items-center">
              <span className="text-[8px] tracking-wider uppercase opacity-70">Telemetry Rate</span>
              <span className="text-foreground font-bold mt-1 tabular-nums text-xs">
                {displayBpm} <span className="text-[9px] font-normal text-muted/50">BPM</span>
              </span>
            </div>

            <div className="w-px h-5 bg-foreground/10" />

            <div className="flex flex-col items-center">
              <span className="text-[8px] tracking-wider uppercase opacity-70">Matrix Buffer</span>
              <span className="text-foreground font-bold mt-1 tabular-nums text-xs">
                {displayTensor} <span className="text-[9px] font-normal text-muted/50">TNS</span>
              </span>
            </div>

            <div className="w-px h-5 bg-foreground/10" />

            <div className="flex flex-col items-center">
              <span className="text-[8px] tracking-wider uppercase opacity-70">Pipeline Cycle</span>
              <span className="text-emerald-500/80 font-bold mt-1 flex items-center gap-1 text-[9px] tracking-tight">
                <ShieldCheck className="w-3 h-3" /> {liveTimestamp ? 'LIVE' : 'SYNC'}
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}