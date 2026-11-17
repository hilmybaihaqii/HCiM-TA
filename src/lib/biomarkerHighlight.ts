// Kapan satu rasio biomarker ditandai merah (FRONTEND_BUGFIX_biomarker_highlight.md).
// Rasio = x_obat / |x_kontrol|, jadi "tidak berubah" = +1 untuk biomarker positif
// dan -1 untuk biomarker negatif (vrest, max_dv). Yang dibandingkan ukuran perubahannya, bukan tandanya.
export function isStrongChange(key: string, ratio: number | null | undefined): boolean {
  if (ratio == null || !Number.isFinite(ratio)) return false;
  const change = Math.abs(ratio) - 1; // vrest -1.0000 -> 0, max_dv -0.4699 -> -0.53
  switch (key) {
    case "qNet":
      return ratio < 0.9; // qNet lebih rendah = risiko TdP lebih tinggi
    case "APD50":
    case "APD90":
      return ratio > 1.1; // AP lebih panjang = pemanjangan QT
    default:
      return Math.abs(change) > 0.1; // biomarker lain: berubah >10% ke arah mana pun
  }
}
