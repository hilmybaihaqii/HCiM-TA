"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import AdminTable from "../../admin/components/AdminTable";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { DetailsPanel, DetailsToggle, TierLabel } from "./RowDetails";

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

  const columns = [
    {
      header: "Date & Time",
      className: "w-48 align-top",
      accessor: (log: PredictionLog) => (
        <span className="text-xs text-muted">{formatDate(log.created_at)}</span>
      ),
    },
    {
      header: "Input Parameters",
      className: "align-top",
      accessor: (log: PredictionLog) => {
        const isExpanded = expandedId === log.id;
        const hasInput = Array.isArray(log.input) && log.input.length > 0;

        return (
          <div>
            <DetailsToggle
              open={isExpanded}
              disabled={!hasInput}
              onClick={() => hasInput && setExpandedId(isExpanded ? null : log.id)}
            />
            <DetailsPanel open={isExpanded && hasInput}>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                {log.input.map((val, idx) => (
                  <div key={idx} className="flex items-baseline justify-between gap-3 text-[11px]">
                    <dt className="text-muted">{FEATURE_NAMES[idx] ?? `F${idx}`}</dt>
                    <dd className="font-mono text-foreground tabular-nums">
                      {typeof val === "number" ? Number(val.toFixed(4)) : String(val)}
                    </dd>
                  </div>
                ))}
              </dl>
            </DetailsPanel>
          </div>
        );
      },
    },
    {
      header: "Processing Time",
      className: "w-32 align-top",
      accessor: (log: PredictionLog) => (
        <span className="text-xs text-muted">{log.latency_ms ?? "—"} ms</span>
      ),
    },
    {
      header: "Result",
      className: "text-right align-top",
      accessor: (log: PredictionLog) => (
        <div className="flex justify-end">
          <TierLabel tier={log.predicted_tier} />
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
            className="w-full bg-surface-white/60 border border-foreground/10 text-xs rounded-control pl-9 pr-4 py-2 focus:outline-none focus:border-foreground/30 transition-all"
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
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-30 disabled:hover:text-muted transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            onClick={() => page < totalPages - 1 && setPage((p) => p + 1)}
            disabled={page >= totalPages - 1 || isLoading}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-30 disabled:hover:text-muted transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
