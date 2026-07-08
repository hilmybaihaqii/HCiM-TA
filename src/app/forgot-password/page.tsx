'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';


type ForgotStep = 'email' | 'otp' | 'reset' | 'success';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotStep>('email');
  const [isLoading, setIsLoading] = useState(false);

  /* =========================================================
     SIMULASI KEAMANAN & LOADING
     ========================================================= */
  const handleNextStep = (next: ForgotStep) => {
    setIsLoading(true);
    // Simulasi proses verifikasi ke server (1.2 detik)
    setTimeout(() => {
      setIsLoading(false);
      setStep(next);

      // Jika mencapai tahap success, otomatis kembali ke login setelah 2.5 detik
      if (next === 'success') {
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      }
    }, 1200);
  };

  /* =========================================================
     ANIMATION VARIANTS
     ========================================================= */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1, duration: 0.8, ease: luxEase } 
    },
    exit: { 
      opacity: 0, y: -10, transition: { duration: 0.4, ease: luxEase } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: luxEase } }
  };

  const blobAnimation = {
    scale: [1, 1.1, 1],
    x: [0, 20, 0],
    y: [0, -30, 0],
  };

  // Indikator Progres Bar
  const renderProgressDots = (currentStep: number) => (
    <motion.div variants={itemVariants} className="flex gap-2 justify-center mb-10">
      {[1, 2, 3].map((s) => (
        <div 
          key={s} 
          className={`h-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${s === currentStep ? 'w-8 bg-accent' : s < currentStep ? 'w-4 bg-accent/50' : 'w-4 bg-white/10'}`}
        />
      ))}
    </motion.div>
  );

  return (
    <main className="fixed inset-0 z-50 w-full h-screen flex bg-background font-sans overflow-hidden">
      
      {/* =========================================================
          PANEL KIRI (Branding & Ambient Animation)
          ========================================================= */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 h-full bg-border p-12 relative overflow-hidden">
        <motion.div
          animate={blobAnimation} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ ...blobAnimation, x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 -right-20 w-80 h-80 bg-secondary/25 rounded-full blur-3xl"
        />
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: luxEase }}>
          <Link href="/" className="relative z-10 text-2xl font-medium tracking-tight text-foreground hover:opacity-70 transition-opacity">
            cardiotox<span className="text-accent">.</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2, ease: luxEase }} className="relative z-10 flex flex-col gap-6">
          <h2 className="text-4xl xl:text-5xl font-medium tracking-tight text-foreground leading-[1.1]">
            Account <br /> recovery process.
          </h2>
          <p className="text-foreground/70 max-w-sm leading-relaxed text-sm">
            For security reasons, resetting your credentials requires multi-step identity verification. Please follow the instructions to secure your account.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6, ease: luxEase }} className="relative z-10 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-foreground/50">
          <span>Security Protocol</span>
          <span>End-to-End Encrypted</span>
        </motion.div>
      </div>

      {/* =========================================================
          PANEL KANAN (Form Forgot Password Wizard)
          ========================================================= */}
      <div className="w-full lg:w-1/2 h-full bg-primary relative flex flex-col items-center justify-center p-6 md:p-12">
        
        {/* Tombol Tutup hanya muncul jika belum success */}
        <AnimatePresence>
          {step !== 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Link href="/login" className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors duration-300 p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-sm relative min-h-100 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* ================= STEP 1: EMAIL ================= */}
            {step === 'email' && (
              <motion.div key="email" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col w-full">
                {renderProgressDots(1)}
                
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <h1 className="text-2xl font-medium tracking-tight text-white mb-3">Identity Verification</h1>
                  <p className="text-xs text-white/50 leading-relaxed">Enter the email address associated with your account to receive a secure recovery code.</p>
                </motion.div>

                <div className="flex flex-col gap-6 w-full">
                  <motion.div variants={itemVariants} className="relative group">
                    <input type="email" placeholder="Email Address" disabled={isLoading} className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <button 
                      type="button" 
                      onClick={() => handleNextStep('otp')} 
                      disabled={isLoading}
                      className="w-full mt-4 py-4 bg-accent text-white text-xs font-medium uppercase tracking-widest hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-sm disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        'Send Recovery Code'
                      )}
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center mt-4">
                    <Link href="/login" className="text-[10px] text-white/40 hover:text-accent transition-colors">
                      ← Return to Login
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 2: OTP ================= */}
            {step === 'otp' && (
              <motion.div key="otp" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col w-full">
                {renderProgressDots(2)}
                
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <h1 className="text-2xl font-medium tracking-tight text-white mb-3">Secure Authorization</h1>
                  <p className="text-xs text-white/50 leading-relaxed">We&apos;ve sent a 6-digit cryptographic code to your email. It expires in 10 minutes.</p>
                </motion.div>

                <div className="flex flex-col gap-6 w-full">
                  <motion.div variants={itemVariants} className="relative group">
                    <input 
                      type="text" 
                      placeholder="• • • • • •" 
                      maxLength={6} 
                      disabled={isLoading}
                      className="w-full bg-transparent border-b border-white/20 py-3 text-2xl tracking-[0.5em] text-center text-white placeholder-white/20 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <button 
                      type="button" 
                      onClick={() => handleNextStep('reset')} 
                      disabled={isLoading}
                      className="w-full mt-4 py-4 bg-accent text-white text-xs font-medium uppercase tracking-widest hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-sm disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Identity'
                      )}
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center mt-4 flex flex-col gap-4">
                    <button type="button" className="text-[10px] text-white/40 hover:text-accent transition-colors">
                      Didn&apos;t receive the code? Resend
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 3: RESET PASSWORD ================= */}
            {step === 'reset' && (
              <motion.div key="reset" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col w-full">
                {renderProgressDots(3)}
                
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <h1 className="text-2xl font-medium tracking-tight text-white mb-3">Set New Credential</h1>
                  <p className="text-xs text-white/50 leading-relaxed">Identity verified. Please create a new, strong password to secure your account.</p>
                </motion.div>

                <div className="flex flex-col gap-6 w-full">
                  <motion.div variants={itemVariants} className="relative group">
                    <input type="password" placeholder="New Password" disabled={isLoading} className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative group">
                    <input type="password" placeholder="Confirm New Password" disabled={isLoading} className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent transition-colors disabled:opacity-50" />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <button 
                      type="button" 
                      onClick={() => handleNextStep('success')} 
                      disabled={isLoading}
                      className="w-full mt-4 py-4 bg-accent text-white text-xs font-medium uppercase tracking-widest hover:bg-accent-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 rounded-sm disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ================= STEP 4: SUCCESS STATE ================= */}
            {step === 'success' && (
              <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center w-full py-10">
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                  className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-8"
                >
                  <motion.svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <motion.path 
                      strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    />
                  </motion.svg>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-2xl font-medium tracking-tight text-white mb-3 text-center">
                  Account Secured
                </motion.h1>
                <motion.p variants={itemVariants} className="text-xs text-white/50 text-center max-w-[250px] leading-relaxed">
                  Your password has been successfully updated. Redirecting you to the secure login portal...
                </motion.p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}