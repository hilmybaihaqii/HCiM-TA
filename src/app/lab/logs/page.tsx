"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import PredictionsTable from "./components/PredictionTable";
import ShapTable from "./components/ShapTable";

interface SummaryResponse {
  total_predictions: number;
  total_explanations: number;
  tier_counts: Record<string, number>;
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<"predictions" | "shap">(
    "predictions",
  );
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  useEffect(() => {
    api("/api/history/summary")
      .then((res) => setSummary(res as SummaryResponse))
      .catch(() => console.error("Failed to fetch summary data."));
  }, []);

  // Membantu membaca key JSON dengan aman (menghindari error jika undefined atau beda casing)
  const getCount = (key: string) => {
    if (!summary?.tier_counts) return 0;
    // Mencari key yang cocok secara case-insensitive
    const foundKey = Object.keys(summary.tier_counts).find(
      (k) => k.toLowerCase() === key.toLowerCase(),
    );
    return foundKey ? summary.tier_counts[foundKey] : 0;
  };

  return (
    <div className="w-full flex flex-col bg-background text-foreground pt-28 pb-20 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
        {/* Header & Dashboard Stats */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-3xl font-medium tracking-tight mb-2">
              History & Records
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              Review your past predictions, understand the model&apos;s
              decision-making process, and monitor the distribution of your
              cardiovascular toxicity risks.
            </p>
          </div>

          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4"
            >
              {/* Card 1: Total Predictions */}
              <div className="bg-surface-white/60 border border-foreground/10 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center flex-1 min-w-27.5">
                <span className="text-3xl font-bold text-foreground">
                  {summary.total_predictions}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted mt-1 text-center">
                  Total Info
                </span>
              </div>

              {/* Card 2: Risk Distribution (High, Intermediate, Low) */}
              <div className="bg-surface-white/60 border border-foreground/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-center flex-2 min-w-45">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted text-center mb-3">
                  Risk Distribution
                </span>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                      High Risk
                    </span>
                    <span className="font-mono font-medium">
                      {getCount("High")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                      Intermediate
                    </span>
                    <span className="font-mono font-medium">
                      {getCount("Intermediate")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-muted">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      Low Risk
                    </span>
                    <span className="font-mono font-medium">
                      {getCount("Low")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Total SHAP */}
              <div className="bg-surface-white/60 border border-foreground/10 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center flex-1 min-w-27.5">
                <span className="text-3xl font-bold text-foreground">
                  {summary.total_explanations}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted mt-1 text-center">
                  Analyses
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Minimalist Tabs */}
        <div className="flex gap-6 mb-8 border-b border-foreground/10">
          <button
            onClick={() => setActiveTab("predictions")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 outline-none ${activeTab === "predictions" ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}
          >
            Prediction History
          </button>
          <button
            onClick={() => setActiveTab("shap")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 outline-none ${activeTab === "shap" ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}
          >
            SHAP History
          </button>
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "predictions" ? <PredictionsTable /> : <ShapTable />}
        </motion.div>
      </div>
    </div>
  );
}
