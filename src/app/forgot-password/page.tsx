'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

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
      setEmail(''); // Kosongkan input setelah sukses
    } catch (error) {
      // Menangkap error jaringan atau server down
      setErrorMsg("An unexpected error occurred while communicating with the server. Please try again.");
    } finally {
      setIsLoading(false);
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
            cardiotox<span className="text-[#E63946]">.</span>
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
          <span>Identity Verification</span>
          <span>Secure Reset</span>
        </motion.div>
      </div>

      {/* PANEL KANAN (Form Forgot Password) */}
      <div className="w-full lg:w-1/2 h-full bg-[#0A0A0A] relative flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.5 }}
            className="absolute top-8 right-8 z-50"
          >
            <Link href="/login" className="text-white/50 hover:text-white transition-colors duration-300 p-2 block">
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
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-emerald-500 text-xs text-center font-medium shadow-sm leading-relaxed">
                  {successMsg}
                </div>
              </motion.div>
            )}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm text-red-500 text-xs text-center font-medium shadow-sm">
                  {errorMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleResetRequest} className="flex flex-col gap-6 w-full">
            
            <div className="relative group">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1 block group-focus-within:text-white transition-colors">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors disabled:opacity-50" 
              />
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
                    Sending Link
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>

          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-xs text-white/50 hover:text-white hover:underline transition-all font-medium">
              Back to Sign In
            </Link>
          </div>

        </motion.div>
      </div>

    </main>
  );
}