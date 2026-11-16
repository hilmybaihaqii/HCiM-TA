"use client";

import React, { useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import {
  useSplash,
  SPLASH_MIN_DISPLAY_MS,
  SPLASH_CHECKPOINT_MS,
  SPLASH_SAFETY_TIMEOUT_MS,
} from "./SplashProvider";

// lagSmoothing(0) sengaja tidak dipakai. Dengan bawaan GSAP, jeda sesaat
// tidak membuat animasi melompat untuk mengejar waktu.

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const Chars = React.memo(
  ({ text, accentLastChar = false }: { text: string; accentLastChar?: boolean }) => (
    <>
      {text.split("").map((c, i) => {
        const isAccent = accentLastChar && i === text.length - 1;
        return (
          <span key={i} className={`char inline-block ${isAccent ? "text-accent" : ""}`}>
            {c === " " ? "\u00A0" : c}
          </span>
        );
      })}
    </>
  ),
);
Chars.displayName = "Chars";

/**
 * Splash pembuka hanya untuk halaman utama (/), sekali per tab.
 */
export default function SplashScreen() {
  const pathname = usePathname();
  const { splashDone } = useSplash();
  const reducedMotion = usePrefersReducedMotion();

  if (pathname !== "/" || splashDone) return null;

  return reducedMotion ? <SplashReducedMotion /> : <SplashIntro />;
}

/* =========================================================
   ACCESSIBILITY: REDUCED MOTION VARIANT (NO KINETIC ANIMATIONS)
   ========================================================= */

const REDUCED_MOTION_FLOOR_MS = 600;

function SplashReducedMotion() {
  const { pageReady, setSplashDone, setSplashStarted } = useSplash();
  const overlayRef = useRef<HTMLDivElement>(null);
  const floorPassedRef = useRef(false);

  useEffect(() => {
    setSplashStarted(true);
  }, [setSplashStarted]);

  const handleDismiss = useCallback(() => {
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => setSplashDone(true),
      });
    } else {
      setSplashDone(true);
    }
  }, [setSplashDone]);

  useEffect(() => {
    const timer = setTimeout(() => {
      floorPassedRef.current = true;
      if (pageReady) {
        handleDismiss();
      }
    }, REDUCED_MOTION_FLOOR_MS);
    return () => clearTimeout(timer);
  }, [pageReady, handleDismiss]);

  useEffect(() => {
    if (floorPassedRef.current && pageReady) {
      handleDismiss();
    }
  }, [pageReady, handleDismiss]);

  return (
    <div data-splash>
      <div
        ref={overlayRef}
        role="region"
        aria-label="Loading application"
        className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] text-black font-sans"
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Skip introductory splash screen"
          className="absolute top-6 right-6 md:top-8 md:right-10 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/15 bg-surface-white/80 hover:bg-surface-white text-xs font-medium text-foreground/80 hover:text-foreground backdrop-blur-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          <span>Skip</span>
          <span aria-hidden="true" className="text-foreground/40 font-mono text-[10px]">↵</span>
        </button>

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-foreground/10 bg-surface-white/60 text-xs font-mono uppercase tracking-[0.2em] text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Ensemble Architecture
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-3">
            Cardiotoxicity<span className="text-accent">.</span>
          </h1>
          <p className="text-base sm:text-xl text-muted font-medium mb-6">
            Prediction for animal-free testing.
          </p>
          <p className="text-xs text-foreground/50 font-mono tracking-wider">
            Preparing 3D cardiac cell model…
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STANDARD INTRO: COMPRESSED TIMELINE (~3s to gate, ~4s total)
   ========================================================= */

