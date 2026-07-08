'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Cpu, Network, Activity, Check } from 'lucide-react';

type Stage = 'idle' | 'ingestion' | 'inference' | 'consensus' | 'completed';

const nodes = [
  { id: 'ingestion', label: 'Input Matrix', idNum: '01', icon: Database },
  { id: 'inference', label: 'Base Learners', idNum: '02', icon: Cpu },
  { id: 'consensus', label: 'Aggregator', idNum: '03', icon: Network },
  { id: 'completed', label: 'Output Node', idNum: '04', icon: Activity },
];

export default function EngineVisualizer({ activeStage }: { activeStage: Stage }) {
  const stageIndices: Record<Stage, number> = {
    idle: 0,
    ingestion: 0,
    inference: 1,
    consensus: 2,
    completed: 3,
  };

  const currentIndex = stageIndices[activeStage];

  const getStageDescription = () => {
    if (activeStage === 'idle' || activeStage === 'ingestion') return 'Awaiting Matrix Input Configuration...';
    if (activeStage === 'inference') return 'Executing Parallel Base Learners...';
    if (activeStage === 'consensus') return 'Synthesizing Voting Consensus...';
    if (activeStage === 'completed') return 'Vector Attribution Compiled.';
    return 'System Idle.';
  };

  return (
    <div className="w-full pt-20 md:pt-28 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="w-full bg-surface-white/80 backdrop-blur-3xl border border-foreground/[0.04] shadow-[0_24px_60px_rgba(0,0,0,0.02)] rounded-[2rem] p-5 md:p-10 relative overflow-hidden flex flex-col">
          
          {/* Subtle Micro-Grid Background for Premium "Empty Space" filling */}
          <div 
            className="absolute inset-0 opacity-[0.02] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }}
          />

          {/* =========================================================
              CLEAN HUD HEADER
              ========================================================= */}
          <div className="flex items-center justify-between border-b border-foreground/[0.04] pb-4 mb-8 md:mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-foreground font-semibold">
                  Engine Status
                </span>
                <span className="hidden sm:inline text-muted/30 font-mono text-[10px]"></span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={activeStage}
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 5 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] md:text-xs font-mono uppercase tracking-[0.1em] text-accent hidden sm:inline"
                  >
                    {getStageDescription()}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Optional Decorative Corner Brackets */}
            <div className="hidden sm:flex text-[10px] font-mono text-muted/30 tracking-widest uppercase">
              Seq_0x71F
            </div>
          </div>

          {/* =========================================================
              PERFECTLY ALIGNED TRACKS & NODES
              ========================================================= */}
          {/* Container ini membungkus lingkaran secara proporsional. */}
          <div className="relative w-full mb-2">
            
            {/* 
              MATHEMATICAL ALIGNMENT: 
              Karena node lebarnya 25% (1/4), pusat node pertama ada di 12.5%.
              Tinggi lingkaran adalah h-10 (40px) di mobile, h-12 (48px) di md.
              Maka garis harus di top-5 (20px) di mobile, top-6 (24px) di md.
            */}
            <div className="absolute top-5 md:top-6 left-[12.5%] right-[12.5%] h-px bg-foreground/[0.06] z-0 pointer-events-none" />
            
            {/* Garis Aktif Animasi */}
            <div className="absolute top-5 md:top-6 left-[12.5%] right-[12.5%] h-px z-0 pointer-events-none">
              <motion.div 
                className="absolute top-0 bottom-0 left-0 bg-accent"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentIndex / (nodes.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Grid Flex Container */}
            <div className="flex justify-between relative z-10 w-full">
              {nodes.map((node, i) => {
                const isCompleted = i < currentIndex || (i === currentIndex && activeStage === 'completed');
                const isActive = i === currentIndex && activeStage !== 'completed';
                const IconComponent = isCompleted ? Check : node.icon;

                return (
                  <div key={node.id} className="relative flex flex-col items-center w-1/4">
                    
                    {/* Node Icon Wrapper - Fixed Height to guarantee line centering */}
                    <div className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-5">
                      
                      {/* Premium Lens Ring (Active State) - Clean, no dirty glow */}
                      {isActive && (
                        <motion.div 
                          className="absolute -inset-2 md:-inset-2.5 border-[1px] border-accent/30 rounded-full"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        />
                      )}
                      
                      {/* Inner Pulse Ring */}
                      {isActive && (
                        <motion.div 
                          className="absolute inset-0 border border-accent/20 rounded-full"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}

                      {/* Core Node Bubble */}
                      <motion.div
                        animate={{
                          backgroundColor: isCompleted ? 'var(--accent)' : isActive ? 'var(--surface-white)' : 'var(--surface-white)',
                          borderColor: isCompleted ? 'transparent' : isActive ? 'var(--accent)' : 'var(--border-color)',
                          color: isCompleted ? 'var(--surface-white)' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                        className="w-full h-full rounded-full border flex items-center justify-center shadow-sm relative z-10 transition-all duration-300"
                      >
                        <IconComponent className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isCompleted ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                      </motion.div>
                    </div>

                    {/* Typography Block */}
                    <div className="flex flex-col items-center text-center">
                      <span className={`text-[9px] md:text-[10px] font-mono mb-1 md:mb-1.5 tracking-[0.15em] transition-colors ${isActive ? 'text-accent font-bold' : 'text-muted/60 font-semibold'}`}>
                        {node.idNum}
                      </span>
                      <span className={`text-[9px] md:text-[11px] uppercase tracking-widest font-medium leading-tight whitespace-normal sm:whitespace-nowrap transition-colors ${isActive ? 'text-foreground' : 'text-muted'}`}>
                        {node.label}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}