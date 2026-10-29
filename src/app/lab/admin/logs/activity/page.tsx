'use client';

import React, { useCallback, useState } from 'react';
import {
  FilterMenu, HistoryControls, HistoryMessage, HistoryRow, HistorySkeleton, Pager, formatWhen, matchesQuery, useHistory,
} from '../../../logs/components/history';
import { AdminUser, personName, useAdminData } from '../../AdminData';

/** Satu kejadian akun dari /admin/auth-events */
interface AuthEvent {
  id: string;
  created_at?: string;
  event?: string;
  ip?: string;
  user_agent?: string;
  user_id?: string | null;
}

type Group = 'signin' | 'failed' | 'account' | 'admin';
/** Filter yang berguna untuk memantau login: semua, login & logout, atau login gagal */
type Filter = 'all' | 'signin' | 'failed';

const EVENTS: Record<string, { label: string; group: Group }> = {
  login_ok: { label: 'Signed in', group: 'signin' },
  oauth_login: { label: 'Signed in with Google', group: 'signin' },
  logout: { label: 'Signed out', group: 'signin' },
  login_fail: { label: 'Failed sign-in', group: 'failed' },
  register: { label: 'Registered', group: 'account' },
  verify: { label: 'Email confirmed', group: 'account' },
  reset: { label: 'Password reset', group: 'account' },
  admin_deleted_user: { label: 'Deactivated by admin', group: 'admin' },
  admin_restored_user: { label: 'Restored by admin', group: 'admin' },
};

/** Event yang belum dikenal: "password_change" -> "Password change" */
function describe(raw?: string): { label: string; group: Group } {
  const key = (raw || '').toLowerCase();
  if (EVENTS[key]) return EVENTS[key];
  const label = key.replace(/_/g, ' ').trim() || 'Unknown event';
  return { label: label[0].toUpperCase() + label.slice(1), group: key.startsWith('admin') ? 'admin' : 'account' };
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All events' },
  { id: 'signin', label: 'Sign-ins & sign-outs' },
  { id: 'failed', label: 'Failed sign-ins' },
];

const DOT: Record<Group, string> = {
  signin: 'bg-foreground/40',
  failed: 'bg-accent',
  account: 'bg-foreground/40',
  admin: 'bg-amber',
};

// Event admin menyimpan pelakunya di user_agent: "Admin <uuid> | <user agent asli>"
const ADMIN_ACTOR = /^Admin\s+([a-f0-9-]{36})\s*\|\s*(.*)$/i;

function splitAgent(ua?: string): { actorId?: string; agent?: string } {
  const m = ua?.match(ADMIN_ACTOR);
  return m ? { actorId: m[1], agent: m[2] } : { agent: ua };
}

/** "Chrome on Windows" dari user agent; kosong kalau tidak dikenali */
function deviceOf(ua?: string): string {
  if (!ua) return '';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '';
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return [browser, os].filter(Boolean).join(' on ');
}

// Ponsel: akun + waktu | kejadian | panah. Desktop: waktu | akun | kejadian | IP | panah.
const ROW = 'grid grid-cols-[1fr_auto_1rem] sm:grid-cols-[11rem_1fr_12rem_8rem_1rem] items-center gap-3 sm:gap-4';

function EventText({ raw }: { raw?: string }) {
  const { label, group } = describe(raw);
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground min-w-0">
      <span className={`h-2 w-2 rounded-full shrink-0 ${DOT[group]}`} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function Detail({ log, byId }: { log: AuthEvent; byId: Map<string, AdminUser> }) {
  const { actorId, agent } = splitAgent(log.user_agent);
  const user = log.user_id ? byId.get(log.user_id) : undefined;
  const rows: [string, React.ReactNode][] = [
    ['Event', describe(log.event).label],
    ['When', formatWhen(log.created_at)],
    [actorId ? 'Account changed' : 'Account', log.user_id ? `${personName(user, log.user_id)}${user?.email && user.display_name ? ` · ${user.email}` : ''}` : 'No account (sign-in did not match one)'],
    ...(actorId ? [['Done by', personName(byId.get(actorId), actorId)] as [string, React.ReactNode]] : []),
    ['IP address', log.ip || '—'],
    ['Device', deviceOf(agent) || '—'],
  ];
  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-foreground/55">{k}</dt>
            <dd className="mt-0.5 text-foreground break-words">{v}</dd>
          </div>
        ))}
      </dl>
      {agent && <p className="text-xs text-foreground/50 font-mono break-all">{agent}</p>}
    </div>
  );
}

