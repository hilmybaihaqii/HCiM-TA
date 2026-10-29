'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { api } from '@/lib/api';
import { setSessionFlag } from '@/lib/sessionFlag';
import {
  AuthAlert, AuthButton, AuthDivider, AuthField, AuthHeading, AuthSecondaryButton, AuthShell, GoogleMark, LOGIN_ASIDE, Spinner, authLink,
} from '@/components/auth/AuthShell';
import SignedInNotice, { AuthWaiting } from '@/components/auth/SignedInNotice';

const REDIRECT_S = 3;
const DEACTIVATED = 'This account has been deactivated. Contact an administrator to restore it.';

type Me = { display_name?: string; email?: string };
/** /auth/me bisa datang polos atau dibungkus { items: [...] } */
const readMe = (raw: unknown): Me => ((raw as { items?: Me[] } | null)?.items?.[0] ?? raw ?? {}) as Me;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Kembali dari Google (?login=success) atau dari link konfirmasi email (?verified=1).
  // Dibaca SEKALI saat halaman dibuka: URL dibersihkan di bawah, dan Next.js ikut memperbarui
  // searchParams. Kalau dihitung ulang tiap render, pengecekan sesi ikut dibatalkan di tengah jalan.
  const [via] = useState<'google' | 'email' | null>(() =>
    searchParams.get('login') === 'success' ? 'google' : searchParams.get('verified') === '1' ? 'email' : null);
  const [session, setSession] = useState<{ state: 'checking' | 'ready'; me?: Me } | null>(via ? { state: 'checking' } : null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Akun nonaktif: dikirim lewat ?status=deactivated atau ?error=invalid
  const [errorMsg, setErrorMsg] = useState<string | null>(() =>
    searchParams.get('status') === 'deactivated' || searchParams.get('error') === 'invalid' ? DEACTIVATED : null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const shake = useAnimation();
  const redirected = useRef(false);

  const triggerShake = () => shake.start({ x: [0, -8, 8, -5, 5, -2, 2, 0], transition: { duration: 0.45 } });

  const openLab = useCallback(() => {
    if (redirected.current) return;
    redirected.current = true;
    setSessionFlag();
    router.replace('/lab');
    router.refresh();
  }, [router]);

  // Pesan dari URL sudah dibaca: bersihkan URL supaya tidak muncul lagi saat reload
  useEffect(() => {
    if (searchParams.get('status') || searchParams.get('error')) window.history.replaceState(null, '', '/login');
  }, [searchParams]);

  // Setelah Google / konfirmasi email: pastikan sesi benar-benar ada sebelum masuk.
  // Sama seperti alur lama yang terbukti jalan: dijalankan sekali dan hasilnya tidak pernah dibatalkan
  // (membersihkan URL di bawah tidak boleh menghentikan pengecekan ini).
  const checked = useRef(false);
  useEffect(() => {
    if (!via || checked.current) return;
    checked.current = true;
    window.history.replaceState(null, '', '/login');
    api('/auth/me')
      .then(raw => setSession({ state: 'ready', me: readMe(raw) }))
      .catch(() => {
        api('/auth/logout', { method: 'POST' }).catch(() => {});
        setSession(null);
        setErrorMsg(via === 'google'
          ? 'Google sign-in did not finish. Please try again.'
          : 'Your email is confirmed. Sign in to continue.');
      });
  }, [via]);

  // Pindah otomatis ke lab setelah sapaan tampil sebentar
  useEffect(() => {
    if (session?.state !== 'ready') return;
    const timer = setTimeout(openLab, REDIRECT_S * 1000);
    return () => clearTimeout(timer);
  }, [session?.state, openLab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const next: typeof fieldErrors = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    if (!password) next.password = 'Enter your password.';
    if (next.email || next.password) {
      setFieldErrors(next);
      triggerShake();
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    try {
      await api('/auth/login', { method: 'POST', body: { email, password } });
      // Pastikan sesi sudah tersimpan sebelum masuk ke /lab
      await api('/auth/me');
      openLab();
    } catch (error) {
      setIsLoading(false);
      api('/auth/logout', { method: 'POST' }).catch(() => {});

      const err = error as { status?: number; message?: string; data?: { detail?: unknown; message?: string } };
      const backend = (typeof err.data?.detail === 'string' ? err.data.detail : err.data?.message ?? err.message ?? '').toLowerCase();

      if (backend.includes('deactivated') || backend.includes('inactive') || err.status === 423) {
        setErrorMsg(DEACTIVATED);
      } else if (err.status === 403) {
        setErrorMsg('Confirm your email first. Open the link we sent when you registered.');
      } else if (err.status === 401) {
        setErrorMsg('That email and password do not match. Check them and try again.');
      } else if (err.status === 429) {
        setErrorMsg('Too many attempts. Wait a moment, then try again.');
      } else {
        setErrorMsg('We could not sign you in right now. Please try again.');
      }
      triggerShake();
    }
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    window.location.href = `/api/auth/google?t=${Date.now()}`;
  };

  // Cek sesi & sapaan tampil di panel yang sama dengan formulir (bukan layar penuh)
  if (session?.state === 'checking') {
    return (
      <AuthShell aside={LOGIN_ASIDE}>
        <AuthWaiting google={via === 'google'} label={via === 'google' ? 'Verifying your Google sign-in' : 'Confirming your email'} />
      </AuthShell>
    );
  }
  if (session?.state === 'ready' && via) {
    return (
      <AuthShell aside={LOGIN_ASIDE}>
        <SignedInNotice via={via} name={session.me?.display_name} email={session.me?.email} seconds={REDIRECT_S} />
      </AuthShell>
    );
  }

  const busy = isLoading || googleLoading;
  const clear = (field: 'email' | 'password') => {
    if (fieldErrors[field]) setFieldErrors(f => ({ ...f, [field]: undefined }));
    if (errorMsg) setErrorMsg(null);
  };

  return (
    <AuthShell
      aside={LOGIN_ASIDE}
      footer={<>New to Cardivex? <Link href="/register" className={authLink}>Create an account</Link></>}
    >
      <AuthHeading title="Sign in">Use the email and password you registered with, or continue with Google.</AuthHeading>

      <motion.form animate={shake} onSubmit={handleSignIn} noValidate className="flex flex-col gap-7">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); clear('email'); }}
          error={fieldErrors.email}
          disabled={busy}
        />
        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder='Password'
          value={password}
          onChange={e => { setPassword(e.target.value); clear('password'); }}
          error={fieldErrors.password}
          disabled={busy}
          hint={<Link href="/forgot-password" className="text-[13px] text-white/45 transition-colors hover:text-white">Forgot password?</Link>}
        />

        <AuthAlert>{errorMsg}</AuthAlert>

        <div className="mt-2 flex flex-col gap-4">
          <AuthButton type="submit" loading={isLoading} disabled={googleLoading}>{isLoading ? 'Signing in' : 'Sign in'}</AuthButton>
          <AuthDivider />
          <AuthSecondaryButton type="button" onClick={handleGoogle} disabled={busy}>
            {googleLoading ? <Spinner /> : <GoogleMark />}
            Continue with Google
          </AuthSecondaryButton>
        </div>
      </motion.form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell aside={LOGIN_ASIDE}><AuthWaiting label="Loading…" /></AuthShell>}>
      <LoginForm />
    </Suspense>
  );
}
