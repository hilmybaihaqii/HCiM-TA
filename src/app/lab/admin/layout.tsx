'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useSessionUser } from '@/components/SessionGuard';
import LabContainer from '../components/LabContainer';
import LabPageHeader from '../components/LabPageHeader';
import { Bone } from '../components/Skeletons';
import { Figure, SectionHead, TabRail } from '../components/report/ui';
import { AdminDataProvider, isAdminRole, isDeactivated, useAdminData } from './AdminData';
import AdminSplashScreen from './components/AdminSplashScreen';

/*
 * Panel admin: header & ringkasan sama bentuknya dengan halaman lab lain, lalu satu rel tab
 * untuk empat daftar (akun, sign-in, prediksi, SHAP). Semua angka dari API admin.
 */

const SECTIONS = [
  { id: '/lab/admin/users', label: 'Accounts' },
  { id: '/lab/admin/logs/activity', label: 'Sign-ins' },
  { id: '/lab/admin/logs/prediction', label: 'Predictions' },
  { id: '/lab/admin/logs/shap', label: 'SHAP' },
];

const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—');

function Overview() {
  const { users, totals, loading } = useAdminData();
  const deactivated = users.filter(isDeactivated).length;
  const admins = users.filter(u => isAdminRole(u)).length;

  return (
    <section aria-labelledby="admin-overview" className="w-full">
      <SectionHead id="admin-overview" title="Overview" meta="Whole platform" />
      <div className="mt-6 pt-6 border-t border-foreground/10 min-h-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8" aria-hidden="true">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center md:items-start gap-2">
                <Bone className="h-3 w-16" />
                <Bone className="h-8 w-14" />
              </div>
            ))}
          </div>
        ) : (
          <motion.dl
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:divide-x md:divide-foreground/10 [&>div]:md:pl-6 [&>div:first-child]:md:pl-0"
          >
            <Figure label="Accounts" note={`${fmt(deactivated)} deactivated · ${fmt(admins)} admin`}>{fmt(totals.users)}</Figure>
            <Figure label="Sign-in events">{fmt(totals.events)}</Figure>
            <Figure label="Predictions">{fmt(totals.predictions)}</Figure>
            <Figure label="SHAP analyses">{fmt(totals.shap)}</Figure>
          </motion.dl>
        )}
      </div>
    </section>
  );
}

/** Lama minimal sambutan "Welcome, Admin." (sama dengan versi awal) */
const SPLASH_MS = 2200;

/** Role dari /auth/me (bisa polos atau dibungkus { items: [...] }) */
const roleOf = (raw: unknown) =>
  String(((raw as { items?: { role?: string }[] } | null)?.items?.[0] ?? (raw as { role?: string } | null))?.role ?? '').toLowerCase();

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = SECTIONS.find(s => pathname.startsWith(s.id))?.id ?? SECTIONS[0].id;

  return (
    <LabContainer className="flex flex-col gap-12 md:gap-16">
      <LabPageHeader
        eyebrow="Admin"
        title="Accounts"
        accent="and activity."
        description="Manage who can sign in, and review every sign-in, prediction and SHAP analysis on Cardivex."
      />

      <Overview />

      <section aria-label="Records" className="w-full">
        <TabRail tabs={SECTIONS} value={active} onChange={path => router.push(path)} label="Admin section" />
        <motion.div
          key={active}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pt-6"
        >
          {children}
        </motion.div>
      </section>
    </LabContainer>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdmin = useSessionUser().role === 'admin';
  // Ketat: setiap kali panel admin dibuka, role dicek ulang ke backend sebelum data admin dimuat.
  // User biasa langsung dikembalikan ke /lab tanpa melihat splash atau data apa pun.
  const [verified, setVerified] = useState(false);
  // Splash muncul setiap kali panel admin dibuka (layout ini dipasang ulang saat masuk dari halaman lab
  // lain), tapi tidak saat berpindah tab di dalam panel admin.
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/lab');
      return;
    }
    let alive = true;
    api('/auth/me')
      .then(raw => {
        if (!alive) return;
        if (roleOf(raw) === 'admin') setVerified(true);
        else router.replace('/lab');
      })
      .catch(() => { if (alive) router.replace('/lab'); });
    const t = setTimeout(() => setMinElapsed(true), SPLASH_MS);
    return () => { alive = false; clearTimeout(t); };
  }, [isAdmin, router]);

  if (!isAdmin) {
    return (
      <LabContainer>
        <p className="py-24 text-center text-sm text-foreground/70">This area is for administrators. Taking you back to the lab…</p>
      </LabContainer>
    );
  }

  return (
    <>
      <AdminSplashScreen isVisible={!verified || !minElapsed} verified={verified} />
      {verified && (
        <AdminDataProvider>
          <AdminShell>{children}</AdminShell>
        </AdminDataProvider>
      )}
    </>
  );
}
