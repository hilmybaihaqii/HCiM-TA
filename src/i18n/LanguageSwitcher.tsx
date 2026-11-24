'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
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

/** Taegukgi yang disederhanakan: lingkaran taeguk merah-biru dan empat trigram */
function FlagKo() {
  const bar = (x: number, y: number, angle: number, broken: boolean[]) => (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {broken.map((gap, i) => (
        gap
          ? <g key={i}><rect x={-4.5} y={-3 + i * 2.2} width={3.8} height={1.4} /><rect x={0.7} y={-3 + i * 2.2} width={3.8} height={1.4} /></g>
          : <rect key={i} x={-4.5} y={-3 + i * 2.2} width={9} height={1.4} />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <rect width="40" height="40" fill="#FFFFFF" />
      <circle cx="20" cy="20" r="8" fill="#0047A0" />
      <path d="M12 20a8 8 0 0 1 16 0a4 4 0 0 1-8 0a4 4 0 0 0-8 0z" fill="#CD2E3A" />
      <g fill="#111111">
        {bar(8.5, 8.5, -56, [false, false, false])}
        {bar(31.5, 31.5, -56, [true, true, true])}
        {bar(31.5, 8.5, 56, [true, false, true])}
        {bar(8.5, 31.5, 56, [false, true, false])}
      </g>
    </svg>
  );
}

const OPTIONS: { id: Lang; code: string; label: string; Flag: () => React.ReactElement }[] = [
  { id: 'en', code: 'EN', label: 'English', Flag: FlagEn },
  { id: 'id', code: 'ID', label: 'Indonesia', Flag: FlagId },
  { id: 'ko', code: 'KO', label: '한국어', Flag: FlagKo },
];
const MENU_LABEL: Record<Lang, string> = { en: 'Language', id: 'Bahasa', ko: '언어' };
const EASE = [0.22, 1, 0.36, 1] as const;

/** Satu tombol bahasa: membuka daftar tiga bahasa; bendera berputar seperti koin saat berganti */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const lang = useLang();
  const calm = useReducedMotion();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = OPTIONS.find(o => o.id === lang) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (id: Lang) => {
    setOpen(false);
    void setLanguage(id);
  };

  return (
    <div ref={root} data-i18n-skip className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${MENU_LABEL[lang]}: ${current.label}`}
        onClick={() => setOpen(v => !v)}
        style={{ viewTransitionName: 'lang-switch' }}
        className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground/10 bg-surface-white/80 pl-1.5 pr-2 text-xs font-semibold text-foreground shadow-[0_1px_3px_rgba(43,31,29,0.08)] transition-[background-color,box-shadow,scale] duration-200 hover:bg-surface-white hover:shadow-[0_3px_10px_rgba(43,31,29,0.12)] active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
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
              <current.Flag />
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative block h-4 w-[1.2rem] overflow-hidden" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.span
              key={current.code}
              className="absolute inset-0 flex items-center justify-center leading-none"
              initial={calm ? { opacity: 0 } : { y: '110%', opacity: 0 }}
              animate={calm ? { opacity: 1 } : { y: '0%', opacity: 1 }}
              exit={calm ? { opacity: 0 } : { y: '-110%', opacity: 0 }}
              transition={{ duration: calm ? 0.01 : 0.42, ease: EASE }}
            >
              {current.code}
            </motion.span>
          </AnimatePresence>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-foreground/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={menuId}
            role="menu"
            aria-label={MENU_LABEL[lang]}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 top-full z-[120] mt-2 w-48 origin-top-right rounded-card border border-foreground/10 bg-surface-white/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.1)] backdrop-blur-md"
          >
            {OPTIONS.map(({ id, label, code, Flag }) => {
              const active = id === lang;
              return (
                <li key={id} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    lang={id}
                    onClick={() => choose(id)}
                    className={`flex w-full items-center gap-2.5 rounded-full px-2.5 py-2 text-left text-sm transition-colors duration-150 ${active ? 'bg-foreground/[0.06] font-medium text-foreground' : 'text-foreground/75 hover:bg-foreground/[0.04] hover:text-foreground'}`}
                  >
                    <span className="block h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10" aria-hidden="true"><Flag /></span>
                    <span className="flex-1">{label}</span>
                    <span className="font-mono text-[10px] text-foreground/45">{code}</span>
                    {active && <Check className="h-3.5 w-3.5 text-action" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
