'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api'; 
import EngineVisualizer from './components/EngineVisualizer';
import LabForm from './components/LabForm';
import LabResults from './components/LabResults';
import ProcessingLoader from './components/ProcessingLoader';
import TutorialGuide from './components/LabTutorial'; 

type Stage = 'idle' | 'ingestion' | 'inference' | 'consensus' | 'completed';

type SHAPData = {
  predicted_class: string;
  base_value: number;
  contributions: { biomarker: string; value: number; shap: number }[];
};

type SimulationResult = { 
  success: boolean; 
  tier?: string; 
  shapData?: SHAPData; 
  error?: string; 
};

// ============================================================================
// KOMPONEN SKELETON
// ============================================================================
function LabSkeleton() {
  return (
    <div className="w-full flex flex-col min-h-100 bg-background overflow-x-hidden">
      <div className="w-full pt-20 md:pt-28 relative z-10 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="w-full bg-surface-white/40 border border-foreground/4 rounded-4xl p-5 md:p-10 flex flex-col">
            <div className="flex items-center justify-between border-b border-foreground/4 pb-4 mb-8 md:mb-12">
              <div className="flex items-center gap-3"><div className="h-4 w-32 bg-foreground/5 rounded-md animate-pulse" /></div>
              <div className="hidden sm:block h-3 w-20 bg-foreground/5 rounded-md animate-pulse" />
            </div>
            <div className="relative w-full mb-2">
              <div className="absolute top-5 md:top-6 left-[12.5%] right-[12.5%] h-px bg-foreground/6" />
              <div className="flex justify-between relative z-10 w-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center w-1/4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground/10 animate-pulse mb-4 md:mb-5" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-2 w-8 bg-foreground/5 rounded-full animate-pulse" />
                      <div className="h-3 w-16 md:w-24 bg-foreground/10 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative mt-6 pb-20">
        <div className="w-full bg-surface-white/40 border border-foreground/4 rounded-4xl p-5 md:p-8">
          <div className="pb-6 border-b border-foreground/4 mb-8">
            <div className="h-3 w-24 bg-foreground/5 rounded-md animate-pulse mb-4" />
            <div className="h-6 w-64 md:w-80 bg-foreground/10 rounded-md animate-pulse mb-4" />
            <div className="h-3 w-full max-w-2xl bg-foreground/5 rounded-md animate-pulse" />
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="flex flex-col justify-between bg-foreground/1 border border-foreground/4 p-4 rounded-2xl h-26">
                <div className="flex justify-between mb-3">
                  <div className="h-3 w-16 bg-foreground/10 rounded-md animate-pulse" />
                  <div className="h-3 w-8 bg-foreground/5 rounded-md animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-foreground/5 rounded-md animate-pulse" />
                <div className="mt-4 pt-3 border-t border-foreground/4"><div className="h-2 w-20 bg-foreground/5 rounded-md animate-pulse" /></div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-foreground/4">
            <div className="flex justify-between mb-6">
              <div>
                <div className="h-3 w-28 bg-foreground/10 rounded-md animate-pulse mb-3" />
                <div className="h-3 w-64 bg-foreground/5 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (<div key={i} className="h-12 w-full bg-foreground/5 rounded-full animate-pulse border border-foreground/5" />))}
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-foreground/4 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground/5 animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-2 w-20 bg-foreground/5 rounded-md animate-pulse" />
                <div className="h-3 w-32 bg-foreground/10 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="w-full sm:w-48 h-12 bg-foreground/10 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HALAMAN UTAMA (OTAK SISTEM AI)
// ============================================================================
export default function DigitalLabPage() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeStage, setActiveStage] = useState<Stage>('idle');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const fetchWithRetry = async (endpoint: string, payload: { data: number[] }, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await api(endpoint, {
          method: "POST",
          body: payload
        });
      } catch (err: unknown) {
        if (i === retries - 1) throw err; 
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  };

  const handleSimulation = async (inputs: number[]) => {
    setError(null);
    setResult(null);
    setActiveStage('ingestion');
    
    await new Promise(r => setTimeout(r, 600));
    setActiveStage('inference');
    
    try {
      const payload = { data: inputs };

      const predictData = await fetchWithRetry("/api/predict", payload);
      setActiveStage('consensus');
      
      const explainData = await fetchWithRetry("/api/explain", payload);
      await new Promise(r => setTimeout(r, 600)); 
      
      const tierLabel = predictData.data[0].label;
      const shapResult = explainData.data[0];

      setResult({
        success: true,
        tier: tierLabel, 
        shapData: {
          predicted_class: tierLabel, 
          base_value: shapResult.base_value,
          contributions: shapResult.contributions
        }
      });
      setActiveStage('completed');

    } catch (err: unknown) {
      console.error("AI Node Error Detail:", err);
      
      const apiErr = err as Record<string, unknown>;
      
      if (apiErr?.status === 401) {
        setError('Session expired. Please reload the page to authenticate.');
      } else {
        const backendMessage = apiErr?.message || apiErr?.error || (err instanceof Error ? err.message : 'Unknown Server Error');
        setError(`AI Engine Failed: ${backendMessage}`);
      }
      setActiveStage('idle');
    }
  };

  const handleReset = () => {
    setResult(null);
    setActiveStage('idle');
  };

  return (
    <>
      {/* CROSSFADE TRANSACTIONS UNTUK SKELETON -> MAIN PAGE */}
      <AnimatePresence mode="wait">
        {isInitializing ? (
          <motion.div 
            key="skeleton" 
            exit={{ opacity: 0, filter: 'blur(4px)' }} 
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            <LabSkeleton />
          </motion.div>
        ) : (
          <motion.div 
            key="main"
            id="tour-main-lab" 
            initial={{ opacity: 0, filter: 'blur(4px)' }} 
            animate={{ opacity: 1, filter: 'blur(0px)' }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
            className="w-full flex flex-col min-h-100 bg-background text-foreground overflow-x-hidden"
          >
            <TutorialGuide />
            <EngineVisualizer activeStage={activeStage} />

            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative min-h-100 mt-6 pb-20">
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-mono text-center tracking-wide shadow-sm"
                >
                  [SYSTEM_CORE_ERROR] // {error}
                </motion.div>
              )}

              {/* PREMIUM BLUR TRANSITIONS ANTARA STAGE */}
              <AnimatePresence mode="wait">
                {(activeStage === 'idle' || activeStage === 'ingestion') && !result && (
                  <motion.div 
                    key="form" 
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} 
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)', scale: 0.98 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <LabForm onSubmit={handleSimulation} />
                  </motion.div>
                )}

                {(activeStage === 'inference' || activeStage === 'consensus') && (
                  <motion.div 
                    key="processing" 
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }} 
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex justify-center w-full"
                  >
                    <ProcessingLoader stage={activeStage as 'inference' | 'consensus'} />
                  </motion.div>
                )}

                {activeStage === 'completed' && result && result.tier && result.shapData && (
                  <motion.div 
                    key="results" 
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} 
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <LabResults tier={result.tier} shap={result.shapData} onReset={handleReset} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}