'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { RefreshCcw, ShieldAlert, ShieldCheck, Scale } from 'lucide-react';

type SHAPData = {
  predicted_class: string;
  base_value: number;
  contributions: { biomarker: string; value: number; shap: number }[];
};

export default function LabResults({ tier, shap, onReset }: { tier: string; shap: SHAPData; onReset: () => void }) {
  const sortedContributions = [...shap.contributions].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
  
  // Mencari SHAP absolut terbesar untuk normalisasi skala (100% sisi kiri/kanan)
  const maxShap = Math.max(...sortedContributions.map(c => Math.abs(c.shap)));
  const isHighRisk = tier.toLowerCase() === 'high';

  // Perbaikan tipe Variants untuk TypeScript
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
      className="w-full mb-20 flex flex-col gap-4 sm:gap-6"
    >
      
      {/* 1. CLINICAL VERDICT BANNER */}
      <div className="w-full bg-surface-white/80 backdrop-blur-3xl border border-foreground/4 shadow-[0_24px_60px_rgba(0,0,0,0.02)] rounded-4xl p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'}`} />
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 z-10 pl-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
            isHighRisk ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {isHighRisk ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-muted font-medium">Diagnostic Verdict</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">TdP Risk Classification</h2>
              <span className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase border ${
                isHighRisk ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              }`}>
                {tier} TIER
              </span>
            </div>
          </div>
        </div>

        <button onClick={onReset} className="group relative z-10 w-full md:w-auto px-6 py-3 bg-foreground/2 border border-foreground/5 text-foreground text-xs font-semibold uppercase tracking-widest rounded-full hover:bg-foreground hover:text-surface-white transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden">
          <span>Recalibrate</span>
          <RefreshCcw className="w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180" />
        </button>
      </div>

      {/* 2. SPATIAL SHAP MATRIX */}
      <div className="w-full bg-surface-white/60 backdrop-blur-3xl border border-foreground/4 shadow-[0_24px_60px_rgba(0,0,0,0.02)] rounded-4xl p-5 md:p-10 relative mt-2">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-8 relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Scale className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted font-medium">Interpretability Engine</span>
            </div>
            <h3 className="text-lg md:text-xl font-medium text-foreground tracking-tight">Feature Attribution Matrix</h3>
          </div>
        </div>

        {/* 
            DYNAMIC ZERO-AXIS
            Garis sekarang dikunci absolut di tengah-tengah (left-1/2) 
            dengan batasan persentase SHAP dihitung relatif terhadap maxShap.
        */}
        <div className="relative w-full">
          <div className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center justify-center z-0">
            <span className="text-[9px] font-mono text-muted/60 bg-surface-white px-2 py-0.5 rounded border border-foreground/4 mb-1">
              BASE THRESHOLD: {shap.base_value.toFixed(4)}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
          </div>

          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/10 z-0 border-l border-dashed border-foreground/20" />
          
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-1 md:gap-2 relative z-10 pt-2">
            {sortedContributions.map((item, i) => {
              // Normalisasi hingga max 100% untuk satu sisi (kiri atau kanan dari tengah)
              const percentage = (Math.abs(item.shap) / maxShap) * 100; 
              const isPositive = item.shap > 0;

              return (
                <motion.div key={i} variants={itemVariants} className="flex items-center w-full py-2.5 px-3 rounded-xl hover:bg-foreground/2 transition-colors group">
                  
                  {/* Label Biomarker */}
                  <div className="w-[20%] sm:w-[25%] flex flex-col sm:flex-row sm:items-center justify-between pr-3 md:pr-6 shrink-0">
                    <span className="text-[10px] md:text-xs font-semibold text-foreground tracking-wide group-hover:text-accent transition-colors truncate">{item.biomarker}</span>
                    <span className="text-[9px] md:text-[10px] font-mono text-muted/60 mt-0.5 sm:mt-0">v: {item.value.toFixed(2)}</span>
                  </div>

                  {/* Wrapper Sumbu Pusat 50-50 */}
                  <div className="flex-1 flex items-center h-4 relative">
                    
                    {/* Sisi Kiri (Negatif/Biru) */}
                    <div className="w-1/2 h-full flex justify-end items-center pr-0.5">
                      {!isPositive && (
                        <motion.div 
                          initial={{ width: '0%' }} animate={{ width: `${percentage}%` }} 
                          transition={{ duration: 1, delay: 0.5 + (i * 0.05), ease: "easeOut" }} 
                          className="h-0.75 bg-blue-500/30 rounded-l-full relative flex items-center justify-start"
                        >
                          <div className="absolute -left-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        </motion.div>
                      )}
                    </div>

                    {/* Sisi Kanan (Positif/Merah) */}
                    <div className="w-1/2 h-full flex justify-start items-center pl-0.5">
                      {isPositive && (
                        <motion.div 
                          initial={{ width: '0%' }} animate={{ width: `${percentage}%` }} 
                          transition={{ duration: 1, delay: 0.5 + (i * 0.05), ease: "easeOut" }} 
                          className="h-0.75 bg-rose-500/30 rounded-r-full relative flex items-center justify-end"
                        >
                          <div className="absolute -right-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                        </motion.div>
                      )}
                    </div>

                  </div>

                  {/* SHAP Value */}
                  <div className="w-16 md:w-24 flex justify-end shrink-0 pl-2">
                    <div className={`text-[9px] md:text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${isPositive ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'}`}>
                      {isPositive ? '+' : ''}{item.shap.toFixed(4)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-5 border-t border-foreground/4 flex items-center justify-between text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] font-medium">
          <div className="flex items-center gap-2 text-blue-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Defends Against Risk
          </div>
          <div className="flex items-center gap-2 text-rose-500">
            Drives Toxicity Risk <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}