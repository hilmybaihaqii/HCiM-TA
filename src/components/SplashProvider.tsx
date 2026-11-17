'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

export interface SplashContextType {
  pageReady: boolean;
  setPageReady: (v: boolean) => void;
  splashDone: boolean;
  setSplashDone: (v: boolean) => void;
  splashStarted: boolean;
  setSplashStarted: (v: boolean) => void;
  readyReason: 'asset' | 'timeout' | null;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

const SEEN_KEY = 'hasSeenSplash';
const noop = () => () => {};

/**
 * INVARIANT:
 * SPLASH_MIN_DISPLAY_MS < SPLASH_CHECKPOINT_MS < SPLASH_SAFETY_TIMEOUT_MS
 *
 * - SPLASH_CHECKPOINT_MS (3000ms): Target waktu timeline GSAP di SplashScreen.tsx mencapai tl.call.
 * - SPLASH_MIN_DISPLAY_MS (1800ms): Batas bawah sebelum splash boleh terbuka, harus < checkpoint agar tidak menahan warm load.
 * - SPLASH_SAFETY_TIMEOUT_MS (12000ms): Batas pengaman jika aset 3D lambat/gagal. HARUS > checkpoint agar gate aset berfungsi!
 */
export const SPLASH_SAFETY_TIMEOUT_MS = 12000;
export const SPLASH_MIN_DISPLAY_MS = 1800;
export const SPLASH_CHECKPOINT_MS = 3000;

/** Splash sudah pernah tampil di tab ini (dibaca dari sessionStorage, aman saat render server) */
function useSeenSplash() {
  return useSyncExternalStore(
    noop,
    () => { try { return sessionStorage.getItem(SEEN_KEY) === 'true'; } catch { return false; } },
    () => false,
  );
}

export function SplashProvider({ children }: { children: React.ReactNode }) {
  // Splash hanya diputar di halaman utama; di halaman lain dianggap sudah selesai (navbar dll. langsung tampil)
  const offHome = usePathname() !== '/';
  const seen = useSeenSplash();
  const [readyFlag, setPageReady] = useState(false);
  const [doneFlag, setDoneFlag] = useState(false);
  const [splashStarted, setSplashStarted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Pengaman: jangan menahan splash lebih dari SPLASH_SAFETY_TIMEOUT_MS walau aset belum selesai.
  // INVARIANT: SPLASH_SAFETY_TIMEOUT_MS (12s) > SPLASH_CHECKPOINT_MS (3s). Jika lebih kecil, gate aset 3D akan mati!
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && SPLASH_SAFETY_TIMEOUT_MS <= SPLASH_CHECKPOINT_MS) {
      console.warn(
        `[SplashConfig Warning] SPLASH_SAFETY_TIMEOUT_MS (${SPLASH_SAFETY_TIMEOUT_MS}ms) must be strictly greater than SPLASH_CHECKPOINT_MS (${SPLASH_CHECKPOINT_MS}ms). Otherwise the asset-readiness gate is dead!`
      );
    }
    const t = setTimeout(() => setTimedOut(true), SPLASH_SAFETY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  // Selesai: simpan ke sessionStorage supaya splash tidak diulang di tab yang sama
  const setSplashDone = useCallback((v: boolean) => {
    setDoneFlag(v);
    if (v) {
      if (typeof window !== 'undefined') {
        (window as unknown as { __curtainLiftTime?: number }).__curtainLiftTime = performance.now();
      }
      try { sessionStorage.setItem(SEEN_KEY, 'true'); } catch { /* storage diblokir: abaikan */ }
    }
  }, []);

  const readyReason: SplashContextType['readyReason'] = readyFlag
    ? 'asset'
    : timedOut
    ? 'timeout'
    : null;

  useEffect(() => {
    if (readyReason) {
      (window as unknown as { __readyReason?: string }).__readyReason = readyReason;
    }
  }, [readyReason]);

  const value = useMemo<SplashContextType>(() => ({
    pageReady: readyFlag || timedOut,
    setPageReady,
    splashDone: doneFlag || seen || offHome,
    setSplashDone,
    // Tanpa splash (sudah pernah tampil / bukan halaman utama) konten landing langsung boleh mulai
    splashStarted: splashStarted || doneFlag || seen || offHome,
    setSplashStarted,
    readyReason,
  }), [readyFlag, timedOut, doneFlag, seen, offHome, setSplashDone, splashStarted, readyReason]);

  return <SplashContext.Provider value={value}>{children}</SplashContext.Provider>;
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}
