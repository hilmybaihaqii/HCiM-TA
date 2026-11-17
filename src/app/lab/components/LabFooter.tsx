import React from 'react';

export default function LabFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-foreground/5 bg-background relative z-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 md:pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted">
          For research use
        </span>

        {/* Copyright & Info */}
        <div className="text-[10px] md:text-xs text-muted/60 font-medium tracking-tight text-center sm:text-right">
          © {currentYear} <span className="text-foreground">cardivex.</span> All rights reserved.
        </div>

      </div>
    </footer>
  );
}