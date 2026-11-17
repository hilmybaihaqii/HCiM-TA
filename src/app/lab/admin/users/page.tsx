'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useSessionUser } from '@/components/SessionGuard';
import { primaryBtn, secondaryBtn } from '../../components/report/ui';
import {
  FilterMenu, HistoryControls, HistoryMessage, HistoryRow, HistorySkeleton, PAGE_SIZE, Pager, formatWhen, matchesQuery,
} from '../../logs/components/history';
import UserActionModal, { ActionType } from '../components/UserActionModal';
import { AdminUser, isAdminRole, isDeactivated, useAdminData } from '../AdminData';

type Filter = 'all' | 'active' | 'deactivated' | 'admin';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All accounts' },
  { id: 'active', label: 'Active' },
  { id: 'deactivated', label: 'Deactivated' },
  { id: 'admin', label: 'Admins' },
];

const matchFilter = (u: AdminUser, f: Filter) =>
  f === 'all' || (f === 'admin' ? isAdminRole(u) : f === 'deactivated' ? isDeactivated(u) : !isDeactivated(u));

/** "Hilmy Baihaqi" -> "HB" */
const initials = (u: AdminUser) => {
  const parts = (u.display_name || u.email || '?').trim().split(/\s+/).filter(Boolean);
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
};

// Ponsel: akun | status | panah. Desktop: akun | peran | status | panah.
const ROW = 'grid grid-cols-[1fr_auto_1rem] sm:grid-cols-[1fr_7rem_8rem_1rem] items-center gap-3 sm:gap-4';

function Status({ user }: { user: AdminUser }) {
  const off = isDeactivated(user);
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${off ? 'text-foreground/55' : 'text-foreground'}`}>
      <span className={`h-2 w-2 rounded-full shrink-0 ${off ? 'border border-foreground/40' : 'bg-foreground/80'}`} />
      {off ? 'Deactivated' : 'Active'}
    </span>
  );
}

function Detail({ user, isSelf, onAction }: { user: AdminUser; isSelf: boolean; onAction: (a: ActionType) => void }) {
  const off = isDeactivated(user);
  const rows: [string, React.ReactNode][] = [
    ['Email', user.email || '—'],
    ['Role', isAdminRole(user) ? 'Administrator' : 'User'],
    ['Status', off ? `Deactivated${user.deleted_at ? ` on ${formatWhen(user.deleted_at)}` : ''}` : 'Active'],
    ...(user.created_at ? [['Joined', formatWhen(user.created_at)] as [string, React.ReactNode]] : []),
    ['Account ID', <span key="id" className="font-mono text-xs break-all">{user.id}</span>],
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-end">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-foreground/55">{k}</dt>
            <dd className="mt-0.5 text-foreground truncate">{v}</dd>
          </div>
        ))}
      </dl>
      {isAdminRole(user) ? (
        <p className="text-sm text-foreground/60 md:text-right md:max-w-56">
          {isSelf ? 'This is your account.' : 'Administrator accounts can’t be deactivated here.'}
        </p>
      ) : off ? (
        <button type="button" onClick={() => onAction('activate')} className={primaryBtn}>Restore account</button>
      ) : (
        <button type="button" onClick={() => onAction('deactivate')} className={secondaryBtn}>Deactivate account</button>
      )}
    </div>
  );
}

/** Semua akun: cari, saring, buka satu akun untuk detail & aksi. Data dari layout admin (sekali muat). */
export default function AdminUsersPage() {
  const me = useSessionUser();
  const { users, loading, error, reload } = useAdminData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ user: AdminUser; action: ActionType; busy: boolean } | null>(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => users.filter(u => matchFilter(u, filter) && matchesQuery(q, [u.display_name, u.email, u.id])),
    [users, filter, q],
  );
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const shown = matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const reset = () => { setOpen(null); setPage(0); };

  const confirm = async () => {
    if (!modal) return;
    setModal({ ...modal, busy: true });
    setActionError(null);
    try {
      if (modal.action === 'activate') await api(`/admin/users/${modal.user.id}/restore`, { method: 'POST' });
      else await api(`/admin/users/${modal.user.id}`, { method: 'DELETE' });
      setModal(null);
      reload();
    } catch (err) {
      const e = err as { data?: { message?: string; detail?: string } };
      const detail = e.data?.detail || e.data?.message;
      setActionError(`Could not ${modal.action === 'activate' ? 'restore' : 'deactivate'} ${modal.user.display_name || 'this account'}.${detail ? ` ${detail}` : ''}`);
      setModal(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <HistoryControls
        query={query}
        onQuery={v => { setQuery(v); reset(); }}
        filter={<FilterMenu options={FILTERS} value={filter} onChange={v => { setFilter(v); reset(); }} label="Show accounts" />}
        placeholder="Search by name, email or account ID"
        summary={!loading && (q || filter !== 'all') ? `${matches.length} matching ${matches.length === 1 ? 'account' : 'accounts'}` : null}
      />

      <AnimatePresence initial={false}>
        {actionError && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-sm text-accent"
          >
            {actionError}
          </motion.p>
        )}
      </AnimatePresence>

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span>Account</span>
          <span className="hidden sm:block">Role</span>
          <span className="text-right sm:text-left">Status</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load the accounts. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          <HistoryMessage>{q || filter !== 'all' ? 'No accounts match your search.' : 'No accounts yet.'}</HistoryMessage>
        ) : (
          <ul>
            {shown.map(u => (
              <HistoryRow
                key={u.id}
                id={u.id}
                grid={ROW}
                open={open === u.id}
                onToggle={() => setOpen(open === u.id ? null : u.id)}
                cells={
                  <>
                    <span className="flex items-center gap-3 min-w-0">
                      <span className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center font-mono text-[11px] ${isDeactivated(u) ? 'bg-foreground/5 text-foreground/45' : 'bg-foreground/10 text-foreground'}`}>
                        {initials(u)}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">
                          {u.display_name || 'No name'}
                          {u.id === me.id && <span className="ml-2 text-xs font-normal text-foreground/50">You</span>}
                        </span>
                        <span className="text-xs text-foreground/60 truncate">{u.email || '—'}</span>
                      </span>
                    </span>
                    <span className="hidden sm:block text-sm text-foreground/70">{isAdminRole(u) ? 'Admin' : 'User'}</span>
                    <span className="justify-self-end sm:justify-self-start"><Status user={u} /></span>
                  </>
                }
              >
                <Detail user={u} isSelf={u.id === me.id} onAction={action => setModal({ user: u, action, busy: false })} />
              </HistoryRow>
            ))}
          </ul>
        )}
      </div>

      <Pager page={page} pages={pages} disabled={loading} onChange={p => { setOpen(null); setPage(p); }} />

      <UserActionModal
        isOpen={!!modal}
        action={modal?.action ?? null}
        userName={modal?.user.display_name || modal?.user.email || 'This account'}
        isProcessing={!!modal?.busy}
        onClose={() => setModal(null)}
        onConfirm={confirm}
      />
    </div>
  );
}
