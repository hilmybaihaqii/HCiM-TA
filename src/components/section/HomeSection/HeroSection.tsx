"use client";

import React, { useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSplash } from "../../SplashProvider";
import { accentSerif } from "@/lib/fonts";
import BubbleLink from "@/components/ui/BubbleLink";

gsap.registerPlugin(useGSAP);

const Heart3D = dynamic(() => import("../../ui/Heart3D"), {
  ssr: false,
  loading: () => <Heart3DPlaceholder />,
});

function Heart3DPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-24 h-24 rounded-full bg-foreground/5 blur-xl" />
    </div>
  );
}

const BG_LINES = ["IN SILICO", "PREDICTION"];
const HEADLINE: ReactNode[] = [
  <>
    Know a drug&apos;s <em className={`${accentSerif.className} italic pr-[0.04em] text-[1.08em] font-normal tracking-normal`}>heart risk</em>
  </>,
  "before it reaches",
  "a patient.",
];

/* =========================================================
   HERO
   ========================================================= */
export default function HeroSection() {
  const { splashStarted, splashDone } = useSplash();
  const scope = useRef<HTMLElement>(null);

  // Hide the intro pieces before first paint, then play them once the splash screen leaves.
  useGSAP(
    () => {
      gsap.set(".hero-char", { yPercent: 105 });
      gsap.set(".hero-line", { yPercent: 110 });
      gsap.set(".hero-fade", { autoAlpha: 0, y: 16 });
    },
    { scope },
  );

  useGSAP(
    () => {
      if (!splashDone) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(".hero-char", { yPercent: 0, duration: 1.6, stagger: 0.045 })
        .to(".hero-line", { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.5)
        .to(".hero-fade", { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.75);
    },
    { scope, dependencies: [splashDone] },
  );

  /*
   * Layout:
   * - Desktop (md+): satu layar penuh, top row / jantung / headline ditumpuk absolut.
   * - HP: alur biasa dari atas ke bawah: label → jantung besar + teks background →
   *   headline & subheader. Tombol muncul setelah scroll sedikit.
   */
  return (
    <section ref={scope} className="relative w-full bg-background font-sans overflow-hidden md:h-svh md:min-h-[640px]">
      <div className="relative w-full md:h-full">
        {/* ================= TOP ROW ================= */}
        <div className="relative md:absolute md:inset-x-0 md:top-0 z-20 pointer-events-none pt-24 md:pt-32">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex items-start justify-between gap-3 sm:gap-6">
            <div className="hero-fade flex flex-col gap-3">
              <span className="self-start rounded-full border border-foreground/15 bg-surface-white/50 px-3.5 py-1.5 text-[11px] md:text-xs font-medium text-foreground backdrop-blur-sm">
                Cardiotoxicity screening platform
              </span>
              <p className="hidden md:block max-w-[15rem] text-xs text-muted leading-relaxed">
                Built on the FDA CiPA framework and the O&apos;Hara-Rudy human ventricular cell model.
              </p>
            </div>

            {/* Versi HP dipendekkan supaya muat sejajar label kiri dan bagian atas tetap seimbang. */}
            <p className="hero-fade flex flex-col items-end gap-0.5 sm:gap-1 pt-1 sm:pt-0 text-right shrink-0">
              <span className="text-[11px] sm:text-xs md:text-sm font-medium text-foreground">
                <span className="sm:hidden">For pharma R&amp;D</span>
                <span className="hidden sm:inline">For drug discovery teams</span>
              </span>
              <span className="text-[10px] sm:text-[11px] md:text-xs text-muted">
                <span className="sm:hidden">CROs · Research labs</span>
                <span className="hidden sm:inline">Pharma R&amp;D · CROs · Research labs</span>
              </span>
            </p>
          </div>
        </div>

        {/* ================= STAGE: teks background + jantung ================= */}
        <div className="relative h-[56svh] md:absolute md:inset-0 md:h-auto">
          <div aria-hidden className="absolute top-[46%] md:top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none z-0 w-full">
            {BG_LINES.map((line, li) => (
              <div
                key={line}
                className="flex overflow-hidden whitespace-pre text-[15.5vw] md:text-[min(13.5vw,20svh)] font-black uppercase leading-[0.86] md:leading-[0.82] tracking-tighter py-[0.08em] -my-[0.08em] px-[0.04em]"
              >
                {line.split("").map((ch, ci) => (
                  <span
                    key={ci}
                    className={`hero-char inline-block ${li === 0 ? "text-transparent" : "text-foreground/5"}`}
                    style={li === 0 ? { WebkitTextStroke: "2px rgba(43, 34, 35, 0.07)" } : undefined}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="absolute inset-0 z-10">
            {splashStarted ? <Heart3D /> : <Heart3DPlaceholder />}
          </div>

          {/* Desktop: sisi kiri/kanan di luar max-w-7xl tetap bisa dipakai scroll, bukan memutar jantung. */}
          <div className="absolute inset-0 z-[15] hidden md:flex pointer-events-none">
            <div className="flex-1 h-full pointer-events-auto" />
            <div className="w-full max-w-7xl h-full pointer-events-none" />
            <div className="flex-1 h-full pointer-events-auto" />
          </div>
        </div>

        {/* ================= HEADLINE + CTA ================= */}
        <div className="relative md:absolute md:inset-x-0 md:bottom-0 z-20 pointer-events-none pb-14 md:pb-11">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between items-stretch lg:items-end gap-9 md:gap-8">
            <div className="w-full lg:max-w-[34rem] pointer-events-auto">
              <h1 className="mb-4 md:mb-5 text-[2rem] sm:text-4xl lg:text-[2.6rem] font-medium leading-[1.04] tracking-[-0.03em] text-foreground">
                {HEADLINE.map((line, i) => (
                  <span key={i} className="block overflow-hidden pb-[0.08em]">
                    <span className="hero-line block">{line}</span>
                  </span>
                ))}
              </h1>
              <p className="hero-fade max-w-sm text-sm text-muted leading-relaxed">
                Cardivex simulates a human heart cell and classifies a compound&apos;s Torsade de Pointes risk. No animal testing.
              </p>
            </div>

            <div className="hero-fade flex flex-row w-full lg:w-auto gap-2 md:gap-3 pointer-events-auto shrink-0 [&>*]:flex-1 lg:[&>*]:flex-none">
              <BubbleLink href="#architecture">How it works</BubbleLink>
              <BubbleLink href="/login" primary>
                Run prediction
              </BubbleLink>
            </div>
          </div>
        </div>

        {/* ================= SCROLL CUE (Z-20) ================= */}
        <a
          href="#about"
          aria-label="Scroll to the next section"
          className="hero-fade group absolute bottom-8 md:bottom-11 left-1/2 -translate-x-1/2 z-20 hidden xl:flex flex-col items-center gap-2 p-2"
        >
          {/* wheel fades in at the top, glides down, fades out: a seamless loop */}
          <span className="relative flex justify-center w-[20px] h-[30px] rounded-full border-2 border-foreground/45 transition-[border-color,transform] duration-500 ease-out group-hover:border-foreground group-hover:-translate-y-0.5">
            <motion.span
              className="absolute top-[5px] w-[3px] h-[6px] rounded-full bg-foreground"
              animate={{ y: [0, 8], opacity: [0, 1, 0] }}
              transition={{
                y: { duration: 1.8, ease: [0.45, 0, 0.55, 1], repeat: Infinity },
                opacity: { duration: 1.8, times: [0, 0.25, 1], ease: "easeInOut", repeat: Infinity },
              }}
            />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-muted transition-colors duration-500 group-hover:text-foreground">Scroll</span>
        </a>
      </div>
    </section>
  );
}
