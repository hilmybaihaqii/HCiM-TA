'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

export type LabNavItem = { name: string; short: string; path: string; icon: LucideIcon };

const DRAG_START_PX = 6;

const isField = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Menu utama di ponsel. Rel abu-abu dengan pil putih yang sama seperti navbar desktop:
 * ketuk satu tab, atau geser pilnya dengan jari lalu lepas di tab tujuan.
 * Disembunyikan saat mengetik, supaya tidak menutupi kolom input di atas keyboard.
 */
export default function LabBottomNav({ items, pathname, id }: { items: LabNavItem[]; pathname: string | null; id?: string }) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const gesture = useRef<{ pointer: number; startX: number; dragging: boolean; index: number } | null>(null);
  const skipClick = useRef(false);
  const [typing, setTyping] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // Pil langsung pindah saat ditekan; nilai ini gugur sendiri begitu URL berubah
  const [pending, setPending] = useState<{ from: string | null; index: number } | null>(null);

  const currentIndex = items.findIndex(item => item.path === pathname);
  const settledIndex = pending && pending.from === pathname ? pending.index : currentIndex;
  const shownIndex = dragIndex ?? settledIndex;

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onFocusOut = () => setTyping(false);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  const release = () => {
    pillRef.current?.style.removeProperty('transform');
    pillRef.current?.style.removeProperty('transition');
    gesture.current = null;
    setDragIndex(null);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    skipClick.current = false;
    gesture.current = { pointer: e.pointerId, startX: e.clientX, dragging: false, index: settledIndex };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    const track = trackRef.current;
    const pill = pillRef.current;
    if (!g || g.pointer !== e.pointerId || !track || !pill) return;
    if (!g.dragging) {
      if (Math.abs(e.clientX - g.startX) < DRAG_START_PX) return;
      g.dragging = true;
      track.setPointerCapture(e.pointerId);
      pill.style.transition = 'scale 200ms ease';
    }
    const rect = track.getBoundingClientRect();
    const w = rect.width / items.length;
    const x = Math.min(rect.width - w, Math.max(0, e.clientX - rect.left - w / 2));
    pill.style.transform = `translateX(${x.toFixed(1)}px) scale(1.05)`;
    g.index = Math.round(x / w);
    setDragIndex(g.index);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointer !== e.pointerId) return;
    if (!g.dragging) {
      gesture.current = null;
      return;
    }
    skipClick.current = true;
    const target = items[g.index];
    setPending({ from: pathname, index: g.index });
    release();
    if (target && target.path !== pathname) router.push(target.path);
  };

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-50 pointer-events-none px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${typing ? 'translate-y-[calc(100%+1rem)]' : 'translate-y-0'}`}
    >
      <nav
        id={id}
        aria-label="Lab sections"
        className="pointer-events-auto mx-auto max-w-md rounded-full border border-foreground/8 bg-surface-white p-1.5 shadow-[0_12px_32px_rgba(43,31,29,0.2)]"
      >
        {/* Mangkuk: rel abu-abu cekung di dalam bingkai putih */}
        <div className="rounded-full bg-[color-mix(in_srgb,var(--foreground)_10%,var(--background))] p-1 shadow-[inset_0_2px_5px_rgba(43,31,29,0.2),inset_0_-1px_1px_rgba(255,255,255,0.75)]">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={release}
          onClickCapture={e => {
            if (!skipClick.current) return;
            skipClick.current = false;
            e.preventDefault();
            e.stopPropagation();
          }}
          className="relative grid touch-none select-none"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {settledIndex >= 0 || dragIndex !== null ? (
            <span
              ref={pillRef}
              aria-hidden="true"
              className="absolute inset-y-0 left-0 rounded-full border border-foreground/10 bg-surface-white shadow-[0_2px_8px_rgba(43,31,29,0.16)] transition-transform duration-[420ms] ease-[cubic-bezier(0.3,1.35,0.55,1)] motion-reduce:transition-none [transform:translateX(calc(var(--tab)*100%))]"
              style={{ width: `${100 / items.length}%`, '--tab': Math.max(0, settledIndex) } as React.CSSProperties}
            />
          ) : null}
          {items.map((item, i) => {
            const active = i === shownIndex;
            const current = item.path === pathname;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                draggable={false}
                aria-current={current ? 'page' : undefined}
                onClick={() => setPending({ from: pathname, index: i })}
                className={`relative z-10 flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                  active ? 'font-semibold text-foreground' : 'font-medium text-foreground/55'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.3,1.35,0.55,1)] motion-reduce:transition-none ${active ? '-translate-y-px scale-110' : ''}`}
                  aria-hidden="true"
                />
                <span>{item.short}</span>
              </Link>
            );
          })}
        </div>
        </div>
      </nav>
    </div>
  );
}
