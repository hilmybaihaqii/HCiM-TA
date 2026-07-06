'use client';

import React from 'react';
import { motion } from 'framer-motion';

type SHAPData = {
  predicted_class: string;
  base_value: number;
  contributions: { biomarker: string; value: number; shap: number }[];
};

export default function LabResults({ tier, shap, onReset }: { tier: string; shap: SHAPData; onReset: () => void }) {
  // Urutkan SHAP berdasarkan magnitudo terbesar agar biomarker paling berpengaruh berada di atas
  const sortedContributions = [...shap.contributions].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
  const maxShap = Math.max(...sortedContributions.map(c => Math.abs(c.shap)));

  // Konfigurasi Tema Berdasarkan Tingkat Risiko
  const getTierTheme = (tierLevel: string) => {
    const level = tierLevel.toLowerCase();
    if (level === 'high') {
      return {
        bg: 'bg-[#FEF2F2]',
        border: 'border-[#FCA5A5]',
        text: 'text-[#DC2626]',
        badge: 'bg-[#DC2626] text-white',
        shadow: 'shadow-[0_10px_40px_rgba(220,38,38,0.1)]'
      };
    }
    if (level === 'intermediate') {
      return {
        bg: 'bg-[#FFFBEB]',
        border: 'border-[#FCD34D]',
        text: 'text-[#D97706]',
        badge: 'bg-[#D97706] text-white',
        shadow: 'shadow-[0_10px_40px_rgba(217,119,6,0.1)]'
      };
    }
    return {
      bg: 'bg-[#F0FDF4]',
      border: 'border-[#86EFAC]',
      text: 'text-[#059669]',
      badge: 'bg-[#059669] text-white',
      shadow: 'shadow-[0_10px_40px_rgba(5,150,105,0.1)]'
    };
  };

  const theme = getTierTheme(tier);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
      className="w-full max-w-5xl mx-auto mt-12 mb-24 flex flex-col gap-8"
    >
      
      {/* =========================================================
          HEADER: RISK TIER RESULT (Dynamic Banner)
          ========================================================= */}
      <div className={`w-full rounded-[2rem] border ${theme.border} ${theme.bg} ${theme.shadow} px-8 md:px-12 py-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-all`}>
        
        {/* Dekorasi Air (Watermark) Halus di Background Banner */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center md:text-left">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 font-semibold mb-2 block">
            Clinical Synthesis Outcome
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
              TdP Risk Assessment
            </h2>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest ${theme.badge} shadow-sm`}>
              {tier}
            </span>
          </div>
        </div>

        <button 
          onClick={onReset} 
          className="relative z-10 px-8 py-4 bg-white border border-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm"
        >
          Reset Simulation
        </button>
      </div>

      {/* =========================================================
          BODY: SHAP EXPLANATION MATRIX (White Card)
          ========================================================= */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-neutral-100 overflow-hidden px-8 md:px-12 py-10">
        
        {/* Header Matrix */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-100 pb-8">
          <div>
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Model Explainability</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Explaining the key electrophysiological drivers pushing the drug toward <strong className="text-neutral-900 uppercase">{shap.predicted_class}</strong> risk[cite: 1].
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3 text-xs font-mono">
            <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-md">
              Base Value: <strong>{shap.base_value.toFixed(4)}</strong>
            </span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" /> Decreases Risk
              </span>
              <span className="flex items-center gap-1.5 text-neutral-500">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Increases Risk
              </span>
            </div>
          </div>
        </div>

        {/* Rows Bar Chart SHAP */}
        <div className="flex flex-col gap-1 relative">
          
          {/* Sumbu Y (Garis Vertikal Netral 0) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-200 z-0 border-l border-dashed border-neutral-300" />
          
          {sortedContributions.map((item, i) => {
            const percentage = (Math.abs(item.shap) / maxShap) * 100;
            const isPositive = item.shap > 0; // SHAP positif mendorong ke arah prediksi, negatif menjauh[cite: 1]

            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex items-center gap-4 relative z-10 group hover:bg-neutral-50 py-2.5 px-2 rounded-lg transition-colors"
              >
                {/* Kolom 1: Nama Biomarker & Nilai Asli */}
                <div className="w-1/4 flex justify-between items-center pr-4">
                  <span className="text-sm font-semibold text-neutral-700">{item.biomarker}</span>
                  <span className="text-xs font-mono text-neutral-400 bg-white border border-neutral-100 px-1.5 py-0.5 rounded shadow-sm">
                    {item.value.toFixed(3)}
                  </span>
                </div>

                {/* Kolom 2: Diagram Batang Kiri-Kanan */}
                <div className="flex-1 flex items-center justify-center h-8">
                  
                  {/* Sisi Negatif (Biru) */}
                  <div className="w-1/2 flex justify-end items-center pr-1.5">
                    {!isPositive && (
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.2 + (i * 0.05), ease: "easeOut" }}
                        className="h-5 bg-[#3B82F6] rounded-l-sm rounded-r-[1px] shadow-sm relative flex items-center justify-start"
                      >
                         <div className="absolute left-0 w-1.5 h-full bg-black/10 rounded-l-sm" />
                      </motion.div>
                    )}
                  </div>

                  {/* Sisi Positif (Merah) */}
                  <div className="w-1/2 flex justify-start items-center pl-1.5">
                    {isPositive && (
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.2 + (i * 0.05), ease: "easeOut" }}
                        className="h-5 bg-[#EF4444] rounded-r-sm rounded-l-[1px] shadow-sm relative flex items-center justify-end"
                      >
                        <div className="absolute right-0 w-1.5 h-full bg-black/10 rounded-r-sm" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Kolom 3: Angka SHAP Value */}
                <div className="w-24 text-right pl-4">
                  <span className={`text-xs font-mono font-bold ${isPositive ? 'text-[#EF4444]' : 'text-[#3B82F6]'}`}>
                    {item.shap > 0 ? '+' : ''}{item.shap.toFixed(4)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Matrix */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
          <span>← Decreases risk of {shap.predicted_class}</span>
          <span>Increases risk of {shap.predicted_class} →</span>
        </div>
      </div>

    </motion.div>
  );
}