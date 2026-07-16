'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowUp } from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import type { IconType } from 'react-icons';

const luxEase = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   REUSABLE COMPONENT: EXPENSIVE ROLLING LINK
   ========================================================= */
const AnimatedLink = ({ title, href }: { title: string; href: string }) => {
  return (
    <li>
      <Link
        href={href}
        className="group relative flex items-center w-max overflow-hidden text-sm font-medium text-muted transition-colors duration-300 hover:text-foreground"
      >
        <span className="relative flex flex-col h-[1.2em] overflow-hidden">
          {/* Teks utama (naik ke atas dan menghilang) */}
          <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
            {title}
          </span>
          {/* Teks aksen (naik dari bawah menggantikan teks utama) */}
          <span className="absolute top-full text-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
            {title}
          </span>
        </span>
        {/* Panah kecil yang muncul secara elegan dari kiri */}
        <svg
          className="w-3 h-3 text-accent opacity-0 -translate-x-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-1 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </li>
  );
};

/* =========================================================
   REUSABLE COMPONENT: SOCIAL ICON BUTTON (bulat, hover glow)
   ========================================================= */
const SocialIcon = ({ icon: Icon, href, label }: { icon: IconType | typeof Mail; href: string; label: string }) => {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group relative w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center text-muted transition-all duration-300 hover:text-accent hover:border-accent/40 hover:scale-105"
    >
      <Icon className="w-4 h-4" />
      <span className="absolute inset-0 rounded-full bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300" />
    </Link>
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-background pt-24 pb-8 px-6 md:px-12 border-t border-foreground/10 font-sans overflow-hidden">

      {/* ==================== WATERMARK BACKGROUND TEXT ==================== */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: luxEase }}
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-8 sm:-bottom-12 md:-bottom-16 left-1/2 -translate-x-1/2 w-full text-center whitespace-nowrap"
      >
        <span className="text-[18vw] leading-none font-medium tracking-tighter text-foreground/3">
          cardivex
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1, ease: luxEase }}
        className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8"
      >

        {/* ==================== LEFT COLUMN: BRANDING ==================== */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <Link
              href="/"
              className="text-3xl font-medium tracking-tighter text-foreground hover:opacity-80 transition-opacity"
            >
              cardivex<span className="text-accent">.</span>
            </Link>
            <p className="mt-6 text-sm text-muted max-w-sm leading-relaxed">
              Advanced <span className="italic font-medium text-foreground">in silico</span> modeling for cardiac safety and animal-free research. Redefining predictive precision.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-8">
              <SocialIcon icon={FaXTwitter} href="#" label="Twitter" />
              <SocialIcon icon={FaLinkedin} href="#" label="LinkedIn" />
              <SocialIcon icon={FaGithub} href="#" label="GitHub" />
              <SocialIcon icon={Mail} href="mailto:hcim.ta01@gmail.com" label="Email" />
            </div>
          </div>

          <div className="mt-12 md:mt-16">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-2">
              Origin
            </div>
            <div className="text-xs font-medium tracking-wide text-foreground">
              Telkom University • HCIM 2026
            </div>
          </div>
        </div>

        {/* SPACING COLUMN */}
        <div className="hidden md:block md:col-span-1"></div>

        {/* ==================== RIGHT COLUMNS: LINKS ==================== */}
        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground mb-6">
            Platform
          </h4>
          <ul className="space-y-4">
            <AnimatedLink title="Model Overview" href="#" />
            <AnimatedLink title="Methodology" href="#" />
            <AnimatedLink title="API Documentation" href="#" />
            <AnimatedLink title="Research Papers" href="#" />
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground mb-6">
            Resources
          </h4>
          <ul className="space-y-4">
            <AnimatedLink title="Ethics Policy" href="#" />
            <AnimatedLink title="Terms of Service" href="#" />
            <AnimatedLink title="Privacy Policy" href="#" />
            <AnimatedLink title="Support" href="#" />
          </ul>
        </div>

        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground mb-6">
              Connect
            </h4>
            <ul className="space-y-4">
              <AnimatedLink title="Contact" href="mailto:hcim.ta01@gmail.com" />
              <AnimatedLink title="Support" href="#" />
            </ul>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="group hidden md:flex items-center gap-2 mt-12 text-[10px] font-mono uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors duration-300 w-max"
          >
            <span className="w-8 h-8 rounded-full border border-foreground/10 flex items-center justify-center group-hover:border-foreground/30 group-hover:-translate-y-0.5 transition-all duration-300">
              <ArrowUp className="w-3.5 h-3.5" />
            </span>
            Back to top
          </button>
        </div>
      </motion.div>

      {/* ==================== BOTTOM COPYRIGHT BAR ==================== */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3, ease: luxEase }}
        className="relative max-w-7xl mx-auto mt-24 pt-8 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <p className="text-[11px] font-mono uppercase tracking-widest text-foreground font-medium">
            © {currentYear} Cardivex.
          </p>
          <span className="hidden md:block w-1 h-1 bg-foreground/20 rounded-full" />
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted">
            Designed for digital precision.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Animated EQ Visualizer */}
          <div className="flex gap-0.75 h-3 mr-4 items-end">
            {[1, 0.6, 0.8, 0.4, 1].map((h, idx) => (
              <motion.div
                key={idx}
                className="w-0.5 bg-foreground/30 rounded-t-sm"
                animate={{ height: [`${h * 100}%`, '100%', `${h * 100}%`] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: idx * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <Link href="#" className="text-[11px] font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors duration-300">
            Privacy
          </Link>
          <Link href="#" className="text-[11px] font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors duration-300">
            Cookies
          </Link>
        </div>
      </motion.div>
    </footer>
  );
}