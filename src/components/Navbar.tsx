'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Platform Overview', href: '#about', id: '01' },
    { name: 'The Paradox', href: '#problem', id: '02' },
    { name: 'ML Architecture', href: '#architecture', id: '03' },
    { name: 'Research Data', href: '#research', id: '04' },
  ];

  const curtainVariants: Variants = {
    closed: { 
      opacity: 0,
      y: '-5%',
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
    }, 
    open: { 
      opacity: 1,
      y: '0%',
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const linkVariants: Variants = {
    closed: { opacity: 0, y: 15 },
    open: (i: number) => ({
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        delay: 0.05 * i + 0.1, 
        ease: 'easeOut' 
      }
    })
  };

  return (
    <>
      {/* === NAVBAR UTAMA === */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 pt-6 pointer-events-none transition-all duration-500">
        <div 
          className={`max-w-7xl mx-auto flex justify-between items-center pointer-events-auto transition-all duration-500 ease-out ${
            scrolled || isMenuOpen
              ? 'bg-surface-white/70 backdrop-blur-xl px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-foreground/5' 
              : 'bg-transparent py-2'
          }`}
        >
          
          {/* Logo - Ukuran pas, jelas, elegan */}
          <Link 
            href="/" 
            className="relative z-50 text-xl md:text-2xl tracking-tight font-medium text-foreground"
            onClick={() => setIsMenuOpen(false)}
          >
            cardiotox<span className="text-accent">.</span>
          </Link>

          <div className="flex items-center gap-5 md:gap-8">
            
            {/* Tombol Get Started - Lebih terbaca dengan text-xs dan font-medium */}
            <Link
              href="/login"
              className="relative z-50 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] border border-foreground/20 text-foreground hover:bg-foreground hover:text-surface-white transition-all duration-300 rounded-full hidden sm:block"
            >
              Get Started
            </Link>

            {/* === TOGGLE MENU BARU (Tanpa Lingkaran, Menyatu, Lebih Besar) === */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group relative z-50 flex items-center gap-3 focus:outline-none p-2 -mr-2"
              aria-label="Toggle Menu"
            >
              {/* Teks Menu/Close - Jelas & Tegas */}
              <span className="text-xs font-mono uppercase tracking-widest font-medium text-foreground w-12 text-right hidden sm:block">
                {isMenuOpen ? 'CLOSE' : 'MENU'}
              </span>

              {/* Ikon 2 Garis - Tanpa Border Bulat, ketebalan 1.5px agar solid */}
              <div className="relative w-6 h-3.5 flex flex-col justify-between items-end">
                <span className={`h-[1.5px] bg-foreground transition-all duration-300 ease-out ${isMenuOpen ? 'w-full rotate-45 translate-y-1.5' : 'w-full group-hover:w-3/4'}`} />
                <span className={`h-[1.5px] bg-foreground transition-all duration-300 ease-out ${isMenuOpen ? 'w-full -rotate-45 translate-y-[6.5px]' : 'w-3/4 group-hover:w-full'}`} />
              </div>
            </button>

          </div>
        </div>
      </nav>

      {/* === OVERLAY MENU === */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            variants={curtainVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 z-40 bg-background flex flex-col"
          >
            <div className="relative z-10 flex flex-col max-w-5xl mx-auto w-full px-8 md:px-12 pt-32 pb-12 h-full justify-center">
              
              <div className="flex flex-col w-full">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-10"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted font-medium">
                    Index
                  </span>
                </motion.div>

                {/* Daftar Tautan - Teks lebih solid (font-medium) agar tidak pudar */}
                <div className="w-full flex flex-col gap-2">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      custom={i}
                      variants={linkVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="w-full"
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center justify-between w-full py-4 border-b border-foreground/10 hover:border-foreground/30 transition-colors duration-300"
                      >
                        <div className="flex items-center gap-6 md:gap-10">
                          <span className="text-xs font-mono text-muted group-hover:text-foreground transition-colors duration-300">
                            {link.id}
                          </span>
                          <span className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
                            {link.name}
                          </span>
                        </div>
                        
                        <svg 
                          className="w-5 h-5 text-muted opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer Panel Kaca Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-auto pt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4"
              >
                <span className="text-xs font-mono uppercase tracking-widest text-muted">
                  In-Silico Pharmacovigilance
                </span>
                
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex sm:hidden items-center justify-center w-full py-3 text-xs font-medium uppercase tracking-widest text-surface-white bg-foreground rounded-full"
                >
                  Get Started
                </Link>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}