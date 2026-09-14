'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { api } from '@/lib/api';
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react';

// ============================================================================
// KOMPONEN FORM RESET
// ============================================================================
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Menangkap token rahasia dari URL[cite: 1, 2]
  const token = searchParams.get('token');
  const hasToken = !!token;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [focusedField, setFocusedField] = useState<'newPassword' | 'confirmPassword' | null>(null);

  const shakeControls = useAnimation();
  const triggerShake = () => {
    shakeControls.start({
      x: [0, -10, 10, -8, 8, -5, 5, -2, 2, 0],
      transition: { duration: 0.5, ease: 'easeInOut' }
    });
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      return;
    }

    setErrorMsg(null);

    const nextFieldErrors: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword) nextFieldErrors.newPassword = "Enter your new password.";
    else if (newPassword.length < 8) nextFieldErrors.newPassword = "Password must be at least 8 characters.";

    if (!confirmPassword) nextFieldErrors.confirmPassword = "Confirm your new password.";
    else if (newPassword && confirmPassword !== newPassword) nextFieldErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      triggerShake();
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setSuccessMsg(null);

    try {
      // Mengirimkan password baru beserta token ke backend[cite: 1, 2]
      await api("/auth/password/reset", {
        method: "POST",
        body: { token, new_password: newPassword }
      });

      setSuccessMsg("Password successfully reset! Redirecting to login...");

      // Alihkan ke login setelah sukses
      setTimeout(() => {
        router.push('/login');
      }, 2500);

    } catch (error) {
      setIsLoading(false);
      const e = error as { status?: number };

      // Error 400 berarti token invalid/expired sesuai panduan[cite: 1, 2]
      if (e.status === 400) {
        setErrorMsg("This link is invalid or expired. Please request a new one.");
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
      triggerShake();
    }
  };

  return (
    <div className="w-full lg:w-1/2 h-full bg-[#0A0A0A] relative flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          className="absolute top-8 right-8 z-50"
        >
          <Link href="/login" aria-label="Back to sign in" className="text-white/50 hover:text-accent transition-colors duration-300 p-2 block outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm flex flex-col py-10"
      >
        <AnimatePresence mode="wait">

          {!hasToken && (
            <motion.div key="invalid-token" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="flex flex-col items-center text-center py-10">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 relative">
                <KeyRound className="w-8 h-8 text-red-500 relative z-10" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-2 tracking-tight">
                Invalid Reset Link
              </h2>
              <p className="text-sm text-white/50 mb-8 leading-relaxed px-2">
                This password reset link is invalid or missing its token. Please request a new one to continue.
              </p>
              <Link
                href="/forgot-password"
                className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                Request New Link
              </Link>
            </motion.div>
          )}

          {hasToken && successMsg && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="flex flex-col items-center text-center py-10">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 relative">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/20 rounded-full" />
                <CheckCircle2 className="w-8 h-8 text-emerald-500 relative z-10" />
              </div>
              <h2 className="text-2xl font-medium text-white mb-2 tracking-tight">
                Password Updated
              </h2>
              <p className="text-sm text-white/50 mb-8 leading-relaxed px-4">
                Your cryptographic key has been successfully reset.
              </p>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-full">
                <Loader2 className="w-4 h-4 text-[#E63946] animate-spin" />
                <span className="text-xs font-mono text-white/70">
                  Redirecting to login...
                </span>
              </div>
            </motion.div>
          )}

          {hasToken && !successMsg && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-medium tracking-tight text-white mb-3">Set New Password</h1>
                <p className="text-xs text-white/50 leading-relaxed">
                  Please enter and confirm your new cryptographic key.
                </p>
              </div>

              <motion.div animate={shakeControls}>
                <form onSubmit={handlePasswordReset} noValidate className="flex flex-col gap-6 w-full">

                  {/* Kolom Sandi Baru */}
                  <div className="relative group flex flex-col">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                          if (errorMsg) setErrorMsg(null);
                        }}
                        onFocus={() => setFocusedField('newPassword')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading}
                        className="w-full bg-transparent border-b border-white/20 py-2 pr-10 text-sm text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 text-[10px] font-mono text-white/30 hover:text-white transition-colors p-2"
                      >
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                    <span className="relative block h-px w-full bg-transparent overflow-hidden">
                      <motion.span
                        className="absolute inset-y-0 left-1/2 -translate-x-1/2 h-px bg-white"
                        initial={false}
                        animate={{ width: focusedField === 'newPassword' ? '100%' : '0%' }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </span>
                    <AnimatePresence mode="wait">
                      {fieldErrors.newPassword ? (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs text-red-500 mt-2"
                        >
                          {fieldErrors.newPassword}
                        </motion.p>
                      ) : (
                        <p className="text-[9px] font-mono text-white/30 mt-2">Minimum 8 characters.</p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Kolom Konfirmasi Sandi */}
                  <div className="relative group flex flex-col">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        if (errorMsg) setErrorMsg(null);
                      }}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading}
                      className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                    />
                    <span className="relative block h-px w-full bg-transparent overflow-hidden">
                      <motion.span
                        className="absolute inset-y-0 left-1/2 -translate-x-1/2 h-px bg-white"
                        initial={false}
                        animate={{ width: focusedField === 'confirmPassword' ? '100%' : '0%' }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </span>
                    <AnimatePresence mode="wait">
                      {(fieldErrors.confirmPassword || errorMsg) && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs text-red-500 mt-2"
                        >
                          {fieldErrors.confirmPassword || errorMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          Updating
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ============================================================================
// WRAPPER HALAMAN UTAMA
// ============================================================================
export default function ResetPasswordPage() {
  return (
    <main className="fixed inset-0 z-50 w-full h-screen flex bg-background font-sans overflow-hidden">

      {/* PANEL KIRI (Branding & Ambient Animation) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 h-full bg-[#E8E6E1] p-12 relative overflow-hidden">

        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-foreground/5 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 -right-20 w-80 h-80 bg-foreground/5 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <Link href="/" className="relative z-10 text-2xl font-bold tracking-tight text-foreground hover:opacity-70 transition-opacity">
            cardivex<span className="text-accent">.</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl xl:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            Security <br /> Update.
          </h2>
          <p className="text-foreground/70 max-w-sm leading-relaxed text-sm">
            Establish a new cryptographic key for your account to restore access to the predictive environment.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-foreground/50">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />Key Generation</span>
          <span>End-to-End Encrypted</span>
        </motion.div>
      </div>

      {/* PANEL KANAN (Form Reset Password) - Wajib Suspense */}
      <Suspense fallback={
        <div className="w-full lg:w-1/2 h-full bg-primary flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-accent rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>

    </main>
  );
}
