"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import AdminTable from "../../admin/components/AdminTable";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 50;

const FEATURE_NAMES = [
  "qNet",
  "dvdtmax",
  "vmax",
  "vrest",
  "APD50",
  "APD90",
  "max_dv",
  "camax",
  "carest",
  "CaTD50",
  "CaTD90",
] as const;

interface PredictionLog {
  id: string;
  input: number[];
  predicted_tier: string;
  probabilities:
    | { confidence: number; label: string }[]
    | Record<string, number>
    | null;
  latency_ms: number;
  created_at: string;
}

interface FetchResponse {
  items: PredictionLog[];
  total: number;
}

export default function PredictionsTable() {
  const [logs, setLogs] = useState<PredictionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = page * PAGE_SIZE;

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = (await api(
          `/api/history/predictions?limit=${PAGE_SIZE}&offset=${offset}`,
        )) as FetchResponse;
        if (!isMounted) return;
        setLogs(res.items || []);
        setTotal(res.total ?? (res.items?.length || 0));
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLogs();
    return () => {
      isMounted = false;
    };
  }, [offset]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        (log.id || "").toLowerCase().includes(query) ||
        (log.predicted_tier || "").toLowerCase().includes(query),
    );
  }, [searchQuery, logs]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const parsed = new Date(dateString.replace(/^\+00/, ""));
    return isNaN(parsed.getTime()) ? "Invalid Date" : parsed.toLocaleString();
  };

  const getTierStyle = (tier: string) => {
    const t = tier.toUpperCase();
    if (t.includes("HIGH")) return "text-rose-600 bg-rose-500/10";
    if (t.includes("LOW")) return "text-emerald-600 bg-emerald-500/10";
    if (t.includes("INTERMEDIATE")) return "text-amber-600 bg-amber-500/10";
    return "text-muted bg-foreground/5";
  };

  const columns = [
    {
      header: "Date & Time",
      className: "w-48",
      accessor: (log: PredictionLog) => (
        <span className="text-xs text-muted">{formatDate(log.created_at)}</span>
      ),
    },
    {
      header: "Input Parameters",
      accessor: (log: PredictionLog) => {
        const isExpanded = expandedId === log.id;
        const hasInput = Array.isArray(log.input) && log.input.length > 0;

        return (
          <div className="relative">
            <button
              onClick={() =>
                hasInput && setExpandedId(isExpanded ? null : log.id)
              }
              disabled={!hasInput}
              className={`flex items-center gap-2 text-xs text-foreground transition-colors ${hasInput ? "hover:text-accent" : "opacity-50"}`}
            >
              View Data{" "}
              {hasInput && (
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <AnimatePresence>
              {isExpanded && hasInput && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 mt-2 z-20 w-72 p-4 rounded-lg bg-surface-white border border-foreground/10 shadow-lg grid grid-cols-2 gap-x-4 gap-y-2"
                >
                  {log.input.map((val, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-muted/70">
                        {FEATURE_NAMES[idx] ?? `F${idx}`}
                      </span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      },
    },
    {
      header: "Processing Time",
      className: "w-32",
      accessor: (log: PredictionLog) => (
        <span className="text-xs text-muted">{log.latency_ms ?? "—"} ms</span>
      ),
    },
    {
      header: "Result",
      className: "text-right",
      accessor: (log: PredictionLog) => (
        <div className="flex justify-end">
          <span
            className={`px-3 py-1 text-[11px] rounded-full font-medium ${getTierStyle(log.predicted_tier || "")}`}
          >
            {log.predicted_tier || "Unknown"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
        <p className="text-xs text-muted">Showing {total} records</p>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full bg-surface-white/60 border border-foreground/10 text-xs rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-foreground/30 transition-all"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-175">
          <AdminTable
            columns={columns}
            data={filteredLogs}
            isLoading={isLoading}
            emptyMessage="No predictions found."
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted">
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => page > 0 && setPage((p) => p - 1)}
            disabled={page === 0 || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border border-foreground/10 disabled:opacity-30 hover:bg-foreground/5"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            onClick={() => page < totalPages - 1 && setPage((p) => p + 1)}
            disabled={page >= totalPages - 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border border-foreground/10 disabled:opacity-30 hover:bg-foreground/5"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
