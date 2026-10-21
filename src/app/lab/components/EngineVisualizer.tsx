'use client';

import React from 'react';
import { Activity, Cpu, Database, Network } from 'lucide-react';
import EngineStatus, { type EngineStep } from './EngineStatus';

type Stage = 'idle' | 'ingestion' | 'inference' | 'consensus' | 'completed';

/* Langkah sama jumlahnya dengan Full Pipeline: input -> proses -> analisis -> hasil */
const STEPS: EngineStep[] = [
  { id: 'ingestion', label: 'Your data', icon: Database },
  { id: 'inference', label: 'Analysis', icon: Cpu },
  { id: 'consensus', label: 'Confidence', icon: Network },
  { id: 'completed', label: 'Result', icon: Activity },
];

const STAGE_INDEX: Record<Stage, number> = { idle: 0, ingestion: 0, inference: 1, consensus: 2, completed: 3 };

const STAGE_TEXT: Record<Stage, string> = {
  idle: 'Ready when you are',
  ingestion: 'Reading your biomarkers',
  inference: 'Checking the risk',
  consensus: 'Measuring how sure the model is',
  completed: 'Your result is ready',
};

/** Status engine Digital Lab: tampilan bersama EngineStatus, tahap milik model ML. */
export default function EngineVisualizer({ activeStage }: { activeStage: Stage }) {
  return (
    <EngineStatus
      id="tour-engine-visualizer"
      steps={STEPS}
      activeIndex={STAGE_INDEX[activeStage]}
      complete={activeStage === 'completed'}
      status={STAGE_TEXT[activeStage]}
    />
  );
}
