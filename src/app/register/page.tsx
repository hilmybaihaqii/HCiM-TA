'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { api } from '@/lib/api';
import {
  AuthAlert, AuthButton, AuthDone, AuthField, AuthHeading, AuthShell, authLink, authLinkButton,
} from '@/components/auth/AuthShell';

type Errors = { displayName?: string; email?: string; password?: string };

const ASIDE = {
  title: <>Start<br />screening.</>,
  text: 'One account to run the full pipeline, test your own biomarkers, and keep every result in one history.',
};

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const shake = useAnimation();

  const triggerShake = () => shake.start({ x: [0, -8, 8, -5, 5, -2, 2, 0], transition: { duration: 0.45 } });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const next: Errors = {};
    if (!displayName.trim()) next.displayName = 'Enter your full name.';
    if (!email.trim()) next.email = 'Enter your email address.';
    if (!password) next.password = 'Choose a password.';
    else if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      triggerShake();
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    try {
      await api('/auth/register', { method: 'POST', body: { email, password, display_name: displayName } });
      setSentTo(email);
      setDisplayName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      const err = error as { status?: number };
      if (err.status === 409) {
        setFieldErrors({ email: 'An account with this email already exists. Sign in instead.' });
      } else if (err.status === 429) {
        setErrorMsg('Too many attempts. Wait a moment, then try again.');
      } else {
        setErrorMsg('We could not create your account right now. Check your details and try again.');
      }
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const clear = (field: keyof Errors) => {
    if (fieldErrors[field]) setFieldErrors(f => ({ ...f, [field]: undefined }));
    if (errorMsg) setErrorMsg(null);
  };

  if (sentTo) {
    return (
      <AuthShell aside={ASIDE}>
        <AuthDone
          title="Check your email"
          action={<Link href="/login" className={authLinkButton}>Go to sign in</Link>}
        >
          <p>
            Your account is created. We sent a confirmation link to{' '}
            <span className="font-medium text-white break-all">{sentTo}</span>. Open it to confirm your email, then sign in.
          </p>
          <p className="mt-3 text-white/40">Nothing in your inbox? Check the spam folder.</p>
        </AuthDone>
      </AuthShell>
    );
  }

  return (
    <AuthShell aside={ASIDE} footer={<>Already have an account? <Link href="/login" className={authLink}>Sign in</Link></>}>
      <AuthHeading title="Create an account">
        We&apos;ll email you a link to confirm your address before you sign in.
      </AuthHeading>

      <motion.form animate={shake} onSubmit={handleRegister} noValidate className="flex flex-col gap-7">
        <AuthField
          label="Full name"
          autoComplete="name"
          placeholder="Full Name"
          value={displayName}
          onChange={e => { setDisplayName(e.target.value); clear('displayName'); }}
          error={fieldErrors.displayName}
          disabled={isLoading}
        />
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); clear('email'); }}
          error={fieldErrors.email}
          disabled={isLoading}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={e => { setPassword(e.target.value); clear('password'); }}
          error={fieldErrors.password}
          disabled={isLoading}
        />

        <AuthAlert>{errorMsg}</AuthAlert>

        <div className="mt-2">
          <AuthButton type="submit" loading={isLoading}>{isLoading ? 'Creating account' : 'Create account'}</AuthButton>
        </div>
      </motion.form>
    </AuthShell>
  );
}
