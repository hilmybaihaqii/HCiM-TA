'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { analyzeBiomarkers } from './actions';
import EngineVisualizer from './components/EngineVisualizer';
import LabForm from './components/LabForm';
import LabResults from './components/LabResults';

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

export default function DigitalLabPage() {
  const [activeStage, setActiveStage] = useState<Stage>('idle');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulation = async (inputs: number[]) => {
    setError(null);
    setResult(null);
    
    setActiveStage('ingestion');
    const apiCallPromise = analyzeBiomarkers(inputs); 
    
    await new Promise(r => setTimeout(r, 1000));
    setActiveStage('inference');
    
    const res = await apiCallPromise;
    await new Promise(r => setTimeout(r, 1500)); 
    setActiveStage('consensus');
    
    await new Promise(r => setTimeout(r, 1500)); 
    
    if (res.success && res.tier && res.shapData) {
      setResult(res as SimulationResult);
      setActiveStage('completed');
    } else {
      setError(res.error || 'An error occurred during pipeline execution.');
      setActiveStage('idle');
    }
  };

  const handleReset = () => {
    setResult(null);
    setActiveStage('idle');
  };

  return (
    <>
      <EngineVisualizer activeStage={activeStage} />

      <div className="px-6 md:px-12 relative min-h-150">
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} 
            className="max-w-4xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-mono uppercase tracking-widest text-center shadow-sm"
          >
            [SYS_ERROR] {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          
          {(activeStage === 'idle' || activeStage === 'ingestion') && !result && (
            <LabForm key="form" onSubmit={handleSimulation} />
          )}

          {(activeStage === 'inference' || activeStage === 'consensus') && (
            <motion.div 
              key="processing" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-24 md:mt-32 flex flex-col items-center justify-center"
            >
               <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }} 
                    className="absolute inset-0 border-[2px] border-neutral-200 border-t-[#E63946] rounded-full shadow-sm" 
                  />
                  <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }} 
                    className="absolute inset-4 border-[2px] border-neutral-100 border-b-neutral-400 rounded-full" 
                  />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-medium">
                    Computing
                  </span>
               </div>
               
               <p className="text-sm text-neutral-600 font-medium tracking-tight bg-white px-6 py-2 rounded-full border border-neutral-200 shadow-sm">
                 {activeStage === 'inference' ? 'Evaluating parallel base learners...' : 'Synthesizing hard voting logic...'}
               </p>
            </motion.div>
          )}

          {activeStage === 'completed' && result && result.tier && result.shapData && (
            <LabResults key="results" tier={result.tier} shap={result.shapData} onReset={handleReset} />
          )}

        </AnimatePresence>
      </div>
    </>
  );
}