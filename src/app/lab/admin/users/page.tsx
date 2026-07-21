'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import AdminTable from '../components/AdminTable';
import UserActionModal, { ActionType } from './components/UserActionModal';
import { Shield, User, RotateCcw, Search, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 50;

interface UserData {
  id?: string;
  email?: string;
  display_name?: string;
  role?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
}

// Helper untuk membuat avatar inisial (contoh: Hilmy Baihaqi -> HB)
const getInitials = (name?: string) => {
  if (!name) return null;
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    user: UserData | null;
    action: ActionType | null;
    isProcessing: boolean;
  }>({ isOpen: false, user: null, action: null, isProcessing: false });

  // Pagination state
  const [page, setPage] = useState(0); // 0-indexed
  const [total, setTotal] = useState(0);
  // Dipakai untuk memicu refetch setelah action (activate/deactivate) sukses,
  // tanpa perlu memanggil function fetch dari luar effect (hindari warning
  // react-hooks/set-state-in-effect karena effect jadi tidak "self-contained")
  const [reloadToken, setReloadToken] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = page * PAGE_SIZE;

  // Fetch logic sekarang inline di dalam useEffect (bukan function terpisah
  // yang dipanggil dari luar), konsisten dengan pola di halaman activity/prediction/shap.
  // Refetch setelah action cukup lewat setReloadToken, bukan manggil fetch langsung.
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const response = await api(`/admin/users?include_deleted=true&limit=${PAGE_SIZE}&offset=${offset}`);
        if (!isMounted) return;

        const data = (response as { items?: UserData[] }).items || [];
        const totalCount = (response as { total?: number }).total ?? data.length;
        setUsers(data);
        setTotal(totalCount);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch users:", error);
        setErrorMsg("Failed to retrieve user data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [offset, reloadToken]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      user =>
        (user.display_name || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query)
    );
  }, [searchQuery, users]);

  // Tombol aksi sudah di-disable untuk admin di level UI,
  // jadi guard ini murni safety-net, tanpa alert() yang blocking di mobile.
  const requestAction = (user: UserData, action: ActionType) => {
    if (user.role === 'admin') return;
    setModalState({ isOpen: true, user, action, isProcessing: false });
  };

  const executeAction = async () => {
    const { user, action } = modalState;
    if (!user || !user.id || !action) return;

    setModalState(prev => ({ ...prev, isProcessing: true }));
    setErrorMsg(null);

    try {
      if (action === 'activate') {
        await api(`/admin/users/${user.id}/restore`, { method: "POST" });
      } else {
        await api(`/admin/users/${user.id}`, { method: "DELETE" });
      }

      // Trigger refetch via reloadToken (effect di atas yang menjalankan fetch-nya)
      setReloadToken(t => t + 1);
      setModalState({ isOpen: false, user: null, action: null, isProcessing: false });
    } catch (error: unknown) {
      console.error("[ERROR] Action failed:", error);
      const err = error as { data?: { message?: string }, message?: string };
      const backendMessage = err?.data?.message || err?.message || "Unknown Error";

      setErrorMsg(`Failed to ${action} user: ${backendMessage}`);
      setModalState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const columns = [
    {
      header: "Identity",
      accessor: (user: UserData) => {
        const isUserDeactivated = user.is_deleted === true || user.deleted_at != null;
        const initials = getInitials(user.display_name);

        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-mono text-[11px] font-medium ${
              isUserDeactivated
                ? 'bg-foreground/5 text-muted'
                : 'bg-foreground/10 text-foreground'
            }`}>
              {initials ? initials : <User className="w-4 h-4" />}
            </div>

            <div className="flex flex-col min-w-0">
              <span className={`font-medium truncate ${isUserDeactivated ? 'text-muted line-through' : 'text-foreground'}`}>
                {user.display_name || 'No Name'}
              </span>
              <span className="text-xs text-muted font-mono truncate">{user.email || 'No Email'}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: "Access Level",
      className: "w-32",
      accessor: (user: UserData) => {
        const isAdmin = user.role === 'admin';
        return (
          <span className={`px-2.5 py-1 text-[9px] rounded-full uppercase tracking-widest font-mono font-medium inline-flex items-center gap-1.5 w-fit border ${
            isAdmin
              ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
              : 'bg-foreground/5 text-muted border-foreground/10'
          }`}>
            {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
            {user.role || 'user'}
          </span>
        );
      }
    },
    {
      header: "Status",
      className: "w-32",
      accessor: (user: UserData) => {
        const isUserDeactivated = user.is_deleted === true || user.deleted_at != null;
        return (
          <span className={`px-2.5 py-1 text-[9px] rounded-full uppercase tracking-widest font-mono font-medium inline-flex items-center gap-1.5 w-fit border ${
            isUserDeactivated
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
          }`}>
            {isUserDeactivated ? 'Deactivated' : 'Active'}
          </span>
        );
      }
    },
    {
      header: "Actions",
      className: "text-right w-32",
      accessor: (user: UserData) => {
        const isUserDeactivated = user.is_deleted === true || user.deleted_at != null;
        const isAdmin = user.role === 'admin';

        return (
          <div className="flex items-center justify-end gap-1">
            {isUserDeactivated ? (
              <button
                onClick={() => requestAction(user, 'activate')}
                disabled={isAdmin}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors outline-none text-[10px] font-mono uppercase tracking-widest ${
                  isAdmin
                    ? 'opacity-30 cursor-not-allowed text-muted'
                    : 'bg-transparent hover:bg-emerald-500/10 text-emerald-600'
                }`}
                title="Activate Account"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Activate</span>
              </button>
            ) : (
              <button
                onClick={() => requestAction(user, 'deactivate')}
                disabled={isAdmin}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors outline-none text-[10px] font-mono uppercase tracking-widest ${
                  isAdmin
                    ? 'opacity-30 cursor-not-allowed text-muted'
                    : 'bg-transparent hover:bg-amber-500/10 text-amber-600'
                }`}
                title="Deactivate Account"
              >
                <Ban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Deactivate</span>
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-foreground">Registered Users</h2>
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-1">
            Total Users: {total} &middot; Page {page + 1} of {totalPages}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0); // reset ke halaman pertama tiap kali mulai search baru
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

      {/* overflow-x-auto: di layar sempit, tabel bisa di-scroll horizontal
          alih-alih kolom saling numpuk/kepencet */}
      <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-160">
          <AdminTable
            columns={columns}
            data={filteredUsers}
            isLoading={isLoading}
            emptyMessage={searchQuery ? "No matching personnel found." : "No users registered in the system."}
          />
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
          Showing {users.length === 0 ? 0 : offset + 1}&ndash;{offset + users.length} of {total}
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

      <UserActionModal
        isOpen={modalState.isOpen}
        action={modalState.action}
        userName={modalState.user?.display_name || 'Unknown User'}
        isProcessing={modalState.isProcessing}
        onClose={() => setModalState({ isOpen: false, user: null, action: null, isProcessing: false })}
        onConfirm={executeAction}
      />
    </div>
  );
}