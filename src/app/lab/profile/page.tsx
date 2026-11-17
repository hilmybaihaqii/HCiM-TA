'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSessionUser } from '@/components/SessionGuard';
import LabPageHeader from '../components/LabPageHeader';
import LabContainer from '../components/LabContainer';
import { Bone, HeaderSkeleton } from '../components/Skeletons';
import IdentityCard from './components/IdentityCard';
import PasswordSection from './components/PasswordSection';
import DeactivateSection from './components/DeactivateSection';

/*
 * Profil: kartu identitas & ringkasan aktivitas di kiri (menempel saat digulir di layar lebar),
 * pengaturan di kanan sebagai baris berjudul yang dipisah garis tipis (bukan tab), supaya semua
 * pilihan terlihat sekaligus.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

function SettingRow({ id, title, text, children, delay = 0 }: {
  id: string;
  title: string;
  text: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      aria-labelledby={id}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className="grid grid-cols-1 xl:grid-cols-[14rem_1fr] gap-5 xl:gap-10 border-t border-foreground/10 py-9 first:border-t-0 first:pt-0"
    >
      <div>
        <h2 id={id} className="text-lg font-medium tracking-tight text-foreground">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{text}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </motion.section>
  );
}

function ProfileContent() {
  const user = useSessionUser();
  const searchParams = useSearchParams();
  // Dibuka dari link "?action=change-password": langsung ke langkah password baru
  const [initialStep] = useState<'request' | 'form'>(() => (searchParams.get('action') === 'change-password' ? 'form' : 'request'));
  const isAdmin = user.role === 'admin';
  const email = user.email || 'your email';

  return (
    <div className="w-full flex flex-col text-foreground">
      <LabContainer className="flex flex-col gap-12 md:gap-16">
        <LabPageHeader
          eyebrow="Profile"
          title="Your account"
          accent="and sign-in."
          description="Your details, your activity on Cardivex, and how you sign in."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,24rem)_1fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <IdentityCard user={user} />
          </div>

          <div>
            <SettingRow
              id="password-heading"
              title="Password"
              text="Changing it takes a code we email you, so only you can do it."
            >
              <PasswordSection email={email} initialStep={initialStep} />
            </SettingRow>

            {isAdmin ? (
              <SettingRow id="deactivate-heading" title="Deactivate account" text="Stop this account from signing in." delay={0.08}>
                <p className="rounded-card bg-foreground/[0.04] px-4 py-3.5 text-sm leading-relaxed text-foreground/70">
                  Administrator accounts can&apos;t be deactivated from the profile page.
                </p>
              </SettingRow>
            ) : (
              <SettingRow
                id="deactivate-heading"
                title="Deactivate account"
                text="Stop this account from signing in. You can ask an administrator to restore it."
                delay={0.08}
              >
                <DeactivateSection email={email} />
              </SettingRow>
            )}
          </div>
        </div>
      </LabContainer>
    </div>
  );
}

// Dibungkus Suspense karena memakai useSearchParams()
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <LabContainer className="flex flex-col gap-12">
        <HeaderSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-[24rem_1fr] gap-12">
          <Bone className="h-72 rounded-sheet" />
          <Bone className="h-72 rounded-sheet" />
        </div>
      </LabContainer>
    }>
      <ProfileContent />
    </Suspense>
  );
}
