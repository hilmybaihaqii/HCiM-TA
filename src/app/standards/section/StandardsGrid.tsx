'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { STANDARDS_DATA } from '@/data/standardsData';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function StandardsGrid() {
  const [activeId, setActiveId] = useState<string | null>(STANDARDS_DATA[0].id);

  const toggleAccordion = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative w-full py-20 md:py-32 bg-background font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex items-end justify-between border-b border-foreground/10 pb-6 mb-12 md:mb-16">
          <div>
            <span className="block text-xs font-mono text-muted mb-1">
              Verification index
            </span>
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">
              Recognized safety frameworks
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">
            {STANDARDS_DATA.length} FOUNDATIONAL PILLARS
          </span>
        </div>

        {/* --- BORDERLESS ACCORDION PROTOCOL LEDGER --- */}
        <div className="border-t border-foreground/15">
          {STANDARDS_DATA.map((item) => {
            const isOpen = activeId === item.id;

            return (
              <div
                key={item.id}
                className="border-b border-foreground/15 transition-colors duration-300"
              >
                {/* BARIS HEADER */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left group focus:outline-none"
                >
                  <div className="flex items-center gap-6 md:w-1/3 shrink-0">
                    <span className="text-xs font-mono text-muted group-hover:text-accent transition-colors">
                      {item.number}
                    </span>
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-mono text-accent mb-1">
                        {item.level}
                      </span>
                      <p className="text-xs font-mono text-muted">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
                      {item.title}
                    </h3>
                  </div>

                  {/* ARROW TOGGLE (chevron, rotates on open) */}
                  <div className="md:w-1/6 flex md:justify-end items-center">
                    <div className="w-8 h-8 flex items-center justify-center text-muted group-hover:text-foreground transition-colors">
                      <motion.svg
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M19 9l-7 7-7-7"
                        />
                      </motion.svg>
                    </div>
                  </div>
                </button>

                {/* EXPANDED CONTENT AREA */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.6, ease: luxEase }}
                      className="overflow-hidden"
                    >
                      <div className="pb-10 md:pb-12 md:pl-[33%] pr-6">
                        <p className="text-base sm:text-lg text-muted font-light leading-relaxed max-w-2xl mb-8">
                          {item.excerpt}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-foreground/10">
                          <div className="flex flex-wrap gap-4">
                            {item.relatedTags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-mono text-muted"
                              >
                                • {tag}
                              </span>
                            ))}
                          </div>

                          <Link
                            href={`/standards/${item.slug}`}
                            className="group/link inline-flex items-center gap-2 text-xs font-mono text-foreground hover:text-accent transition-colors duration-300"
                          >
                            <span>Inspect standard specifications</span>
                            <svg
                              className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1 text-accent"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M5 12h14M13 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}