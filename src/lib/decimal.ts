/**
 * Angka desimal dari kolom input. Backend menerima angka (JSON number), jadi tampilan di kolom
 * boleh memakai koma atau titik; yang penting nilainya diubah ke angka yang benar sebelum dikirim.
 */

/** Kolom bertitik (Full Pipeline): koma diubah jadi titik, karakter selain angka dibuang */
export function normalizeDecimal(raw: string): string {
  return raw.replace(/,/g, '.').replace(/[^0-9.eE+-]/g, '');
}

/** Kolom berkoma (Digital Lab): titik diubah jadi koma, hanya satu koma, karakter selain angka dibuang */
export function commaDecimal(raw: string): string {
  const s = raw.replace(/\./g, ',').replace(/[^0-9,eE+-]/g, '');
  const i = s.indexOf(',');
  return i < 0 ? s : s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, '');
}

/** Angka ditampilkan dengan koma desimal, mis. 1.25 -> "1,25" */
export const formatComma = (n: number) => String(n).replace('.', ',');

/** Nilai angka yang sah dari teks berkoma atau bertitik, atau null bila kosong/tidak terbaca */
export function parseDecimal(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
