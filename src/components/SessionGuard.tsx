'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const verifySession = async (attempt = 0) => {
      try {
        await api('/auth/me');

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const authError = error as { status?: number };

        if (authError.status === 401 || authError.status === 403) {
          router.replace('/login');
          return;
        }

        if (attempt < 1) {
          retryTimer = setTimeout(() => {
            void verifySession(attempt + 1);
          }, 300);
          return;
        }

        console.error('Session verification failed:', error);
        router.replace('/login');
      }
    };

    void verifySession();

    return () => {
      isMounted = false;

      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [router]);

 // Selama sesi masih dicek, jangan render halaman Lab (cegah kedipan/bocor data)
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 w-full h-screen flex items-center justify-center bg-background z-9999">
        <div className="animate-pulse">
          <span className="text-sm font-medium text-foreground/60 tracking-wider">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }
  // Jika sah, render halamannya
  return <>{children}</>;
}