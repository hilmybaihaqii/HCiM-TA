"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { getTierColor, getTierCssVar } from "@/lib/tierColor";
import PredictionHistory from "./components/PredictionHistory";
import ShapHistory from "./components/ShapHistory";
import RiskDonut from "./components/RiskDonut";
import LabPageHeader from "../components/LabPageHeader";
import LabContainer from "../components/LabContainer";
import { Bone } from "../components/Skeletons";
import { SectionHead, SlideIndicator } from "../components/report/ui";

interface SummaryResponse {
  total_predictions: number;
  total_explanations: number;
  tier_counts: Record<string, number>;
}

const TIERS = ["high", "intermediate", "low"] as const;

/** Jumlah per tier dari summary; key bisa beda huruf besar/kecil */
function tierCount(summary: SummaryResponse | null, tier: string): number {
  const key = Object.keys(summary?.tier_counts ?? {}).find(k => k.toLowerCase() === tier);
  return key ? summary!.tier_counts[key] : 0;
}

type Tab = "predictions" | "shap";

export default function LogsPage() {
  const [tab, setTab] = useState<Tab>("predictions");
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryFailed, setSummaryFailed] = useState(false);

  useEffect(() => {
    api("/api/history/summary")
      .then(res => setSummary(res as SummaryResponse))
      .catch(err => {
        console.error("Failed to fetch summary data.", err);
        setSummaryFailed(true);
      });
  }, []);

  const counts = TIERS.map(t => ({ tier: t, count: tierCount(summary, t) }));
  const top = [...counts].sort((a, b) => b.count - a.count)[0];
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "predictions", label: "Predictions", count: summary?.total_predictions },
    { id: "shap", label: "SHAP analyses", count: summary?.total_explanations },
  ];

  return (
    <div className="w-full flex flex-col text-foreground">
      <LabContainer className="flex flex-col gap-12 md:gap-16">
        <LabPageHeader
          eyebrow="Activity logs"
          title="History"
          accent="and records."
          description="Your past predictions, the factors behind them, and how the risk results are spread."
        />

        {/* ---------- Ringkasan: donut kiri, angka kanan (ponsel: bertumpuk rata tengah) ---------- */}
        <section aria-labelledby="summary-heading" className="w-full">
          <SectionHead id="summary-heading" title="Overview" meta="All your records" />
          <div className="mt-6 min-h-36">
            {summary ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-8 sm:gap-14"
              >
                <div className="justify-self-center sm:justify-self-start">
                  <RiskDonut
                    centerLabel="predictions"
                    slices={counts.map(c => ({ key: c.tier, label: c.tier[0].toUpperCase() + c.tier.slice(1), count: c.count, color: getTierCssVar(c.tier) }))}
                  />
                </div>
                <dl className="w-full">
                  {[
                    { k: "Predictions", v: summary.total_predictions },
                    { k: "SHAP analyses", v: summary.total_explanations },
                  ].map(r => (
                    <div key={r.k} className="flex items-baseline justify-between gap-6 px-3 py-2.5 rounded-chip odd:bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]">
                      <dt className="text-sm text-foreground/70">{r.k}</dt>
                      <dd className="font-mono text-base tabular-nums text-foreground">{r.v}</dd>
                    </div>
                  ))}
                  {top && top.count > 0 && (
                    <div className="flex items-baseline justify-between gap-6 px-3 py-2.5 rounded-chip">
                      <dt className="text-sm text-foreground/70">Most common result</dt>
                      <dd className={`text-sm font-medium capitalize ${getTierColor(top.tier).text}`}>{top.tier}</dd>
                    </div>
                  )}
                </dl>
              </motion.div>
            ) : summaryFailed ? (
              <p role="alert" className="py-10 text-center text-sm text-foreground/70">
                Could not load the overview. Your history below is still available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-8 sm:gap-14" aria-hidden="true">
                <div className="flex items-center gap-5 justify-self-center sm:justify-self-start">
                  <Bone className="w-32 h-32 rounded-full" />
                  <div className="flex flex-col gap-3">{[0, 1, 2].map(i => <Bone key={i} className="h-3 w-24" />)}</div>
                </div>
                <div className="flex flex-col gap-3">{[0, 1, 2].map(i => <Bone key={i} className="h-8 w-full rounded-chip" />)}</div>
              </div>
            )}
          </div>
        </section>

        {/* ---------- Riwayat: satu switch, satu daftar ---------- */}
        <section aria-label="Records" className="w-full">
          <div role="tablist" aria-label="Record type" className="relative grid grid-cols-2 p-1 rounded-control bg-foreground/6">
            <span className="absolute inset-1 pointer-events-none">
              <SlideIndicator
                index={tabs.findIndex(t => t.id === tab)}
                count={tabs.length}
                className="inset-y-0 left-0 rounded-[calc(var(--radius-control)-4px)] bg-surface-white border border-foreground/15 shadow-sm"
              />
            </span>
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`relative z-10 px-2 py-2 text-sm font-medium transition-colors ${tab === t.id ? "text-foreground" : "text-foreground/60 hover:text-foreground"}`}
              >
                {t.label}
                {typeof t.count === "number" && <span className="ml-1.5 font-mono text-xs text-foreground/50">{t.count}</span>}
              </button>
            ))}
          </div>

          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pt-6"
          >
            {tab === "predictions" ? <PredictionHistory /> : <ShapHistory />}
          </motion.div>
        </section>
      </LabContainer>
    </div>
  );
}
