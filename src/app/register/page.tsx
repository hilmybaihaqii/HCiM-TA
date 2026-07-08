'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  /* =========================================================
     ANIMATION VARIANTS
     ========================================================= */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1, duration: 0.8, ease: luxEase } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: luxEase } }
  };

  const blobAnimation = {
    scale: [1, 1.1, 1],
    x: [0, 20, 0],
    y: [0, -30, 0],
  };

  return (
    <main className="fixed inset-0 z-50 w-full h-screen flex bg-background font-sans overflow-hidden">
      
      {/* =========================================================
          PANEL KIRI (Branding & Ambient Animation)
          ========================================================= */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 h-full bg-border p-12 relative overflow-hidden">

        {/* Ambient Background Blobs */}
        <motion.div
          animate={blobAnimation}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ ...blobAnimation, x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 -right-20 w-80 h-80 bg-secondary/25 rounded-full blur-3xl"
        />
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: luxEase }}>
          <Link href="/" className="relative z-10 text-2xl font-medium tracking-tight text-foreground hover:opacity-70 transition-opacity">
            cardiotox<span className="text-accent">.</span>
          </Link>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 flex flex-col gap-6">
          <motion.h2 variants={itemVariants} className="text-4xl xl:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            Join the research <br /> network.
          </motion.h2>
          <motion.p variants={itemVariants} className="text-foreground/70 max-w-sm leading-relaxed text-sm">
            Create an account to evaluate our in silico models, participate in the private beta, and access advanced electrophysiological analytics.
          </motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6, ease: luxEase }} className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-foreground/50">
          <span>Research Platform</span>
          <span>Telkom University</span>
        </motion.div>
      </div>

      {/* =========================================================
          PANEL KANAN (Form Register)
          ========================================================= */}
      <div className="w-full lg:w-1/2 h-full bg-primary relative flex flex-col items-center justify-center p-6 md:p-12">
        
        {/* Tombol Tutup (X) */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5, ease: luxEase }}>
          <Link href="/" className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors duration-300 p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </motion.div>

        {/* Kontainer Form */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-sm flex flex-col">
          
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-3">Request Access</h1>
            <p className="text-xs text-white/50">Register to join the private evaluation program.</p>
          </motion.div>
          
          <div className="flex flex-col gap-6 w-full">
            
            {/* Input First & Last Name */}
            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="relative group w-1/2">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors hover:border-white/50"
                />
              </div>
              <div className="relative group w-1/2">
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors hover:border-white/50"
                />
              </div>
            </motion.div>

            {/* Input Email */}
            <motion.div variants={itemVariants} className="relative group">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors hover:border-white/50" 
              />
            </motion.div>
            
            {/* Input Institution */}
            <motion.div variants={itemVariants} className="relative group">
              <input 
                type="text" 
                placeholder="Institution / Hospital" 
                className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors hover:border-white/50" 
              />
            </motion.div>

            {/* Input Password + Toggle Hide/Show */}
            <motion.div variants={itemVariants} className="relative group flex items-center">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Create Password" 
                className="w-full bg-transparent border-b border-white/20 py-3 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors hover:border-white/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 flex items-center justify-center p-2 text-white/30 hover:text-white/80 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {showPassword ? (
                    <motion.svg
                      key="eye-open"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
                      className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="eye-closed"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
                      className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <button 
                type="button" 
                className="w-full mt-6 py-4 bg-accent text-white text-xs font-medium uppercase tracking-widest hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-sm"
              >
                Create Account
              </button>
            </motion.div>

            {/* Link ke Login */}
            <motion.div variants={itemVariants} className="text-center mt-6">
              <span className="text-[10px] text-white/40">Already have an account? </span>
              <Link href="/login" className="text-[10px] text-white hover:text-accent transition-colors">
                Sign in here
              </Link>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </main>
  );
}