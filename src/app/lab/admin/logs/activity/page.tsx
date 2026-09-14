'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import AdminTable from '../../components/AdminTable';
import { Activity, Search, Clock, LogIn, LogOut, ShieldAlert, Fingerprint, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 50;

// Regex untuk mendeteksi format "Admin <uuid> | <real_user_agent>"
// yang dipakai backend untuk event admin_deleted_user / admin_restored_user
const ADMIN_ACTOR_REGEX = /^Admin\s+([a-f0-9-]{36})\s*\|\s*(.+)$/i;

const truncateUA = (ua: string, len = 25) =>
  ua.length > len ? ua.substring(0, len) + '...' : ua;

// Interface untuk data user dari /admin/users
interface UserData {
  id: string;
  display_name?: string;
  email?: string;
}

// Interface untuk log yang sudah digabung dengan data user
interface ActivityLog {
  id?: string;
  created_at?: string;
  event?: string;
  ip?: string;
  user_agent?: string;
  user_id?: string;
  // Tambahan untuk menyimpan hasil mapping
  user_data?: UserData | null;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        // Melakukan fetch ke 2 endpoint sekaligus secara paralel agar cepat
        const [eventsResponse, usersResponse] = await Promise.all([
          api(`/admin/auth-events?limit=${PAGE_SIZE}&offset=${offset}`),
          api("/admin/users?include_deleted=true")
        ]);

        if (!isMounted) return;

        const eventsData = (eventsResponse as { items?: ActivityLog[] }).items || [];
        const totalCount = (eventsResponse as { total?: number }).total ?? eventsData.length;
        const usersData = (usersResponse as { items?: UserData[] }).items || [];

        // Membuat kamus/map pencarian user berdasarkan ID agar pencocokan sangat cepat
        const userMap = new Map<string, UserData>();
        usersData.forEach(user => {
          if (user.id) userMap.set(user.id, user);
        });

        // Gabungkan data log dengan data user
        const enrichedLogs = eventsData.map(log => ({
          ...log,
          user_data: log.user_id ? userMap.get(log.user_id) || null : null
        }));

        setLogs(enrichedLogs);
        setTotal(totalCount);
      } catch (error: unknown) {
        if (!isMounted) return;
        console.error("Failed to fetch data:", error);
        setErrorMsg("Failed to retrieve system records. Please try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLogsAndUsers();

    return () => {
      isMounted = false;
    };
  }, [offset]); // re-fetch tiap kali page/offset berubah

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;

    const query = searchQuery.toLowerCase();
    return logs.filter(
      log =>
        (log.user_id || '').toLowerCase().includes(query) ||
        (log.event || '').toLowerCase().includes(query) ||
        (log.ip || '').toLowerCase().includes(query) ||
        (log.user_data?.display_name || '').toLowerCase().includes(query) ||
        (log.user_data?.email || '').toLowerCase().includes(query)
    );
  }, [searchQuery, logs]);

  const columns = [
    {
      header: "Timestamp",
      className: "w-48",
      accessor: (log: ActivityLog) => {
        let dateStr = 'Unknown Time';

        if (log.created_at) {
          // Perbaikan tanggal: Hanya menghapus +00 di awal agar tahun (2026) aman
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
      header: "System Identity & Origin",
      accessor: (log: ActivityLog) => {
        const rawEvent = (log.event || 'unknown').toLowerCase();
        const ipAddress = log.ip || 'Unknown IP';

        // Case 1: admin_* events -> user_agent berisi "Admin <id> | <ua>"
        const adminMatch = log.user_agent ? log.user_agent.match(ADMIN_ACTOR_REGEX) : null;

        if (adminMatch) {
          const [, actorId, realUA] = adminMatch;
          // log.user_data di sini adalah TARGET user (yang di-delete/restore),
          // karena join-nya berdasarkan log.user_id, bukan actorId
          const targetName = log.user_data?.display_name || 'Unknown Target';
          const targetEmail = log.user_data?.email || `ID: ${(log.user_id || '').split('-')[0]}...`;

          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 text-foreground/70">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-xs">
                  Target: {targetName}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted font-mono">{targetEmail}</span>
                  <span className="text-[9px] text-muted/50 border-l border-muted/20 pl-2">
                    by admin ({actorId.split('-')[0]}...)
                  </span>
                </div>
                <span className="text-[9px] text-muted/40 font-mono mt-0.5">
                  {ipAddress} · {truncateUA(realUA)}
                </span>
              </div>
            </div>
          );
        }

        // Case 2: login_fail -> user_id selalu null, memang tanpa identitas user
        if (rawEvent === 'login_fail' || !log.user_id) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-xs">
                  Unauthenticated attempt
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    {ipAddress}
                  </span>
                  <span className="text-[9px] text-muted/50 border-l border-muted/20 pl-2">
                    {log.user_agent ? truncateUA(log.user_agent) : 'Unknown Device'}
                  </span>
                </div>
              </div>
            </div>
          );
        }

        // Case 3: normal event dengan user yang match di userMap
        const fallbackId = log.user_id ? log.user_id.split('-')[0] + '...' : 'UNKNOWN_ID';
        const displayName = log.user_data?.display_name || 'Unknown User';
        const userEmail = log.user_data?.email || `ID: ${fallbackId}`;

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 text-foreground/70">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground text-xs" title={`Full ID: ${log.user_id}`}>
                {displayName}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted font-mono flex items-center gap-1">
                  {userEmail}
                </span>
                <span className="text-[9px] text-muted/50 border-l border-muted/20 pl-2 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  {ipAddress}
                </span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: "Action Event",
      className: "text-right",
      accessor: (log: ActivityLog) => {
        const rawEvent = (log.event || 'unknown_event').toLowerCase();

        const EVENT_CONFIG: Record<string, { label: string; icon: typeof Activity; color: string }> = {
          login_ok: { label: 'LOGIN', icon: LogIn, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
          oauth_login: { label: 'OAUTH LOGIN', icon: LogIn, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
          logout: { label: 'LOGOUT', icon: LogOut, color: 'text-muted bg-foreground/5 border-foreground/10' },
          login_fail: { label: 'LOGIN FAILED', icon: ShieldAlert, color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' },
          register: { label: 'REGISTERED', icon: Activity, color: 'text-sky-600 bg-sky-500/10 border-sky-500/20' },
          verify: { label: 'EMAIL VERIFIED', icon: Activity, color: 'text-sky-600 bg-sky-500/10 border-sky-500/20' },
          reset: { label: 'PASSWORD RESET', icon: Activity, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
          admin_deleted_user: { label: 'ADMIN DELETED USER', icon: ShieldAlert, color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' },
          admin_restored_user: { label: 'ADMIN RESTORED USER', icon: ShieldAlert, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
        };

        const config = EVENT_CONFIG[rawEvent] || {
          label: rawEvent.replace(/_/g, ' ').toUpperCase(),
          icon: Activity,
          color: 'text-accent bg-accent/10 border-accent/20'
        };
        const Icon = config.icon;

        return (
          <div className="flex items-center justify-end">
            <span className={`px-2.5 py-1.5 text-[9px] rounded-md uppercase tracking-widest font-mono font-medium flex items-center gap-1.5 w-fit border shadow-sm ${config.color}`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
          </div>
        );
      }
    }
  ];

  const canGoPrev = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
            System Activity
          </h2>
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-1">
            Auth & Access Logs: {total} total &middot; Page {page + 1} of {totalPages}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search by User, Email, IP or Event..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0); // reset ke halaman pertama tiap kali user mulai mengetik search baru
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

      <AdminTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        emptyMessage={searchQuery ? "No matching activity records found." : "No system activities recorded yet."}
      />

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
          Showing {logs.length === 0 ? 0 : offset + 1}&ndash;{offset + logs.length} of {total}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => canGoPrev && setPage(p => p - 1)}
            disabled={!canGoPrev || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-full border border-foreground/10 text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <button
            onClick={() => canGoNext && setPage(p => p + 1)}
            disabled={!canGoNext || isLoading}
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