'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { api } from '@/lib/api';
import {
  AuthAlert, AuthButton, AuthDone, AuthField, AuthHeading, AuthShell, authLink, authLinkButton as primaryLink,
} from '@/components/auth/AuthShell';
import { AuthWaiting } from '@/components/auth/SignedInNotice';

const REDIRECT_MS = 2500;

type Errors = { newPassword?: string; confirmPassword?: string };

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const shake = useAnimation();

  // Berhasil: ke halaman login setelah pesan terbaca
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.push('/login'), REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [done, router]);

  const aside = { title: <>Almost<br />done.</>, text: 'Choose a new password, then sign in with it on any device.' };

  if (!token) {
    return (
      <AuthShell aside={aside} close="/login">
        <AuthHeading title="This link is incomplete">
          The reset link is missing part of its address. Open it again from the email, or request a new one.
        </AuthHeading>
        <Link href="/forgot-password" className={primaryLink}>Request a new link</Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell aside={aside} close="/login">
        <AuthDone title="Password updated" action={<Link href="/login" className={primaryLink}>Sign in now</Link>}>
          <p>Sign in with your new password. Taking you to the sign-in page…</p>
        </AuthDone>
      </AuthShell>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const next: Errors = {};
    if (!newPassword) next.newPassword = 'Choose a new password.';
    else if (newPassword.length < 8) next.newPassword = 'Use at least 8 characters.';
    if (!confirmPassword) next.confirmPassword = 'Type the new password again.';
    else if (newPassword && confirmPassword !== newPassword) next.confirmPassword = 'The two passwords do not match.';
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      shake.start({ x: [0, -8, 8, -5, 5, -2, 2, 0], transition: { duration: 0.45 } });
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    try {
      await api('/auth/password/reset', { method: 'POST', body: { token, new_password: newPassword } });
      setDone(true);
    } catch (error) {
      const err = error as { status?: number };
      setErrorMsg(err.status === 400
        ? 'This link has expired or was already used. Request a new one.'
        : 'We could not update your password right now. Please try again.');
      shake.start({ x: [0, -8, 8, -5, 5, -2, 2, 0], transition: { duration: 0.45 } });
    } finally {
      setIsLoading(false);
    }
  };

  const clear = (field: keyof Errors) => {
    if (fieldErrors[field]) setFieldErrors(f => ({ ...f, [field]: undefined }));
    if (errorMsg) setErrorMsg(null);
  };

  return (
    <AuthShell aside={aside} close="/login" footer={<>Link expired? <Link href="/forgot-password" className={authLink}>Request a new one</Link></>}>
      <AuthHeading title="Set a new password">Use at least 8 characters. You will sign in with it from now on.</AuthHeading>

      <motion.form animate={shake} onSubmit={handleReset} noValidate className="flex flex-col gap-7">
        <AuthField
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={e => { setNewPassword(e.target.value); clear('newPassword'); }}
          error={fieldErrors.newPassword}
          disabled={isLoading}
        />
        <AuthField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={e => { setConfirmPassword(e.target.value); clear('confirmPassword'); }}
          error={fieldErrors.confirmPassword}
          disabled={isLoading}
        />
        <AuthAlert>{errorMsg}</AuthAlert>
        <div className="mt-2">
          <AuthButton type="submit" loading={isLoading}>{isLoading ? 'Saving' : 'Save new password'}</AuthButton>
        </div>
      </motion.form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthShell aside={{ title: <>Almost<br />done.</>, text: 'Choose a new password, then sign in with it on any device.' }} close="/login"><AuthWaiting label="Loading…" /></AuthShell>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
