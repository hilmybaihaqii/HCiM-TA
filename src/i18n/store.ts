import { flushSync } from 'react-dom';
import { PATTERNS, translateDate } from './patterns';

/*
 * Bahasa situs. Teks sumber tetap bahasa Inggris di komponen; kamus `id.json` memetakannya ke
 * bahasa Indonesia dan hanya diunduh oleh pengguna yang memilih bahasa Indonesia.
 * Lapisan DOM (domTranslator) hanya mengganti isi teks, jadi struktur React dan animasi tidak tersentuh.
 */

export type Lang = 'en' | 'id';
export const LANG_KEY = 'cardivex-lang';

let lang: Lang = 'en';
let dict: Record<string, string> | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const applyHooks = new Set<(next: Lang) => void>();

export const getLang = () => lang;
export const getServerLang = (): Lang => 'en';
export const subscribeLang = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};
export const onApplyLang = (fn: (next: Lang) => void) => {
  applyHooks.add(fn);
  return () => { applyHooks.delete(fn); };
};

function loadDictionary() {
  loading ??= import('./id.json')
    .then(m => { dict = m.default as Record<string, string>; })
    .catch(err => { loading = null; throw err; });
  return loading;
}

const exact = (s: string) => dict?.[s];

/** Terjemahan satu teks; kembali ke teks asli kalau belum ada di kamus */
export function translate(text: string): string {
  if (lang !== 'id' || !dict) return text;
  const hit = exact(text);
  if (hit !== undefined) return hit;
  for (const [re, build] of PATTERNS) {
    const m = text.match(re);
    if (m) return build(m, translate);
  }
  return translateDate(text) ?? text;
}

function commit(next: Lang) {
  lang = next;
  document.documentElement.lang = next;
  flushSync(() => listeners.forEach(fn => fn()));
  applyHooks.forEach(fn => fn(next));
}

/** Dipanggil sekali setelah hidrasi: terapkan pilihan yang tersimpan */
export async function restoreLanguage() {
  let saved: string | null = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch { /* storage diblokir: pakai bahasa Inggris */ }
  try {
    if (saved === 'id') {
      await loadDictionary();
      commit('id');
    }
  } finally {
    document.documentElement.removeAttribute('data-i18n-pending');
  }
}

type ViewTransitionLike = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };
let switching = false;

export async function setLanguage(next: Lang) {
  // Klik beruntun diabaikan sampai pergantian yang sedang berjalan selesai
  if (next === lang || switching) return;
  switching = true;
  try {
    if (next === 'id') await loadDictionary();
    try { localStorage.setItem(LANG_KEY, next); } catch { /* storage diblokir: berlaku untuk halaman ini saja */ }

    const doc = document as Document & { startViewTransition?: (cb: () => void) => ViewTransitionLike };
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (doc.startViewTransition && !calm) {
      const transition = doc.startViewTransition(() => commit(next));
      // Animasi yang dilewati browser bukan kegagalan: bahasanya tetap sudah berganti
      transition.ready.catch(() => {});
      transition.finished.catch(() => {});
      await transition.updateCallbackDone;
    } else {
      commit(next);
    }
  } finally {
    switching = false;
  }
}
