// src/lib/tierColor.ts

export type RiskTier = 'low' | 'intermediate' | 'high';

export interface TierColorClasses {
  text: string;
  textStrong: string;
  bg: string;
  bgSoft: string;
  border: string;
  dot: string;
  ring: string;
}

const TIER_COLORS: Record<RiskTier, TierColorClasses> = {
  low: {
    text: 'text-teal',
    textStrong: 'text-teal font-bold',
    bg: 'bg-teal',
    bgSoft: 'bg-teal/15',
    border: 'border-teal/40',
    dot: 'bg-teal',
    ring: 'ring-teal/40',
  },
  intermediate: {
    text: 'text-amber',
    textStrong: 'text-amber font-bold',
    bg: 'bg-amber',
    bgSoft: 'bg-amber/15',
    border: 'border-amber/40',
    dot: 'bg-amber',
    ring: 'ring-amber/40',
  },
  high: {
    text: 'text-accent',
    textStrong: 'text-accent font-bold',
    bg: 'bg-accent',
    bgSoft: 'bg-accent/15',
    border: 'border-accent/40',
    dot: 'bg-accent',
    ring: 'ring-accent/40',
  },
};

export function normalizeTier(tier: string): RiskTier {
  const t = tier.toLowerCase();
  if (t.startsWith('high')) return 'high';
  if (t.startsWith('inter') || t === 'medium' || t === 'moderate') return 'intermediate';
  return 'low';
}

export function getTierColor(tier: string): TierColorClasses {
  return TIER_COLORS[normalizeTier(tier)];
}
