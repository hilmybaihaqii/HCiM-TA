import React from 'react';

export default function LabFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-foreground/5 bg-background relative z-10">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* HUD System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center relative w-2 h-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted font-medium">
            Core Engine: Online
          </span>
        </div>

        {/* Copyright & Info */}
        <div className="text-[10px] md:text-xs text-muted/60 font-medium tracking-tight text-center sm:text-right">
          © {currentYear} <span className="text-foreground">cardivex.</span> All rights reserved. <br className="sm:hidden" />
          <span className="hidden sm:inline"> | </span> Designed for In-Silico Pharmacovigilance.
        </div>

      </div>
    </footer>
  );
}