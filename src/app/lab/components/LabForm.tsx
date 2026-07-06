'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Urutan wajib sesuai kontrak API
const BIOMARKERS = [
  'qNet', 'dvdtmax', 'vmax', 'vrest', 'APD50', 
  'APD90', 'max_dv', 'camax', 'carest', 'CaTD50', 'CaTD90'
];

export default function LabForm({ onSubmit }: { onSubmit: (data: number[]) => void }) {
  const [values, setValues] = useState<string[]>(Array(11).fill(''));

  const handleChange = (index: number, val: string) => {
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValues = values.map(v => parseFloat(v) || 0);
    onSubmit(numValues);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl mx-auto mt-12 md:mt-16 mb-24"
    >
      {/* =========================================================
          FORM CARD CONTAINER
          ========================================================= */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-neutral-100 overflow-hidden">
        
        {/* Header Form */}
        <div className="px-8 md:px-12 py-10 border-b border-neutral-100 bg-white">
          <h3 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-2">
            Biomarker Parameter Input
          </h3>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl">
            Please provide the raw, unscaled values for the 11 electrophysiological parameters. Ensure data integrity before initializing the prediction pipeline.
          </p>
        </div>

        {/* Body Form (Input Grid) */}
        <form onSubmit={handleSubmit} className="px-8 md:px-12 py-10 bg-[#FAFAFA]/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            
            {BIOMARKERS.map((marker, idx) => (
              <div key={marker} className="flex flex-col group relative">
                
                {/* Label dengan Tipografi Monospace Elegan */}
                <label className="text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 mb-2 ml-1 transition-colors group-focus-within:text-[#E63946] font-medium">
                  {marker}
                </label>
                
                {/* Input Kotak Premium ala Stripe */}
                <div className="relative">
                  <input
                    type="number" 
                    step="any" 
                    required 
                    value={values[idx]} 
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 font-mono transition-all duration-300
                               placeholder:text-neutral-300
                               focus:bg-white focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-[#E63946]/10"
                    placeholder="0.000"
                  />
                  {/* Ikon dekoratif kecil yang muncul saat diisi */}
                  {values[idx] !== '' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
              </div>
            ))}

          </div>

          {/* Footer Form & Submit Button */}
          <div className="mt-12 pt-10 border-t border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
              <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Data will be processed via secure endpoints.</span>
            </div>

            <button 
              type="submit" 
              className="w-full sm:w-auto px-10 py-4 bg-[#18181B] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-xl 
                         hover:bg-[#E63946] hover:shadow-[0_10px_20px_rgba(230,57,70,0.2)] 
                         hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
            >
              Run Prediction
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

          </div>
        </form>

      </div>
    </motion.div>
  );
}