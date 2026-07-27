"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
      router.push("/login?login=success");
    }
  }, [isLoginSuccess, router]);
  if (isLoginSuccess) {
    return (
      <div className="fixed inset-0 z-100 flex h-screen w-full flex-col items-center justify-center bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6"
        >
          <Loader2
            className="w-7 h-7 text-white/80 animate-spin"
            strokeWidth={1.5}
          />

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