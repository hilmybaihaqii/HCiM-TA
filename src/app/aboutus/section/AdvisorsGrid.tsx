'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TEAM_DATA } from '@/data/teamData';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function AdvisorsGrid() {
  const advisors = TEAM_DATA.filter(member => member.category === 'advisor');

  return (
    <section className="relative w-full py-16 md:py-24 bg-background border-t border-foreground/10 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex items-end justify-between border-b border-foreground/10 pb-6 mb-12">
          <div>
            <span className="block text-xs font-mono text-muted mb-1.5 uppercase tracking-widest">
              Scientific Board
            </span>
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">
              Supervisors & Advisors
            </h2>
          </div>
        </div>

        {/* --- ADVISORS LEDGER --- */}
        <div className="divide-y divide-foreground/10 border-b border-foreground/10">
          {advisors.map((advisor, index) => (
            <motion.div
              key={advisor.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: luxEase }}
              className="group py-8 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 hover:bg-foreground/1.5 px-4 -mx-4 transition-colors duration-300"
            >
              
              {/* KIRI: FOTO KECIL & NAMA */}
              <div className="flex items-center gap-6 md:w-5/12 shrink-0">
                <div className="relative w-14 h-14 md:w-16 md:h-16 overflow-hidden rounded-full bg-foreground/5 shrink-0">
                  <Image
                    src={advisor.image}
                    alt={advisor.name}
                    fill
                    sizes="64px"
                    className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-medium tracking-tight text-foreground group-hover:text-accent transition-colors duration-300 mb-1">
                    {advisor.name}
                  </h4>
                  <span className="text-xs font-mono text-accent">
                    {advisor.role}
                  </span>
                </div>
              </div>

              {/* TENGAH: INSTITUSI */}
              <div className="md:w-5/12 flex flex-col justify-center">
                <p className="text-sm font-medium text-foreground mb-1 leading-snug">
                  {advisor.institution}
                </p>
                <p className="text-xs font-mono text-muted">
                  {advisor.location}
                </p>
              </div>

              {/* KANAN: KONTAK / LINKEDIN */}
              <div className="md:w-2/12 flex md:justify-end items-center gap-4">
                <a
                  href={`mailto:${advisor.email}`}
                  className="text-muted hover:text-foreground transition-colors p-2"
                  aria-label="Email"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
                <a
                  href={advisor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors p-2"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}