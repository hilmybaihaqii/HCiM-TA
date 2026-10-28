"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import PredictionsTable from "./components/PredictionTable";
import ShapTable from "./components/ShapTable";
import RiskDonut from "./components/RiskDonut";
import LabPageHeader from "../components/LabPageHeader";
import LabContainer from "../components/LabContainer";
import { Bone } from "../components/Skeletons";
import { getTierCssVar } from "@/lib/tierColor";

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
  const [summaryFailed, setSummaryFailed] = useState(false);

  useEffect(() => {
    api("/api/history/summary")
      .then((res) => setSummary(res as SummaryResponse))
      .catch((err) => {
        console.error("Failed to fetch summary data.", err);
        setSummaryFailed(true);
      });
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
    <div className="w-full flex flex-col text-foreground">
      <LabContainer>
        {/* Header: bentuk yang sama dengan Full Pipeline */}
        <LabPageHeader
          eyebrow="Activity logs"
          title="History"
          accent="and records."
          description="Your past predictions, the factors behind them, and how the risk results are spread."
        />

        {/* Ringkasan: satu baris di tengah, total hanya ditulis sekali (di tengah donut) */}
        <div className="min-h-36 my-10 md:my-12 flex justify-center">
          {summary ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center gap-8 sm:gap-14"
            >
              <RiskDonut
                centerLabel="predictions"
                slices={[
                  { key: "high", label: "High", count: getCount("High"), color: getTierCssVar("high") },
                  { key: "intermediate", label: "Intermediate", count: getCount("Intermediate"), color: getTierCssVar("intermediate") },
                  { key: "low", label: "Low", count: getCount("Low"), color: getTierCssVar("low") },
                ]}
              />
              <span aria-hidden="true" className="w-12 h-px sm:w-px sm:h-16 bg-foreground/10" />
              <div className="text-center sm:text-left">
                <span className="block text-3xl font-medium tabular-nums text-foreground leading-none">
                  {summary.total_explanations}
                </span>
                <span className="mt-2 block text-xs text-muted">SHAP analyses</span>
              </div>
            </motion.div>
          ) : summaryFailed ? (
            <p role="alert" className="self-center pl-4 border-l-2 border-accent/70 text-sm text-muted leading-relaxed">
              Could not load the summary. Your history below is still available.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-14" aria-hidden="true">
              <div className="flex items-center gap-5">
                <Bone className="w-32 h-32 rounded-full" />
                <div className="flex flex-col gap-3">
                  {[0, 1, 2].map(i => <Bone key={i} className="h-3 w-28" />)}
                </div>
              </div>
              <Bone className="h-10 w-24" />
            </div>
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
      </LabContainer>
    </div>
  );
}
