'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import DocumentTitle from './DocumentTitle';
import { syncDom } from './domTranslator';
import { getLang, getServerLang, onApplyLang, restoreLanguage, subscribeLang, translate } from './store';

/** Bahasa aktif; server selalu merender bahasa Inggris supaya hidrasi cocok */
export function useLang() {
  return useSyncExternalStore(subscribeLang, getLang, getServerLang);
}

/**
 * Untuk teks yang dipecah per kata sebelum dirender (animasi GSAP/Framer).
 * Teks biasa tidak perlu ini: lapisan DOM menerjemahkannya otomatis.
 */
export function useT() {
  const lang = useLang();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((text: string) => translate(text), [lang]);
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const off = onApplyLang(syncDom);
    void restoreLanguage();
    return off;
  }, []);
  return <><DocumentTitle />{children}</>;
}
