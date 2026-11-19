'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Lama minimal sambutan saat berpindah tampilan (admin <-> user), sama untuk kedua arah */
export const VIEW_SPLASH_MS = 2200;

/**
 * Sambutan layar penuh saat berpindah tampilan: "Welcome, Admin." ketika masuk panel admin,
 * dan versi user view ketika kembali ke lab. Satu desain, hanya teksnya yang berbeda.
 * Animasi memakai opacity & transform saja (tanpa blur/width) supaya mulus di ponsel.
 */
export default function ViewSplash({ isVisible, title, status }: {
  isVisible: boolean;
  title: string;
  /** Teks kecil di bawah garis, mis. "Verifying admin access" */
  status: string;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="view-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-6 will-change-[opacity,transform]"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground text-center">
              {title}
            </h1>

            <div className="mt-8 h-px w-full min-w-48 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.4, ease: [0.65, 0, 0.35, 1] }}
                className="h-full origin-left bg-foreground/20"
              />
            </div>

            <p className="mt-4 text-[10px] font-mono uppercase tracking-widest text-muted animate-pulse">
              {status}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
