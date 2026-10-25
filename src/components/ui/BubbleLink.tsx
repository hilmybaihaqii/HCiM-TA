'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';

/**
 * Rounded black-and-white link. On hover a bubble swells from the point
 * where the cursor entered, with a lighter ripple running just ahead of it.
 * On leave it shrinks back toward the exit point.
 * `arrow`: arah panah ("right" untuk pindah halaman, "down" untuk lanjut ke section bawah).
 */
export default function BubbleLink({
  href,
  children,
  primary = false,
  arrow = 'right',
  className = '',
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  arrow?: 'right' | 'down';
  className?: string;
}) {
  const setOrigin = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  const bubble =
    'pointer-events-none absolute left-[var(--x,50%)] top-[var(--y,50%)] -z-10 aspect-square w-[260%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100';

  return (
    <Link
      href={href}
      onMouseEnter={setOrigin}
      onMouseLeave={setOrigin}
      className={`group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full border px-6 py-3.5 md:px-8 md:py-4 text-sm font-medium tracking-tight transition-[color,transform] duration-500 active:scale-[0.97] ${
        primary
          ? 'border-foreground bg-foreground text-surface-white hover:text-foreground'
          : 'border-foreground/15 bg-surface-white/40 backdrop-blur-sm text-foreground hover:text-surface-white'
      } ${className}`}
    >
      {/* ripple */}
      <span aria-hidden className={`${bubble} duration-500 ${primary ? 'bg-surface-white/40' : 'bg-foreground/25'}`} />
      {/* bubble */}
      <span aria-hidden className={`${bubble} duration-700 delay-75 ${primary ? 'bg-surface-white' : 'bg-foreground'}`} />

      {children}
      <svg
        className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          arrow === 'down' ? 'group-hover:translate-y-1' : 'group-hover:translate-x-1'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={arrow === 'down' ? 'M12 5v14m-5-5 5 5 5-5' : 'M5 12h14m-5-5 5 5-5 5'} />
      </svg>
    </Link>
  );
}
