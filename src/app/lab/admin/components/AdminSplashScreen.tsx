'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminSplashScreenProps {
  isVisible: boolean;
  authChecked: boolean;
}

export default function AdminSplashScreen({ isVisible, authChecked }: AdminSplashScreenProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="admin-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background pointer-events-auto"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Teks statis, 1 warna, elegan tanpa ikon tambahan */}
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground">
              Welcome, Admin.
            </h1>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
              className="h-px bg-foreground/20 mt-8"
            />
            
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-4 animate-pulse">
              {authChecked ? "Clearance Verified. Initializing Module..." : "Verifying System Clearance..."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}