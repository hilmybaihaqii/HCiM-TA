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

  useEffect(() => {
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

  return (
    <SplashContext.Provider
      value={{ pageReady, setPageReady, splashDone, setSplashDone, splashStarted, setSplashStarted }}
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