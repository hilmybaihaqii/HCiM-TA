/*
 * Kalimat yang memuat angka atau nama dinamis, jadi tidak bisa dicocokkan persis dengan kamus.
 * `tr` menerjemahkan potongan yang juga ada di kamus (mis. nama tingkat risiko).
 */
type Tr = (s: string) => string;
export type Pattern = [RegExp, (m: string[], tr: Tr) => string];

const list = (s: string, tr: Tr) => s.split(', ').map(tr).join(', ');

export const PATTERNS: Pattern[] = [
  [/^Email (.+): (\S+@\S+)$/, m => `Kirim email ke ${m[1]}: ${m[2]}`],
  [/^LinkedIn profile of (.+) \(opens in a new tab\)$/, m => `Profil LinkedIn ${m[1]} (terbuka di tab baru)`],
  [/^View Publication: (.+) \(opens in a new tab\)$/, m => `Lihat publikasi: ${m[1]} (terbuka di tab baru)`],
  [/^Account ([\w-]{8})$/, m => `Akun ${m[1]}`],
  [/^(.+) won't be able to sign in\. The account is kept, so you can restore it at any time\.$/, m => `${m[1]} tidak akan bisa masuk. Akun tetap disimpan, jadi kamu bisa memulihkannya kapan saja.`],
  [/^(.+) will be able to sign in again and see their history\.$/, m => `${m[1]} akan bisa masuk lagi dan melihat riwayatnya.`],
  [/^([\d,]+) deactivated · ([\d,]+) admin$/, m => `${m[1]} nonaktif · ${m[2]} admin`],
  [/^([\d,]+) matching events?$/, m => `${m[1]} peristiwa cocok`],
  [/^([\d,]+) matching predictions?$/, m => `${m[1]} prediksi cocok`],
  [/^([\d,]+) matching accounts?$/, m => `${m[1]} akun cocok`],
  [/^([\d,]+) matching runs?$/, m => `${m[1]} simulasi cocok`],
  [/^([\d,]+) matching analys[ie]s$/, m => `${m[1]} analisis cocok`],
  [/^Deactivated on (.+)$/, m => `Dinonaktifkan pada ${m[1]}`],
  [/^Could not restore (.+?)\.(.*)$/, (m, tr) => `Tidak dapat memulihkan ${tr(m[1])}.${m[2]}`],
  [/^Could not deactivate (.+?)\.(.*)$/, (m, tr) => `Tidak dapat menonaktifkan ${tr(m[1])}.${m[2]}`],
  [/^(.+) Open the guide on (.+)$/, (m, tr) => `${tr(m[1])} Buka panduan tentang ${tr(m[2])}`],
  [/^Guide: (.+)$/, (m, tr) => `Panduan: ${tr(m[1])}`],
  [/^In this result it was one of the main reasons the model chose (\w+)\.$/, (m, tr) => `Pada hasil ini, biomarker ini salah satu alasan utama model memilih ${tr(m[1])}.`],
  [/^In this result it was one of the main things holding the model back from (\w+)\.$/, (m, tr) => `Pada hasil ini, biomarker ini salah satu penahan utama model untuk memilih ${tr(m[1])}.`],
  [/^In this result it nudged the model toward (\w+)\.$/, (m, tr) => `Pada hasil ini, biomarker ini sedikit mendorong model menuju ${tr(m[1])}.`],
  [/^In this result it nudged the model away from (\w+)\.$/, (m, tr) => `Pada hasil ini, biomarker ini sedikit menjauhkan model dari ${tr(m[1])}.`],
  [/^Could not load the main drivers\. (.+)$/, (m, tr) => `Faktor utama tidak dapat dimuat. ${tr(m[1])}`],
  [/^All (\d+) trees in the model voted (\w+)\.$/, (m, tr) => `Semua ${m[1]} pohon dalam model memilih ${tr(m[2])}.`],
  [/^How the (\d+) trees in the model voted$/, m => `Cara ${m[1]} pohon dalam model memberi suara`],
  [/^(Low|Intermediate|High|low|intermediate|high) risk$/, (m, tr) => `Risiko ${tr(m[1]).toLowerCase()}`],
  [/^(.+) status$/, (m, tr) => `Status ${tr(m[1])}`],
  [/^with non-conformity threshold q̂ = (.+)$/, m => `dengan ambang non-konformitas q̂ = ${m[1]}`],
  [/^(\d+) days$/, m => `${m[1]} hari`],
  [/^(\d+) jobs$/, m => `${m[1]} job`],
  [/^([\d,]+) saved$/, m => `${m[1]} tersimpan`],
  [/^Drug: (.+)$/, m => `Obat: ${m[1]}`],
  [/^Method: (.+)$/, (m, tr) => `Metode: ${list(m[1], tr)}`],
  [/^Result: (.+)$/, (m, tr) => `Hasil: ${list(m[1], tr)}`],
  [/^Filter, (\d+) active$/, m => `Filter, ${m[1]} aktif`],
  [/^(\d+) selected$/, m => `${m[1]} dipilih`],
  [/^Mean across (\d+) simulated doses$/, m => `Rata-rata dari ${m[1]} dosis simulasi`],
  [/^Simulated at (.+)× Cmax, biomarkers taken as the mean over doses\.$/, m => `Disimulasikan pada ${m[1].replace(' and ', ' dan ')}× Cmax, biomarker diambil dari rata-rata seluruh dosis.`],
  [/^Simulates the heart cell at (.+)× Cmax\.$/, m => `Menyimulasikan sel jantung pada ${m[1].replace(' and ', ' dan ')}× Cmax.`],
  [/^Simulating the cell at (.+)× Cmax$/, m => `Menyimulasikan sel pada ${m[1].replace(' and ', ' dan ')}× Cmax`],
  [/^Enter a drug's exposure and ion-channel block\. We simulate a human ventricular cell at (.+)× Cmax, measure 11 biomarkers, and classify the risk for the mean and for each dose\.$/, m => `Masukkan paparan obat dan blokade kanal ion. Kami menyimulasikan sel ventrikel manusia pada ${m[1].replace(' and ', ' dan ')}× Cmax, mengukur 11 biomarker, lalu mengklasifikasikan risikonya.`],
  [/^(.+) versus time$/, (m, tr) => `${tr(m[1])} terhadap waktu`],
  [/^Invalid input: (.+)$/, m => `Input tidak valid: ${m[1]}`],
  [/^Could not start the simulation: (.+)$/, m => `Simulasi tidak dapat dimulai: ${m[1]}`],
  [/^Could not start the simulation\.$/, () => 'Simulasi tidak dapat dimulai.'],
  [/^Code sent to (\S+)\. It may take a minute to arrive\.$/, m => `Kode dikirim ke ${m[1]}. Mungkin perlu semenit untuk sampai.`],
  [/^Code sent to (\S+)\.$/, m => `Kode dikirim ke ${m[1]}.`],
  [/^Resend code in (\d+)s$/, m => `Kirim ulang kode dalam ${m[1]} dtk`],
  [/^Digit (\d+)$/, m => `Digit ${m[1]}`],
  [/^At least (\d+) characters$/, m => `Minimal ${m[1]} karakter`],
  [/^Use at least (\d+) characters\.$/, m => `Gunakan minimal ${m[1]} karakter.`],
  [/^Welcome, (.+)\.$/, m => `Selamat datang, ${m[1]}.`],
  [/^for (\S+)$/, m => `untuk ${m[1]}`],
  [/^Show (.+)$/, (m, tr) => `Tampilkan ${tr(m[1])}`],
];

const MONTHS: Record<string, string> = { May: 'Mei', Aug: 'Agu', Oct: 'Okt', Dec: 'Des' };

/** Tanggal dari formatWhen: hanya nama bulan yang berbeda */
export function translateDate(s: string): string | null {
  if (!/^(\d{1,2} )?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b.*\d{4}/.test(s)) return null;
  return s.replace(/\b(May|Aug|Oct|Dec)\b/, m => MONTHS[m]);
}
