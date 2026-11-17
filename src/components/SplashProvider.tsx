'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

interface SplashContextType {
  pageReady: boolean;
  setPageReady: (v: boolean) => void;
  splashDone: boolean;
  setSplashDone: (v: boolean) => void;
  splashStarted: boolean;
  setSplashStarted: (v: boolean) => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

const SEEN_KEY = 'hasSeenSplash';
const noop = () => () => {};

/** Splash sudah pernah tampil di tab ini (dibaca dari sessionStorage, aman saat render server) */
function useSeenSplash() {
  return useSyncExternalStore(
    noop,
    () => { try { return sessionStorage.getItem(SEEN_KEY) === 'true'; } catch { return false; } },
    () => false,
  );
}

/** Dokumen selesai dimuat (event "load") */
function useWindowLoaded() {
  return useSyncExternalStore(
    cb => { window.addEventListener('load', cb); return () => window.removeEventListener('load', cb); },
    () => document.readyState === 'complete',
    () => false,
  );
}

export function SplashProvider({ children }: { children: React.ReactNode }) {
  // Splash hanya diputar di halaman utama; di halaman lain dianggap sudah selesai (navbar dll. langsung tampil)
  const offHome = usePathname() !== '/';
  const seen = useSeenSplash();
  const loaded = useWindowLoaded();
  const [readyFlag, setPageReady] = useState(false);
  const [doneFlag, setDoneFlag] = useState(false);
  const [splashStarted, setSplashStarted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Pengaman: jangan menahan splash lebih dari 8 detik walau aset belum selesai
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // Selesai: simpan ke sessionStorage supaya splash tidak diulang di tab yang sama
  const setSplashDone = useCallback((v: boolean) => {
    setDoneFlag(v);
    if (v) {
      try { sessionStorage.setItem(SEEN_KEY, 'true'); } catch { /* storage diblokir: abaikan */ }
    }
  }, []);

  const value = useMemo<SplashContextType>(() => ({
    pageReady: readyFlag || loaded || timedOut,
    setPageReady,
    splashDone: doneFlag || seen || offHome,
    setSplashDone,
    // Tanpa splash (sudah pernah tampil / bukan halaman utama) konten landing langsung boleh mulai
    splashStarted: splashStarted || doneFlag || seen || offHome,
    setSplashStarted,
  }), [readyFlag, loaded, timedOut, doneFlag, seen, offHome, setSplashDone, splashStarted]);

  return <SplashContext.Provider value={value}>{children}</SplashContext.Provider>;
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}
