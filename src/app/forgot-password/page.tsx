'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Mengirimkan permintaan reset password ke backend[cite: 1, 2]
      await api("/auth/password/forgot", {
        method: "POST",
        body: { email }
      });

      // Backend selalu merespons 200 untuk mencegah kebocoran data pengguna[cite: 1, 2]
      setSuccessMsg("If that email exists in our system, we have sent a password reset link. Please check your inbox.");
    } catch (error) {
      // Menangkap error jaringan atau server down
      setErrorMsg("An unexpected error occurred while communicating with the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    setSuccessMsg(null);
    setEmail('');
  };

  return (
    <main className="fixed inset-0 z-50 w-full h-screen flex bg-background font-sans overflow-hidden">

      {/* PANEL KIRI (Branding & Ambient Animation) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 h-full bg-background p-12 relative overflow-hidden">

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-amber/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 15, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 right-1/4 w-64 h-64 bg-teal/15 rounded-full blur-3xl"
          />
        </div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <Link href="/" className="relative z-10 text-2xl font-bold tracking-tight text-foreground hover:opacity-70 transition-opacity">
            cardivex<span className="text-accent">.</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl xl:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            Recovery <br /> Protocol.
          </h2>
          <p className="text-foreground/70 max-w-sm leading-relaxed text-sm">
            Regain access to your secure research node. Enter your associated email address to initiate the password reset sequence.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-foreground/50">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />Identity Verification</span>
          <span>Secure Reset</span>
        </motion.div>
      </div>

      {/* PANEL KANAN (Form Forgot Password) */}
      <div className="w-full lg:w-1/2 h-full bg-primary relative flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">

        <Link href="/" className="lg:hidden absolute top-6 left-6 z-40 text-lg font-bold tracking-tight text-white hover:opacity-70 transition-opacity">
          cardivex<span className="text-accent">.</span>
        </Link>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-medium tracking-tight text-white mb-3">Reset Password</h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Enter your email address and we will send you instructions to reset your password.
            </p>
          </div>

          {/* Banner Notifikasi (Sukses / Error) */}
          <AnimatePresence mode="wait">
            {successMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                <div role="status" aria-live="polite" className="p-4 bg-teal/10 border border-teal/30 rounded-sm text-teal text-xs text-center font-medium shadow-sm leading-relaxed">
                  {successMsg}
                </div>
              </motion.div>
            )}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                <div role="alert" aria-live="polite" className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/30 rounded-sm text-accent text-xs text-center font-medium shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {successMsg === null ? (
            <form onSubmit={handleResetRequest} className="flex flex-col gap-6 w-full">

              <div className="relative group">
                <label htmlFor="forgot-email" className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-accent transition-colors">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-accent text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Link
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

            </form>
          ) : (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleUseDifferentEmail}
                className="w-full py-3.5 bg-transparent border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white/5 hover:border-accent/40 transition-all duration-300"
              >
                Use a Different Email
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="text-xs text-white/50 hover:text-accent hover:underline transition-all font-medium outline-none focus-visible:underline">
              Back to Sign In
            </Link>
          </div>

        </motion.div>
      </div>

    </main>
  );
}
