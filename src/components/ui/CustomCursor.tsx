"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Default ke true agar kursor tidak muncul sejenak di HP saat halaman pertama kali dimuat
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  // Titik pusat mengikuti secara instan (0 delay untuk akurasi klik)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Cincin luar mengikuti dengan fisika pegas (spring) yang sangat halus
  const springConfig = { damping: 25, stiffness: 400, mass: 0.15 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // 1. SOLUSI ESLINT: Gunakan Timeout agar state tidak di-set secara sinkron
    // yang menyebabkan cascading render.
    const timer = setTimeout(() => {
      const mediaQuery = window.matchMedia("(pointer: fine)");
      setIsTouchDevice(!mediaQuery.matches);
    }, 0);

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest(".cursor-pointer")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      clearTimeout(timer); // Bersihkan timer
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  // Jika terdeteksi perangkat layar sentuh (HP/Tablet), jangan render kursor sama sekali
  if (isTouchDevice) return null;

  return (
    <>
      {/* ELEMEN 1: Cincin / Lensa (Trailing Ring) */}
      {/* 2. SOLUSI TAILWIND: Ubah z-[9998] menjadi z-9998 */}
      <motion.div
        className="fixed top-0 left-0 z-9998 pointer-events-none rounded-full flex items-center justify-center mix-blend-difference"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHovering ? 80 : 36,
          height: isHovering ? 80 : 36,
          backgroundColor: isHovering
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0)",
          border: isHovering
            ? "0px solid rgba(255,255,255,0)"
            : "1.5px solid rgba(255,255,255,1)",
        }}
        transition={{
          width: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          backgroundColor: { duration: 0.2 },
          border: { duration: 0.2 },
        }}
      />

      {/* ELEMEN 2: Titik Pusat (Core Dot) */}
      {/* 2. SOLUSI TAILWIND: Ubah z-[9999] menjadi z-9999 */}
      <motion.div
        className="fixed top-0 left-0 z-9999 pointer-events-none rounded-full bg-white mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: isHovering ? 0 : 8,
          height: isHovering ? 0 : 8,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </>
  );
}
