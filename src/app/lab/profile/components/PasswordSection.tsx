'use client';

import React, { useId, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { readApiError } from '@/lib/pipeline';
import { DrawnCheck } from '@/components/auth/AuthShell';
import { primaryBtn, secondaryBtn } from '../../components/report/ui';
import OtpInput, { useCooldown } from './OtpInput';

/*
 * Ganti password dalam tiga langkah: kode ke email -> password baru -> selesai.
 * Backend memeriksa kode bersama password lama & baru di satu endpoint (confirm), jadi langkah
 * "kode" hanya mengumpulkan kode tanpa memanggil API.
 */

type Step = 'request' | 'code' | 'form' | 'success';
const STEPS = ['Email code', 'New password', 'Done'] as const;
const stepIndex: Record<Step, number> = { request: -1, code: 0, form: 1, success: 2 };
const MIN = 8;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Tiga garis kemajuan dengan label di bawahnya */
function Progress({ step }: { step: Step }) {
  const at = stepIndex[step];
  return (
    <ol className="grid grid-cols-3 gap-2">
      {STEPS.map((label, i) => (
        <li key={label}>
          <span className="block h-[3px] overflow-hidden rounded-full bg-foreground/10">
            <motion.span
              className="block h-full origin-left rounded-full bg-foreground"
              initial={false}
              animate={{ scaleX: i <= at ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </span>
          <span className={`mt-2 block text-xs transition-colors duration-300 ${i <= at ? 'text-foreground' : 'text-foreground/45'}`}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

/** Skor 0-4 dari panjang & variasi karakter (dihitung di browser, tidak dikirim) */
function strength(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: '' };
  let score = pw.length >= MIN ? 1 : 0;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return { score, label: pw.length < MIN ? `At least ${MIN} characters` : ['Weak', 'Fair', 'Good', 'Strong'][Math.min(score, 4) - 1] ?? 'Weak' };
}

export function PasswordInput({ label, value, onChange, error, autoComplete, meter = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  autoComplete: string;
  /** Tampilkan pengukur kekuatan password */
  meter?: boolean;
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const s = meter ? strength(value) : null;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          aria-invalid={!!error}
          className={`h-12 w-full rounded-control border bg-surface-white px-4 pr-12 text-[15px] text-foreground outline-none
            transition-[border-color,box-shadow] duration-200 focus:ring-4
            ${error ? 'border-accent/60 focus:ring-accent/10' : 'border-foreground/12 hover:border-foreground/25 focus:border-foreground focus:ring-foreground/[0.06]'}`}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {s && value && (
        <div className="mt-2.5 flex items-center gap-3">
          <span className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map(n => (
              <span key={n} className={`h-1 rounded-full transition-colors duration-300 ${n <= s.score ? (s.score <= 1 ? 'bg-accent' : s.score === 2 ? 'bg-amber' : 'bg-foreground') : 'bg-foreground/10'}`} />
            ))}
          </span>
          <span className="w-36 text-right text-xs text-foreground/60">{s.label}</span>
        </div>
      )}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-2 text-[13px] text-accent"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'info'; children?: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {children && (
        <motion.p
          role={tone === 'error' ? 'alert' : 'status'}
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="overflow-hidden"
        >
          <span className={`block rounded-card px-4 py-3 text-sm leading-relaxed ${tone === 'error' ? 'bg-accent/[0.08] text-accent-dark' : 'bg-foreground/[0.05] text-foreground/80'}`}>
            {children}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function PasswordSection({ email, initialStep }: { email: string; initialStep: 'request' | 'form' }) {
  const [step, setStep] = useState<Step>(initialStep);
  const [code, setCode] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'error' | 'info'; text: string } | null>(null);
  const [errors, setErrors] = useState<{ code?: string; current?: string; next?: string; confirm?: string }>({});
  const cooldown = useCooldown(30);
  const shake = useAnimation();
  const nudge = () => shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } });

  const sendCode = async () => {
    setNotice(null);
    setSending(true);
    try {
      await api('/auth/password/change/request', { method: 'POST' });
      cooldown.start();
      setCode('');
      setStep('code');
      setNotice({ tone: 'info', text: `Code sent to ${email}. It may take a minute to arrive.` });
    } catch (err) {
      const { status, message } = readApiError(err);
      setNotice({ tone: 'error', text: status === 429 ? 'Too many requests. Wait a moment, then try again.' : message || 'We could not send the code. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const toForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      setErrors({ code: 'Enter all 6 digits from the email.' });
      nudge();
      return;
    }
    setErrors({});
    setNotice(null);
    setStep('form');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const errs: typeof errors = {};
    if (!current) errs.current = 'Enter your current password.';
    if (next.length < MIN) errs.next = `Use at least ${MIN} characters.`;
    else if (next === current) errs.next = 'Choose a password different from the current one.';
    if (confirm !== next) errs.confirm = 'The two passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) { nudge(); return; }

    setSaving(true);
    try {
      await api('/auth/password/change/confirm', { method: 'POST', body: { code, current_password: current, new_password: next } });
      setCurrent(''); setNext(''); setConfirm('');
      setStep('success');
    } catch (err) {
      const { message } = readApiError(err);
      const text = message || 'We could not update your password. Please try again.';
      if (/code/i.test(text)) {
        setStep('code');
        setErrors({ code: text });
      } else if (/current|old/i.test(text) && /password/i.test(text)) {
        setErrors({ current: text });
        nudge();
      } else {
        setNotice({ tone: 'error', text });
      }
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setStep('request'); setCode(''); setNotice(null); setErrors({}); };

  return (
    <div className="flex flex-col gap-7">
      <Progress step={step} />
      <Notice tone={notice?.tone ?? 'info'}>{notice?.text}</Notice>

      {/* Animasi masuk saja per langkah (AnimatePresence mode="wait" bisa macet di opacity 0) */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
          {step === 'request' && (
            <div className="flex flex-col items-start gap-5">
              <p className="text-sm leading-relaxed text-foreground/70">
                We&apos;ll email a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it here, then
                choose your new password.
              </p>
              <button type="button" onClick={sendCode} disabled={sending} className={primaryBtn}>
                {sending ? 'Sending code…' : 'Send code'}
              </button>
            </div>
          )}

          {step === 'code' && (
            <motion.form animate={shake} onSubmit={toForm} className="flex flex-col gap-5">
              <p className="text-sm leading-relaxed text-foreground/70">Enter the code from the email we sent to <span className="font-medium text-foreground">{email}</span>.</p>
              <OtpInput value={code} onChange={v => { setCode(v); setErrors({}); }} invalid={!!errors.code} autoFocus />
              {errors.code && <p className="-mt-2 text-[13px] text-accent">{errors.code}</p>}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <button type="submit" className={primaryBtn}>Continue</button>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={sending || cooldown.left > 0}
                  className="text-sm text-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:no-underline disabled:opacity-50"
                >
                  {cooldown.left > 0 ? `Resend code in ${cooldown.left}s` : sending ? 'Sending…' : 'Resend code'}
                </button>
              </div>
            </motion.form>
          )}

          {step === 'form' && (
            <motion.form animate={shake} onSubmit={save} className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4 rounded-card bg-foreground/[0.04] px-4 py-3 text-sm">
                <span className="text-foreground/60">Code <span className="ml-1 font-mono tracking-[0.2em] text-foreground">{code || '——'}</span></span>
                <button type="button" onClick={() => setStep('code')} className="text-foreground/60 underline-offset-4 hover:text-foreground hover:underline">Change</button>
              </div>
              <PasswordInput label="Current password" autoComplete="current-password" value={current} onChange={v => { setCurrent(v); setErrors(e => ({ ...e, current: undefined })); }} error={errors.current} />
              <PasswordInput label="New password" autoComplete="new-password" meter value={next} onChange={v => { setNext(v); setErrors(e => ({ ...e, next: undefined })); }} error={errors.next} />
              <PasswordInput label="Confirm new password" autoComplete="new-password" value={confirm} onChange={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: undefined })); }} error={errors.confirm} />
              <div className="pt-1">
                <button type="submit" disabled={saving} className={primaryBtn}>{saving ? 'Updating…' : 'Update password'}</button>
              </div>
            </motion.form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-start gap-5">
              <span className="text-foreground"><DrawnCheck size={48} /></span>
              <div>
                <p className="text-base font-medium text-foreground">Password updated</p>
                <p className="mt-1 text-sm text-foreground/70">Use your new password the next time you sign in.</p>
              </div>
              <button type="button" onClick={reset} className={secondaryBtn}>Done</button>
            </div>
          )}
      </motion.div>
    </div>
  );
}
