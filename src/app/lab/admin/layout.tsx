'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Activity, BrainCircuit, Network, ShieldAlert } from 'lucide-react';
import { useSessionUser } from '@/components/SessionGuard';
import AdminSplashScreen from './components/AdminSplashScreen';
import LabContainer from '../components/LabContainer';

const SPLASH_MS = 2200;
const SPLASH_SEEN_KEY = 'adminSplashSeen';

/** Splash "Welcome, Admin." cukup sekali per sesi browser, bukan tiap kali masuk panel admin. */
function readSplashSeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) === '1';
  } catch {
    return true;
  }
}

const adminNavItems = [
  { name: 'Users', path: '/lab/admin/users', icon: Users },
  { name: 'Activity', path: '/lab/admin/logs/activity', icon: Activity },
  { name: 'Predictions', path: '/lab/admin/logs/prediction', icon: BrainCircuit },
  { name: 'SHAP Data', path: '/lab/admin/logs/shap', icon: Network },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Sesi sudah dicek SessionGuard di layout /lab; di sini tinggal cek role
  const isAuthorized = useSessionUser().role === 'admin';
  // Area lab hanya dirender di client (SessionGuard), jadi sessionStorage aman dibaca saat init
  const [showSplash, setShowSplash] = useState(() => isAuthorized && !readSplashSeen());

  useEffect(() => {
    if (!isAuthorized) router.replace('/lab');
  }, [isAuthorized, router]);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      setShowSplash(false);
      try { sessionStorage.setItem(SPLASH_SEEN_KEY, '1'); } catch { /* storage diblokir: abaikan */ }
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [showSplash]);

  return (
    <>
      {/* =========================================================
          KOMPONEN SPLASH SCREEN TERPISAH
          ========================================================= */}
      <AdminSplashScreen isVisible={showSplash} authChecked />

      {/* =========================================================
          FALLBACK JIKA AKSES DITOLAK
          ========================================================= */}
      {!showSplash && !isAuthorized && (
        <div className="fixed inset-0 z-9000 flex flex-col items-center justify-center gap-4 text-rose-500 bg-background px-4 text-center">
          <ShieldAlert className="w-12 h-12" />
          <span className="text-sm font-mono uppercase tracking-widest">Unauthorized Access</span>
        </div>
      )}

      {/* =========================================================
          KONTEN ADMIN UTAMA
          ========================================================= */}
      {!showSplash && isAuthorized && (
        <LabContainer>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 border-b border-foreground/10 pb-6 flex flex-col gap-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-2">Admin Control Panel</h1>
              <p className="text-[10px] sm:text-xs text-muted font-mono uppercase tracking-widest">System Management & Log Analysis</p>
            </div>

            {/* -mx-4 px-4: nav bisa di-scroll edge-to-edge di mobile, konsisten
                dengan pola scroll container di halaman-halaman admin lainnya */}
            <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 scrollbar-hide">
              {adminNavItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path} className="relative outline-none shrink-0">
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-background bg-foreground' : 'text-muted hover:bg-foreground/5 hover:text-foreground'}`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </LabContainer>
      )}
    </>
  );
}