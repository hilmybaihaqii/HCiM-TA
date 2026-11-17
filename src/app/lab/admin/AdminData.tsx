'use client';

// Data bersama panel admin: daftar semua akun (untuk nama di setiap log) dan jumlah total tiap log.
// Dimuat sekali di layout admin, jadi berpindah tab admin tidak meminta data yang sama lagi.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cachedGet, invalidateHistory } from '@/lib/historyCache';
import { fetchAllPages } from '../logs/components/history';

export interface AdminUser {
  id: string;
  email?: string;
  display_name?: string;
  role?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at?: string;
}

export const isDeactivated = (u: AdminUser) => u.is_deleted === true || u.deleted_at != null;
export const isAdminRole = (u?: AdminUser | null) => String(u?.role ?? '').toLowerCase() === 'admin';

/** "Nama" atau email, atau potongan ID kalau akun sudah tidak ada */
export function personName(u?: AdminUser | null, id?: string | null): string {
  if (u?.display_name) return u.display_name;
  if (u?.email) return u.email;
  return id ? `Account ${id.slice(0, 8)}` : 'Unknown account';
}

type Totals = { users?: number; events?: number; predictions?: number; shap?: number };

type AdminData = {
  users: AdminUser[];
  byId: Map<string, AdminUser>;
  loading: boolean;
  error: boolean;
  totals: Totals;
  /** Muat ulang setelah ada perubahan (mis. akun dinonaktifkan) */
  reload: () => void;
};

const Ctx = createContext<AdminData | null>(null);

const totalOf = (path: string) =>
  cachedGet<{ total?: number; items?: unknown[] } | null>(`${path}${path.includes('?') ? '&' : '?'}limit=1&offset=0`)
    .then(r => r?.total ?? r?.items?.length ?? 0)
    .catch(() => undefined);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [nonce, setNonce] = useState(0);
  // `key` = permintaan yang hasilnya tersimpan; loading = key belum sama dengan permintaan saat ini
  const [state, setState] = useState<{ key: number; users: AdminUser[]; error: boolean; totals: Totals }>({
    key: -1, users: [], error: false, totals: {},
  });

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchAllPages<AdminUser>('/admin/users?include_deleted=true').catch(() => null),
      totalOf('/admin/auth-events'),
      totalOf('/admin/prediction-logs'),
      totalOf('/admin/shap-logs'),
    ]).then(([users, events, predictions, shap]) => {
      if (!alive) return;
      setState({
        key: nonce,
        users: users?.items ?? [],
        error: users === null,
        totals: { users: users?.total, events, predictions, shap },
      });
    });
    return () => { alive = false; };
  }, [nonce]);

  const reload = useCallback(() => {
    invalidateHistory();
    setNonce(n => n + 1);
  }, []);

  const value = useMemo<AdminData>(() => ({
    users: state.users,
    byId: new Map(state.users.filter(u => u.id).map(u => [u.id, u])),
    loading: state.key !== nonce,
    error: state.error,
    totals: state.totals,
    reload,
  }), [state, nonce, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminData(): AdminData {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAdminData must be used inside <AdminDataProvider>');
  return v;
}
