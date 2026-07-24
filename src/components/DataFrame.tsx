'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface DataFrameProps {
  title: string;
  subtitle: string;
  insight: string;
  caption: string;
  children: React.ReactNode;
}

const luxEase = [0.16, 1, 0.3, 1] as const;

export const DataFrame = ({ title, subtitle, insight, caption, children }: DataFrameProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: luxEase }}
      className="border-t border-foreground/10 py-10 md:py-16 mb-16 md:mb-32"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Editorial Text Column */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <div>
            <h4 className="text-sm md:text-base font-medium text-foreground mb-3">{title}</h4>
            <p className="text-xs md:text-sm text-muted leading-relaxed">{subtitle}</p>
          </div>
          
          <div className="mt-8 md:mt-12 border-l border-accent/50 pl-4">
            <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-accent mb-2">Observation</span>
            <p className="text-[11px] md:text-xs text-foreground leading-relaxed">{insight}</p>
          </div>
        </div>
        
        {/* Interactive Chart Column */}
        <div className="lg:col-span-8 w-full relative">
          {children}
          <div className="mt-4 border-t border-foreground/5 pt-3 text-[9px] font-mono uppercase tracking-[0.2em] text-muted text-right">
            {caption}
          </div>
        </div>

      </div>
    </motion.div>
  );
};