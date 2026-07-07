'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ActivitySquare, User, LogOut, ChevronDown } from 'lucide-react';

export default function LabNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { name: 'Digital Lab', path: '/lab', icon: FlaskConical },
    { name: 'Activity Logs', path: '/lab/logs', icon: ActivitySquare },
  ];

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  const executeLogout = () => {
    setShowLogoutModal(false);
    router.push('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] pt-4 md:pt-6 px-4 md:px-12 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl flex justify-between items-center pointer-events-auto bg-surface-white/70 backdrop-blur-xl border border-foreground/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-full px-3 md:px-4 py-2.5">
          
          {/* LOGO */}
          <Link href="/lab" className="flex items-center pl-2 md:pl-3 group shrink-0">
            <span className="text-sm md:text-base font-medium tracking-tight text-foreground transition-transform duration-300 group-hover:scale-[1.02]">
              cardiotox<span className="text-accent">.</span>
            </span>
          </Link>

          {/* PILL NAVIGATION (Sekarang Terlihat di Mobile - Menampilkan Ikon Saja di Layar Kecil) */}
          <nav className="flex items-center gap-1 md:gap-1.5 bg-foreground/[0.03] p-1 rounded-full border border-foreground/[0.05]">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link 
                  key={item.name} 
                  href={item.path} 
                  title={item.name}
                  className="relative px-3 py-2 md:px-4 md:py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-center"
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-surface-white rounded-full shadow-sm border border-foreground/[0.02]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 z-10 transition-colors duration-300 ${isActive ? 'text-foreground font-semibold' : 'text-muted hover:text-foreground'}`}>
                    <Icon className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    {/* Teks dihilangkan pada mobile, muncul di desktop */}
                    <span className="hidden md:block">{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* USER PROFILE DROPDOWN */}
          <div className="relative pr-1 shrink-0">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-full hover:bg-foreground/[0.04] transition-colors focus:outline-none"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-medium text-foreground leading-none">Hilmy B.</span>
                <span className="text-[9px] text-muted font-mono mt-0.5 uppercase tracking-wider">Researcher</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-foreground/10 to-foreground/[0.02] border border-foreground/5 flex items-center justify-center text-muted shadow-sm">
                  <User className="w-3.5 h-3.5" />
                </div>
                {/* Jarak ikon chevron dirapikan agar tidak mepet batas kanan */}
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Glassmorphic Dropdown - Jarak dan Padding Disimetriskan */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-3 w-52 bg-surface-white/90 backdrop-blur-2xl border border-foreground/5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] rounded-2xl p-2 flex flex-col z-[101]"
                >
                  <Link 
                    href="/lab/profile" 
                    onClick={() => setShowProfileMenu(false)} 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  
                  {/* Garis pembatas (divider) diposisikan secara seimbang */}
                  <div className="h-px bg-foreground/5 my-1 mx-2" />
                  
                  <button 
                    onClick={handleLogoutClick} 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-accent hover:bg-accent/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> End Session
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* =========================================================
          LOGOUT CONFIRMATION MODAL
          ========================================================= */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
          >
            {/* Background Overlay Click to Cancel */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setShowLogoutModal(false)} 
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-[320px] bg-surface-white/80 backdrop-blur-2xl border border-foreground/10 shadow-[0_30px_80px_rgba(0,0,0,0.1)] rounded-3xl p-6 overflow-hidden"
            >
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                  <LogOut className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-medium text-foreground tracking-tight mb-1">
                  End Session
                </h3>
                <p className="text-xs text-muted leading-relaxed px-2">
                  Are you sure you want to log out of your workspace?
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={executeLogout}
                  className="w-full py-3 rounded-full bg-accent text-white text-xs font-semibold tracking-wide hover:bg-accent/90 hover:scale-[1.02] transition-all duration-300 shadow-sm"
                >
                  Yes, Log Out
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full py-3 rounded-full border border-foreground/10 bg-transparent text-foreground text-xs font-semibold tracking-wide hover:bg-foreground/[0.03] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}