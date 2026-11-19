"use client";

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useSplash, SPLASH_MIN_DISPLAY_MS, SPLASH_CHECKPOINT_MS } from "./SplashProvider";

/*
 * Splash pembuka halaman utama (/), sekali per tab.
 *
 * Konsep: hanya wordmark, tepat di tengah layar. Huruf naik dari balik garis potong, jarak huruf
 * merapat perlahan, lalu titik merah di ujungnya berdetak dua kali seperti detak jantung
 * ("lub-dub"). Setelah itu huruf naik keluar dan tirai terangkat. Hanya transform & opacity
 * (plus letter-spacing pada satu baris pendek), tanpa blur atau bayangan, supaya ringan di HP murah.
 *
 * Alur waktu (detik):
 *   0.00  huruf naik satu per satu, jarak huruf merapat
 *   0.55  titik muncul
 *   0.85  dua detak (lub-dub)
 *   0.70  satu kalimat kecil muncul di bawah
 *   1.50  gerbang: berhenti di sini bila halaman (model 3D) belum siap; lanjut saat siap
 *   1.55  huruf naik keluar, tirai terangkat (selesai ±2,6 detik)
 */

const WORDMARK = "cardivex";
// Posisi awal huruf di bawah garis potong. Inline transform, bukan kelas Tailwind `translate-*`
// (properti CSS `translate` terpisah dan tidak ikut dianimasikan GSAP).
const HIDDEN: React.CSSProperties = { transform: "translateY(105%)" };
const DOT_HIDDEN: React.CSSProperties = { transform: "scale(0)" };
// Pengaman: bila karena sesuatu timeline tidak pernah selesai (mis. tab terus tersembunyi),
// splash ditutup supaya isi halaman tidak tertahan.
const FAILSAFE_MS = 9000;

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export default function SplashScreen() {
  const pathname = usePathname();
  const { splashDone } = useSplash();
  const reducedMotion = usePrefersReducedMotion();

  if (pathname !== "/" || splashDone) return null;
  return reducedMotion ? <SplashStatic /> : <SplashIntro />;
}

/* ---------- Tampilan bersama ---------- */

/**
 * Wordmark tepat di tengah: yang dipusatkan hanya kata "cardivex"; titik diletakkan absolut di
 * kanannya dan kalimat absolut di bawahnya, jadi keduanya tidak menggeser titik tengah.
 */
function Mark({ animated }: { animated: boolean }) {
  return (
    <div className="relative">
      <h1
        aria-label="cardivex"
        className="splash-word relative flex overflow-hidden pb-[0.12em] pt-[0.04em] text-[clamp(2.25rem,7vw,3.75rem)] font-medium leading-none text-foreground"
        style={{ letterSpacing: animated ? "0.04em" : "-0.035em" }}
      >
        {WORDMARK.split("").map((c, i) => (
          <span key={i} aria-hidden="true" className={`inline-block ${animated ? "splash-char" : ""}`} style={animated ? HIDDEN : undefined}>
            {c}
          </span>
        ))}
      </h1>
      {/* Titik merah: berdetak dua kali. Ukuran mengikuti font (em), duduk di garis dasar huruf. */}
      <span
        aria-hidden="true"
        className="splash-dot absolute left-full bottom-[0.3em] ml-[0.06em] block h-[0.17em] w-[0.17em] rounded-full bg-accent text-[clamp(2.25rem,7vw,3.75rem)]"
        style={animated ? DOT_HIDDEN : undefined}
      />
      <p
        className={`splash-caption absolute left-1/2 top-full mt-5 -translate-x-1/2 whitespace-nowrap text-[13px] text-foreground/50 md:mt-6 md:text-sm ${animated ? "opacity-0" : ""}`}
      >
        Cardiotoxicity prediction, without animal testing.
      </p>
    </div>
  );
}

function Shell({ overlayRef, onSkip, animated, children }: {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onSkip: () => void;
  animated: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={overlayRef}
      role="region"
      aria-label="Loading Cardivex"
      className="fixed inset-0 z-9999 grid place-items-center bg-background font-sans text-foreground"
    >
      {children}
      <button
        type="button"
        onClick={onSkip}
        className={`splash-skip absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 p-2 text-xs text-foreground/45 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action md:bottom-8 md:right-9 ${animated ? "opacity-0" : ""}`}
      >
        Skip
      </button>
    </div>
  );
}

/* ---------- Tanpa gerak (prefers-reduced-motion) ---------- */

const STATIC_FLOOR_MS = 600;

