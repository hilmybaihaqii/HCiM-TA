'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ActivitySquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ActivityLogsPage() {
  return (
    <div className="w-full flex flex-col bg-background text-foreground overflow-x-hidden pt-28 md:pt-32 pb-20">
      {/* Container disamakan persis dengan halaman LabForm (max-w-7xl, px-6 md:px-12) */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative">
        
        {/* HEADER PAGE */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ActivitySquare className="w-5 h-5 text-accent" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted font-semibold">
                System Records
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-2">
              Activity Feed
            </h1>
            <p className="text-xs text-muted max-w-xl leading-relaxed">
              Review the narrative history of your Torsade de Pointes (TdP) predictions and model interactions.
            </p>
          </div>
        </div>

        {/* WORK IN PROGRESS CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full bg-surface-white/80 backdrop-blur-3xl border border-foreground/4 shadow-[0_24px_60px_rgba(0,0,0,0.02)] rounded-4xl p-10 md:p-24 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[50vh]"
        >
          <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
            
            {/* Badge Minimalis Pengganti Ikon */}
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent mb-6 border border-accent/20 bg-accent/10 px-4 py-1.5 rounded-full">
              Status: In Progress
            </div>

            <h2 className="text-2xl font-medium tracking-tight text-foreground mb-3">
              Module Under Construction
            </h2>
            
            <p className="text-xs text-muted leading-relaxed mb-10">
              The engineering team is currently integrating the historical logs with the backend database infrastructure. This feature will be available in the next deployment cycle.
            </p>

            <Link href="/lab" className="group flex items-center justify-center gap-3 px-8 py-3.5 bg-foreground/5 border border-foreground/10 text-foreground text-xs font-semibold uppercase tracking-[0.1em] rounded-full hover:bg-foreground hover:text-surface-white transition-all duration-300">
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Return to Digital Lab
            </Link>
            
          </div>
        </motion.div>

      </div>
    </div>
  );
}