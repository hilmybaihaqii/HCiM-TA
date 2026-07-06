'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ActivitySquare, User, LogOut, ChevronDown } from 'lucide-react';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Daftar Menu Navigasi
  const navItems = [
    { name: 'Digital Lab', path: '/lab', icon: FlaskConical },
    { name: 'Activity Logs', path: '/lab/logs', icon: ActivitySquare },
  ];

  const handleLogout = () => {
    // Tambahkan logika penghapusan token/sesi di sini nantinya
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans selection:bg-[#E63946] selection:text-white">
      
      {/* =========================================================
          FLOATING ISLAND NAVIGATION (The "Not-a-Template" Navbar)
          ========================================================= */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl">
        <div className="bg-white/70 backdrop-blur-xl border border-black/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-4 py-2 flex items-center justify-between">
          
          {/* Bagian Kiri: Logo */}
          <Link href="/lab" className="flex items-center gap-2 pl-4 pr-6">
            <div className="w-6 h-6 rounded-full bg-[#E63946] flex items-center justify-center shadow-sm">
              <FlaskConical className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-neutral-900">
              cardiotox<span className="text-[#E63946]">.</span>
            </span>
          </Link>

          {/* Bagian Tengah: Navigasi (Pill Tabs) */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/50 p-1 rounded-full border border-neutral-200/50">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.path} className="relative px-5 py-2 rounded-full text-xs font-medium transition-colors">
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-white rounded-full shadow-sm border border-black/[0.02]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 z-10 ${isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bagian Kanan: User Profile & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-semibold text-neutral-900 leading-none">Hilmy B.</span>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5">Researcher</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500 shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Mewah */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-3 w-56 bg-white border border-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl p-2 flex flex-col z-[101]"
                >
                  <Link href="/lab/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <div className="h-px bg-neutral-100 my-1 mx-2" />
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-[#E63946] hover:bg-[#FEF2F2] transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" /> End Session
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>

      {/* =========================================================
          MAIN CONTENT AREA
          ========================================================= */}
      <div className="pt-28 pb-12">
        {children}
      </div>

    </div>
  );
}