"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cachedGet } from "@/lib/historyCache";
import { getTierColor, getTierCssVar } from "@/lib/tierColor";
import PredictionHistory from "./components/PredictionHistory";
import ShapHistory from "./components/ShapHistory";
import RiskBars from "./components/RiskBars";
import LabPageHeader from "../components/LabPageHeader";
import LabContainer from "../components/LabContainer";
import { Bone } from "../components/Skeletons";
import { Figure, SectionHead, TabRail } from "../components/report/ui";

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
    cachedGet<SummaryResponse>("/api/history/summary")
      .then(res => setSummary(res))
      .catch(err => {
        console.error("Failed to fetch summary data.", err);
        setSummaryFailed(true);
      });
  }, []);

  const counts = TIERS.map(t => ({ tier: t, count: tierCount(summary, t) }));
  const top = [...counts].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="w-full flex flex-col text-foreground">
      <LabContainer className="flex flex-col gap-12 md:gap-16">
        <LabPageHeader
          eyebrow="Activity logs"
          title="History"
          accent="and records."
          description="Your past predictions, the factors behind them, and how the risk results are spread."
        />

        {/* ---------- Ringkasan: tiga angka di kiri, bar chart risiko di kanan (ponsel: bertumpuk) ---------- */}
        <section aria-labelledby="summary-heading" className="w-full">
          <SectionHead id="summary-heading" title="Overview" meta="All your records" />
          <div className="mt-6 pt-6 border-t border-foreground/10 min-h-36">
            {summary ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-8 md:gap-12"
              >
                <dl className="grid grid-cols-3 divide-x divide-foreground/10 md:divide-x-0">
                  <Figure label="Predictions">{summary.total_predictions}</Figure>
                  <Figure label="SHAP analyses">{summary.total_explanations}</Figure>
                  <Figure label="Most common" word>
                    {top && top.count > 0
                      ? <span className={`capitalize ${getTierColor(top.tier).text}`}>{top.tier}</span>
                      : "—"}
                  </Figure>
                </dl>
                <div className="md:pl-12 md:border-l md:border-foreground/10">
                  <p className="mb-2 px-2 text-xs text-foreground/60">Risk results</p>
                  <RiskBars
                    slices={counts.map(c => ({ key: c.tier, label: c.tier[0].toUpperCase() + c.tier.slice(1), count: c.count, color: getTierCssVar(c.tier) }))}
                  />
                </div>
              </motion.div>
            ) : summaryFailed ? (
              <p role="alert" className="py-10 text-center text-sm text-foreground/70">
                Could not load the overview. Your history below is still available.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-8 md:gap-12" aria-hidden="true">
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex flex-col items-center md:items-start gap-2">
                      <Bone className="h-3 w-16" />
                      <Bone className="h-8 w-14" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-4 md:pl-12">
                  {[0, 1, 2].map(i => <Bone key={i} className="h-5 w-full rounded-full" />)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ---------- Riwayat: satu rel tab, satu daftar ---------- */}
        <section aria-label="Records" className="w-full">
          <TabRail
            tabs={[
              { id: "predictions", label: "Predictions" },
              { id: "shap", label: "SHAP analyses" },
            ]}
            value={tab}
            onChange={id => setTab(id as Tab)}
            label="Record type"
            panelPrefix="records"
          />

          <motion.div
            key={tab}
            id={`records-${tab}`}
            role="tabpanel"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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
