import { flushSync } from 'react-dom';
import { PATTERNS, translateDate } from './patterns';

/*
 * Bahasa situs. Teks sumber tetap bahasa Inggris di komponen; kamus `id.json` dan `ko.json`
 * memetakannya ke bahasa Indonesia dan Korea, dan masing-masing hanya diunduh saat dipilih.
 * Lapisan DOM (domTranslator) hanya mengganti isi teks, jadi struktur React dan animasi tidak tersentuh.
 */

export type Lang = 'en' | 'id' | 'ko';
export type ForeignLang = Exclude<Lang, 'en'>;
export const LANGS: Lang[] = ['en', 'id', 'ko'];
export const LANG_KEY = 'cardivex-lang';

const LOADERS: Record<ForeignLang, () => Promise<{ default: Record<string, string> }>> = {
  id: () => import('./id.json'),
  ko: () => import('./ko.json'),
};

let lang: Lang = 'en';
const dicts: Partial<Record<ForeignLang, Record<string, string>>> = {};
const loading: Partial<Record<ForeignLang, Promise<void>>> = {};
const listeners = new Set<() => void>();
const applyHooks = new Set<(next: Lang) => void>();

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);
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

function loadDictionary(target: Lang) {
  if (target === 'en') return Promise.resolve();
  loading[target] ??= LOADERS[target]()
    .then(m => { dicts[target] = m.default; })
    .catch(err => { delete loading[target]; throw err; });
  return loading[target];
}

/** Terjemahan satu teks; kembali ke teks asli kalau belum ada di kamus */
export function translate(text: string): string {
  if (lang === 'en') return text;
  const dict = dicts[lang];
  if (!dict) return text;
  const hit = dict[text];
  if (hit !== undefined) return hit;
  for (const [re, build] of PATTERNS[lang]) {
    const m = text.match(re);
    if (m) return build(m, translate);
  }
  return translateDate(text, lang) ?? text;
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
    if (isLang(saved) && saved !== 'en') {
      await loadDictionary(saved);
      commit(saved);
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
    await loadDictionary(next);
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
