'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChartColumn, Gauge, ListChecks } from 'lucide-react';
import { formatChange, strongestChange } from '@/lib/pipeline';
import { getTierColor } from '@/lib/tierColor';
import LabForm from './components/LabForm';
import TutorialGuide from './components/LabTutorial';
import LabPageHeader from './components/LabPageHeader';
import LabContainer from './components/LabContainer';
import HeartbeatLoader from './components/report/HeartbeatLoader';
import RiskVerdict from './components/report/RiskVerdict';
import BiomarkerList from './components/report/BiomarkerList';
import StageMonitor, { type Stage, type StageState } from './components/report/StageMonitor';
import { primaryBtn } from './components/report/ui';
import { type Report, clearLabReport, retryLabExplain, submitLabReport, useLabReport } from './useLabReport';

/*
 * Digital Lab: 11 rasio biomarker milik user -> model risiko.
 * Tampilan status, loading dan hasil sama dengan Full Pipeline (components/report), supaya konsisten.
 * Setiap prediksi langsung diikuti SHAP. Laporan disimpan di useLabReport, jadi tetap ada saat user
 * berpindah tab (juga yang masih berjalan) dan hanya hilang lewat "New prediction".
 */

function stageStates(r: Report | null): StageState[] {
  if (!r) return ['active', 'pending', 'pending'];
  if (r.status === 'predicting') return ['done', 'active', 'pending'];
  if (r.status === 'error') return ['done', 'failed', 'pending'];
  if (r.shap) return ['done', 'done', 'done'];
  return ['done', 'done', r.explaining ? 'active' : 'pending'];
}

function statusText(r: Report | null): string {
  if (!r) return 'Ready for your biomarkers';
  if (r.status === 'predicting') return 'Running the risk model';
  if (r.status === 'error') return 'The prediction stopped';
  if (r.explaining) return 'Computing the main drivers';
  return r.shap ? 'Result and main drivers ready' : 'Result ready';
}

function buildStages(r: Report | null): Stage[] {
  const shift = r ? strongestChange(r.inputs) : null;
  const top = r?.shap ? [...r.shap.contributions].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))[0] : undefined;
  const tier = r?.tier && r.tier !== 'unknown' ? r.tier : null;
  return [
    {
      id: 'biomarkers',
      title: 'Your biomarkers',
      icon: ChartColumn,
      does: 'The 11 ratios you entered, each compared with the drug-free cell.',
      output: shift ? <>Largest change <span className="font-mono">{shift.key} {formatChange(shift.change)}</span></> : undefined,
    },
    {
      id: 'risk',
      title: 'Risk model',
      icon: Gauge,
      does: 'Classifies TdP risk as low, intermediate or high.',
      output: tier ? <><span className={`capitalize ${getTierColor(tier).text}`}>{tier}</span> risk</> : undefined,
    },
    {
      id: 'drivers',
      title: 'Main drivers',
      icon: ListChecks,
      does: 'SHAP shows which biomarkers moved the model most.',
      output: top ? <>Strongest driver <span className="font-mono">{top.biomarker}</span></> : undefined,
    },
  ];
}

export default function DigitalLabPage() {
  const report = useLabReport();

  const showForm = !report || report.status === 'error';

  return (
    <motion.div
      id="tour-main-lab"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col text-foreground overflow-x-hidden"
    >
      <TutorialGuide />

      <LabContainer className="flex flex-col gap-8">
        <LabPageHeader
          eyebrow="Digital lab"
          title="Bring your biomarkers."
          accent="Get the risk."
          description="Enter the 11 biomarker ratios from your own simulation and run the Cardivex risk model."
        />

        <StageMonitor
          id="tour-engine-visualizer"
          label="Digital lab"
          status={statusText(report)}
          stages={buildStages(report)}
          states={stageStates(report)}
        />

        {showForm && (
          <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            {report?.error && (
              <p role="alert" className="mb-6 text-center text-sm text-accent leading-relaxed text-balance">{report.error}</p>
            )}
            <LabForm onSubmit={inputs => void submitLabReport(inputs)} initial={report?.inputs} />
          </motion.div>
        )}

        {report?.status === 'predicting' && (
          <HeartbeatLoader
            eyebrow="Your biomarkers"
            title="Checking the risk"
            detail="The model is reading the 11 biomarker ratios you entered."
            steps={[{ label: 'Risk group', state: 'active' }]}
          />
        )}

        {report?.status === 'done' && report.tier && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mx-auto flex flex-col gap-14 md:gap-20 pt-6 pb-20"
          >
            <div className="flex items-center justify-between gap-4 px-1">
              <p className="min-w-0 text-sm text-foreground/70 leading-snug">
                Result for <span className="hidden sm:inline">the 11 ratios you entered</span><span className="sm:hidden">your 11 ratios</span>
              </p>
              <button type="button" onClick={clearLabReport} className={`${primaryBtn} max-sm:px-3.5 max-sm:py-2 max-sm:text-xs`}>
                New prediction
              </button>
            </div>

            <RiskVerdict tier={report.tier} prediction={report.prediction} />

            <BiomarkerList
              ratios={report.inputs}
              tier={report.tier}
              shap={report.shap}
              explaining={report.explaining}
              shapError={report.shapError}
              onExplain={retryLabExplain}
            />
          </motion.div>
        )}
      </LabContainer>
    </motion.div>
  );
}
