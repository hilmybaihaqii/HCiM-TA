'use client';

import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
// Perhatikan: Menggunakan CallBackProps, bukan EventData untuk v3
import type { EventData, Step, TooltipRenderProps } from 'react-joyride';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X, ChevronLeft } from 'lucide-react';

// ============================================================================
// KOMPONEN TOOLTIP KUSTOM (TETAP PREMIUM & ELEGAN)
// ============================================================================
const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
}: TooltipRenderProps) => {
  return (
    <div {...tooltipProps} className="max-w-85 md:max-w-100 w-full outline-none z-10000">
      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white/95 backdrop-blur-2xl border border-black/5 shadow-[0_30px_80px_rgba(0,0,0,0.12)] rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 right-10 w-32 h-px bg-linear-to-r from-transparent via-[#E63946]/30 to-transparent" />
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center border border-black/3">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-semibold">
              Step {index + 1} / {size}
            </span>
          </div>
          
          <button {...closeProps} type="button" className="p-1.5 text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors outline-none group" title="Skip Tour">
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        <div className="mb-8">
          {step.title && <h3 className="text-lg md:text-xl font-medium tracking-tight text-neutral-900 mb-2">{step.title}</h3>}
          <p className="text-xs md:text-[13px] text-neutral-500 leading-relaxed">{step.content}</p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          {index > 0 ? (
            <button {...backProps} type="button" className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors outline-none">
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
          ) : <div />}

          <button {...primaryProps} type="button" className="group flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-[#E63946] text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(230,57,70,0.25)] hover:-translate-y-0.5 outline-none">
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// KOMPONEN UTAMA
// ============================================================================
export default function LabTutorial() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenLabTutorial');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, []);

  // Perbaikan tipe data parameter menggunakan CallBackProps dari v3
  const handleJoyrideEvent = (data: EventData) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === 'close') {
      setRun(false);
      localStorage.setItem('hasSeenLabTutorial', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: 'body', 
      placement: 'center',
      title: 'Welcome! 👋',
      content: 'Welcome to the Cardiotox Digital Lab. This guided tour will introduce you to the core functionalities of our AI engine for predicting drug-induced cardiotoxicity.',
    },
    {
      target: '#tour-navbar-menu',
      placement: 'bottom', 
      isFixed: true, 
      title: 'Navigation Console',
      content: 'Navigate between modules here. The "Digital Lab" houses the simulation environment, while "Activity Logs" maintains a comprehensive record of your prior predictive analyses.',
    },
    {
      target: '#tour-user-profile',
      placement: 'bottom-end', 
      isFixed: true, 
      title: 'Identity & Security',
      content: 'Access your profile to manage account configurations, verify credentials, and securely terminate your active session.',
    },
    {
      target: '#tour-engine-visualizer',
      placement: 'bottom',
      title: 'Engine Telemetry',
      content: 'Monitor the Stacking Ensemble model\'s workflow in real-time. This pipeline visualizes each phase, from initial data ingestion through to the final model consensus.',
    },
    {
      target: '#tour-lab-form',
      placement: 'top', 
      title: 'Biomarker Ingestion',
      content: 'Input the required cardiovascular biomarker data here. Accurate entry of these 11 essential features is critical for precise Torsade de Pointes (TdP) risk prediction.',
    },
    {
      target: '#tour-preset-drugs',
      placement: 'top',
      title: 'Compound Library',
      content: 'Alternatively, streamline your workflow by loading validated datasets of known pharmaceutical compounds, sourced directly from the CiPA In-Silico framework.',
    },
    {
      target: '#tour-start-button',
      placement: 'top',
      title: 'Initiate Pipeline',
      content: 'Once all parameters are configured, initiate the evaluation. The AI engine will process the inputs and compute the predicted cardiotoxicity risk level.',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      
      // PERBAIKAN v3: onEvent diubah menjadi callback
      onEvent={handleJoyrideEvent}
      
      tooltipComponent={CustomTooltip} 
      beaconComponent={() => null}
      scrollToFirstStep={true}
      
      
      // PERBAIKAN v3: Menghapus object 'options' sepenuhnya, langsung tembak ke 'overlay'
      options={{
        zIndex: 10000,
        overlayColor: 'rgba(10,10,10,.65)',
      }}

      styles={{
        overlay: {
          backdropFilter: 'blur(3px)',
        },
      }}
    />
  );
}