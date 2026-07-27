'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

type LoaderStage = 'inference' | 'consensus';

const subStepLogs: Record<LoaderStage, string[]> = {
  inference: [
    'MAPPING APD90 VENTRICULAR REPOLARIZATION',
    'EVALUATING S-WAVE OVERLAP RATIOS',
    'EXTRACTING hERG CHANNEL COEFFICIENTS',
  ],
  consensus: [
    'CALCULATING ENSEMBLE VARIANCE MATRIX',
    'SYNCHRONIZING INTER-OBSERVER VOTES',
    'CONSOLIDATING SHAPLEY CONFIDENCE VALUES',
  ],
};

const TOTAL_BIOMARKERS = 11;

function formatElapsed(ms: number) {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(1).padStart(4, '0');
  return `${String(minutes).padStart(2, '0')}:${seconds}`;
}

function StageTelemetry({ stage }: { stage: LoaderStage }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const interval = setInterval(() => {
      setElapsedMs(performance.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const currentLogs = subStepLogs[stage];
  const logIndex = Math.floor(elapsedMs / 2500) % currentLogs.length;
  const activeSubLog = currentLogs[logIndex];
  const stageNumber = stage === 'inference' ? 1 : 2;

  return (
    <>
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

      <div className="w-32 h-0.5 bg-foreground/5 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute top-0 bottom-0 w-12 bg-accent/80 blur-[0.5px]"
          initial={{ x: '-150%' }}
          animate={{ x: '350%' }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="flex items-center gap-8 mt-10 border-t border-foreground/5 pt-6 font-mono text-[10px] text-muted/40 w-full max-w-sm justify-center">

        <div className="flex flex-col items-center">
          <span className="text-[8px] tracking-wider uppercase opacity-70">Elapsed</span>
          <span className="text-foreground font-bold mt-1 tabular-nums text-xs">
            {formatElapsed(elapsedMs)}
          </span>
        </div>

        <div className="w-px h-5 bg-foreground/10" />

        <div className="flex flex-col items-center">
          <span className="text-[8px] tracking-wider uppercase opacity-70">Stage</span>
          <span className="text-foreground font-bold mt-1 tabular-nums text-xs">
            {stageNumber} <span className="text-[9px] font-normal text-muted/50">/ 2</span>
          </span>
        </div>

        <div className="w-px h-5 bg-foreground/10" />

        <div className="flex flex-col items-center">
          <span className="text-[8px] tracking-wider uppercase opacity-70">Biomarkers</span>
          <span className="text-foreground font-bold mt-1 tabular-nums text-xs">
            {TOTAL_BIOMARKERS} <span className="text-[9px] font-normal text-muted/50">EVAL</span>
          </span>
        </div>

      </div>
    </>
  );
}

export default function ProcessingLoader({ stage }: { stage: LoaderStage }) {
  const ECG_PATH = 'M 0 50 L 40 50 L 45 40 L 50 50 L 65 50 L 70 65 L 85 10 L 100 90 L 115 50 L 135 50 L 145 35 L 155 50 L 200 50';

  return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden select-none">

      <div className="w-full max-w-xl flex flex-col items-center relative z-10">

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-8 bg-foreground/2 px-3 py-1.5 border border-foreground/4 rounded-full">
          <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span className="text-[9px] font-mono text-foreground/70 uppercase tracking-[0.25em] font-bold">
            Biomarker Synthesis Engine
          </span>
        </div>

        <div className="relative h-20 w-full max-w-md flex items-center justify-center mb-10">

          <div className="absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />

          <svg
            className="w-full h-full text-accent"
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
            style={{ filter: 'drop-shadow(0 0 8px var(--color-accent))' }}
          >
            {/* Ground rail */}
            <path
              d={ECG_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glow trail (wide, blurred, behind) */}
            <motion.path
              d={ECG_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40 blur-[3px]"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: [0, 0.35, 0], pathOffset: [0, 0.65, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />

            {/* Crisp tracer, on top */}
            <motion.path
              d={ECG_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 0.35, 0],
                pathOffset: [0, 0.65, 1],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </div>

        {/* =========================================================
            DYNAMIC METADATA
            ========================================================= */}
        <div className="text-center flex flex-col items-center w-full">

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

          <StageTelemetry key={stage} stage={stage} />

        </div>

      </div>
    </div>
  );
}