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
                    <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-muted">
                      {item.subtitle}
                    </p>
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
                      <div className="pb-12 md:pb-16 md:pl-[33%] pr-0 md:pr-6">
                        {/* Ringkasan, lalu klausul lengkap: isi pilar dibaca di halaman ini, bukan hanya di halaman detail */}
                        <p className="max-w-2xl text-base sm:text-lg font-light leading-relaxed text-muted">
                          {item.excerpt}
                        </p>
                        <p className="mt-5 max-w-2xl border-l-2 border-accent/40 pl-4 text-sm leading-relaxed text-foreground">
                          {item.implication}
                        </p>

                        <dl className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
                          {item.content.map((sec) => (
                            <div key={sec.clause} className="max-w-md">
                              <dt className="flex items-baseline gap-3">
                                <span className="font-mono text-[11px] text-muted">{sec.clause}</span>
                                <span className="text-sm font-medium tracking-tight text-foreground">{sec.title}</span>
                              </dt>
                              <dd className="mt-2 text-sm font-light leading-relaxed text-muted">{sec.body}</dd>
                            </div>
                          ))}
                        </dl>

                        {/* Dokumen asli: teks peraturan atau paper, dibuka di tab baru */}
                        <div className="mt-10 border-t border-foreground/10 pt-6">
                          <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                            Read the source
                          </span>
                          <ul className="mt-4 flex flex-col gap-3">
                            {item.sources.map((src) => {
                              const external = src.href.startsWith('http');
                              return (
                                <li key={src.href}>
                                  <a
                                    href={src.href}
                                    target={external ? '_blank' : undefined}
                                    rel={external ? 'noreferrer noopener' : undefined}
                                    className="group/src inline-flex max-w-2xl items-baseline gap-2 text-sm text-foreground transition-colors duration-300 hover:text-accent"
                                  >
                                    <span className="underline decoration-foreground/20 underline-offset-4 transition-colors group-hover/src:decoration-accent">
                                      {src.label}
                                    </span>
                                    {src.note && (
                                      <span className="shrink-0 rounded-full border border-foreground/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                                        {src.note}
                                      </span>
                                    )}
                                    <span aria-hidden="true" className="shrink-0 text-muted transition-transform duration-300 group-hover/src:translate-x-0.5 group-hover/src:text-accent">
                                      {external ? '↗' : '→'}
                                    </span>
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-foreground/10 pt-6">
                          <div className="flex flex-wrap gap-4">
                            {item.relatedTags.map((tag) => (
                              <span key={tag} className="font-mono text-xs text-muted">
                                • {tag}
                              </span>
                            ))}
                          </div>
                          <Link
                            href={`/standards/${item.slug}`}
                            className="group/link inline-flex items-center gap-2 font-mono text-xs text-foreground transition-colors duration-300 hover:text-accent"
                          >
                            <span>Open the full reference</span>
                            <svg
                              className="h-4 w-4 text-accent transition-transform duration-300 group-hover/link:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M13 5l7 7-7 7" />
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