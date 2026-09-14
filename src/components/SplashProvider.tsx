'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SplashContextType {
  pageReady: boolean;
  setPageReady: (v: boolean) => void;
  splashDone: boolean;
  setSplashDone: (v: boolean) => void;
  splashStarted: boolean;
  setSplashStarted: (v: boolean) => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [pageReady, setPageReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [splashStarted, setSplashStarted] = useState(false);

  // 1. Cek sessionStorage saat komponen dimount
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash === 'true') {
      setSplashDone(true); // Jika sudah pernah lihat, langsung tandai selesai
    }

    const handleLoad = () => setPageReady(true);
    if (document.readyState === 'complete') {
      setPageReady(true);
    } else {
      window.addEventListener('load', handleLoad);
    }

    const fallbackTimeout = setTimeout(() => {
      setPageReady(true);
    }, 8000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // 2. Buat custom fungsi untuk setSplashDone agar otomatis simpan ke sessionStorage
  const handleSetSplashDone = (v: boolean) => {
    setSplashDone(v);
    if (v === true) {
      sessionStorage.setItem('hasSeenSplash', 'true');
    }
  };

  return (
    <SplashContext.Provider
      value={{ 
        pageReady, 
        setPageReady, 
        splashDone, 
        setSplashDone: handleSetSplashDone, // Gunakan custom fungsi di sini
        splashStarted, 
        setSplashStarted 
      }}
    >
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}