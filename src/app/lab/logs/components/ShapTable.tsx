'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import AdminTable from '../../admin/components/AdminTable';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { DetailsPanel, DetailsToggle, TierLabel } from './RowDetails';

const PAGE_SIZE = 50;

interface Contribution {
  feature?: string;
  biomarker?: string;
  shap?: number;
  value?: number;
}

interface ShapLog {
  id: string;
  predicted_class: string;
  base_value: number;
  contributions: Contribution[];
  created_at: string;
}

interface FetchResponse {
  items: ShapLog[];
  total: number;
}

export default function ShapTable() {
  const [logs, setLogs] = useState<ShapLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
        const res = await api(`/api/history/explanations?limit=${PAGE_SIZE}&offset=${offset}`) as FetchResponse;
        if (!isMounted) return;
        setLogs(res.items || []);
        setTotal(res.total ?? (res.items?.length || 0));
      } catch (error) {
        console.error("Failed to fetch SHAP logs:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLogs();
    return () => { isMounted = false; };
  }, [offset]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log =>
      (log.id || '').toLowerCase().includes(query) ||
      (log.predicted_class || '').toLowerCase().includes(query)
    );
  }, [searchQuery, logs]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const parsed = new Date(dateString.replace(/^\+00/, ''));
    return isNaN(parsed.getTime()) ? 'Invalid Date' : parsed.toLocaleString();
  };

  const columns = [
    {
      header: "Date & Time",
      className: "w-48 align-top",
      accessor: (log: ShapLog) => (
        <span className="text-xs text-muted">{formatDate(log.created_at)}</span>
      )
    },
    {
      header: "Predicted Class",
      className: "w-40 align-top",
      accessor: (log: ShapLog) => (
        <TierLabel tier={log.predicted_class} />
      )
    },
    {
      header: "Key Factors",
      className: "text-right align-top",
      accessor: (log: ShapLog) => {
        const isExpanded = expandedId === log.id;
        const contributions = log.contributions || [];
        const hasContributions = contributions.length > 0;
        
        const sorted = [...contributions].sort((a, b) => Math.abs(b.shap || 0) - Math.abs(a.shap || 0));
        const maxAbsShap = sorted.length ? Math.max(...sorted.map(c => Math.abs(c.shap || 0)), 0.0001) : 1;
        const topFeature = sorted[0];

        return (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                {topFeature ? <>Main factor <span className="text-foreground font-medium">{topFeature.feature || topFeature.biomarker}</span></> : 'No data'}
              </span>
              <DetailsToggle
                open={isExpanded}
                disabled={!hasContributions}
                onClick={() => hasContributions && setExpandedId(isExpanded ? null : log.id)}
              />
            </div>
            <div className="w-full max-w-md">
              <DetailsPanel open={isExpanded && hasContributions}>
                <p className="text-[11px] text-muted mb-3 pb-2 border-b border-foreground/8">
                  Base value <span className="font-mono text-foreground">{log.base_value?.toFixed(4) ?? '—'}</span>
                </p>
                <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {sorted.map((c, idx) => {
                    const shapVal = c.shap || 0;
                    const isPositive = shapVal >= 0;
                    const barPct = (Math.abs(shapVal) / maxAbsShap) * 100;
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-medium text-foreground">{c.feature || c.biomarker}</span>
                          <span className={`font-mono tabular-nums ${isPositive ? 'text-rose-600' : 'text-blue-600'}`}>
                            {isPositive ? '+' : ''}{shapVal.toFixed(4)}
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-foreground/5 overflow-hidden">
                          <div className={`h-full rounded-full ${isPositive ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${barPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DetailsPanel>
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-2">
        {/* Filter hanya bekerja pada halaman yang sedang dimuat (API belum punya parameter search) */}
        <p className="text-xs text-muted">
          {searchQuery.trim()
            ? `${filteredLogs.length} of ${logs.length} on this page match`
            : `Showing ${total} explanations`}
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="search"
            placeholder="Filter this page by ID or class"
            aria-label="Filter this page by ID or class"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-white/60 border border-foreground/10 text-xs rounded-control pl-9 pr-4 py-2 focus:outline-none focus:border-foreground/30 transition-all"
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-175">
          <AdminTable columns={columns} data={filteredLogs} isLoading={isLoading} emptyMessage="No analysis data found." />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted">
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => page > 0 && setPage(p => p - 1)}
            disabled={page === 0 || isLoading}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-30 disabled:hover:text-muted transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            onClick={() => page < totalPages - 1 && setPage(p => p + 1)}
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