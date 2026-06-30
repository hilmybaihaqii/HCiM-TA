"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* --- Helper memecah karakter untuk animasi presisi --- */
const Chars = ({ text }: { text: string }) => (
  <>
    {text.split("").map((c, i) => (
      <span key={i} className="char inline-block will-change-transform">
        {c === " " ? "\u00A0" : c}
      </span>
    ))}
  </>
);

export default function SplashScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const greetingWrapRef = useRef<HTMLDivElement>(null);
  const welcomeWrapRef = useRef<HTMLDivElement>(null);
  const visualWrapRef = useRef<HTMLDivElement>(null);
  const mainTextWrapRef = useRef<HTMLDivElement>(null);
  const wordWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      const navbar = document.querySelector(".main-navbar");
      if (navbar) {
        gsap.set(navbar, { yPercent: -100, opacity: 0 });
      }

      /* =========================================
       PHASE 0: AESTHETIC GRID & MINIMAL LINES
       ========================================= */
      tl.to(".bg-grid", { opacity: 1, duration: 2.5, ease: "power2.inOut" }, 0);

      tl.fromTo(
        ".line-accent",
        { scaleX: 0 },
        { scaleX: 1, duration: 2, ease: "expo.inOut", stagger: 0.2 },
        0,
      );

      /* =========================================
       PHASE 1: TRUE VERTICAL SLOT CYLINDER
       ========================================= */
      const words = gsap.utils.toArray(".audiens-word") as HTMLElement[];
      const wrapper = wordWrapperRef.current;

      gsap.set(words, { yPercent: -100, opacity: 0 });

      if (wrapper && words[0]) {
        gsap.set(wrapper, { width: words[0].offsetWidth });
      }

      // Teks "Hello," masuk
      tl.fromTo(
        ".hello-char",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          stagger: 0.04,
        },
        0.3,
      );

      // Silinder Kata Pertama (Doctors.)
      tl.to(
        words[0],
        { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out" },
        "<0.2",
      );

      // Putaran Silinder Mekanikal
      for (let i = 1; i < words.length; i++) {
        const prevWord = words[i - 1];
        const currentWord = words[i];

        const delayTime = 0.65; // Jeda membaca sedikit diperpanjang agar rileks

        tl.to(prevWord, {
          yPercent: 100,
          opacity: 0,
          duration: 0.7,
          ease: "expo.inOut",
          delay: delayTime,
        });
        tl.to(
          currentWord,
          { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.inOut" },
          "<",
        );

        if (wrapper) {
          tl.to(
            wrapper,
            {
              width: currentWord.offsetWidth,
              duration: 0.7,
              ease: "expo.inOut",
            },
            "<",
          );
        }
      }

      // Tarik sapaan pertama ke atas dengan elegan
      tl.to(greetingWrapRef.current, {
        yPercent: -60,
        opacity: 0,
        duration: 0.8,
        ease: "expo.inOut",
        delay: 0.5,
      });

      /* =========================================
       PHASE 1.5: THE "WELCOME TO" BRIDGE
       ========================================= */
      gsap.set(welcomeWrapRef.current, { autoAlpha: 1 });

      tl.fromTo(
        ".welcome-char",
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.03,
          ease: "expo.out",
        },
        "-=0.3", // Muncul sesaat sebelum sapaan "Hello" benar-benar lenyap
      );

      // Tahan "Welcome to." sejenak, lalu tarik ke atas
      tl.to(welcomeWrapRef.current, {
        yPercent: -60,
        opacity: 0,
        duration: 0.8,
        ease: "expo.inOut",
        delay: 0.6,
      });

      /* =========================================
       PHASE 2: RED HEARTBEAT (CLEAN DRAW)
       ========================================= */
      tl.set(visualWrapRef.current, { autoAlpha: 1 });

      tl.fromTo(
        ".sci-ecg",
        { strokeDasharray: 200, strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 1.5, ease: "power3.inOut" },
        "-=0.2",
      );

      tl.to(
        visualWrapRef.current,
        {
          y: -30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.inOut",
        },
        "+=0.3",
      );

      /* =========================================
       PHASE 3: SHIFT TYPOGRAPHY & MICRO-LABEL
       ========================================= */
      tl.set(mainTextWrapRef.current, { y: 30, autoAlpha: 1 });

      tl.fromTo(
        ".micro-label",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "expo.out" },
      );

      tl.fromTo(
        ".main-line-1 .char",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.02,
          ease: "expo.out",
        },
        "<",
      );

      tl.to(
        mainTextWrapRef.current,
        { y: 0, duration: 1, ease: "expo.inOut" },
        "+=0.1",
      );

      tl.fromTo(
        ".main-line-2 .char",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.015,
          ease: "expo.out",
        },
        "<",
      );

      /* =========================================
       PHASE 4: EXIT SPLASH (OPEN CURTAIN)
       ========================================= */
      tl.to(
        ".micro-label, .main-line-1 .char, .main-line-2 .char",
        {
          yPercent: -100,
          opacity: 0,
          duration: 0.6,
          stagger: 0.005,
          ease: "expo.inOut",
        },
        "+=1.5",
      ); // Jeda cukup lama agar pengguna bisa membaca pesan utama

      tl.to(
        ".line-accent, .bg-grid",
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "<",
      );

      tl.to(
        overlayRef.current,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.2,
          ease: "expo.inOut",
        },
        "-=0.3",
      );

      if (navbar) {
        tl.to(
          navbar,
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            ease: "expo.out",
          },
          "-=0.8",
        );
      }
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-[#FAFAFA] text-black font-sans"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      >
        {/* === AESTHETIC BACKGROUND === */}
        <div
          className="bg-grid absolute inset-0 z-0 opacity-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#0000000A 1px, transparent 1px), linear-gradient(90deg, #0000000A 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="line-accent absolute left-6 md:left-12 top-8 md:top-12 h-px w-20 sm:w-28 md:w-36 bg-black origin-left z-0" />
        <div className="line-accent absolute right-6 md:right-12 bottom-8 md:bottom-12 h-px w-20 sm:w-28 md:w-36 bg-black origin-right z-0" />

        {/* PHASE 1: HELLO CYLINDER */}
        <div
          ref={greetingWrapRef}
          className="absolute z-20 flex items-center justify-center w-full px-4 text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight"
        >
          <div className="flex items-center">
            <span className="flex overflow-hidden">
              {"Hello,".split("").map((c, i) => (
                <span key={i} className="hello-char inline-block pb-2 pt-1">
                  {c}
                </span>
              ))}
            </span>
            <span className="inline-block pb-2 pt-1">&nbsp;</span>
            <div
              ref={wordWrapperRef}
              className="relative h-[1.2em] overflow-hidden flex items-center"
            >
              <span className="audiens-word absolute left-0 text-neutral-800 whitespace-nowrap leading-none pb-2 pt-1">
                Doctors.
              </span>
              <span className="audiens-word absolute left-0 text-neutral-800 whitespace-nowrap leading-none pb-2 pt-1">
                Researchers.
              </span>
              <span className="audiens-word absolute left-0 text-neutral-800 whitespace-nowrap leading-none pb-2 pt-1">
                Scientists.
              </span>
            </div>
          </div>
        </div>

        {/* PHASE 1.5: THE "WELCOME TO" BRIDGE */}
        <div
          ref={welcomeWrapRef}
          className="absolute z-20 flex items-center justify-center w-full px-4 invisible"
        >
          <div className="overflow-hidden flex">
            {"Welcome to.".split("").map((c, i) => (
              <span
                key={i}
                className="welcome-char block text-sm sm:text-base font-mono uppercase tracking-[0.3em] text-neutral-500 font-medium pb-1"
              >
                {c === " " ? "\u00A0" : c}
              </span>
            ))}
          </div>
        </div>

        {/* PHASE 2: RED HEARTBEAT */}
        <div
          ref={visualWrapRef}
          className="invisible absolute z-10 w-44 h-24 md:w-72 md:h-36 flex items-center justify-center"
        >
          <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
            <path
              className="sci-ecg"
              d="M 5 25 L 25 25 L 32 25 L 36 15 L 42 45 L 50 5 L 56 35 L 62 25 L 75 25 L 95 25"
              fill="none"
              stroke="#E63946" /* Berubah menjadi merah khas identitas logo */
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* PHASE 3: MAIN TYPOGRAPHY */}
        <div
          ref={mainTextWrapRef}
          className="absolute z-30 flex flex-col items-center justify-center w-full px-4 md:px-8 text-center will-change-transform invisible"
        >
          <div className="micro-label overflow-hidden mb-4 md:mb-6">
            <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-neutral-500">
              Ensemble Architecture
            </span>
          </div>

          <div className="overflow-hidden pb-1 md:pb-2">
            <h1 className="main-line-1 block text-[11vw] sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-black leading-none whitespace-nowrap">
              <Chars text="Cardiotoxicity." />
            </h1>
          </div>

          <div className="overflow-hidden pt-2 pb-2 mt-2">
            <h1 className="main-line-2 block text-[4.5vw] sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-700 whitespace-nowrap">
              <Chars text="Prediction for animal-free testing." />
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
