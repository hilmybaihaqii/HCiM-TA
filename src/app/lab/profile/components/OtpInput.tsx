'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Kode 6 digit dalam kotak terpisah: maju otomatis saat mengetik, Backspace mundur, dan bisa
 * menempel kode sekaligus. Mengisi otomatis kode dari SMS/email di iOS (autoComplete one-time-code).
 */
export default function OtpInput({ value, onChange, length = 6, invalid = false, autoFocus = false }: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (i: number, ch: string) => {
    const next = digits.slice();
    next[i] = ch;
    onChange(next.join(''));
  };

  const fill = (raw: string, from = 0) => {
    const clean = raw.replace(/\D/g, '').slice(0, length - from);
    if (!clean) return;
    const next = digits.slice();
    clean.split('').forEach((c, k) => { next[from + k] = c; });
    onChange(next.join(''));
    inputs.current[Math.min(from + clean.length, length - 1)]?.focus();
  };

  return (
    <div className="grid w-full max-w-sm grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={length}
          value={d}
          onChange={e => {
            const raw = e.target.value;
            if (raw.length > 1) { fill(raw, i); return; } // isi otomatis / tempel
            const ch = raw.replace(/\D/g, '');
            setAt(i, ch);
            if (ch && i < length - 1) inputs.current[i + 1]?.focus();
          }}
          onKeyDown={e => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) {
              inputs.current[i - 1]?.focus();
              setAt(i - 1, '');
            }
            if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
            if (e.key === 'ArrowRight' && i < length - 1) inputs.current[i + 1]?.focus();
          }}
          onPaste={e => { e.preventDefault(); fill(e.clipboardData.getData('text'), i); }}
          onFocus={e => e.target.select()}
          className={`h-14 w-full min-w-0 rounded-control border text-center font-mono text-xl font-medium text-foreground outline-none
            transition-[border-color,background-color,box-shadow] duration-200 focus:ring-4
            ${invalid ? 'border-accent/60 focus:ring-accent/10' : 'focus:border-foreground focus:ring-foreground/[0.06]'}
            ${d ? 'bg-surface-white border-foreground/30' : 'bg-foreground/[0.03] border-foreground/12'}`}
        />
      ))}
    </div>
  );
}

/** Hitung mundur sebelum kode boleh dikirim ulang (mencegah spam ke backend & email) */
export function useCooldown(seconds = 30) {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (until <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  const left = Math.max(0, Math.ceil((until - now) / 1000));
  return {
    left,
    start: () => { const t = Date.now(); setNow(t); setUntil(t + seconds * 1000); },
  };
}
