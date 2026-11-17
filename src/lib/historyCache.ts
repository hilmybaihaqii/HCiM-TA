// Cache sisi browser untuk endpoint riwayat (/api/history/...).
// Backend & database jalan di paket gratis, jadi berpindah tab atau kembali ke Activity Logs tidak
// perlu meminta data yang sama lagi. Cache dikosongkan begitu ada prediksi / SHAP / simulasi baru,
// dan setiap entri kedaluwarsa sendiri setelah TTL sebagai pengaman.

import { api } from "./api";

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; promise: Promise<unknown> }>();

/** GET dengan cache: permintaan yang sama (termasuk yang masih berjalan) memakai satu hasil. */
export function cachedGet<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise as Promise<T>;
  const promise = api(path).catch(err => {
    cache.delete(path); // jangan simpan kegagalan; coba lagi di permintaan berikutnya
    throw err;
  });
  cache.set(path, { at: Date.now(), promise });
  return promise as Promise<T>;
}

/** Panggil setelah ada catatan baru di backend (prediksi, SHAP, simulasi selesai). */
export function invalidateHistory() {
  cache.clear();
}
