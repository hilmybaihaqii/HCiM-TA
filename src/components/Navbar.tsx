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
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
      document.body.style.paddingRight = '0px';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Platform Overview', href: '#about', id: '01' },
    { name: 'The Paradox', href: '#problem', id: '02' },
    { name: 'ML Architecture', href: '#architecture', id: '03' },
    { name: 'Research Data', href: '#research', id: '04' },
  ];

  const curtainVariants: Variants = {
    closed: { opacity: 0, y: '-5%', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }, 
    open: { opacity: 1, y: '0%', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  const linkVariants: Variants = {
    closed: { opacity: 0, y: 15 },
    open: (i: number) => ({
      opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.05 * i + 0.1, ease: 'easeOut' }
    })
  };

  return (
    <>
      {/* === NAVBAR UTAMA === */}
      <nav className="fixed top-0 left-0 w-full z-50 pt-4 md:pt-6 px-4 md:px-12 pointer-events-none transition-all duration-500 flex justify-center">
        <div 
          className={`w-full max-w-7xl flex justify-between items-center pointer-events-auto transition-all duration-500 ease-out px-5 md:px-6 py-2.5 md:py-3 rounded-full border ${
            scrolled || isMenuOpen
              ? 'bg-surface-white/70 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-foreground/5' 
              : 'bg-transparent border-transparent shadow-none'
          }`}
        >
          
          <Link 
            href="/" 
            className="relative z-50 text-xl md:text-2xl tracking-tight font-medium text-foreground"
            onClick={() => setIsMenuOpen(false)}
          >
            cardivex<span className="text-accent">.</span>
          </Link>

          <div className="flex items-center gap-5 md:gap-8">
            <Link
              href="/login"
              className="relative z-50 px-5 py-2 text-xs font-medium tracking-[0.15em] border border-foreground text-foreground hover:bg-foreground hover:text-surface-white transition-all duration-300 rounded-full hidden sm:block"
            >
              Get Started
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="group relative z-50 flex items-center gap-3 focus:outline-none p-2 -mr-2"
              aria-label="Toggle Menu"
            >
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest font-medium text-foreground w-10 md:w-12 text-right hidden sm:block">
                {isMenuOpen ? 'CLOSE' : 'MENU'}
              </span>

              <div className="relative w-5 md:w-6 h-2 md:h-2.5 flex flex-col justify-between items-end">
                <span className={`h-[1.5px] bg-foreground transition-all duration-300 ease-out ${isMenuOpen ? 'w-full rotate-45 translate-y-[3.5px] md:translate-y-[4.5px]' : 'w-full group-hover:w-1/2'}`} />
                <span className={`h-[1.5px] bg-foreground transition-all duration-300 ease-out ${isMenuOpen ? 'w-full -rotate-45 translate-y-[-3.5px] md:translate-y-[-4.5px]' : 'w-1/2 group-hover:w-full'}`} />
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
            className="fixed inset-0 z-40 bg-background overflow-y-auto"
          >
            <div className="relative z-10 flex flex-col max-w-7xl mx-auto w-full px-6 md:px-12 pt-28 pb-10 min-h-svh">
              
              <div className="flex flex-col w-full max-w-5xl my-auto">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-8 md:mb-10"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-muted font-medium">
                    Index
                  </span>
                </motion.div>

                <div className="w-full flex flex-col gap-1 md:gap-2">
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
                        <div className="flex items-center gap-4 md:gap-10">
                          <span className="text-[10px] md:text-xs font-mono text-muted group-hover:text-foreground transition-colors duration-300">
                            {link.id}
                          </span>
                          <span className="text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground group-hover:text-accent transition-colors duration-300">
                            {link.name}
                          </span>
                        </div>
                        <svg 
                          className="w-4 h-4 md:w-5 md:h-5 text-muted opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent" 
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

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 md:mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-6"
              >
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-muted">
                  In-Silico Pharmacovigilance
                </span>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex sm:hidden items-center justify-center w-full py-3.5 text-[10px] font-medium uppercase tracking-widest text-surface-white bg-foreground rounded-full"
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