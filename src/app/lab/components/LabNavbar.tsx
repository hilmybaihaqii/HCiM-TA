'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ActivitySquare, User, LogOut, ChevronDown, Shield, MonitorPlay, Workflow } from 'lucide-react';
import { api } from '@/lib/api';
import { useSessionUser } from '@/components/SessionGuard';

export default function LabNavbar() {
  const pathname = usePathname();
  const user = useSessionUser();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Deteksi apakah user sedang berada di area admin
  const isAdminRoute = pathname?.startsWith('/lab/admin');

  // Menu profil menutup saat klik/tap di luar atau tekan Escape
  useEffect(() => {
    if (!showProfileMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setShowProfileMenu(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowProfileMenu(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showProfileMenu]);

  const navItems = [
    { name: 'Full Pipeline', path: '/lab/pipeline', icon: Workflow },
    { name: 'Digital Lab', path: '/lab', icon: FlaskConical },
    { name: 'Activity Logs', path: '/lab/logs', icon: ActivitySquare },
  ];

  // Pil menu: posisi diukur dari tombol aktif lalu digeser dengan CSS transform.
  // Tab yang diklik langsung jadi tujuan (tanpa menunggu halaman baru selesai dimuat), jadi pil
  // bergerak sekali, mulus, di jalurnya. Sebelumnya layoutId Framer melompat saat isi halaman berganti.
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // Klik dicatat bersama path asalnya; begitu path berganti, catatan ini otomatis tidak dipakai lagi
  const [clicked, setClicked] = useState<{ to: string; from: string | null } | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const activePath = clicked && clicked.from === pathname ? clicked.to : pathname;
  const activeIndex = navItems.findIndex(item => item.path === activePath);

  useLayoutEffect(() => {
    const measure = () => {
      const el = linkRefs.current[activeIndex];
      setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
    };
    measure();
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [activeIndex, isAdminRoute]);

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  const executeLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api("/auth/logout", { method: "POST" }); 
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowLogoutModal(false);
      setIsLoggingOut(false);
      // Hasil lab yang diingat per tab (Digital Lab, job pipeline, dosis) jangan terlihat oleh akun berikutnya
      try {
        Object.keys(sessionStorage)
          .filter(k => k === 'digital-lab-report' || k.startsWith('pipeline-'))
          .forEach(k => sessionStorage.removeItem(k));
      } catch { /* storage diblokir: tidak ada yang perlu dihapus */ }
      window.location.href = '/login';
    }
  };

  const getFirstName = (name?: string) => {
    if (!name) return '...';
    return name.trim().split(' ')[0];
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 pt-[max(1rem,env(safe-area-inset-top))] md:pt-[max(1.5rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:px-12 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl flex items-center pointer-events-auto bg-surface-white/70 backdrop-blur-xl border border-foreground/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-full px-3 md:px-4 py-2.5">
          
          {/* ============================== */}
          {/* BAGIAN KIRI: LOGO              */}
          {/* ============================== */}
          <div className="flex-1 flex justify-start">
            <Link href="/lab" className="flex items-center pl-1 md:pl-2 group shrink-0">
              <span className="text-sm md:text-base font-medium tracking-tight text-foreground transition-transform duration-300 group-hover:scale-[1.02]">
                cardivex<span className="text-accent">.</span>
              </span>
            </Link>
          </div>

          {/* ============================== */}
          {/* BAGIAN TENGAH: MENU DINAMIS    */}
          {/* ============================== */}
          <div className="shrink-0 flex items-center justify-center">
            {!isAdminRoute && (
              <nav
                ref={navRef}
                id="tour-navbar-menu"
                className="relative flex items-center gap-1 md:gap-1.5 bg-foreground/5 p-1 rounded-full border border-foreground/8"
              >
                {/* Satu pil bersama yang bergeser ke tab aktif */}
                {pill && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 bottom-1 left-0 rounded-full bg-surface-white shadow-sm border border-foreground/10 transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                    style={{ width: pill.w, transform: `translateX(${pill.x}px)` }}
                  />
                )}
                {navItems.map((item, i) => {
                  const isActive = activePath === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      ref={el => { linkRefs.current[i] = el; }}
                      href={item.path}
                      title={item.name}
                      onClick={() => setClicked({ to: item.path, from: pathname })}
                      aria-current={pathname === item.path ? 'page' : undefined}
                      className={`relative z-10 px-3 py-2 md:px-4 md:py-1.5 rounded-full text-xs font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                        isActive ? 'text-foreground' : 'text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4 md:w-3.5 md:h-3.5" />
                      <span className="hidden md:block">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* ============================== */}
          {/* BAGIAN KANAN: PROFIL           */}
          {/* ============================== */}
          <div ref={profileRef} className="flex-1 flex justify-end relative">
            <button
              id="tour-user-profile"
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full hover:bg-foreground/4 transition-colors focus:outline-none"
            >
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-xs font-medium text-foreground leading-none truncate max-w-30">
                  {getFirstName(user.display_name)}
                </span>
                <span className="text-[10px] text-muted font-mono mt-0.5 tracking-wide truncate max-w-32.5">
                  {user.email}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-foreground/10 to-foreground/2 border border-foreground/5 flex items-center justify-center text-muted shadow-sm overflow-hidden">
                  <User className="w-3.5 h-3.5" />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-3 w-52 bg-surface-white/90 backdrop-blur-2xl border border-foreground/5 shadow-[0_16px_40px_rgba(0,0,0,0.08)] rounded-card p-2 flex flex-col z-101"
                >
                  <Link 
                    href="/lab/profile" 
                    onClick={() => setShowProfileMenu(false)} 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-control text-xs font-medium text-muted hover:text-foreground hover:bg-foreground/3 transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>

                  {/* LOGIKA SWITCHER (Menggunakan Link Biasa Tanpa Animasi Tambahan) */}
                  {user.role === 'admin' && (
                    <>
                      <div className="h-px bg-foreground/5 my-1 mx-2" />
                      {!isAdminRoute ? (
                        <Link 
                          href="/lab/admin" 
                          onClick={() => setShowProfileMenu(false)} 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-control text-xs font-medium text-muted hover:text-foreground hover:bg-foreground/3 transition-colors"
                        >
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      ) : (
                        <Link 
                          href="/lab" 
                          onClick={() => setShowProfileMenu(false)} 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-control text-xs font-medium text-muted hover:text-foreground hover:bg-foreground/3 transition-colors"
                        >
                          <MonitorPlay className="w-4 h-4" /> User View
                        </Link>
                      )}
                    </>
                  )}
                  
                  <div className="h-px bg-foreground/5 my-1 mx-2" />
                  
                  <button 
                    onClick={handleLogoutClick} 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-control text-xs font-medium text-accent hover:bg-accent/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
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
            className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => !isLoggingOut && setShowLogoutModal(false)} />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-[320px] bg-surface-white/80 backdrop-blur-2xl border border-foreground/10 shadow-[0_30px_80px_rgba(0,0,0,0.1)] rounded-sheet p-6 overflow-hidden"
            >
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
                  <LogOut className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-medium text-foreground tracking-tight mb-1">
                  Sign out?
                </h3>
                <p className="text-xs text-muted leading-relaxed px-2">
                  You can sign back in at any time.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={executeLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-control bg-accent text-white text-xs font-semibold tracking-wide hover:bg-accent/90 hover:scale-[1.02] transition-all duration-300 shadow-sm disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isLoggingOut ? 'Signing out…' : 'Sign out'}
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="w-full py-3 rounded-control border border-foreground/10 bg-transparent text-foreground text-xs font-semibold tracking-wide hover:bg-foreground/3 transition-colors disabled:opacity-50"
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