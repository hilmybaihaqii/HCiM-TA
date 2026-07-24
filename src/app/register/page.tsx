'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  // State Form (Sesuai kebutuhan payload backend)[cite: 1, 2]
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State UI & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      // Mengirimkan data registrasi ke backend[cite: 1, 2]
      await api("/auth/register", {
        method: "POST",
        body: {
          email,
          password,
          display_name: displayName // Pastikan penulisan key ini persis seperti kontrak backend[cite: 1, 2]
        }
      });

      // Jika sukses (201), tampilkan instruksi verifikasi[cite: 1, 2]
      setSuccessMsg("Account created successfully! Please check your email to verify your account before logging in.");
      setIsLoading(false);

      // Kosongkan form setelah berhasil
      setDisplayName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (error) {
      setIsLoading(false);

      const e = error as { status?: number };

      // Menangani error spesifik (409) jika email sudah terpakai[cite: 1, 2]
      if (e.status === 409) {
        setErrorMsg("That email is already in use. Please sign in instead.");
      } else {
        setErrorMsg("Registration failed. Please check your inputs and try again.");
      }
    }
  };

  return (
    <main className="fixed inset-0 z-50 w-full h-screen flex bg-background font-sans overflow-hidden">

      {/* PANEL KIRI (Branding & Ambient Animation) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 h-full bg-background p-12 relative overflow-hidden">

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-teal/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], x: [0, 15, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber/15 rounded-full blur-3xl"
          />
        </div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <Link href="/" className="relative z-10 text-2xl font-bold tracking-tight text-foreground hover:opacity-70 transition-opacity">
            cardivex<span className="text-accent">.</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl xl:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            Join the <br /> Research Node.
          </h2>
          <p className="text-foreground/70 max-w-sm leading-relaxed text-sm">
            Create an account to run Torsade de Pointes (TdP) predictions and access the advanced SHAP explainability matrix.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-foreground/50">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />Registration</span>
          <span>Verified Access</span>
        </motion.div>
      </div>

      {/* PANEL KANAN (Form Register) */}
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
            <Link href="/" aria-label="Close and return to homepage" className="text-white/50 hover:text-accent transition-colors duration-300 p-2 block outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-full">
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
            <h1 className="text-3xl font-medium tracking-tight text-white mb-3">Create Account</h1>
            <p className="text-xs text-white/50 leading-relaxed">Fill in your details to initialize your credentials.</p>
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

          <form onSubmit={handleRegister} className="flex flex-col gap-6 w-full">

            <div className="relative group">
              <label htmlFor="register-name" className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-accent transition-colors">
                Full Name
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading || successMsg !== null}
                required
                className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
              />
            </div>

            <div className="relative group">
              <label htmlFor="register-email" className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-accent transition-colors">
                Email Address
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || successMsg !== null}
                required
                className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
              />
            </div>

            <div className="relative group flex flex-col">
              <label htmlFor="register-password" className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-accent transition-colors">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-password"
                  name="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || successMsg !== null}
                  required
                  minLength={8}
                  className="w-full bg-transparent border-b border-white/20 py-2 pr-10 text-sm text-white focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-0 text-[10px] font-mono text-white/30 hover:text-accent transition-colors p-2 outline-none focus-visible:text-accent"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              <p className="text-[9px] font-mono text-white/30 mt-2">Minimum 8 characters.</p>
            </div>

            <div className="relative group flex flex-col">
              <label htmlFor="register-confirm-password" className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-accent transition-colors">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                name="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || successMsg !== null}
                required
                aria-invalid={passwordsMismatch}
                className={`w-full bg-transparent border-b py-2 text-sm text-white focus:outline-none transition-colors disabled:opacity-50 ${passwordsMismatch ? 'border-accent/60 focus:border-accent' : 'border-white/20 focus:border-accent'}`}
              />
              {passwordsMismatch && (
                <p className="text-[9px] font-mono text-accent/90 mt-2">Passwords do not match.</p>
              )}
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={isLoading || successMsg !== null || passwordsMismatch}
                className="w-full py-4 bg-accent text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/50">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:underline transition-all font-medium">
                Sign in
              </Link>
            </p>
          </div>

        </motion.div>
      </div>

    </main>
  );
}
