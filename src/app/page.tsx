'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

import HomeLayout from "@/components/layout/HomeLayout";
import HeroSection from "@/components/section/HeroSection";
import AboutSection from "@/components/section/AboutSection";
import ProblemBackground from "@/components/section/ProblemBackground";
import SolutionSection from "@/components/section/Solution";
import ModelFlowSection from "@/components/section/ModelFlowSection";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Deteksi apakah user baru saja berhasil login via Google
  const isLoginSuccess = searchParams.get('login') === 'success';

  useEffect(() => {
    if (isLoginSuccess) {
      // Verifikasi sesi cookie ke backend
      api("/auth/me")
        .then(() => {
          // Jika aman, langsung masukkan ke Lab
          router.push('/lab');
        })
        .catch(() => {
          // Jika gagal, kembalikan ke login
          router.push('/login');
        });
    }
  }, [isLoginSuccess, router]);

  // =======================================================================
  // JIKA SEDANG REDIRECT: TAMPILKAN LOADING SCREEN SIMPEL & ESTETIK
  // =======================================================================
  if (isLoginSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex h-screen w-full flex-col items-center justify-center bg-[#0A0A0A]">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6"
        >
          {/* Spinner Minimalis yang Clean */}
          <Loader2 className="w-7 h-7 text-white/80 animate-spin" strokeWidth={1.5} />
          
          {/* Teks elegan, tidak terlalu "AI" */}
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-base font-medium tracking-tight text-white">
              Authentication Successful
            </h2>
            <p className="text-xs text-white/50 tracking-wide">
              Redirecting, please wait...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // =======================================================================
  // JIKA KUNJUNGAN BIASA: TAMPILKAN LANDING PAGE
  // =======================================================================
  return (
    <HomeLayout>
      <HeroSection />
      <AboutSection />
      <ProblemBackground />
      <SolutionSection />
      <ModelFlowSection />
    </HomeLayout>
  );
}

export default function Home() {
  return (
    // Membungkus seluruh konten dengan Suspense agar aman saat Build
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}