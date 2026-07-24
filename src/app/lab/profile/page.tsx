'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

import ProfileCard from './components/ProfileCard';
import SecuritySettings from './components/SecuritySettings';
import DangerZone from './components/DangerZone';

interface UserProfileData {
  display_name?: string;
  email?: string;
  role?: string;
}

interface AuthMeResponse {
  items?: UserProfileData[];
  display_name?: string;
  email?: string;
  role?: string;
}

function ProfileOrchestrator() {
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string; email: string; role: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'security' | 'danger'>('security');
  // Dihitung langsung saat inisialisasi (bukan lewat effect), karena searchParams
  // sudah tersedia secara sinkron pas render pertama — gak perlu "menyusul" lewat effect.
  const [initialPwdStep] = useState<'request' | 'form'>(() =>
    searchParams.get('action') === 'change-password' ? 'form' : 'request'
  );

  useEffect(() => {
    // Ambil data profil
    api('/auth/me')
      .then((res: unknown) => {
        const rawData = res as AuthMeResponse;
        const data = rawData?.items ? rawData.items[0] : rawData;

        setProfile({
          name: data?.display_name || 'Unknown',
          email: data?.email || 'No email',
          role: data?.role?.toLowerCase() || 'user'
        });
      })
      .catch(() => console.warn("Failed to load profile data."))
      .finally(() => setIsLoading(false));
  }, []);

  const canShowDangerZone = !isLoading && profile?.role !== 'admin';

  return (
    <div className="w-full flex flex-col text-foreground overflow-x-hidden pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 min-h-screen">
      {/* PENTING: max-width di sini disamakan (max-w-4xl) dengan max-width ProfileCard/tabs/content
          di bawah. Sebelumnya wrapper ini pakai max-w-7xl sementara isinya max-w-4xl tanpa mx-auto
          sendiri, jadi konten nempel ke kiri wrapper yang lebih lebar alih-alih ikut center. */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">

        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-6 sm:mb-8"
        >
          Profile Settings
        </motion.h1>

        {/* 1. Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-10 sm:mb-12"
        >
          <ProfileCard isLoading={isLoading} profile={profile} />
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

      </div>
    </div>
  );
}

// Dibungkus Suspense karena pakai useSearchParams()
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    }>
      <ProfileOrchestrator />
    </Suspense>
  );
}