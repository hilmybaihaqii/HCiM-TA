'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { api } from '@/lib/api';

export default function RegisterPage() {
  // State Form (Sesuai kebutuhan payload backend)[cite: 1, 2]
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State UI & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ displayName?: string; email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<'displayName' | 'email' | 'password' | null>(null);

  const shakeControls = useAnimation();
  const triggerShake = () => {
    shakeControls.start({
      x: [0, -10, 10, -8, 8, -5, 5, -2, 2, 0],
      transition: { duration: 0.5, ease: 'easeInOut' }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const nextFieldErrors: { displayName?: string; email?: string; password?: string } = {};
    if (!displayName.trim()) nextFieldErrors.displayName = "Enter your full name.";
    if (!email.trim()) nextFieldErrors.email = "Enter your email address.";
    if (!password) nextFieldErrors.password = "Enter your password.";
    else if (password.length < 8) nextFieldErrors.password = "Password must be at least 8 characters.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      triggerShake();
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setSuccessMsg(null);

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

    } catch (error) {
      setIsLoading(false);

      const e = error as { status?: number };

      // Menangani error spesifik (409) jika email sudah terpakai[cite: 1, 2]
      if (e.status === 409) {
        setFieldErrors({ email: "That email is already in use. Please sign in instead." });
      } else {
        setErrorMsg("Registration failed. Please check your inputs and try again.");
      }
      triggerShake();
    }
  };

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
            cardivex<span className="text-[#E63946]">.</span>
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
          <span>Registration</span>
          <span>Verified Access</span>
        </motion.div>
      </div>

      {/* PANEL KANAN (Form Register) */}
      <div className="w-full lg:w-1/2 h-full bg-[#0A0A0A] relative flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-8 right-8 z-50"
          >
            <Link href="/" className="text-white/50 hover:text-white transition-colors duration-300 p-2 block">
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

          {/* Banner Notifikasi Sukses */}
          <AnimatePresence mode="wait">
            {successMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-emerald-500 text-xs text-center font-medium shadow-sm leading-relaxed">
                  {successMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div animate={shakeControls}>
          <form onSubmit={handleRegister} noValidate className="flex flex-col gap-6 w-full">

            <div className="relative group">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (fieldErrors.displayName) setFieldErrors((prev) => ({ ...prev, displayName: undefined }));
                }}
                onFocus={() => setFocusedField('displayName')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading || successMsg !== null}
                className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
              />
              <span className="relative block h-px w-full bg-transparent overflow-hidden">
                <motion.span
                  className="absolute inset-y-0 left-1/2 -translate-x-1/2 h-px bg-white"
                  initial={false}
                  animate={{ width: focusedField === 'displayName' ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <AnimatePresence mode="wait">
                {fieldErrors.displayName && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs text-red-500 mt-2"
                  >
                    {fieldErrors.displayName}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                disabled={isLoading || successMsg !== null}
                className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
              />
              <span className="relative block h-px w-full bg-transparent overflow-hidden">
                <motion.span
                  className="absolute inset-y-0 left-1/2 -translate-x-1/2 h-px bg-white"
                  initial={false}
                  animate={{ width: focusedField === 'email' ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <AnimatePresence mode="wait">
                {fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs text-red-500 mt-2"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group flex flex-col">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading || successMsg !== null}
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
                  animate={{ width: focusedField === 'password' ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>

              <AnimatePresence mode="wait">
                {(fieldErrors.password || errorMsg) ? (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs text-red-500 mt-2"
                  >
                    {fieldErrors.password || errorMsg}
                  </motion.p>
                ) : (
                  <p className="text-[9px] font-mono text-white/30 mt-2">Minimum 8 characters.</p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={isLoading || successMsg !== null}
                className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Processing
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

          </form>
          </motion.div>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/50">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:underline transition-all font-medium">
                Sign in
              </Link>
            </p>
          </div>

        </motion.div>
      </div>

    </main>
  );
}