"use client";

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useSplash, SPLASH_MIN_DISPLAY_MS, SPLASH_CHECKPOINT_MS } from "./SplashProvider";

/*
 * Splash pembuka halaman utama (/), sekali per tab.
 *
 * Konsep: hanya wordmark, tepat di tengah layar. Huruf naik dari balik garis potong sambil merapat,
 * lalu titik merah di ujungnya berdetak dua kali seperti detak jantung ("lub-dub"). Setelah itu
 * huruf naik keluar dan tirai terangkat. Hanya transform & opacity lewat Web Animations API
 * (dijalankan compositor), tanpa blur atau bayangan, supaya mulus di HP murah.
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
// Posisi awal huruf di bawah garis potong (inline, supaya tidak berkedip sebelum animasi mulai).
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
        style={{ letterSpacing: "-0.035em" }}
      >
        {WORDMARK.split("").map((c, i) => (
          <span key={i} aria-hidden="true" className={`inline-block ${animated ? "splash-char will-change-transform" : ""}`} style={animated ? HIDDEN : undefined}>
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
    const el = overlayRef.current;
    if (!el) return setSplashDone(true);
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-out", fill: "forwards" })
      .finished.then(() => setSplashDone(true), () => setSplashDone(true));
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

/* ---------- Animasi standar ----------
 * Memakai Web Animations API, bukan GSAP: animasi transform & opacity dijalankan compositor (GPU),
 * jadi tetap mulus walau main thread sedang sibuk memuat model jantung 3D dan menyiapkan halaman.
 * (Versi GSAP berjalan di main thread lewat requestAnimationFrame dan ikut tersendat.)
 */

// Kurva setara easing GSAP sebelumnya
const EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EXPO_IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";
const POWER3_IN = "cubic-bezier(0.55, 0.055, 0.675, 0.19)";
// Jarak huruf merapat lewat geseran transform tiap huruf (tanpa letter-spacing, yang memicu layout)
const SPREAD_EM = 0.075;

function SplashIntro() {
  const { pageReady, setSplashDone, setSplashStarted } = useSplash();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Syarat sebelum keluar: intro sudah sampai gerbang, waktu minimum lewat, halaman siap, tab terlihat
  const atGate = useRef(false);
  const minElapsed = useRef(false);
  const pageReadyRef = useRef(pageReady);
  const exiting = useRef(false);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setSplashDone(true);
  }, [setSplashDone]);

  const exit = useCallback((fast = false) => {
    const root = containerRef.current;
    const overlay = overlayRef.current;
    if (exiting.current) return;
    exiting.current = true;
    if (!root || !overlay) return finish();
    if (!fast) {
      root.querySelectorAll<HTMLElement>(".splash-caption, .splash-skip").forEach(el =>
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-in", fill: "forwards" }));
      root.querySelectorAll<HTMLElement>(".splash-char").forEach((el, i) =>
        el.animate([{ transform: "translate(0, 0)" }, { transform: "translate(0, -105%)" }],
          { duration: 550, delay: 50 + i * 25, easing: POWER3_IN, fill: "forwards" }));
      root.querySelector<HTMLElement>(".splash-dot")?.animate([{ transform: "scale(1)" }, { transform: "scale(0)" }],
        { duration: 350, delay: 300, easing: POWER3_IN, fill: "forwards" });
    }
    overlay.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }],
      { duration: fast ? 550 : 950, delay: fast ? 0 : 450, easing: EXPO_IN_OUT, fill: "forwards" })
      .finished.then(finish, finish);
  }, [finish]);

  const tryExit = useCallback(() => {
    if (atGate.current && minElapsed.current && pageReadyRef.current && !document.hidden) exit();
  }, [exit]);

  useEffect(() => {
    pageReadyRef.current = pageReady;
    tryExit();
  }, [pageReady, tryExit]);

  useEffect(() => {
    const t = setTimeout(() => { minElapsed.current = true; tryExit(); }, SPLASH_MIN_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [tryExit]);

  // Pengaman: jangan pernah menahan isi halaman
  useEffect(() => {
    const t = setTimeout(finish, FAILSAFE_MS);
    return () => clearTimeout(t);
  }, [finish]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setSplashStarted(true));
    return () => cancelAnimationFrame(raf);
  }, [setSplashStarted]);

  // Tab disembunyikan: jeda intro supaya tidak terlewat; terlihat lagi: lanjut (atau keluar bila sudah siap)
  useEffect(() => {
    const onVisibility = () => {
      const anims = containerRef.current?.getAnimations({ subtree: true }) ?? [];
      if (document.hidden) anims.forEach(a => a.pause());
      else { anims.forEach(a => a.play()); tryExit(); }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [tryExit]);

  // Intro dimulai setelah font siap, supaya huruf tidak berganti bentuk di tengah animasi
  useEffect(() => {
    let cancelled = false;
    let gateTimer = 0;
    const start = () => {
      const root = containerRef.current;
      if (cancelled || !root) return;
      const chars = root.querySelectorAll<HTMLElement>(".splash-char");
      const mid = (chars.length - 1) / 2;
      // Huruf naik dari balik garis potong sambil merapat ke tengah
      chars.forEach((el, i) =>
        el.animate(
          [{ transform: `translate(${((i - mid) * SPREAD_EM).toFixed(3)}em, 105%)` }, { transform: "translate(0, 0)" }],
          { duration: 1050, delay: i * 45, easing: EXPO_OUT, fill: "both" },
        ));
      // Titik muncul lalu berdetak dua kali (lub-dub)
      root.querySelector<HTMLElement>(".splash-dot")?.animate(
        [
          { transform: "scale(0)", offset: 0, easing: "ease-out" },
          { transform: "scale(1.12)", offset: 0.3, easing: "ease-in-out" },
          { transform: "scale(1)", offset: 0.33, easing: "ease-out" },
          { transform: "scale(1.55)", offset: 0.434, easing: "ease-in" },
          { transform: "scale(1)", offset: 0.585 },
          { transform: "scale(1)", offset: 0.623, easing: "ease-out" },
          { transform: "scale(1.3)", offset: 0.717, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          { transform: "scale(1)", offset: 1 },
        ],
        { duration: 1060, delay: 550, fill: "both" },
      );
      root.querySelectorAll<HTMLElement>(".splash-caption, .splash-skip").forEach(el =>
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 700, easing: "ease-out", fill: "both" }));
      // Gerbang: keluar di titik ini bila semuanya siap, kalau belum tunggu sampai siap
      gateTimer = window.setTimeout(() => { atGate.current = true; tryExit(); }, SPLASH_CHECKPOINT_MS);
    };
    if (document.fonts?.ready) document.fonts.ready.then(start, start);
    else start();
    return () => {
      cancelled = true;
      clearTimeout(gateTimer);
    };
  }, [tryExit]);

  const skip = useCallback(() => exit(true), [exit]);

  // Enter / Escape juga melewati intro
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter") skip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  return (
    <div ref={containerRef} data-splash>
      <Shell overlayRef={overlayRef} onSkip={skip} animated>
        <Mark animated />
      </Shell>
    </div>
  );
}
