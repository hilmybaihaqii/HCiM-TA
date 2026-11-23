'use client';

import React from 'react';
import { useLang } from '@/i18n/LanguageProvider';
import { getTierColor } from '@/lib/tierColor';

/** "High risk" / "Risiko tinggi": urutan kata berbeda, jadi tidak bisa diterjemahkan per potongan */
export default function RiskLabel({ tier }: { tier: string }) {
  const lang = useLang();
  const word = <span className={`${lang === 'id' ? 'lowercase' : 'capitalize'} ${getTierColor(tier).text}`}>{tier}</span>;
  return lang === 'id' ? <>Risiko {word}</> : <>{word} risk</>;
}
