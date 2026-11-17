'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { api } from '@/lib/api';
import {
  AuthAlert, AuthButton, AuthDone, AuthField, AuthHeading, AuthSecondaryButton, AuthShell, authLink,
} from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const shake = useAnimation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setEmailError('Enter the email you signed up with.');
      shake.start({ x: [0, -8, 8, -5, 5, -2, 2, 0], transition: { duration: 0.45 } });
      return;
    }

    setIsLoading(true);
    try {
      await api('/auth/password/forgot', { method: 'POST', body: { email } });
      setSentTo(email);
    } catch (error) {
      const err = error as { status?: number };
      setErrorMsg(err.status === 429
        ? 'Too many requests. Wait a moment, then try again.'
        : 'We could not send the email right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const aside = { title: <>Locked<br />out?</>, text: 'Request a link and choose a new password. Your account and history stay as they are.' };

  if (sentTo) {
    return (
      <AuthShell aside={aside} close="/login">
        <AuthDone
          title="Check your email"
          action={
            <AuthSecondaryButton type="button" onClick={() => { setSentTo(null); setEmail(''); }}>
              Use a different email
            </AuthSecondaryButton>
          }
        >
          {/* Backend tidak memberi tahu apakah email terdaftar, jadi kalimatnya juga tidak memastikan */}
          <p>
            If an account uses <span className="font-medium text-white break-all">{sentTo}</span>, a link to set a
            new password is on its way. Open it on this device or any other.
          </p>
          <p className="mt-3 text-white/40">Nothing in your inbox after a few minutes? Check the spam folder.</p>
        </AuthDone>
      </AuthShell>
    );
  }

  return (
    <AuthShell aside={aside} close="/login" footer={<>Remembered it? <Link href="/login" className={authLink}>Sign in</Link></>}>
      <AuthHeading title="Reset your password">
        Enter the email you signed up with. We&apos;ll send you a link to choose a new password.
      </AuthHeading>

      <motion.form animate={shake} onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailError(undefined); setErrorMsg(null); }}
          error={emailError}
          disabled={isLoading}
        />
        <AuthAlert>{errorMsg}</AuthAlert>
        <div className="mt-2">
          <AuthButton type="submit" loading={isLoading}>{isLoading ? 'Sending link' : 'Send reset link'}</AuthButton>
        </div>
      </motion.form>
    </AuthShell>
  );
}
