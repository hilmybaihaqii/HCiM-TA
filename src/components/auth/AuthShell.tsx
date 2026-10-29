'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';

/*
 * Kerangka halaman akun (login, register, lupa & reset password).
 * Layar lebar: panel putih berisi judul halaman di kiri, formulir di panel hitam di kanan.
 * Ponsel: panel hitam saja. Tinggi memakai dvh + jarak aman (notch, toolbar Safari yang muncul/hilang).
 * Hanya hitam & putih; merah lembut khusus pesan galat.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export function AuthShell({ children, footer, aside, close = '/' }: {
  children: React.ReactNode;
  /** Baris bawah formulir, mis. "Belum punya akun? Buat akun" */
  footer?: React.ReactNode;
  /** Judul & kalimat di panel putih (layar lebar), sesuai halaman */
  aside: { title: React.ReactNode; text: string };
  /** Tujuan tombol tutup (X) */
  close?: string;
}) {
  return (
    <main className="relative z-50 flex min-h-dvh w-full bg-[#0A0A0A] font-sans">
      {/* Panel putih (layar lebar) */}
      <aside className="sticky top-0 hidden h-dvh w-1/2 flex-col justify-between overflow-hidden bg-white p-12 xl:p-16 text-[#0A0A0A] lg:flex">
        <motion.div {...rise(0)}>
          <Link href="/" className="text-2xl font-medium tracking-tight transition-opacity hover:opacity-60">
            cardivex<span className="text-black/30">.</span>
          </Link>
        </motion.div>

        <div className="max-w-md">
          <motion.h2 {...rise(0.1)} className="text-4xl xl:text-5xl font-medium leading-[1.08] tracking-tight">
            {aside.title}
          </motion.h2>
          <motion.p {...rise(0.2)} className="mt-6 max-w-sm text-[15px] leading-relaxed text-black/55">
            {aside.text}
          </motion.p>
        </div>

        <motion.ul {...rise(0.35)} className="grid grid-cols-3 gap-6 border-t border-black/10 pt-6 text-xs text-black/50">
          <li><span className="block text-sm font-medium text-black">ORd model</span>Heart-cell simulation</li>
          <li><span className="block text-sm font-medium text-black">Random forest</span>400-tree risk vote</li>
          <li><span className="block text-sm font-medium text-black">SHAP</span>Why the model decided</li>
        </motion.ul>
      </aside>

      {/* Panel hitam: formulir */}
      <section className="relative flex min-h-dvh flex-1 flex-col px-6 sm:px-12 text-white pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-medium tracking-tight lg:invisible">cardivex<span className="text-white/35">.</span></Link>
          <Link
            href={close}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10"
        >
          {children}
        </motion.div>

        {footer && <div className="mx-auto w-full max-w-sm text-center text-sm text-white/50">{footer}</div>}
      </section>
    </main>
  );
}

export function AuthHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-10 text-center">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      {children && <p className="mt-3 text-sm leading-relaxed text-white/50">{children}</p>}
    </div>
  );
}

/** Kolom isian bergaris bawah; garis putih tumbuh dari tengah saat fokus */
export function AuthField({ label, error, hint, type = 'text', ...input }: {
  label: string;
  error?: string;
  hint?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="group">
      <label htmlFor={id} className="block text-[11px] font-mono uppercase tracking-[0.16em] text-white/40 transition-colors duration-300 group-focus-within:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full border-b bg-transparent py-3 text-[15px] text-white placeholder:text-white/20 outline-none transition-colors duration-300 disabled:opacity-50
            ${isPassword ? 'pr-11' : ''} ${error ? 'border-rose-400/60' : 'border-white/15 hover:border-white/30'}`}
          {...input}
        />
        {/* Garis fokus */}
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-white transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:w-full" />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/10 hover:text-white"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-2 text-[13px] text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {hint && <div className="mt-3 flex justify-end">{hint}</div>}
    </div>
  );
}

/** Pesan untuk seluruh formulir (mis. email/password salah) */
export function AuthAlert({ children }: { children?: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="overflow-hidden"
        >
          <span className="block rounded-2xl border border-rose-400/25 bg-rose-500/10 px-5 py-3.5 text-sm leading-relaxed text-rose-200">
            {children}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const btnBase = 'inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export function AuthButton({ loading, children, ...button }: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...button} disabled={button.disabled || loading} className={`${btnBase} bg-white text-black hover:bg-white/85 disabled:opacity-60`}>
      {loading && <Spinner className="border-black/20 border-t-black" />}
      {children}
    </button>
  );
}

export function AuthSecondaryButton({ children, ...button }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...button} className={`${btnBase} border border-white/20 text-white hover:border-white/45 hover:bg-white/[0.04] disabled:opacity-50`}>
      {children}
    </button>
  );
}

export const authLinkButton = `${btnBase} bg-white text-black hover:bg-white/85`;

export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 text-xs text-white/30">
      <span className="h-px flex-1 bg-white/10" />
      {label}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function Spinner({ className = 'border-white/20 border-t-white' }: { className?: string }) {
  return <span aria-hidden="true" className={`h-4 w-4 shrink-0 animate-spin rounded-full border-2 ${className}`} />;
}

export function GoogleMark() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/** Lingkaran centang yang tergambar sekali (dipakai di semua pesan berhasil). Warna = currentColor. */
export function DrawnCheck({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <motion.circle
        cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0.2 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      <motion.path
        d="M21 33 L29 41 L44 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
      />
    </svg>
  );
}

/** Pengganti formulir setelah berhasil (mis. akun dibuat, email reset terkirim) */
export function AuthDone({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col items-center text-center">
      <DrawnCheck size={60} />
      <h1 className="mt-8 text-3xl font-medium tracking-tight">{title}</h1>
      <div className="mt-3 text-sm leading-relaxed text-white/55">{children}</div>
      {action && <div className="mt-10 w-full">{action}</div>}
    </motion.div>
  );
}

export const authLink = 'font-medium text-white underline-offset-4 hover:underline';
