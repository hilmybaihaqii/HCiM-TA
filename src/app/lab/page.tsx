'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api'; 
import EngineVisualizer from './components/EngineVisualizer';
import LabForm from './components/LabForm';
import LabResults, { parsePredictResponse, PredictionOutput } from './components/LabResults';
import { PageSkeleton, ResultSkeleton } from './components/Skeletons';
import TutorialGuide from './components/LabTutorial';
import LabPageHeader from './components/LabPageHeader';

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
  prediction?: PredictionOutput | null;
  error?: string; 
};

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

  const fetchWithRetry = async (endpoint: string, payload: { data: number[]; prediction_id?: string }, retries = 3) => {
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
      
      const predictionId =
        typeof predictData?.prediction_id === 'string' && predictData.prediction_id.trim() !== ''
          ? predictData.prediction_id.trim()
          : undefined;

      const explainPayload: { data: number[]; prediction_id?: string } = {
        data: inputs,
        ...(predictionId ? { prediction_id: predictionId } : {}),
      };

      const explainData = await fetchWithRetry("/api/explain", explainPayload);
      await new Promise(r => setTimeout(r, 600)); 
      
      const tierLabel = String(predictData.data[0].label || 'unknown').toLowerCase();
      const shapResult = explainData.data[0];
      // Parse response /api/predict yang lebih lengkap (confidences + conformal prediction)
      const parsedPrediction = parsePredictResponse(predictData.data);

      setResult({
        success: true,
        tier: tierLabel, 
        shapData: {
          predicted_class: tierLabel, 
          base_value: shapResult.base_value,
          contributions: shapResult.contributions
        },
        prediction: parsedPrediction,
      });
      setActiveStage('completed');

    } catch (err: unknown) {
      // Error asli & {status,data} dari api.ts sengaja di-flatten manual di sini,
      // karena Error native (message/stack non-enumerable) tampil sebagai "{}" kosong
      // kalau di-log langsung lewat Next.js dev overlay.
      console.error("AI Node Error Detail:", {
        name: err instanceof Error ? err.name : undefined,
        message: err instanceof Error ? err.message : undefined,
        ...(typeof err === 'object' && err !== null ? err : { raw: err }),
      });

      const apiErr = err as Record<string, unknown>;
      const status = typeof apiErr?.status === 'number' ? apiErr.status : undefined;
      const errData = apiErr?.data as Record<string, unknown> | null;

      let detailMsg: string | undefined;
      if (errData) {
        if (typeof errData.detail === 'string') {
          detailMsg = errData.detail;
        } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
          const firstErr = errData.detail[0] as Record<string, unknown> | string;
          detailMsg = typeof firstErr === 'string' ? firstErr : (typeof firstErr?.msg === 'string' ? firstErr.msg : JSON.stringify(firstErr));
        } else if (typeof errData.message === 'string') {
          detailMsg = errData.message;
        } else if (typeof errData.error === 'string') {
          detailMsg = errData.error;
        }
      }
      if (!detailMsg && typeof apiErr?.message === 'string') {
        detailMsg = apiErr.message;
      }

      if (status === 401) {
        setError('Session expired. Please reload the page to authenticate.');
      } else if (status === 422) {
        setError(detailMsg ? `Invalid input: ${detailMsg}` : 'Invalid input');
      } else if (status === 429) {
        setError('Too many requests. Please wait a few seconds and try again.');
      } else if (status === 502 || status === 503 || status === 504) {
        setError('The AI engine is waking up. Please try again in about a minute.');
      } else if (err instanceof TypeError) {
        // fetch() gagal total di level jaringan (backend unreachable / cold-start / offline)
        setError('Could not reach the AI engine. Please check your connection and try again.');
      } else {
        const backendMessage = detailMsg || apiErr?.error || (err instanceof Error ? err.message : 'Unknown Server Error');
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
            <PageSkeleton />
          </motion.div>
        ) : (
          <motion.div 
            key="main"
            id="tour-main-lab" 
            initial={{ opacity: 0, filter: 'blur(4px)' }} 
            animate={{ opacity: 1, filter: 'blur(0px)' }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
            className="w-full flex flex-col min-h-100 text-foreground overflow-x-hidden"
          >
            <TutorialGuide />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-28 md:pt-36 pb-20 flex flex-col gap-8">
              <LabPageHeader
                eyebrow="Digital lab"
                title="Bring your biomarkers."
                accent="Get the risk."
                description="Enter the 11 biomarker ratios from your own simulation and run the Cardivex risk model."
              />
              <EngineVisualizer activeStage={activeStage} />

              <div className="relative min-h-100">
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  role="alert"
                  className="mb-6 pl-4 border-l-2 border-rose-500/70 text-sm text-rose-600 leading-relaxed"
                >
                  {error}
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
                    className="w-full"
                  >
                    <ResultSkeleton label="Checking the risk" />
                  </motion.div>
                )}

                {activeStage === 'completed' && result && result.tier && result.shapData && (
                  <motion.div 
                    key="results" 
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }} 
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <LabResults tier={result.tier} shap={result.shapData} prediction={result.prediction} onReset={handleReset} />
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}