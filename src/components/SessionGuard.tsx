'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Mengecek apakah sesi di cookie backend masih hidup
    api('/auth/me')
      .then(() => {
        setIsAuthorized(true);
      })
      .catch((error) => {
        console.error('Session expired or invalid:', error);
        // Hard-redirect ke halaman login agar sisa cache ikut terhapus
        window.location.href = '/login';
      });
  }, []);

  // Selama sesi masih dicek, jangan render halaman Lab (cegah kedipan/bocor data)
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 w-full h-screen flex items-center justify-center bg-background z-[9999]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <span className="text-xs font-mono text-foreground/50 uppercase tracking-widest">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  // Jika sah, render halamannya
  return <>{children}</>;
}