'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { cachedGet } from '@/lib/historyCache';
import { getTierColor } from '@/lib/tierColor';
import type { SessionUser } from '@/components/SessionGuard';
import { Bone } from '../../components/Skeletons';
import { Figure, textLink } from '../../components/report/ui';

const EASE = [0.16, 1, 0.3, 1] as const;

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
};

type Summary = { total_predictions: number; total_explanations: number; tier_counts: Record<string, number> };

/** Tier yang paling sering muncul di riwayat user */
function topTier(s: Summary): string | null {
  const entries = Object.entries(s.tier_counts ?? {}).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0]?.toLowerCase() ?? null;
}

/** Kartu identitas gelap (nama, email, peran, ID akun) + ringkasan aktivitas user dari riwayatnya. */
export default function IdentityCard({ user }: { user: SessionUser }) {
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<Summary | null | undefined>(undefined);
  const isAdmin = user.role === 'admin';
  const name = user.display_name || 'No name';

  useEffect(() => {
    let alive = true;
    cachedGet<Summary>('/api/history/summary')
      .then(s => { if (alive) setSummary(s); })
      .catch(() => { if (alive) setSummary(null); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
    } catch { /* clipboard diblokir: ID tetap bisa diseleksi manual */ }
  };

  const tier = summary ? topTier(summary) : null;

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-sheet bg-[#0A0A0A] p-6 sm:p-8 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
      >
        {/* Garis detak tipis sebagai latar kartu, tergambar sekali */}
        <svg aria-hidden="true" viewBox="0 0 400 80" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-[42%] h-20 w-full text-white/[0.09]">
          <motion.path
            d="M0 40 H150 L162 40 L171 22 L183 64 L196 6 L209 74 L221 40 H262 L271 35 L280 40 H400"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: [0.65, 0, 0.35, 1], delay: 0.4 }}
          />
        </svg>

        <div className="relative flex items-center justify-between gap-4">
          <span className="text-base font-medium tracking-tight">cardivex<span className="text-white/35">.</span></span>
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75">{isAdmin ? 'Administrator' : 'User'}</span>
        </div>

        <div className="relative mt-14 flex items-center gap-4 sm:gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-xl font-medium tracking-tight text-black">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl sm:text-2xl font-medium tracking-tight">{name}</p>
            <p className="truncate text-sm text-white/55">{user.email || 'No email'}</p>
          </div>
        </div>

        <div className="relative mt-10 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
          <div className="min-w-0">
            <p className="text-[11px] text-white/40">Account ID</p>
            <p className="mt-1 truncate font-mono text-xs text-white/75">{user.id || '—'}</p>
          </div>
          {user.id && (
            <button
              type="button"
              onClick={copyId}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-xs text-white/75 transition-colors duration-200 hover:border-white/40 hover:text-white"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
        aria-labelledby="activity-heading"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="activity-heading" className="text-sm font-medium text-foreground">Your activity</h2>
          <Link href="/lab/logs" className={textLink}>Open history</Link>
        </div>
        <div className="mt-4 border-t border-foreground/10 pt-5 min-h-16">
          {summary === undefined ? (
            <div className="grid grid-cols-3 gap-4" aria-hidden="true">
              {[0, 1, 2].map(i => <div key={i} className="flex flex-col gap-2"><Bone className="h-3 w-14" /><Bone className="h-7 w-10" /></div>)}
            </div>
          ) : summary === null ? (
            <p className="text-sm text-foreground/60">Could not load your activity right now.</p>
          ) : (
            <dl className="grid grid-cols-3">
              <Figure label="Predictions">{summary.total_predictions}</Figure>
              <Figure label="SHAP analyses">{summary.total_explanations}</Figure>
              <Figure label="Most common" word>
                {tier ? <span className={`capitalize text-base md:text-lg ${getTierColor(tier).text}`}>{tier}</span> : '—'}
              </Figure>
            </dl>
          )}
        </div>
      </motion.section>
    </div>
  );
}
