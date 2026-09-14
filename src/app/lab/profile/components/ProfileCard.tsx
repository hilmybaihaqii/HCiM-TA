'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, User as UserIcon } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface ProfileCardProps {
  isLoading: boolean;
  profile: UserProfile | null;
}

export default function ProfileCard({ isLoading, profile }: ProfileCardProps) {
  const getInitials = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return '?';
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return trimmed.substring(0, 2).toUpperCase();
  };

  const isAdmin = profile?.role === 'admin';

  // ==========================================
  // LOADING SKELETON
  // ==========================================
  if (isLoading) {
    return (
      <div className="bg-surface-white/60 border border-foreground/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 md:gap-10 shadow-sm w-full max-w-4xl animate-pulse">
        {/* Skeleton Avatar Box */}
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-foreground/5 shrink-0 mx-auto md:mx-0" />

        {/* Skeleton Text Data */}
        <div className="flex flex-col gap-6 justify-center flex-1 w-full">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-foreground/5 shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="w-16 h-2.5 bg-foreground/10 rounded" />
                <div className={`h-4 bg-foreground/5 rounded ${i === 1 ? 'w-56' : i === 0 ? 'w-40' : 'w-28'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTUAL CONTENT
  // ==========================================
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="bg-surface-white/60 backdrop-blur-md border border-foreground/10 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 shadow-sm w-full max-w-4xl"
    >
      {/* KIRI: Avatar Box */}
      <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center shrink-0 mx-auto md:mx-0">
        <span className="text-4xl md:text-6xl font-bold text-accent tracking-tighter">
          {profile ? getInitials(profile.name) : <UserIcon className="w-12 h-12 md:w-16 md:h-16" />}
        </span>
      </div>

      {/* KANAN: Text Information */}
      <div className="flex flex-col gap-6 justify-center min-w-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            <UserIcon className="w-4 h-4 text-muted" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Name</p>
            <p className="text-sm text-foreground font-medium truncate">{profile?.name || 'Unknown'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-muted" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-0.5">Email</p>
            <p className="text-sm text-foreground font-medium truncate">{profile?.email || 'No email provided'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            {isAdmin ? <Shield className="w-4 h-4 text-muted" /> : <UserIcon className="w-4 h-4 text-muted" />}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">System Role</p>
            <span className={`px-2.5 py-1 text-[9px] rounded-full uppercase tracking-widest font-mono font-medium inline-flex items-center gap-1.5 w-fit border ${
              isAdmin
                ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                : 'bg-foreground/5 text-muted border-foreground/10'
            }`}>
              {isAdmin ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
              {isAdmin ? 'Administrator' : 'User'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}