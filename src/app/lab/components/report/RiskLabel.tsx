'use client';

import React from 'react';
import { useLang } from '@/i18n/LanguageProvider';
import { getTierColor } from '@/lib/tierColor';

const KO: Record<string, string> = { high: '고위험', intermediate: '중위험', low: '저위험' };

/** "High risk" / "Risiko tinggi" / "고위험": urutan kata berbeda, jadi tidak diterjemahkan per potongan */
export default function RiskLabel({ tier }: { tier: string }) {
  const lang = useLang();
  const color = getTierColor(tier).text;
  if (lang === 'ko') return <span data-i18n-skip className={color}>{KO[tier.toLowerCase()] ?? tier}</span>;
  const word = <span className={`${lang === 'id' ? 'lowercase' : 'capitalize'} ${color}`}>{tier}</span>;
  return lang === 'id' ? <>Risiko {word}</> : <>{word} risk</>;
}