/** Semua kejadian akun: sign-in, gagal sign-in, perubahan akun, dan tindakan admin. */
export default function AdminActivityPage() {
  const { byId } = useAdminData();
  // Pencarian ikut mencocokkan nama & email akun (dari daftar akun admin)
  const matchEvent = useCallback((log: AuthEvent, q: string, f: Filter) => {
    const { label, group } = describe(log.event);
    if (f !== 'all' && group !== f) return false;
    const u = log.user_id ? byId.get(log.user_id) : undefined;
    return matchesQuery(q, [label, log.event, log.ip, log.user_id, u?.display_name, u?.email, formatWhen(log.created_at)]);
  }, [byId]);
  const h = useHistory<AuthEvent, Filter>('/admin/auth-events', matchEvent);
  const { items: shown, total, loading, error, page, pages, setPage } = h;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <HistoryControls
        query={h.query}
        onQuery={v => { setOpen(null); h.setQuery(v); }}
        filter={<FilterMenu options={FILTERS} value={h.filter} onChange={v => { setOpen(null); h.setFilter(v); }} label="Show events" />}
        placeholder="Search by name, email, IP or event"
        summary={!loading && h.filtering ? `${total} matching ${total === 1 ? 'event' : 'events'}` : null}
      />

      <div>
        <div className={`${ROW} px-2 sm:px-3 pb-2 text-[11px] text-foreground/60 border-b border-foreground/10`}>
          <span className="hidden sm:block">Date & time</span>
          <span>Account</span>
          <span className="text-right sm:text-left">Event</span>
          <span className="hidden sm:block text-right">IP address</span>
          <span />
        </div>
        {loading ? (
          <HistorySkeleton grid={ROW} />
        ) : error ? (
          <HistoryMessage>Could not load the sign-in events. Reload the page to try again.</HistoryMessage>
        ) : shown.length === 0 ? (
          <HistoryMessage>{h.filtering ? 'No events match your search.' : 'No events recorded yet.'}</HistoryMessage>
        ) : (
          <ul>
            {shown.map(log => {
              const user = log.user_id ? byId.get(log.user_id) : undefined;
              return (
                <HistoryRow
                  key={log.id}
                  id={log.id}
                  grid={ROW}
                  open={open === log.id}
                  onToggle={() => setOpen(open === log.id ? null : log.id)}
                  cells={
                    <>
                      <span className="hidden sm:block text-sm text-foreground truncate">{formatWhen(log.created_at)}</span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm text-foreground truncate">{log.user_id ? personName(user, log.user_id) : 'Unknown account'}</span>
                        <span className="sm:hidden text-xs text-foreground/55 truncate">{formatWhen(log.created_at)}</span>
                        {user?.email && user.display_name && <span className="hidden sm:block text-xs text-foreground/55 truncate">{user.email}</span>}
                      </span>
                      <span className="justify-self-end sm:justify-self-start min-w-0"><EventText raw={log.event} /></span>
                      <span className="hidden sm:block text-right font-mono text-xs text-foreground/70 truncate">{log.ip || '—'}</span>
                    </>
                  }
                >
                  <Detail log={log} byId={byId} />
                </HistoryRow>
              );
            })}
          </ul>
        )}
      </div>

      <Pager page={page} pages={pages} disabled={loading} onChange={p => { setOpen(null); setPage(p); }} />
    </div>
  );
}
