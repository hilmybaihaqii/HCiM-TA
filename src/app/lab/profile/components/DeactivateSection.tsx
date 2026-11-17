'use client';

import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Archive, LogIn, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { readApiError } from '@/lib/pipeline';
import { clearSessionFlag } from '@/lib/sessionFlag';
import { secondaryBtn } from '../../components/report/ui';
import OtpInput, { useCooldown } from './OtpInput';
import { Notice } from './PasswordSection';

const EASE = [0.16, 1, 0.3, 1] as const;

// Apa yang terjadi saat akun dinonaktifkan (sesuai perilaku backend: akun disembunyikan, bisa dipulihkan admin)
const EFFECTS = [
  { icon: LogIn, title: 'You can’t sign in', text: 'Signing in to this account stops working.' },
  { icon: Archive, title: 'Your history is kept', text: 'Simulations, predictions and SHAP analyses are hidden, not erased.' },
  { icon: RotateCcw, title: 'An admin can restore it', text: 'Ask an administrator if you want the account back later.' },
];

const dangerBtn = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-control bg-accent text-surface-white text-sm font-medium shadow-sm shadow-accent/20 hover:bg-accent-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

/** Menonaktifkan akun sendiri (khusus user): pahami akibatnya -> kode ke email -> konfirmasi. */
export default function DeactivateSection({ email }: { email: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'code'>('intro');
  const [understood, setUnderstood] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'error' | 'info'; text: string } | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const cooldown = useCooldown(30);
  const shake = useAnimation();

  const sendCode = async () => {
    setNotice(null);
    setSending(true);
    try {
      await api('/auth/account/delete/request', { method: 'POST' });
      cooldown.start();
      setCode('');
      setStep('code');
      setNotice({ tone: 'info', text: `Code sent to ${email}.` });
    } catch (err) {
      const { status, message } = readApiError(err);
      setNotice({ tone: 'error', text: status === 429 ? 'Too many requests. Wait a moment, then try again.' : message || 'We could not send the code. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const deactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (code.length < 6) {
      setCodeError('Enter all 6 digits from the email.');
      shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } });
      return;
    }
    setWorking(true);
    try {
      await api('/auth/account/delete/confirm', { method: 'POST', body: { code } });
      try { await api('/auth/logout', { method: 'POST' }); } catch { /* akun sudah nonaktif, logout boleh gagal */ }
      clearSessionFlag();
      router.push('/login?status=deactivated');
    } catch (err) {
      setCodeError(readApiError(err).message || 'That code is wrong or has expired. Request a new one.');
      shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } });
      setWorking(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EFFECTS.map(({ icon: Icon, title, text }, i) => (
          <motion.li
            key={title}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 * i }}
            className="rounded-card border border-foreground/10 bg-surface-white/70 p-4"
          >
            <Icon className="h-4 w-4 text-foreground/60" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/60">{text}</p>
          </motion.li>
        ))}
      </ul>

      <Notice tone={notice?.tone ?? 'info'}>{notice?.text}</Notice>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {step === 'intro' ? (
          <div className="flex flex-col items-start gap-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={understood}
                onChange={e => setUnderstood(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--foreground)]"
              />
              I understand that I won&apos;t be able to sign in until an administrator restores my account.
            </label>
            <button type="button" onClick={sendCode} disabled={!understood || sending} className={`${secondaryBtn} disabled:opacity-40 disabled:pointer-events-none`}>
              {sending ? 'Sending code…' : 'Email me a confirmation code'}
            </button>
          </div>
        ) : (
          <motion.form animate={shake} onSubmit={deactivate} className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-foreground/70">Enter the code from the email we sent to <span className="font-medium text-foreground">{email}</span>.</p>
            <OtpInput value={code} onChange={v => { setCode(v); setCodeError(null); }} invalid={!!codeError} autoFocus />
            {codeError && <p className="-mt-2 text-[13px] text-accent">{codeError}</p>}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button type="submit" disabled={working} className={dangerBtn}>{working ? 'Deactivating…' : 'Deactivate my account'}</button>
              <button
                type="button"
                onClick={sendCode}
                disabled={sending || cooldown.left > 0}
                className="text-sm text-foreground/60 underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:no-underline disabled:opacity-50"
              >
                {cooldown.left > 0 ? `Resend code in ${cooldown.left}s` : sending ? 'Sending…' : 'Resend code'}
              </button>
              <button type="button" onClick={() => { setStep('intro'); setNotice(null); setCodeError(null); }} className="text-sm text-foreground/60 underline-offset-4 hover:text-foreground hover:underline">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
