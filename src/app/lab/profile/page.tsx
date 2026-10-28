'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LabPageHeader from '../components/LabPageHeader';
import LabContainer from '../components/LabContainer';
import { Bone, HeaderSkeleton } from '../components/Skeletons';
import { useSearchParams } from 'next/navigation';
import { useSessionUser } from '@/components/SessionGuard';

import ProfileCard from './components/ProfileCard';
import SecuritySettings from './components/SecuritySettings';
import DangerZone from './components/DangerZone';

function ProfileOrchestrator() {
  const searchParams = useSearchParams();
  const user = useSessionUser();

  // Data profil diambil dari sesi (SessionGuard), tanpa panggilan /auth/me tambahan
  const profile = {
    name: user.display_name || 'Unknown',
    email: user.email || 'No email',
    role: user.role,
  };

  const [activeTab, setActiveTab] = useState<'security' | 'danger'>('security');
  // Dihitung langsung saat inisialisasi (bukan lewat effect), karena searchParams
  // sudah tersedia secara sinkron pas render pertama — gak perlu "menyusul" lewat effect.
  const [initialPwdStep] = useState<'request' | 'form'>(() =>
    searchParams.get('action') === 'change-password' ? 'form' : 'request'
  );

  const canShowDangerZone = profile.role !== 'admin';

  return (
    <div className="w-full flex flex-col text-foreground overflow-x-hidden">
      {/* Lebar "narrow" (max-w-4xl) sama dengan ProfileCard/tabs/content di bawah, supaya ikut center */}
      <LabContainer size="narrow">

        <div className="mb-8 sm:mb-10">
          <LabPageHeader
            eyebrow="Profile"
            title="Your account."
            accent="Kept safe."
            description="Your details, your password, and the option to deactivate your account."
          />
        </div>

        {/* 1. Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-10 sm:mb-12"
        >
          <ProfileCard isLoading={false} profile={profile} />
        </motion.div>

        {/* 2. Tabs Navigation dengan sliding underline */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-6 sm:gap-8 border-b border-foreground/10 mb-8 overflow-x-auto scrollbar-hide"
        >
          <button
            onClick={() => setActiveTab('security')}
            className={`relative pb-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'security' ? 'text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            Security & Password
            {activeTab === 'security' && (
              <motion.div
                layoutId="profile-tab-underline"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-foreground rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
          </button>

          {canShowDangerZone && (
            <button
              onClick={() => setActiveTab('danger')}
              className={`relative pb-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeTab === 'danger' ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`}
            >
              Danger Zone
              {activeTab === 'danger' && (
                <motion.div
                  layoutId="profile-tab-underline"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-foreground rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          )}
        </motion.div>

        {/* 3. Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'security' && <SecuritySettings initialStep={initialPwdStep} />}
            {activeTab === 'danger' && canShowDangerZone && <DangerZone />}
          </motion.div>
        </AnimatePresence>

      </LabContainer>
    </div>
  );
}

// Dibungkus Suspense karena pakai useSearchParams()
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <LabContainer size="narrow" className="flex flex-col gap-10">
        <HeaderSkeleton />
        <Bone className="h-56 rounded-sheet" />
      </LabContainer>
    }>
      <ProfileOrchestrator />
    </Suspense>
  );
}