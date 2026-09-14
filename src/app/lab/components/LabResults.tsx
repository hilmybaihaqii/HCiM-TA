'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { RefreshCcw, ChevronDown } from 'lucide-react';

type SHAPData = {
  predicted_class: string;
  base_value: number;
  contributions: { biomarker: string; value: number; shap: number }[];
};

/* =========================================================
   TIPE & PARSER UNTUK RESPONSE /api/predict
   ========================================================= */
export type PredictionOutput = {
  confidences: { confidence: number; label: string }[];
  predictedLabel: string;
  conformal: {
    alpha: number;
    calibrationNote: string;
    isAmbiguous: boolean;
    outOfDistribution: boolean;
    predictionSet: string[];
    qHat: number;
    recommendedAction: string;
    setSize: number;
  };
};

export function parsePredictResponse(raw: unknown[]): PredictionOutput | null {
  try {
    const confPart = raw[0] as { confidences: { confidence: number; label: string }[]; label: string };
    const conformalPart = raw[2] as {
      alpha: number;
      calibration_note: string;
      is_ambiguous: boolean;
      out_of_distribution: boolean;
      prediction_set: string[];
      q_hat: number;
      recommended_action: string;
      set_size: number;
    };

    return {
      confidences: confPart.confidences || [],
      predictedLabel: confPart.label || 'unknown',
      conformal: {
        alpha: conformalPart.alpha,
        calibrationNote: conformalPart.calibration_note?.replace(/\s+/g, ' ').trim() || '',
        isAmbiguous: conformalPart.is_ambiguous,
        outOfDistribution: conformalPart.out_of_distribution,
        predictionSet: conformalPart.prediction_set || [],
        qHat: conformalPart.q_hat,
        recommendedAction: conformalPart.recommended_action || confPart.label,
        setSize: conformalPart.set_size ?? conformalPart.prediction_set?.length ?? 1,
      },
    };
  } catch {
    return null;
  }
}

const tierPalette = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('high')) return { text: 'text-rose-600', solid: 'bg-rose-500', rule: 'border-rose-500' };
  if (l.includes('intermediate')) return { text: 'text-amber-600', solid: 'bg-amber-500', rule: 'border-amber-500' };
  return { text: 'text-emerald-600', solid: 'bg-emerald-500', rule: 'border-emerald-500' };
};

// Terjemahkan tier jadi kalimat saran yang benar-benar actionable. Konteksnya:
// skrining risiko Torsades de Pointes (TdP) dari respons ion-channel jantung.
const actionSuggestion = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes('high')) {
    return 'The cardiac ion-channel response indicates elevated arrhythmic risk — flag this compound and avoid advancing it without further cardiac safety review.';
  }
  if (l.includes('intermediate')) {
    return 'The ion-channel response is inconclusive — consider additional assays or expert review before making a safety decision.';
  }
  return 'The cardiac ion-channel response indicates low arrhythmic risk — reasonable to proceed, subject to standard safety review.';
};

/* =========================================================
   ANGKA YANG MENGHITUNG NAIK
   ========================================================= */
function AnimatedPercent({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let cancelled = false;
    const target = value * 100;
    const duration = 1100;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const timeoutId = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min((now - start) / duration, 1);
        setDisplay(Math.round(target * ease(t)));
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, delay]);

  return <>{display}%</>;
}

/* =========================================================
   HALAMAN HASIL
   ========================================================= */
