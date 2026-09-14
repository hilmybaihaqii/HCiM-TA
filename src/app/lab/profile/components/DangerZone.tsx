'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Loader2, KeyRound, UserX, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ApiError extends Error {
  message: string;
}

type Step = 'request' | 'form';

// Input OTP 6 kotak terpisah — sama seperti di SecuritySettings, biar konsisten
function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const setDigitAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(''));
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/[^0-9]/g, '').slice(-1);
    setDigitAt(index, char);
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigitAt(index - 1, '');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, '').slice(0, length));
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-medium bg-background/50 border border-foreground/10 rounded-xl focus:outline-none focus:border-foreground/40 focus:bg-background transition-colors"
        />
      ))}
    </div>
  );
}

export default function DangerZone() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [deleteCode, setDeleteCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const controls = useAnimation();

  const triggerShake = () => {
    controls.start({ x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } });
  };

  const handleRequestCode = async () => {
    try {
      setFeedback(null);
      setIsSending(true);
      await api('/auth/account/delete/request', { method: 'POST' });
      setFeedback({ type: 'success', message: 'Verification code sent to your email.' });
      setStep('form');
    } catch (error: unknown) {
      const err = error as ApiError;
      setFeedback({ type: 'error', message: err.message || 'Failed to request code.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setCodeError(null);

    if (deleteCode.length < 6) {
      setCodeError('Please enter the full 6-digit code.');
      triggerShake();
      return;
    }

    try {
      setIsDeactivating(true);
      await api('/auth/account/delete/confirm', { method: 'POST', body: { code: deleteCode } });
      try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore: account is deactivated regardless */ }
      router.push('/login?status=deactivated');
    } catch (error: unknown) {
      const err = error as ApiError;
      setCodeError(err.message || 'Invalid or expired code.');
      triggerShake();
      setIsDeactivating(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-white/60 border border-foreground/10 rounded-3xl p-6 sm:p-8 max-w-4xl">
      <h2 className="text-xl font-medium tracking-tight text-foreground mb-2">Deactivate Account</h2>
      <p className="text-xs text-muted leading-relaxed mb-6">
        This hides your account and data until an admin restores it. Email verification is required.
      </p>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-4 mb-6 text-xs rounded-xl border ${feedback.type === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
              {feedback.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'request' ? (
          <motion.div
            key="request"
            variants={stepVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            className="flex flex-col items-start gap-5 max-w-md"
          >
            <button
              onClick={handleRequestCode} disabled={isSending}
              className="px-8 py-3 bg-foreground text-surface-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-foreground/90 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSending ? 'Sending...' : 'Request Code'}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            variants={stepVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            onSubmit={handleDeactivate}
            className="flex flex-col items-center gap-6 max-w-md mx-auto text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">Enter verification code</p>
              <p className="text-xs text-muted leading-relaxed">
                We sent a 6-digit code to your email.
              </p>
            </div>

            <motion.div animate={controls}>
              <OtpInput value={deleteCode} onChange={(v) => { setDeleteCode(v); setCodeError(null); }} />
            </motion.div>

            <AnimatePresence>
              {codeError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden -mt-2"
                >
                  <span className="flex items-center justify-center gap-1.5 text-[10px] text-rose-500">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {codeError}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3 w-full">
              <button
                type="submit" disabled={isDeactivating}
                className="w-full py-4 bg-foreground text-surface-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-foreground/90 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isDeactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    Deactivate Account
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleRequestCode}
                disabled={isSending}
                className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isSending ? 'Resending...' : "Didn't get a code? Resend"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}