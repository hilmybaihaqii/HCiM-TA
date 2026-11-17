'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
// Asumsikan data ini diimpor dari src/data/compounds.ts
import { BIOMARKERS, COMPOUND_LIBRARY } from '@/data/compounds';

/** Sama dengan breakpoint md Tailwind (768px) */
const MOBILE_QUERY = '(max-width: 767.98px)';

export default function LabForm({ onSubmit, initial }: {
  onSubmit: (data: number[]) => void;
  /** Nilai awal (mis. setelah prediksi gagal, supaya isian tidak hilang) */
  initial?: number[];
}) {
  const [values, setValues] = useState<string[]>(() => (initial?.length === 11 ? initial.map(String) : Array(11).fill('')));
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  // Nilai awal langsung dari media query (area lab hanya dirender di client), supaya render pertama
  // di ponsel sudah 4 obat, tidak 12 lalu melompat.
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  // Ikuti perubahan ukuran layar (rotasi, resize) & reset page langsung di callback event
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      setIsMobile(mql.matches);
      if (!mql.matches) setPage(0);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const injectPreset = (presetId: string, presetValues: number[]) => {
    setValues(presetValues.map(v => v.toString()));
    setActivePreset(presetId);
  };

  const handleManualInput = (idx: number, val: string) => {
    const newVals = [...values];
    newVals[idx] = val;
    setValues(newVals);
    setActivePreset(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values.map(v => parseFloat(v) || 0));
  };

  const filledCount = values.filter(v => v !== '').length;
  const isReady = filledCount === BIOMARKERS.length;

  // Logika pembagian data untuk paginasi 4 obat di mobile
  const itemsPerPage = isMobile ? 4 : 12;
  const totalItems = 12; 
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDrugs = COMPOUND_LIBRARY.slice(0, totalItems).slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full mb-16"
    >
      {/* ID TOUR DITAMBAHKAN DI SINI */}
      <div id="tour-lab-form" className="bg-surface-white/80 backdrop-blur-3xl border border-foreground/4 shadow-[0_24px_60px_rgba(0,0,0,0.02)] rounded-sheet p-5 md:p-8 relative overflow-hidden">
        
        {/* Dekorasi Garis Kaca HUD */}
        <div className="absolute top-0 left-10 w-px h-4 bg-foreground/10" />
        <div className="absolute top-4 left-6 w-8 h-px bg-foreground/10" />

        {/* =========================================================
            1. HEADER MATRIX
            ========================================================= */}
        <div className="pb-6 border-b border-foreground/4 mb-8 relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted font-medium">
              Biomarkers
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-medium text-foreground tracking-tight mb-2">
            Your 11 biomarker ratios
          </h3>
          <p className="text-[11px] md:text-xs text-muted max-w-2xl leading-relaxed">
            Enter each value as a ratio to the drug-free cell, or fill them all from a known drug below.
          </p>
        </div>

        {/* =========================================================
            2. INPUT GRID (BIOMARKERS)
            ========================================================= */}
        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {BIOMARKERS.map((marker, idx) => {
              const hasValue = values[idx] !== '';
              
              return (
                <div 
                  key={marker.id} 
                  className={`relative flex flex-col justify-between bg-foreground/1 border p-4 rounded-card transition-all duration-300 group
                    ${hasValue ? 'border-foreground/8 bg-surface-white/50' : 'border-foreground/4 hover:bg-surface-white/80'}
                    focus-within:bg-surface-white focus-within:border-action/40 focus-within:ring-4 focus-within:ring-action/5 focus-within:shadow-[0_8px_20px_rgba(0,0,0,0.02)]
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[11px] font-mono font-bold tracking-widest text-muted group-focus-within:text-action transition-colors uppercase cursor-text">
                      {marker.name}
                    </label>
                    <span className="text-[9px] font-mono text-muted/50 bg-foreground/2 px-1.5 py-0.5 rounded-chip border border-foreground/4">
                      {marker.unit}
                    </span>
                  </div>
                  
                  <div className="relative flex items-center">
                    <input
                      type="number" step="any" required placeholder="1.000"
                      value={values[idx]}
                      onChange={(e) => handleManualInput(idx, e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-lg font-mono text-foreground font-medium placeholder:text-foreground/10 focus:outline-none focus:ring-0 transition-colors"
                    />

                  </div>

                  <div className="mt-4 pt-3 border-t border-foreground/4 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-muted/40 tracking-widest uppercase line-clamp-1">
                      {marker.cat}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================
              3. AUTO-FILL COMPOUND LIBRARY (PAGINATED GRID)
              ========================================================= */}
          {/* ID TOUR DITAMBAHKAN DI SINI */}
          <div id="tour-preset-drugs" className="mt-8 pt-8 border-t border-foreground/4">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                    Start from a known drug
                  </span>
                </div>
                <p className="text-[10px] md:text-[11px] text-muted leading-relaxed">
                  Fills in all 11 values from the CiPA reference data.
                </p>
              </div>

              {/* Data Source Footnote Label */}
              <div className="flex items-center gap-1.5 bg-foreground/3 border border-foreground/5 px-3 py-1.5 rounded-control shrink-0">
                <span className="text-[10px] text-muted">
                  Source: CiPA in-silico data
                </span>
              </div>
            </div>

            {/* Area Grid Pil Obat */}
            <div className="relative min-h-55 md:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
                >
                  {paginatedDrugs.map((drug) => {
                    const isSelected = activePreset === drug.id;
                    
                    return (
                      <button
                        key={drug.id}
                        type="button"
                        onClick={() => injectPreset(drug.id, drug.values)}
                        className={`group relative flex items-stretch h-12 w-full rounded-control transition-all duration-300 overflow-hidden outline-none text-left
                          ${isSelected 
                            ? 'bg-surface-white border-transparent ring-1 ring-action/60 shadow-[0_6px_16px_-4px_rgba(0,0,0,0.1)] scale-[1.02]' 
                            : 'bg-surface-white/60 border border-foreground/10 hover:border-foreground/20 hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm'
                          }
                        `}
                      >
                        {/* Sisi Kiri Kapsul */}
                        <div className={`relative w-11 shrink-0 flex items-center justify-center transition-all duration-300
                          ${isSelected 
                            ? 'bg-action text-surface-white' 
                            : 'bg-foreground/4 text-muted group-hover:bg-foreground/8 group-hover:text-foreground'
                          }
                        `}>
                          <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                            <path d="m8.5 8.5 7 7"/>
                          </svg>
                          {isSelected && (
                            <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-80 pointer-events-none" />
                          )}
                        </div>

                        {/* Garis Pembatas Kapsul */}
                        <div className={`w-px shrink-0 transition-colors duration-300 
                          ${isSelected ? 'bg-action/20' : 'bg-foreground/5 group-hover:bg-foreground/10'}
                        `} />

                        {/* Sisi Kanan Kapsul */}
                        <div className={`flex-1 min-w-0 px-3.5 flex flex-col justify-center transition-all duration-300
                          ${isSelected ? 'bg-action/5' : 'bg-transparent'}
                        `}>
                          <span className={`text-xs font-bold tracking-tight truncate block w-full transition-colors 
                            ${isSelected ? 'text-action' : 'text-foreground group-hover:text-foreground/80'}
                          `}>
                            {drug.name}
                          </span>
                          <span className={`text-[8px] font-mono tracking-wider uppercase truncate block w-full mt-0.5 transition-colors
                            ${isSelected ? 'text-action/60' : 'text-muted/50'}
                          `}>
                            {drug.type}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigasi Paginasi Profesional dengan Arrow (Hanya Aktif di Mobile) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 md:hidden">
                {/* Tombol Previous */}
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  className={`w-8 h-8 rounded-control flex items-center justify-center transition-all border outline-none
                    ${page === 0 
                      ? 'border-foreground/5 text-muted/20 cursor-not-allowed' 
                      : 'border-foreground/10 text-muted hover:text-action hover:bg-action/10 active:scale-90'
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Nomor Halaman */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPage(idx)}
                      className={`w-7 h-7 rounded-control text-[11px] font-mono font-medium transition-all duration-300 flex items-center justify-center outline-none
                        ${page === idx
                          ? 'bg-action text-surface-white shadow-sm scale-105'
                          : 'bg-foreground/5 text-muted hover:bg-action/10 hover:text-action'
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Tombol Next */}
                <button
                  type="button"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  className={`w-8 h-8 rounded-control flex items-center justify-center transition-all border outline-none
                    ${page === totalPages - 1 
                      ? 'border-foreground/5 text-muted/20 cursor-not-allowed' 
                      : 'border-foreground/10 text-muted hover:text-action hover:bg-action/10 active:scale-90'
                    }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* =========================================================
              4. ACTION FOOTER
              ========================================================= */}
          <div className="mt-10 pt-6 border-t border-foreground/4 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Filled in</span>
                <span className={`text-sm font-medium ${isReady ? 'text-foreground' : 'text-muted'}`}>
                  {filledCount} of 11 values
                </span>
              </div>
            </div>

            {/* ID TOUR DITAMBAHKAN DI SINI */}
            <button 
              id="tour-start-button"
              type="submit"
              disabled={!isReady}
              className={`group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 rounded-control shadow-lg 
                ${isReady
                  ? 'bg-accent text-surface-white hover:bg-accent-dark hover:shadow-accent/25 hover:scale-[1.02] active:scale-95 cursor-pointer'
                  : 'bg-foreground/10 text-muted/50 shadow-none cursor-not-allowed'
                }
              `}
            >
              Predict risk
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>

      </div>
    </motion.div>
  );
}