import type Lenis from 'lenis';

/*
 * Instance Lenis yang sedang aktif (hanya di landing page). Disimpan di sini supaya
 * komponen lain, misalnya Navbar saat menu dibuka, bisa menghentikan scroll halus sementara.
 */
let current: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  current = lenis;
};

export const getLenis = () => current;
