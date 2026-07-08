'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { analyzeBiomarkers } from './actions';
import EngineVisualizer from './components/EngineVisualizer';
import LabForm from './components/LabForm';
import LabResults from './components/LabResults';
import ProcessingLoader from './components/ProcessingLoader'; // <-- Import komponen loader baru

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
    
    await new Promise(r => setTimeout(r, 600));
    setActiveStage('inference');
    
    const res = await apiCallPromise;
    await new Promise(r => setTimeout(r, 800)); 
    setActiveStage('consensus');
    
    await new Promise(r => setTimeout(r, 600)); 
    
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
    <div className="w-full flex flex-col min-h-100 bg-background text-foreground overflow-x-hidden">
      
      {/* Visualizer memikul jangkar px internalnya sendiri */}
      <EngineVisualizer activeStage={activeStage} />

      {/* Pembungkus Konten Utama: Terkunci Konsisten dengan Pola Landing Page */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 relative min-h-100 mt-6">
        {error && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/25 rounded-2xl text-accent text-xs font-mono text-center tracking-wide">
            [SYSTEM_CORE_ERROR] // {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {(activeStage === 'idle' || activeStage === 'ingestion') && !result && (
            <LabForm key="form" onSubmit={handleSimulation} />
          )}

          {/* =========================================================
              NEW ELEGANT PROCESSING LOADER INTEGRATION
              ========================================================= */}
          {(activeStage === 'inference' || activeStage === 'consensus') && (
            <motion.div 
              key="processing" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }} 
            >
              {/* Memanggil komponen loader dengan passing data stage */}
              <ProcessingLoader stage={activeStage as 'inference' | 'consensus'} />
            </motion.div>
          )}

          {activeStage === 'completed' && result && result.tier && result.shapData && (
            <LabResults key="results" tier={result.tier} shap={result.shapData} onReset={handleReset} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}