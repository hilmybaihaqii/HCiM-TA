'use client';

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLang } from './LanguageProvider';
import { setLanguage, type Lang } from './store';

function FlagId() {
  return (
    <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
      <rect width="20" height="10" fill="#E0202E" />
      <rect y="10" width="20" height="10" fill="#FFFFFF" />
    </svg>
  );
}

function FlagEn() {
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden="true">
      <rect width="60" height="60" fill="#012169" />
      <path d="M0 0L60 60M60 0L0 60" stroke="#FFFFFF" strokeWidth="12" />
      <path d="M0 0L60 60M60 0L0 60" stroke="#C8102E" strokeWidth="5" />
      <path d="M30 0V60M0 30H60" stroke="#FFFFFF" strokeWidth="18" />
      <path d="M30 0V60M0 30H60" stroke="#C8102E" strokeWidth="10" />
    </svg>
  );
}

const OPTIONS: Record<Lang, { code: string; next: Lang; action: string; Flag: () => React.ReactElement }> = {
  id: { code: 'ID', next: 'en', action: 'Switch to English', Flag: FlagId },
  en: { code: 'EN', next: 'id', action: 'Ganti ke Bahasa Indonesia', Flag: FlagEn },
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Satu tombol bahasa: bendera berputar seperti koin, kode bahasanya bergulir */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const lang = useLang();
  const calm = useReducedMotion();
  const { code, next, action, Flag } = OPTIONS[lang];

  return (
    <button
      type="button"
      data-i18n-skip
      lang={next}
      aria-label={action}
      title={action}
      onClick={() => { void setLanguage(next); }}
      style={{ viewTransitionName: 'lang-switch' }}
      className={`group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-foreground/10 bg-surface-white/80 pl-1.5 pr-2.5 text-xs font-semibold text-foreground shadow-[0_1px_3px_rgba(43,31,29,0.08)] transition-[background-color,box-shadow,scale] duration-200 hover:bg-surface-white hover:shadow-[0_3px_10px_rgba(43,31,29,0.12)] active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${className}`}
    >
      <span className="relative block h-6 w-6 [perspective:120px]" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.span
            key={lang}
            className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-black/10 [backface-visibility:hidden]"
            initial={calm ? { opacity: 0 } : { rotateY: -180 }}
            animate={calm ? { opacity: 1 } : { rotateY: 0 }}
            exit={calm ? { opacity: 0 } : { rotateY: 180 }}
            transition={{ duration: calm ? 0.01 : 0.55, ease: EASE }}
          >
            <Flag />
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="relative block h-4 w-[1.15rem] overflow-hidden" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.span
            key={code}
            className="absolute inset-0 flex items-center justify-center leading-none"
            initial={calm ? { opacity: 0 } : { y: '110%', opacity: 0 }}
            animate={calm ? { opacity: 1 } : { y: '0%', opacity: 1 }}
            exit={calm ? { opacity: 0 } : { y: '-110%', opacity: 0 }}
            transition={{ duration: calm ? 0.01 : 0.42, ease: EASE }}
          >
            {code}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
