'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Loader2, Eye, EyeOff, CheckCircle2, Mail, KeyRound, Lock, Check, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ApiError extends Error {
  message: string;
}

type Step = 'request' | 'code' | 'form' | 'success';

const STEPS: { key: Step; label: string; icon: typeof Mail }[] = [
  { key: 'request', label: 'Request', icon: Mail },
  { key: 'code', label: 'Verify', icon: KeyRound },
  { key: 'form', label: 'Password', icon: Lock },
  { key: 'success', label: 'Done', icon: Check },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex(s => s.key === current);

  return (
    <div className="flex items-center gap-1.5 mb-8">
      {STEPS.map((s, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${
                  isDone
                    ? 'bg-foreground border-foreground text-surface-white'
                    : isActive
                      ? 'bg-foreground/10 border-foreground text-foreground'
                      : 'bg-transparent border-foreground/15 text-muted/50'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className={`hidden sm:inline text-[10px] font-mono uppercase tracking-widest transition-colors duration-300 ${
                isActive ? 'text-foreground' : isDone ? 'text-muted' : 'text-muted/40'
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px min-w-4 transition-colors duration-300 ${isDone ? 'bg-foreground' : 'bg-foreground/10'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Input OTP 6 kotak terpisah: auto-advance ke kotak berikutnya saat ngetik,
// backspace mundur ke kotak sebelumnya, dan support paste kode sekaligus.
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

// Input password kecil dengan toggle show/hide, error message inline yang animated,
// dan shake animation yang di-trigger tiap kali `shakeToken` berubah (misal submit gagal).
function PasswordField({
  label,
  value,
  onChange,
  error,
  shakeToken,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  shakeToken?: number;
}) {
  const [visible, setVisible] = useState(false);
  const controls = useAnimation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (shakeToken !== undefined) {
      controls.start({ x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } });
    }
  }, [shakeToken, controls]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</label>
      <motion.div animate={controls} className="relative">
        <input
          type={visible ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-background/50 border text-sm rounded-xl px-4 py-3 pr-11 focus:outline-none transition-colors ${
            error
              ? 'border-rose-500/50 focus:border-rose-500'
              : 'border-foreground/10 focus:border-foreground/30 focus:bg-background'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-foreground transition-colors"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <span className="flex items-center gap-1.5 text-[10px] text-rose-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SecuritySettings({ initialStep }: { initialStep: 'request' | 'form' }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep);

  const [verificationCode, setVerificationCode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Error khusus per-field. oldPasswordError & confirmMismatchFromServer cuma
  // muncul setelah backend nolak (baru diketahui setelah submit), sedangkan
  // newPasswordError/confirmPasswordError dihitung live sambil user ngetik.
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [shakeTokens, setShakeTokens] = useState({ old: 0, new: 0, confirm: 0 });

  const MIN_PASSWORD_LENGTH = 8;
  const newPasswordError = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH
    ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    : null;
  const confirmPasswordError = confirmPassword.length > 0 && confirmPassword !== newPassword
    ? 'Passwords do not match'
    : null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep(initialStep);
  }, [initialStep]);

  const handleRequestEmail = async () => {
    try {
      setFeedback(null);
      setIsSending(true);
      await api('/auth/password/change/request', { method: 'POST' });
      setFeedback({ type: 'success', message: 'Verification code sent to your email.' });
      setStep('code');
    } catch (error: unknown) {
      const err = error as ApiError;
      setFeedback({ type: 'error', message: err.message || 'Failed to send email.' });
    } finally {
      setIsSending(false);
    }
  };

  // Backend tidak punya endpoint verifikasi kode terpisah — kode baru divalidasi
  // bareng current_password/new_password di endpoint confirm. Jadi di sini kita
  // cuma pindah step secara lokal, tanpa memanggil API.
  const handleContinueToForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length < 6) {
      setFeedback({ type: 'error', message: 'Please enter the full 6-digit code.' });
      return;
    }
    setFeedback(null);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setOldPasswordError(null);

    // Validasi lokal dulu sebelum hit API — kalau ada yang invalid, shake field
    // yang bermasalah dan jangan lanjut ke server.
    if (newPasswordError || confirmPasswordError) {
      setShakeTokens(prev => ({
        ...prev,
        new: newPasswordError ? prev.new + 1 : prev.new,
        confirm: confirmPasswordError ? prev.confirm + 1 : prev.confirm,
      }));
      return;
    }

    try {
      setIsChanging(true);
      await api('/auth/password/change/confirm', {
        method: 'POST',
        body: { code: verificationCode, current_password: oldPassword, new_password: newPassword }
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStep('success');
    } catch (error: unknown) {
      const err = error as ApiError;
      const message = err.message || 'Failed to change password.';

      if (/code/i.test(message)) {
        setFeedback({ type: 'error', message });
        setStep('code');
      } else if (/current|old/i.test(message) && /password/i.test(message)) {
        // Backend nolak karena password lama salah -> tempel error di field itu spesifik
        setOldPasswordError(message);
        setShakeTokens(prev => ({ ...prev, old: prev.old + 1 }));
      } else {
        // Fallback: error umum yang gak bisa dipetakan ke field tertentu
        setFeedback({ type: 'error', message });
      }
    } finally {
      setIsChanging(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-white/60 border border-foreground/10 rounded-3xl p-6 sm:p-8 max-w-4xl">
      <h2 className="text-xl font-medium tracking-tight mb-6">Change Password</h2>

      <StepIndicator current={step} />

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
        {step === 'request' && (
          <motion.div
            key="request"
            variants={stepVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            className="flex flex-col items-start gap-5 max-w-md"
          >
            <p className="text-xs text-muted leading-relaxed">
              For security reasons, changing your password requires email verification. We&apos;ll send a 6-digit code to your registered email.
            </p>
            <button
              onClick={handleRequestEmail} disabled={isSending}
              className="px-8 py-3 bg-foreground text-surface-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-foreground/90 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSending ? 'Sending...' : 'Request Code'}
            </button>
          </motion.div>
        )}

        {step === 'code' && (
          <motion.form
            key="code"
            variants={stepVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            onSubmit={handleContinueToForm}
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

            <OtpInput value={verificationCode} onChange={setVerificationCode} />

            <div className="flex flex-col gap-3 w-full">
              <button
                type="submit"
                className="w-full py-4 bg-foreground text-surface-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-foreground/90 transition-all flex justify-center items-center gap-2"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleRequestEmail}
                disabled={isSending}
                className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isSending ? 'Resending...' : "Didn't get a code? Resend"}
              </button>
            </div>
          </motion.form>
        )}

        {step === 'form' && (
          <motion.form
            key="form"
            variants={stepVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 max-w-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-[10px] font-mono text-muted">
                  Code <span className="text-foreground tracking-widest">{verificationCode}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('code')}
                className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
              >
                Edit code
              </button>
            </div>

            <PasswordField
              label="Old Password"
              value={oldPassword}
              onChange={(v) => { setOldPassword(v); setOldPasswordError(null); }}
              error={oldPasswordError}
              shakeToken={shakeTokens.old}
            />
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              error={newPasswordError}
              shakeToken={shakeTokens.new}
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={confirmPasswordError}
              shakeToken={shakeTokens.confirm}
            />

            <button
              type="submit" disabled={isChanging}
              className="mt-2 w-full py-4 bg-foreground text-surface-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-foreground/90 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
            </button>
          </motion.form>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            variants={stepVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-5 max-w-md mx-auto text-center py-4"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <div className="flex flex-col gap-1.5">
              <span className="text-base font-medium text-foreground">Password changed successfully</span>
              <p className="text-xs text-muted leading-relaxed">
                Your password has been updated. Use your new password next time you sign in.
              </p>
            </div>
            <button
              onClick={() => router.replace('/lab/profile')}
              className="px-8 py-3 bg-foreground text-surface-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-foreground/90 transition-all"
            >
              Back to Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}