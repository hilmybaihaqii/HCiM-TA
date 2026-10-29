'use client';

import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { TooltipRenderProps, EventData, Step } from 'react-joyride';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, X, ChevronLeft } from 'lucide-react';

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
        className="bg-white/95 backdrop-blur-2xl border border-black/5 shadow-[0_30px_80px_rgba(0,0,0,0.12)] rounded-card p-6 md:p-8 flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 right-10 w-32 h-px bg-linear-to-r from-transparent via-accent/30 to-transparent" />
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center border border-black/3">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-semibold">
              Step {index + 1} / {size}
            </span>
          </div>
          
          <button {...closeProps} className="p-1.5 text-neutral-300 hover:text-foreground hover:bg-neutral-100 rounded-control transition-colors outline-none group" title="Skip Tour">
            <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
          </button>
        </div>

        <div className="mb-8">
          {step.title && <h3 className="text-lg md:text-xl font-medium tracking-tight text-foreground mb-2">{step.title}</h3>}
          <p className="text-xs md:text-[13px] text-neutral-500 leading-relaxed">{step.content}</p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          {index > 0 ? (
            <button {...backProps} className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-foreground transition-colors outline-none">
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
          ) : <div />}

          <button {...primaryProps} className="group flex items-center gap-2 px-5 py-2.5 bg-action hover:bg-action-dark text-white text-[11px] font-bold uppercase tracking-widest rounded-control transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(42,42,42,0.2)] hover:-translate-y-0.5 outline-none">
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function LabTutorial() {
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Membisukan linter khusus untuk baris ini, karena kita MEMANG 
    // sengaja memicu render untuk menghindari error Hydration di Next.js
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    const hasSeenTutorial = localStorage.getItem('hasSeenLabTutorial');
    
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setRun(true);
        window.dispatchEvent(new Event('resize')); 
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, []);

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
      title: 'Welcome to the Digital Lab',
      content: 'A quick tour of how to check a drug for the risk of Torsades de Pointes (TdP), a dangerous heart rhythm.',
    },
    {
      target: '#tour-navbar-menu',
      placement: 'bottom', 
      isFixed: true, 
      title: 'Pages',
      content: 'Full Pipeline starts from drug data and simulates the heart cell for you. Digital Lab takes biomarkers you already have. Activity Logs keeps every result.',
    },
    {
      target: '#tour-user-profile',
      placement: 'bottom', 
      isFixed: true, 
      title: 'Your account',
      content: 'Change your password or sign out here.',
    },
    {
      target: '#tour-engine-visualizer',
      placement: 'bottom',
      title: 'Progress',
      content: 'Shows where your prediction is while it runs, from reading your data to the result.',
    },
    {
      target: '#tour-lab-form',
      placement: 'top', 
      title: 'Your biomarkers',
      content: 'Enter the 11 biomarker ratios from your own simulation. All 11 are needed.',
    },
    {
      target: '#tour-preset-drugs',
      placement: 'top',
      title: 'Known drugs',
      content: 'No data yet? Fill the form with a known drug from the CiPA reference set.',
    },
    {
      target: '#tour-start-button',
      placement: 'top',
      title: 'Predict',
      content: 'When all 11 values are in, press Predict risk to see the result and what drove it.',
    }
  ];

  // Mencegah Joyride dirender di server untuk menghindari Hydration Mismatch
  if (!isMounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      onEvent={handleJoyrideEvent}
      tooltipComponent={CustomTooltip} 
      beaconComponent={() => null}
      scrollToFirstStep={true}
      options={{
        zIndex: 10000,
        overlayColor: 'rgba(10, 10, 10, 0.65)', 
      }}
    />
  );
}