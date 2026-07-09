'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { CheckCircle2, Loader2, X } from 'lucide-react';

// ============================================================================
// KOMPONEN FORM & REDIRECT UTAMA
// ============================================================================
function LoginForm() {
  const searchParams = useSearchParams();
  
  const isVerified = searchParams.get('verified') === '1';
  const isGoogleSuccess = searchParams.get('login') === 'success';
  const isAutoRedirecting = isVerified || isGoogleSuccess;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Auto Redirect Logic (Google OAuth / Verification)
  useEffect(() => {
    if (isAutoRedirecting) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Validasi akhir sesi ke backend, lalu Hard-Redirect ke Lab
            api("/auth/me")
              .then(() => {
                window.location.href = '/lab'; 
              })
              .catch(() => {
                window.location.href = '/login'; 
              });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAutoRedirecting]);

  // Manual Login Logic
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api("/auth/login", { 
        method: "POST", 
        body: { email, password } 
      });
      // Gunakan Hard-Redirect agar browser mensinkronisasi Cookie baru
      window.location.href = '/lab';
    } catch (error) { 
      setIsLoading(false);
      const e = error as { status?: number };
      if (e.status === 403) setErrorMsg("Please verify your email first.");
      else if (e.status === 401) setErrorMsg("Wrong email or password.");
      else setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/google'; 
  };

  return (
    <div className="w-full lg:w-1/2 h-full bg-[#0A0A0A] relative flex flex-col items-center justify-center p-6 md:p-12">
      
      {!isAutoRedirecting && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-8 right-8 z-50">
            {/* Tombol X yang diperbaiki dengan Hard Redirect ke Landing Page */}
            <button 
              onClick={() => window.location.href = '/'}
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 p-2 block outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm flex flex-col"
      >
        {isAutoRedirecting ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-10">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 relative">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/20 rounded-full" />
              <CheckCircle2 className="w-8 h-8 text-emerald-500 relative z-10" />
            </div>
            
            <h2 className="text-2xl font-medium text-white mb-2 tracking-tight">
              {isVerified ? 'Verification Complete' : 'Authentication Success'}
            </h2>
            <p className="text-sm text-white/50 mb-8 leading-relaxed px-4">
              {isVerified ? 'Your identity has been successfully verified. Establishing secure connection...' : 'Google OAuth linked successfully. Establishing secure connection...'}
            </p>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-full">
              <Loader2 className="w-4 h-4 text-[#E63946] animate-spin" />
              <span className="text-xs font-mono text-white/70">
                Redirecting to lab in {countdown}s
              </span>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-medium tracking-tight text-white mb-3">Welcome Back</h1>
              <p className="text-xs text-white/50 leading-relaxed">Enter your credentials to access the secure research node.</p>
            </div>
            
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-red-500 text-xs text-center font-medium shadow-sm">
                    {errorMsg}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleSignIn} className="flex flex-col gap-6 w-full">
              <div className="relative group">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors disabled:opacity-50" />
              </div>
              
              <div className="relative group flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">Password</label>
                <div className="relative flex items-center">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required className="w-full bg-transparent border-b border-white/20 py-2 pr-10 text-sm text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 text-[10px] font-mono text-white/30 hover:text-white transition-colors p-2 outline-none">
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 cursor-pointer group/rem">
                    <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center transition-all duration-200 ${rememberMe ? 'bg-white border-white' : 'border-white/30 group-hover/rem:border-white/60'}`}>
                      {rememberMe && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 group-hover/rem:text-white transition-colors">Remember Me</span>
                  </label>
                  <Link href="/forgot-password" className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">Forgot Password?</Link>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col gap-4">
                <button type="submit" disabled={isLoading} className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3">
                  {isLoading ? <><div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Authenticating</> : 'Sign In'}
                </button>

                <div className="flex items-center gap-4 my-1">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-[10px] font-mono text-white/30 uppercase">Or</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full py-3.5 bg-transparent border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-white/5 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50">
                  {isLoading ? (
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Google
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-white/50">
                Don&apos;t have an account? <Link href="/register" className="text-white hover:underline transition-all font-medium">Register here</Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="fixed inset-0 z-50 w-full h-screen flex bg-background font-sans overflow-hidden">
      <div className="hidden lg:flex flex-col justify-between w-1/2 h-full bg-[#E8E6E1] p-12 relative overflow-hidden">
        <motion.div animate={{ scale: [1, 1.1, 1], x: [0, 20, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 -left-40 w-96 h-96 bg-foreground/5 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.1, 1], x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-20 -right-20 w-80 h-80 bg-foreground/5 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <Link href="/" className="relative z-10 text-2xl font-bold tracking-tight text-foreground hover:opacity-70 transition-opacity">
            cardiotox<span className="text-[#E63946]">.</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl xl:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            Secure Access <br /> Protocol.
          </h2>
          <p className="text-foreground/70 max-w-sm leading-relaxed text-sm">
            Enter the clinical environment. Your session is protected by end-to-end encryption and strict security protocols.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-foreground/50">
          <span>Security Protocol</span>
          <span>Encrypted Session</span>
        </motion.div>
      </div>

      <Suspense fallback={<div className="w-full lg:w-1/2 h-full bg-[#0A0A0A] flex items-center justify-center"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}