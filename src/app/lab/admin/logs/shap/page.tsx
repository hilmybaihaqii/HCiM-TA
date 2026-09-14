'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import AdminTable from '../../components/AdminTable';
import { Network, Search, Clock, ActivitySquare, Fingerprint, User, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 50;

interface UserData {
  id: string;
  display_name?: string;
  email?: string;
}

interface Contribution {
  biomarker: string;
  shap: number;
  value: number;
}

interface ShapLog {
  id?: string;
  user_id?: string | null;
  prediction_id?: string | null;
  input?: number[];
  predicted_class?: string;
  base_value?: number;
  contributions?: Contribution[];
  latency_ms?: number;
  created_at?: string;
  // Hasil join dengan /admin/users
  user_data?: UserData | null;
}

export default function ShapLogsPage() {
  const [logs, setLogs] = useState<ShapLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0); // 0-indexed
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = page * PAGE_SIZE;

  useEffect(() => {
    let isMounted = true;

    const fetchLogsAndUsers = async () => {
      setIsLoading(true);
      try {
        const [logsResponse, usersResponse] = await Promise.all([
          api(`/admin/shap-logs?limit=${PAGE_SIZE}&offset=${offset}`),
          api("/admin/users?include_deleted=true")
        ]);

        if (!isMounted) return;

        const logsData = (logsResponse as { items?: ShapLog[] }).items || [];
        const totalCount = (logsResponse as { total?: number }).total ?? logsData.length;
        const usersData = (usersResponse as { items?: UserData[] }).items || [];

        const userMap = new Map<string, UserData>();
        usersData.forEach(user => {
          if (user.id) userMap.set(user.id, user);
        });

        const enrichedLogs = logsData.map(log => ({
          ...log,
          user_data: log.user_id ? userMap.get(log.user_id) || null : null
        }));

        setLogs(enrichedLogs);
        setTotal(totalCount);
        setExpandedId(null);
      } catch (error: unknown) {
        if (!isMounted) return;
        console.error("Failed to fetch SHAP logs:", error);
        setErrorMsg("Failed to retrieve SHAP data. Please try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLogsAndUsers();

    return () => {
      isMounted = false;
    };
  }, [offset]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;

    const query = searchQuery.toLowerCase();
    return logs.filter(
      log =>
        (log.id || '').toLowerCase().includes(query) ||
        (log.user_id || '').toLowerCase().includes(query) ||
        (log.user_data?.display_name || '').toLowerCase().includes(query) ||
        (log.user_data?.email || '').toLowerCase().includes(query) ||
        (log.predicted_class || '').toLowerCase().includes(query)
    );
  }, [searchQuery, logs]);

  const getTierColor = (t: string) => {
    if (t.includes('HIGH')) return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    if (t.includes('LOW')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (t.includes('INTERMEDIATE')) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-foreground/5 text-muted border-foreground/10';
  };

  const columns = [
    {
      header: "Timestamp",
      className: "w-44",
      accessor: (log: ShapLog) => {
        let dateStr = 'Unknown Time';

        if (log.created_at) {
          const cleanDateStr = log.created_at.replace(/^\+00/, '');
          const parsedDate = new Date(cleanDateStr);

          if (!isNaN(parsedDate.getTime())) {
            dateStr = parsedDate.toLocaleString();
          }
        }

        return (
          <div className="flex items-center gap-2 text-muted">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono text-[10px] uppercase tracking-widest">{dateStr}</span>
          </div>
        );
      }
    },
    {
      header: "System Tracking",
      accessor: (log: ShapLog) => {
        const safeLogId = log.id || 'UNKNOWN';

        const displayName = log.user_data?.display_name
          || (log.user_id ? null : 'Anonymous');
        const subLabel = log.user_data?.email
          || (log.user_id ? `ID: ${log.user_id.split('-')[0]}...` : 'Unauthenticated request');

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2" title={log.user_id ? `Full User ID: ${log.user_id}` : 'Anonymous / unauthenticated request'}>
              <div className="w-5 h-5 rounded bg-foreground/5 flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-muted" />
              </div>
              <span className="text-xs font-mono text-foreground font-medium">
                {displayName || 'Unknown User'}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-7">
              <span className="text-[10px] font-mono text-muted">{subLabel}</span>
            </div>
            <div className="flex items-center gap-2 pl-7" title={`Full SHAP Log ID: ${safeLogId}`}>
              <Fingerprint className="w-3 h-3 text-muted/60 shrink-0" />
              <span className="text-[9px] font-mono text-muted/60">
                {safeLogId.split('-')[0]}...
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: "Predicted Class",
      className: "w-36",
      accessor: (log: ShapLog) => {
        const rawTier = (log.predicted_class || 'UNKNOWN').toUpperCase();
        return (
          <span className={`px-2.5 py-1.5 text-[9px] rounded-md uppercase tracking-widest font-mono font-medium inline-flex items-center gap-1.5 w-fit border shadow-sm ${getTierColor(rawTier)}`}>
            <ActivitySquare className="w-3 h-3" />
            {rawTier}
          </span>
        );
      }
    },
    {
      header: "SHAP Contribution",
      className: "text-right",
      accessor: (log: ShapLog) => {
        const safeLogId = log.id || 'UNKNOWN';
        const isExpanded = expandedId === safeLogId;
        const contributions = log.contributions || [];
        const hasContributions = contributions.length > 0;

        // Urutkan berdasarkan besarnya pengaruh (|shap|), yang paling berpengaruh di atas
        const sorted = [...contributions].sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap));
        const maxAbsShap = sorted.length > 0 ? Math.max(...sorted.map(c => Math.abs(c.shap)), 0.0001) : 1;
        const topBiomarker = sorted[0];

        return (
          <div className="relative flex justify-end">
            <button
              type="button"
              onClick={() => hasContributions && setExpandedId(isExpanded ? null : safeLogId)}
              disabled={!hasContributions}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-foreground/10 bg-foreground/5 ${hasContributions ? 'cursor-pointer hover:bg-foreground/10' : 'cursor-default opacity-50'} transition-colors`}
            >
              {topBiomarker ? (
                <span className="text-[9px] font-mono text-muted">
                  top: <span className="text-foreground font-medium">{topBiomarker.biomarker}</span>
                </span>
              ) : (
                <span className="text-[9px] font-mono text-muted">No SHAP data</span>
              )}
              {hasContributions && (
                <ChevronDown className={`w-3 h-3 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Dropdown breakdown - floating, tidak mendorong layout row lain */}
            <AnimatePresence>
              {isExpanded && hasContributions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1.5 z-20 w-[85vw] max-w-80 sm:w-80 rounded-lg bg-surface-white border border-foreground/10 shadow-lg overflow-hidden text-left"
                >
                  <div className="px-3 py-2 border-b border-foreground/10 bg-foreground/[0.03]">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-widest">
                      Base value: {log.base_value?.toFixed(4) ?? '—'}
                      {typeof log.latency_ms === 'number' && ` · ${log.latency_ms} ms`}
                    </span>
                  </div>
                  <div className="p-3 flex flex-col gap-2 max-h-72 overflow-y-auto">
                    {sorted.map((c) => {
                      const isPositive = c.shap >= 0;
                      const barPct = (Math.abs(c.shap) / maxAbsShap) * 100;
                      return (
                        <div key={c.biomarker} className="flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-foreground font-medium">{c.biomarker}</span>
                            <span className="text-muted">
                              value: {c.value} &middot;{' '}
                              <span className={isPositive ? 'text-rose-600' : 'text-emerald-600'}>
                                {isPositive ? '+' : ''}{c.shap.toFixed(4)}
                              </span>
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isPositive ? 'bg-rose-500/60' : 'bg-emerald-500/60'}`}
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-3 py-1.5 border-t border-foreground/10 bg-foreground/[0.03]">
                    <span className="text-[9px] font-mono text-muted">
                      <span className="text-rose-600">merah</span> = mendorong ke arah predicted class ·{' '}
                      <span className="text-emerald-600">hijau</span> = menjauhkan
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
            Model Interpretability
          </h2>
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-1">
            SHAP Value Records: {total} &middot; Page {page + 1} of {totalPages}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search by Name, Email, ID or Class..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedId(null);
              setPage(0);
            }}
            className="w-full bg-surface-white/40 border border-foreground/10 text-foreground text-xs rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/30 transition-all placeholder:text-muted/70 backdrop-blur-sm"
          />
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs text-center font-mono shadow-sm">
              [SYSTEM_ERROR] {errorMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[720px]">
          <AdminTable
            columns={columns}
            data={filteredLogs}
            isLoading={isLoading}
            emptyMessage={searchQuery ? "No matching SHAP records found." : "No interpretability data generated yet."}
          />
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
          Showing {logs.length === 0 ? 0 : offset + 1}&ndash;{offset + logs.length} of {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => page > 0 && setPage(p => p - 1)}
            disabled={page === 0 || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-foreground/10 text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <button
            onClick={() => page < totalPages - 1 && setPage(p => p + 1)}
            disabled={page >= totalPages - 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-foreground/10 text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}