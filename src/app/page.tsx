"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SignInCelebration from "@/components/auth/SignedInNotice";
import { AuthShell, LOGIN_ASIDE } from "@/components/auth/AuthShell";

import HomeLayout from "@/components/layout/HomeLayout";
import HeroSection from "@/components/section/HomeSection/HeroSection";
import AboutSection from "@/components/section/HomeSection/AboutSection";
import ProblemBackground from "@/components/section/HomeSection/ProblemBackground";
import SolutionSection from "@/components/section/HomeSection/Solution";
import ClosingSection from "@/components/section/HomeSection/ClosingSection";


function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoginSuccess = searchParams.get("login") === "success";

  useEffect(() => {
    if (isLoginSuccess) {
      router.replace("/login?login=success");
    }
  }, [isLoginSuccess, router]);
  // Kembali dari Google: tampilan sama persis dengan halaman login yang memeriksa sesi & menyapa user,
  // jadi perpindahan ke /login?login=success tidak terlihat sebagai halaman lain.
  if (isLoginSuccess) {
    return (
      <AuthShell aside={LOGIN_ASIDE}>
        <SignInCelebration via="google" ready={false} />
      </AuthShell>
    );
  }


  return (
    <HomeLayout>
      <HeroSection />
      <AboutSection />
      <ProblemBackground />
      <SolutionSection />
      <ClosingSection/>
    </HomeLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}