function SplashStatic() {
  const { pageReady, setSplashDone, setSplashStarted } = useSplash();
  const overlayRef = useRef<HTMLDivElement>(null);
  const floorPassed = useRef(false);
  const leaving = useRef(false);

  useEffect(() => { setSplashStarted(true); }, [setSplashStarted]);

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    if (!overlayRef.current) return setSplashDone(true);
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power1.out", onComplete: () => setSplashDone(true) });
  }, [setSplashDone]);

  useEffect(() => {
    const t = setTimeout(() => {
      floorPassed.current = true;
      if (pageReady) leave();
    }, STATIC_FLOOR_MS);
    return () => clearTimeout(t);
  }, [pageReady, leave]);

  useEffect(() => {
    if (floorPassed.current && pageReady) leave();
  }, [pageReady, leave]);

  return (
    <div data-splash>
      <Shell overlayRef={overlayRef} onSkip={leave} animated={false}>
        <Mark animated={false} />
      </Shell>
    </div>
  );
}

/* ---------- Animasi standar ---------- */

function SplashIntro() {
  const { pageReady, setSplashDone, setSplashStarted } = useSplash();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Tiga syarat sebelum melewati gerbang: font siap, waktu minimum lewat, halaman siap
  const fontsReady = useRef(false);
  const minElapsed = useRef(false);
  const pageReadyRef = useRef(pageReady);

  const tryResume = useCallback(() => {
    const tl = tlRef.current;
    if (tl?.paused() && fontsReady.current && minElapsed.current && pageReadyRef.current && !document.hidden) tl.play();
  }, []);

  useEffect(() => {
    pageReadyRef.current = pageReady;
    tryResume();
  }, [pageReady, tryResume]);

  useEffect(() => {
    const t = setTimeout(() => { minElapsed.current = true; tryResume(); }, SPLASH_MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [tryResume]);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), FAILSAFE_MS);
    return () => clearTimeout(t);
  }, [setSplashDone]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setSplashStarted(true));
    return () => cancelAnimationFrame(raf);
  }, [setSplashStarted]);

  // Tab disembunyikan: jeda, supaya pengunjung tidak melewatkan intro
  useEffect(() => {
    const onVisibility = () => {
      if (!tlRef.current || !fontsReady.current) return;
      if (document.hidden) tlRef.current.pause();
      else tlRef.current.play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Mulai setelah font siap, supaya huruf tidak berganti bentuk di tengah animasi
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      fontsReady.current = true;
      if (!document.hidden) tlRef.current?.play();
    };
    if (document.fonts?.ready) document.fonts.ready.then(start, start);
    else start();
    return () => { cancelled = true; };
  }, []);

  const skip = useCallback(() => {
    tlRef.current?.kill();
    if (!overlayRef.current) return setSplashDone(true);
    gsap.to(overlayRef.current, { yPercent: -100, duration: 0.55, ease: "power3.inOut", onComplete: () => setSplashDone(true) });
  }, [setSplashDone]);

  // Enter / Escape juga melewati intro
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter") skip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  useGSAP(
    () => {
      const gate = SPLASH_CHECKPOINT_MS / 1000;
      const tl = gsap.timeline({ paused: true, onComplete: () => setSplashDone(true) });
      tlRef.current = tl;

      tl
        // Masuk: huruf naik, jarak huruf merapat bersamaan
        .to(".splash-char", { y: 0, yPercent: 0, duration: 1.05, ease: "expo.out", stagger: 0.045 }, 0)
        .to(".splash-word", { letterSpacing: "-0.035em", duration: 1.4, ease: "expo.out" }, 0)
        // Titik muncul, lalu berdetak dua kali (lub-dub)
        .to(".splash-dot", { scale: 1, duration: 0.45, ease: "back.out(2.2)" }, 0.55)
        .to(".splash-dot", { scale: 1.55, duration: 0.11, ease: "power2.out" }, 0.9)
        .to(".splash-dot", { scale: 1, duration: 0.16, ease: "power2.in" }, ">")
        .to(".splash-dot", { scale: 1.3, duration: 0.1, ease: "power2.out" }, ">0.04")
        .to(".splash-dot", { scale: 1, duration: 0.3, ease: "power3.out" }, ">")
        .to(".splash-caption, .splash-skip", { opacity: 1, duration: 0.7, ease: "power1.out" }, 0.7)
        // Gerbang
        .call(() => { if (!(pageReadyRef.current && minElapsed.current)) tl.pause(); }, [], gate)
        // Keluar: kalimat & tombol memudar, huruf naik keluar, titik mengecil, lalu tirai terangkat
        .to(".splash-caption, .splash-skip", { opacity: 0, duration: 0.3, ease: "power1.in" }, gate + 0.05)
        .to(".splash-char", { yPercent: -105, duration: 0.55, ease: "power3.in", stagger: 0.025 }, gate + 0.05)
        .to(".splash-dot", { scale: 0, duration: 0.35, ease: "power2.in" }, gate + 0.3)
        .to(overlayRef.current, { yPercent: -100, duration: 0.95, ease: "expo.inOut" }, gate + 0.45);
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} data-splash>
      <Shell overlayRef={overlayRef} onSkip={skip} animated>
        <Mark animated />
      </Shell>
    </div>
  );
}
