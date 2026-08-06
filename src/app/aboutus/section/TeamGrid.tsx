'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { TEAM_DATA } from '@/data/teamData';

// Menggunakan bezier curve yang sangat halus untuk kesan mewah
const luxEase = [0.16, 1, 0.3, 1] as const;
const softEase = [0.22, 1, 0.36, 1] as const;

type FilterType = 'all' | 'core' | 'advisor';

export default function TeamGrid() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTeam = TEAM_DATA.filter((member) => 
    filter === 'all' ? true : member.category === filter
  );

  return (
    <section className="relative w-full py-20 md:py-32 bg-background font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* ==================== SECTION HEADER & INTERACTIVE TABS ==================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-foreground/10 pb-6 mb-16 md:mb-24 gap-8">
          <div>
            <span className="block text-xs font-mono text-muted mb-1.5 uppercase tracking-widest">
              Cardivex Network
            </span>
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">
              Investigators & Advisors
            </h2>
          </div>

          {/* EDITORIAL FILTER TABS */}
          <div className="flex items-center gap-6 text-xs font-mono">
            {[
              { id: 'all', label: 'All Members' },
              { id: 'core', label: 'Core Researchers' },
              { id: 'advisor', label: 'Scientific Board' },
            ].map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as FilterType)}
                  className={`relative pb-2 transition-colors duration-500 outline-none ${
                    isActive ? 'text-foreground font-medium' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute left-0 bottom-0 w-full h-px bg-accent"
                      transition={{ duration: 0.7, ease: luxEase }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== UNIFIED STAGGERED GRID ==================== */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-24 gap-y-20">
          <AnimatePresence mode="popLayout">
            {filteredTeam.map((member) => (
              <motion.div
                key={member.id}
                layout
                // Transisi "Mewah": Blur halus + Melayang dari bawah ke atas
                initial={{ opacity: 0, y: 40, scale: 0.97, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40, scale: 0.97, filter: 'blur(8px)', transition: { duration: 0.5, ease: softEase } }}
                transition={{ duration: 0.9, ease: luxEase }}
                className="group flex flex-col md:[&:nth-child(even)]:mt-32"
              >
                
                {/* 1. KINETIC PORTRAIT (Selalu Berwarna, Hanya Efek Zoom) */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-foreground/5 border border-foreground/10 mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 px-2.5 py-1 bg-background/90 backdrop-blur-md text-[10px] font-mono text-foreground border border-foreground/10">
                    {member.category === 'core' ? 'Core Researcher' : 'Advisor'}
                  </div>
                </div>

                {/* 2. INTERACTIVE EDITORIAL BIO (HOVER REVEAL KEMBALI) */}
                <div className="relative w-full">
                  {/* Selalu Tampil: Nama & Peran */}
                  <div className="border-b border-foreground/10 pb-4">
                    <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-2 group-hover:text-accent transition-colors duration-500">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono text-muted uppercase tracking-widest">
                      {member.role}
                    </p>
                  </div>

                  {/* 
                    Tersembunyi di Desktop, Muncul saat Hover. 
                    (Di layar HP/Mobile akan otomatis selalu terbuka agar ramah sentuhan).
                  */}
                  <div className="grid grid-rows-[1fr] lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div className="overflow-hidden">
                      <div className="pt-5">
                        <div className="flex items-center gap-2 text-xs font-mono text-foreground mb-4">
                          <span className="w-1 h-1 bg-accent" />
                          <span>{member.institution}</span>
                        </div>
                        
                        {member.bio && (
                          <p className="text-sm text-muted font-light leading-relaxed mb-6">
                            {member.bio}
                          </p>
                        )}

                        {/* Kontak & Socials */}
                        <div className="flex items-center justify-between text-xs font-mono">
                          <a
                            href={`mailto:${member.email}`}
                            className="text-muted hover:text-foreground transition-colors duration-300"
                          >
                            {member.email}
                          </a>
                          
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted hover:text-accent transition-colors duration-300"
                            aria-label={`LinkedIn ${member.name}`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}