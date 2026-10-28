'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface SessionUser {
  id: string;
  email: string;
  display_name: string;
  role: 'user' | 'admin';
}

const SessionContext = createContext<SessionUser | null>(null);

/**
 * User yang sedang login, dari satu panggilan /auth/me di SessionGuard.
 * Pakai ini di dalam area yang dibungkus SessionGuard, jangan panggil /auth/me lagi.
 */
export function useSessionUser(): SessionUser {
  const user = useContext(SessionContext);
  if (!user) throw new Error('useSessionUser must be used inside <SessionGuard>');
  return user;
}

/** /auth/me bisa datang polos atau dibungkus { items: [...] } */
function readUser(raw: unknown): SessionUser {
  const data = (raw as { items?: unknown[] } | null)?.items?.[0] ?? raw;
  const u = (data ?? {}) as Partial<SessionUser>;
  return {
    id: u.id ?? '',
    email: u.email ?? '',
    display_name: u.display_name ?? '',
    role: String(u.role ?? 'user').toLowerCase() === 'admin' ? 'admin' : 'user',
  };
}

export default function SessionGuard({ children, fallback }: {
  children: React.ReactNode;
  /** Opsional: tampilan selama sesi dicek (mis. skeleton). Default: teks "Verifying Session...". */
  fallback?: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const verifySession = async (attempt = 0) => {
      try {
        const data = await api('/auth/me');

        if (isMounted) {
          setUser(readUser(data));
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
  if (!user) {
    if (fallback) {
      return <div className="fixed inset-0 z-9999 bg-background overflow-hidden">{fallback}</div>;
    }
    return (
      <div className="fixed inset-0 w-full h-dvh flex items-center justify-center bg-background z-9999">
        <div className="animate-pulse">
          <span className="text-sm font-medium text-foreground/60 tracking-wider">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }
  // Jika sah, render halamannya
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}
