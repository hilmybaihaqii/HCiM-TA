'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TEAM_DATA } from '@/data/teamData';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function AboutHero() {
  const images = TEAM_DATA.slice(0, 7).map((member) => member.image);

  const glassBackgroundImage = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop';

  return (
    <section className="relative w-full pt-36 md:pt-44 bg-background overflow-hidden font-sans">
      
      {/* ==================== 1. CENTERED TEXT HEADER ==================== */}
      <div className="max-w-7xl mx-auto px-6 text-center relative z-20 mb-12 md:mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: luxEase }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground mb-6"
        >
          About Us
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: luxEase }}
          className="text-base sm:text-lg md:text-xl text-muted font-light leading-relaxed max-w-7xl mx-auto"
        >
          A multidisciplinary research group sitting at the intersection of electrophysiology, machine learning, and digital interface design to engineer the future of cardiac safety.
        </motion.p>
      </div>

      {/* ==================== 2. TIGHT INTERLOCKING COLLAGE ==================== */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10 pb-24 md:pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: luxEase }}
          className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 relative z-10"
        >
          
          {/* KOLOM 1: TALL (Brand Element) di atas, SHORT (Team) di bawah */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
            
            {/* SLOT 1 (KIRI ATAS): Dark Frosted Glass Brand Element */}
            <div className="group relative w-20 h-30 sm:w-32.5 sm:h-47.5 md:w-45 md:h-65 lg:w-55 lg:h-80 rounded-full overflow-hidden shrink-0 shadow-sm border border-foreground/10">
              <Image src={glassBackgroundImage} alt="Lab Background" fill className="object-cover" />
              
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center transition-colors duration-500 group-hover:bg-black/40">
                <span className="text-[10px] sm:text-sm md:text-xl font-medium tracking-tight text-white leading-tight">
                  Cardivex<br />Research
                </span>
              </div>
            </div>

            {/* SLOT 2 */}
            <div className="relative w-20 h-20 sm:w-32.5 sm:h-32.5 md:w-45 md:h-45 lg:w-55 lg:h-55 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image src={images[0]} alt="Team Member" fill className="object-cover" />
            </div>
          </div>

          {/* KOLOM 2: SHORT di atas, TALL di bawah */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
            <div className="relative w-20 h-20 sm:w-32.5 sm:h-32.5 md:w-45 md:h-45 lg:w-55 lg:h-55 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image src={images[1]} alt="Team Member" fill className="object-cover" />
            </div>
            <div className="relative w-20 h-30 sm:w-32.5 sm:h-47.5 md:w-45 md:h-65 lg:w-55 lg:h-80 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image src={images[2]} alt="Team Member" fill className="object-cover" />
            </div>
          </div>

          {/* KOLOM 3: TALL di atas, SHORT di bawah */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
            <div className="relative w-20 h-30 sm:w-32.5 sm:h-47.5 md:w-45 md:h-65 lg:w-55 lg:h-80 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image src={images[3]} alt="Team Member" fill className="object-cover" />
            </div>
            <div className="relative w-20 h-20 sm:w-32.5 sm:h-32.5 md:w-45 md:h-45 lg:w-55 lg:h-55 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image src={images[4]} alt="Team Member" fill className="object-cover" />
            </div>
          </div>

          {/* KOLOM 4: SHORT di atas, TALL di bawah */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
            <div className="relative w-20 h-20 sm:w-32.5 sm:h-32.5 md:w-45 md:h-45 lg:w-55 lg:h-55 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image src={images[5]} alt="Team Member" fill className="object-cover" />
            </div>
            <div className="relative w-20 h-30 sm:w-32.5 sm:h-47.5 md:w-45 md:h-65 lg:w-55 lg:h-80 rounded-full overflow-hidden shrink-0 shadow-sm">
              <Image src={images[6]} alt="Team Member" fill className="object-cover" />
            </div>
          </div>

        </motion.div>
      </div>
      
    </section>
  );
}