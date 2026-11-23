// Membersihkan semua data akun yang tersimpan di tab ini, supaya tidak terlihat oleh akun berikutnya.
// Dipakai saat logout dan saat sesi habis. Setelah memanggil ini, pindah halaman dengan
// window.location (bukan router) agar state di memori (laporan lab, cache riwayat) ikut hilang.

import { invalidateHistory } from "./historyCache";
import { clearSessionFlag } from "./sessionFlag";

export function clearClientSession() {
  try {
    Object.keys(sessionStorage)
      .filter(k => k === "digital-lab-report" || k.startsWith("pipeline-"))
      .forEach(k => sessionStorage.removeItem(k));
  } catch { /* storage diblokir: tidak ada yang perlu dihapus */ }
  invalidateHistory();
  clearSessionFlag();
}
