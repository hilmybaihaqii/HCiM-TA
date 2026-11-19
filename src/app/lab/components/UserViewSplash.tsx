'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import ViewSplash, { VIEW_SPLASH_MS } from './ViewSplash';

/*
 * Sambutan saat admin berpindah dari panel admin ke user view. Dipicu dari menu profil
 * (startUserViewSplash), lalu dirender di layout /lab yang tetap terpasang selama perpindahan
 * halaman, jadi lapisannya menutupi pergantian halaman di belakangnya.
 * Tertutup setelah VIEW_SPLASH_MS lewat DAN halaman sudah bukan /lab/admin.
 */

type State = { active: boolean; minDone: boolean };
let state: State = { active: false, minDone: false };
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const SERVER_STATE: State = { active: false, minDone: false };

function set(next: State) {
  state = next;
  listeners.forEach(l => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

/** Dipanggil saat "User View" diklik */
export function startUserViewSplash() {
  clearTimeout(timer);
  set({ active: true, minDone: false });
  timer = setTimeout(() => set({ ...state, minDone: true }), VIEW_SPLASH_MS);
}

export default function UserViewSplash() {
  const { active, minDone } = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
  const arrived = !usePathname().startsWith('/lab/admin');
  const done = minDone && arrived;

  useEffect(() => {
    if (active && done) set({ active: false, minDone: false });
  }, [active, done]);

  return (
    <ViewSplash
      isVisible={active && !done}
      title="Welcome back."
      status={arrived ? 'User view ready' : 'Switching to user view'}
    />
  );
}
