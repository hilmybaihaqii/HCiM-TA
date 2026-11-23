'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLang } from './LanguageProvider';
import { translate } from './store';

const SITE = 'Cardiotoxicity Prediction';

/** Urutan penting: yang lebih spesifik lebih dulu */
const PAGES: [RegExp, string][] = [
  [/^\/$/, 'Home'],
  [/^\/standards/, 'Standards'],
  [/^\/articles/, 'Articles'],
  [/^\/aboutus/, 'About Us'],
  [/^\/login/, 'Sign in'],
  [/^\/register/, 'Create account'],
  [/^\/forgot-password/, 'Reset your password'],
  [/^\/reset-password/, 'Set a new password'],
  [/^\/lab\/admin/, 'Admin Panel'],
  [/^\/lab\/pipeline/, 'Full Pipeline'],
  [/^\/lab\/logs/, 'Activity Logs'],
  [/^\/lab\/guide/, 'Guide'],
  [/^\/lab\/profile/, 'Profile'],
  [/^\/lab\/?$/, 'Digital Lab'],
];

/** Judul tab: "<menu> | Cardiotoxicity Prediction". Hanya nama menu yang mengikuti bahasa. */
export default function DocumentTitle() {
  const pathname = usePathname();
  const lang = useLang();

  useEffect(() => {
    const page = PAGES.find(([re]) => re.test(pathname))?.[1];
    const wanted = page ? `${translate(page)} | ${SITE}` : SITE;
    const apply = () => { if (document.title !== wanted) document.title = wanted; };
    apply();
    // Next.js bisa menulis ulang <title> sesudah navigasi
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname, lang]);

  return null;
}