function SplashIntro() {
  const { pageReady, setSplashDone, setSplashStarted } = useSplash();

  const minTimeElapsedRef = useRef(false);
  const pageReadyRef = useRef(pageReady);
  const fontsReadyRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const greetingWrapRef = useRef<HTMLDivElement>(null);
  const visualWrapRef = useRef<HTMLDivElement>(null);
  const mainTextWrapRef = useRef<HTMLDivElement>(null);
  const wordWrapperRef = useRef<HTMLDivElement>(null);

  // INVARIANT: SPLASH_MIN_DISPLAY_MS (1.8s) < SPLASH_CHECKPOINT_MS (3.0s) < SPLASH_SAFETY_TIMEOUT_MS (12.0s)
  // Dev guard: warns if the safety timeout in SplashProvider is configured <= checkpoint time.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && SPLASH_SAFETY_TIMEOUT_MS <= SPLASH_CHECKPOINT_MS) {
      console.warn(
        `[SplashConfig Warning] SPLASH_SAFETY_TIMEOUT_MS (${SPLASH_SAFETY_TIMEOUT_MS}ms) must be strictly greater than SPLASH_CHECKPOINT_MS (${SPLASH_CHECKPOINT_MS}ms). Otherwise the asset-readiness gate is bypassed!`
      );
    }
  }, []);

  function tryResume() {
    if (
      fontsReadyRef.current &&
      pageReadyRef.current &&
      minTimeElapsedRef.current &&
      tlRef.current?.paused() &&
      !document.hidden
    ) {
      tlRef.current.play();
    }
  }

  useEffect(() => {
    pageReadyRef.current = pageReady;
    tryResume();
  }, [pageReady]);

  // Minimum floor before splash is allowed to resume (1.8s, strictly < 3.0s checkpoint)
  useEffect(() => {
    const timer = setTimeout(() => {
      minTimeElapsedRef.current = true;
      tryResume();
    }, SPLASH_MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setSplashStarted(true));
    return () => cancelAnimationFrame(raf);
  }, [setSplashStarted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!tlRef.current || !fontsReadyRef.current) return;
      if (document.hidden) {
        tlRef.current.pause();
      } else {
        tryResume();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      fontsReadyRef.current = true;
      tlRef.current?.play();
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSkip = useCallback(() => {
    tlRef.current?.kill();
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => setSplashDone(true),
      });
    } else {
      setSplashDone(true);
    }
  }, [setSplashDone]);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out", force3D: true },
        onComplete: () => setSplashDone(true),
      });
      tlRef.current = tl;

      /* =========================================
       PHASE 0: AESTHETIC GRID & ACCENTS (0.0s - 1.15s)
       ========================================= */
      tl.to(".bg-grid, .splash-glow", { opacity: 1, duration: 1.2, ease: "power2.inOut" }, 0);
      tl.fromTo(
        ".line-accent",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.0, ease: "expo.inOut", stagger: 0.1 },
        0,
      );

      const words = gsap.utils.toArray(".audiens-word") as HTMLElement[];
      const wrapper = wordWrapperRef.current;
      gsap.set(words, { yPercent: -100, opacity: 0 });
      if (wrapper && words[0]) {
        gsap.set(wrapper, { width: () => words[0].offsetWidth });
      }

      // "Hello," characters slide up
      tl.fromTo(
        ".hello-char",
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.45, ease: "expo.out", stagger: 0.02 },
        0.1,
      );
      // First word ("Doctors.") slides in
      tl.to(words[0], { yPercent: 0, opacity: 1, duration: 0.45, ease: "expo.out" }, 0.2);

      // Fast, punchy rotation to "Researchers."
      if (words[1]) {
        tl.to(
          words[0],
          { yPercent: 100, opacity: 0, duration: 0.35, ease: "expo.inOut" },
          0.65,
        );
        tl.to(
          words[1],
          { yPercent: 0, opacity: 1, duration: 0.35, ease: "expo.inOut" },
          0.65,
        );
        if (wrapper) {
          tl.to(
            wrapper,
            { width: () => words[1].offsetWidth, duration: 0.35, ease: "expo.inOut" },
            0.65,
          );
        }
      }

      // Greeting wrap slides out
      tl.to(
        greetingWrapRef.current,
        {
          yPercent: -60,
          opacity: 0,
          duration: 0.35,
          ease: "expo.inOut",
          onComplete: () => gsap.set(greetingWrapRef.current, { display: "none" }),
        },
        1.15,
      );

      /* =========================================
       PHASE 1: RED HEARTBEAT ECG (1.25s - 1.85s)
       ========================================= */
      tl.set(visualWrapRef.current, { autoAlpha: 1 }, 1.25);
      tl.fromTo(
        ".sci-ecg",
        { strokeDasharray: 200, strokeDashoffset: 200 },
        { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" },
        1.25,
      );
      tl.to(
        visualWrapRef.current,
        {
          y: -25,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => gsap.set(visualWrapRef.current, { display: "none" }),
        },
        1.8,
      );

      /* =========================================
       PHASE 2: SHIFT TYPOGRAPHY & MICRO-LABEL (1.85s - 3.0s)
       ========================================= */
      tl.set(mainTextWrapRef.current, { y: 20, autoAlpha: 1 }, 1.85);

      tl.fromTo(
        ".micro-label",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "expo.out" },
        1.9,
      );

      tl.fromTo(
        ".main-line-1 .char",
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.015, ease: "expo.out" },
        1.95,
      );

      tl.to(mainTextWrapRef.current, { y: 0, duration: 0.45, ease: "expo.inOut" }, 2.2);

      tl.fromTo(
        ".main-line-2 .char",
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.008, ease: "expo.out" },
        2.25,
      );

      /* =========================================
       CHECKPOINT GATE: ~3.0s
       INVARIANT: SPLASH_MIN_DISPLAY_MS (1.8s) < SPLASH_CHECKPOINT_MS (3.0s) < SPLASH_SAFETY_TIMEOUT_MS (12.0s)
       ========================================= */
      tl.call(
        () => {
          if (!(pageReadyRef.current && minTimeElapsedRef.current)) {
            tl.pause();
          }
        },
        [],
        SPLASH_CHECKPOINT_MS / 1000,
      );

      /* =========================================
       OUTRO (3.05s - 4.0s)
       ========================================= */
      tl.to(
        ".micro-label, .main-line-1 .char, .main-line-2 .char",
        {
          yPercent: -100,
          opacity: 0,
          duration: 0.35,
          stagger: 0.004,
          ease: "expo.inOut",
        },
        3.05,
      );

      tl.to(
        ".line-accent, .bg-grid, .splash-glow",
        { opacity: 0, duration: 0.35, ease: "power2.inOut" },
        3.05,
      );

      tl.to(
        overlayRef.current,
        {
          yPercent: -100,
          duration: 0.85,
          ease: "expo.inOut",
        },
        3.15,
      );
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} data-splash>
      <div
        ref={overlayRef}
        role="region"
        aria-label="Loading application"
        className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] text-black font-sans"
        style={{ willChange: "transform" }}
      >
        {/* Skip button accessible via Tab and click */}
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Skip introductory splash animation"
          className="absolute top-6 right-6 md:top-8 md:right-10 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/15 bg-surface-white/80 hover:bg-surface-white text-xs font-medium text-foreground/80 hover:text-foreground backdrop-blur-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          <span>Skip intro</span>
          <span aria-hidden="true" className="text-foreground/40 font-mono text-[10px]">↵</span>
        </button>

        {/* Ambient color blobs */}
        <div className="splash-glow absolute inset-0 z-0 opacity-0 pointer-events-none overflow-hidden">
          <div
            className="blob-drift absolute -top-[22%] -left-[20%] w-[62vw] h-[62vw] max-w-190 max-h-190 will-change-transform animate-[blob-drift-1_9s_ease-in-out_infinite]"
            style={{ background: "radial-gradient(closest-side, rgba(184,84,92,0.20), rgba(184,84,92,0))" }}
          />
          <div
            className="blob-drift absolute -bottom-[25%] -right-[18%] w-[58vw] h-[58vw] max-w-180 max-h-180 will-change-transform animate-[blob-drift-2_11s_ease-in-out_-3s_infinite]"
            style={{ background: "radial-gradient(closest-side, rgba(22,133,111,0.18), rgba(22,133,111,0))" }}
          />
          <div
            className="blob-drift absolute top-[28%] right-[4%] w-[40vw] h-[40vw] max-w-120 max-h-120 will-change-transform animate-[blob-drift-3_7s_ease-in-out_-2s_infinite]"
            style={{ background: "radial-gradient(closest-side, rgba(217,139,30,0.16), rgba(217,139,30,0))" }}
          />
        </div>

        <div
          className="bg-grid absolute inset-0 z-0 opacity-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#0000000A 1px, transparent 1px), linear-gradient(90deg, #0000000A 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="line-accent absolute left-6 md:left-12 top-8 md:top-12 h-px w-20 sm:w-28 md:w-36 bg-accent origin-left z-0" />
        <div className="line-accent absolute right-6 md:right-12 bottom-8 md:bottom-12 h-px w-20 sm:w-28 md:w-36 bg-teal origin-right z-0" />

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
              style={{ contain: "layout style paint" }}
            >
              <span className="audiens-word absolute left-0 text-accent whitespace-nowrap leading-none pb-2 pt-1">
                Doctors.
              </span>
              <span className="audiens-word absolute left-0 text-teal whitespace-nowrap leading-none pb-2 pt-1">
                Researchers.
              </span>
            </div>
          </div>
        </div>

        <div
          ref={visualWrapRef}
          className="invisible absolute z-10 w-44 h-24 md:w-72 md:h-36 flex items-center justify-center"
        >
          <div
            className="absolute w-48 h-48 md:w-72 md:h-72"
            style={{ background: "radial-gradient(closest-side, rgba(184,84,92,0.16), rgba(184,84,92,0))" }}
          />
          <svg viewBox="0 0 100 50" className="relative w-full h-full overflow-visible">
            <path
              className="sci-ecg"
              d="M 5 25 L 25 25 L 32 25 L 36 15 L 42 45 L 50 5 L 56 35 L 62 25 L 75 25 L 95 25"
              fill="none"
              stroke="var(--accent-red)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          ref={mainTextWrapRef}
          className="absolute z-30 flex flex-col items-center justify-center w-full px-4 md:px-8 text-center invisible"
        >
          <div className="micro-label overflow-hidden mb-3 md:mb-5">
            <span className="flex items-center justify-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Ensemble Architecture
            </span>
          </div>

          <div className="overflow-hidden pb-1 md:pb-2">
            <h1 className="main-line-1 block text-[11vw] sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-none whitespace-nowrap">
              <Chars text="Cardiotoxicity." accentLastChar />
            </h1>
          </div>

          <div className="overflow-hidden pt-1 pb-1 mt-1">
            <h2 className="main-line-2 block text-[4.5vw] sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-muted whitespace-nowrap">
              <Chars text="Prediction for animal-free testing." />
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
