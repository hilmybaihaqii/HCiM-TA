// Penanda "sedang login" milik frontend (cookie biasa, bukan cookie sesi backend).
// Dipakai proxy.ts untuk menahan halaman publik & halaman login selama user belum logout.
// Ini hanya untuk navigasi: keamanan tetap di backend. Penanda yang basi tidak berbahaya:
// /lab memanggil /auth/me, dan kalau sesi sudah habis SessionGuard menghapus penanda ini.

export const SESSION_FLAG = "cardivex_signed_in";

const WEEK_S = 60 * 60 * 24 * 7;

export function setSessionFlag() {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_FLAG}=1; Path=/; Max-Age=${WEEK_S}; SameSite=Lax${secure}`;
}

export function clearSessionFlag() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_FLAG}=; Path=/; Max-Age=0; SameSite=Lax`;
}
