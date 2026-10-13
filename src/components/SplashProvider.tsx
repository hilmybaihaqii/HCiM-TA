'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [pageReady, setPageReady] = useState(() => !isHomePage);
  const [splashDone, setSplashDone] = useState(() => {
    if (!isHomePage) return true;
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('hasSeenSplash') === 'true';
    }
    return false;
  });
  const [splashStarted, setSplashStarted] = useState(() => !isHomePage);

  useEffect(() => {
    if (!isHomePage) {
      setSplashDone(true);
      setPageReady(true);
      setSplashStarted(true);
      return;
    }

    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash === 'true') {
      setSplashDone(true);
      setPageReady(true);
      setSplashStarted(true);
      return;
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
  }, [isHomePage]);

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