export default function LabResults({
  tier,
  shap,
  prediction,
  onReset,
}: {
  tier: string;
  shap: SHAPData;
  prediction?: PredictionOutput | null;
  onReset: () => void;
}) {
  const sortedContributions = [...shap.contributions].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
  const maxShap = Math.max(...sortedContributions.map(c => Math.abs(c.shap)));
  const palette = tierPalette(tier);
  const [showDetails, setShowDetails] = useState(false);

  const sortedConfidences = prediction ? [...prediction.confidences].sort((a, b) => b.confidence - a.confidence) : [];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
  const sectionFade: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
      className="w-full mb-20"
    >
      <div className="w-full bg-surface-white/70 backdrop-blur-md border border-foreground/10 rounded-3xl overflow-hidden shadow-sm">

        {/* ================= HERO: VERDICT (editorial, lega) ================= */}
        <motion.div
          initial="hidden" animate="show" variants={sectionFade}
          className="px-6 sm:px-10 md:px-16 pt-14 md:pt-20 pb-12 md:pb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted">Diagnostic verdict</span>
              <h1 className={`mt-3 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic tracking-tight ${palette.text}`}>
                {tier.toLowerCase()} risk
              </h1>
            </div>

            <button
              onClick={onReset}
              className="group relative flex items-center gap-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors duration-300 shrink-0 pb-0.5"
            >
              Recalibrate
              <RefreshCcw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" />
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
            </button>
          </div>

          <p className="mt-6 text-base text-muted max-w-lg leading-relaxed">
            Derived from the cardiac ion-channel biomarker profile of this compound, screened for Torsades de Pointes (TdP) arrhythmic potential.
          </p>
        </motion.div>

        <div className="border-t border-foreground/8" />

        {/* ================= CONFIDENCE SPECTRUM ================= */}
        {prediction && (
          <>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }} variants={sectionFade}
              className="px-6 sm:px-10 md:px-16 py-8 md:py-10"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-muted">Model confidence</span>

              <div className="mt-5 flex w-full h-1.5 rounded-full overflow-hidden bg-foreground/6">
                {sortedConfidences.map((c, i) => {
                  const p = tierPalette(c.label);
                  return (
                    <motion.div
                      key={c.label}
                      initial={{ width: '0%' }}
                      whileInView={{ width: `${c.confidence * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className={p.solid}
                    />
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-8">
                {sortedConfidences.map((c) => {
                  const p = tierPalette(c.label);
                  const isWinner = c.label.toLowerCase() === prediction.predictedLabel.toLowerCase();
                  return (
                    <div key={c.label} className="flex items-baseline gap-2">
                      <span className={`font-mono text-xl sm:text-2xl tabular-nums ${isWinner ? p.text : 'text-muted/40'}`}>
                        <AnimatedPercent value={c.confidence} delay={0.3} />
                      </span>
                      <span className={`text-sm capitalize ${isWinner ? 'text-foreground' : 'text-muted/40'}`}>
                        {c.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <div className="border-t border-foreground/8" />

            {/* ================= RECOMMENDED ACTION (pull-quote, bukan kotak alert) ================= */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }} variants={sectionFade}
              className="px-6 sm:px-10 md:px-16 py-8 md:py-10 flex flex-col gap-5"
            >
              <span className="text-xs font-mono uppercase tracking-wider text-muted">Recommended action</span>

              <blockquote className={`border-l-2 ${palette.rule} pl-5 md:pl-6`}>
                <p className="text-base sm:text-lg md:text-xl font-serif italic text-foreground leading-snug max-w-2xl">
                  {actionSuggestion(prediction.conformal.recommendedAction)}
                </p>
              </blockquote>

              {prediction.conformal.predictionSet.length > 1 && (
                <p className="text-sm text-muted leading-relaxed">
                  Statistically, the model considers{' '}
                  {prediction.conformal.predictionSet.map((label, i) => (
                    <span key={label}>
                      {i > 0 && (i === prediction.conformal.predictionSet.length - 1 ? ' and ' : ', ')}
                      <span className={`font-medium ${tierPalette(label).text}`}>{label}</span>
                    </span>
                  ))}{' '}
                  equally plausible for this input.
                </p>
              )}

              {(prediction.conformal.isAmbiguous || prediction.conformal.outOfDistribution) && (
                <div className="flex flex-col gap-1.5">
                  {prediction.conformal.isAmbiguous && (
                    <p className="text-sm text-amber-700 leading-relaxed">
                      <span className="font-medium">Note —</span> this result is ambiguous; treat the recommendation above as provisional pending further review.
                    </p>
                  )}
                  {prediction.conformal.outOfDistribution && (
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      <span className="font-medium">Note —</span> this input falls outside the training distribution, so confidence may be less reliable here.
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowDetails(v => !v)}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors w-max mt-1"
              >
                Technical details
                <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 pt-1 text-sm">
                      <div className="flex flex-wrap gap-x-8 gap-y-1 text-muted font-mono">
                        <span>raw label <span className="text-foreground">{prediction.conformal.recommendedAction}</span></span>
                        <span>alpha <span className="text-foreground">{prediction.conformal.alpha}</span></span>
                        <span>q_hat <span className="text-foreground">{prediction.conformal.qHat}</span></span>
                        <span>set size <span className="text-foreground">{prediction.conformal.setSize}</span></span>
                      </div>
                      <p className="text-muted leading-relaxed max-w-2xl">
                        {prediction.conformal.calibrationNote}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="border-t border-foreground/8" />
          </>
        )}

        {/* ================= FEATURE ATTRIBUTION (SHAP) ================= */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-10%' }} variants={sectionFade}
          className="px-6 sm:px-10 md:px-16 py-8 md:py-12 relative"
        >
          <div className="mb-8 flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted">What drove this result</span>
              <p className="mt-2 text-base text-foreground max-w-lg">
                How each biomarker pushed the prediction toward or away from risk.
              </p>
            </div>
            <span className="text-xs font-mono text-muted/50">
              base {shap.base_value.toFixed(4)}
            </span>
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col">
            {sortedContributions.map((item, i) => {
              const percentage = (Math.abs(item.shap) / maxShap) * 100;
              const isPositive = item.shap > 0;

              return (
                <motion.div key={i} variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 w-full py-3.5 border-b border-foreground/6 last:border-b-0 group">

                  {/* Baris atas di mobile: nama biomarker + kedua angka. Di desktop, cuma nama + value mentah. */}
                  <div className="flex items-center justify-between sm:w-[26%] sm:pr-6 shrink-0">
                    <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">{item.biomarker}</span>
                    <div className="flex items-center gap-3 sm:hidden">
                      <span className="text-xs font-mono text-muted/50">{item.value.toFixed(2)}</span>
                      <span className={`text-sm font-mono ${isPositive ? 'text-rose-600' : 'text-blue-600'}`}>
                        {isPositive ? '+' : ''}{item.shap.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <span className="hidden sm:block text-xs font-mono text-muted/50 sm:w-14 sm:shrink-0">{item.value.toFixed(2)}</span>

                  {/* Bar diverging — full width di mobile, tebal & jelas kelihatan */}
                  <div className="flex-1 flex items-center h-4 relative w-full">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/10 -translate-x-1/2" />
                    <div className="w-1/2 h-full flex justify-end items-center pr-0.5">
                      {!isPositive && (
                        <motion.div
                          initial={{ width: '0%' }} whileInView={{ width: `${percentage}%` }} viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.1 + (i * 0.04), ease: "easeOut" }}
                          className="h-1.5 rounded-l-full bg-blue-500"
                        />
                      )}
                    </div>
                    <div className="w-1/2 h-full flex justify-start items-center pl-0.5">
                      {isPositive && (
                        <motion.div
                          initial={{ width: '0%' }} whileInView={{ width: `${percentage}%` }} viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.1 + (i * 0.04), ease: "easeOut" }}
                          className="h-1.5 rounded-r-full bg-rose-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Angka SHAP — cuma tampil di sini pada layar sm ke atas (di mobile udah ada di baris atas) */}
                  <div className="hidden sm:flex w-16 md:w-24 justify-end shrink-0 pl-3">
                    <span className={`text-sm font-mono ${isPositive ? 'text-rose-600' : 'text-blue-600'}`}>
                      {isPositive ? '+' : ''}{item.shap.toFixed(4)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-8 pt-5 border-t border-foreground/8 flex items-center justify-between text-sm text-muted">
            <span className="text-blue-600">Defends against risk</span>
            <span className="text-rose-600">Drives toxicity risk</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}