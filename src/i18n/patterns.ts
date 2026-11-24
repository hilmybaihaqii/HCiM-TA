/*
 * Kalimat yang memuat angka atau nama dinamis, jadi tidak bisa dicocokkan persis dengan kamus.
 * `tr` menerjemahkan potongan yang juga ada di kamus (mis. nama tingkat risiko).
 */
import type { ForeignLang } from './store';
type Tr = (s: string) => string;
export type Pattern = [RegExp, (m: string[], tr: Tr) => string];

const list = (s: string, tr: Tr) => s.split(', ').map(tr).join(', ');

const ID_PATTERNS: Pattern[] = [
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

const KO_PATTERNS: Pattern[] = [
  [/^Email (.+): (\S+@\S+)$/, m => `${m[1]}에게 이메일 보내기: ${m[2]}`],
  [/^LinkedIn profile of (.+) \(opens in a new tab\)$/, m => `${m[1]}의 LinkedIn 프로필 (새 탭에서 열림)`],
  [/^View Publication: (.+) \(opens in a new tab\)$/, m => `논문 보기: ${m[1]} (새 탭에서 열림)`],
  [/^Account ([\w-]{8})$/, m => `계정 ${m[1]}`],
  [/^(.+) won't be able to sign in\. The account is kept, so you can restore it at any time\.$/, m => `${m[1]} 님은 로그인할 수 없게 됩니다. 계정은 보관되므로 언제든 복원할 수 있습니다.`],
  [/^(.+) will be able to sign in again and see their history\.$/, m => `${m[1]} 님이 다시 로그인하여 기록을 볼 수 있게 됩니다.`],
  [/^([\d,]+) deactivated · ([\d,]+) admin$/, m => `비활성 ${m[1]} · 관리자 ${m[2]}`],
  [/^([\d,]+) matching events?$/, m => `일치하는 이벤트 ${m[1]}개`],
  [/^([\d,]+) matching predictions?$/, m => `일치하는 예측 ${m[1]}개`],
  [/^([\d,]+) matching accounts?$/, m => `일치하는 계정 ${m[1]}개`],
  [/^([\d,]+) matching runs?$/, m => `일치하는 실행 ${m[1]}개`],
  [/^([\d,]+) matching analys[ie]s$/, m => `일치하는 분석 ${m[1]}개`],
  [/^Deactivated on (.+)$/, m => `${m[1]}에 비활성화됨`],
  [/^Could not restore (.+?)\.(.*)$/, (m, tr) => `${tr(m[1])}을(를) 복원할 수 없습니다.${m[2]}`],
  [/^Could not deactivate (.+?)\.(.*)$/, (m, tr) => `${tr(m[1])}을(를) 비활성화할 수 없습니다.${m[2]}`],
  [/^(.+) Open the guide on (.+)$/, (m, tr) => `${tr(m[1])} ${tr(m[2])} 가이드 열기`],
  [/^Guide: (.+)$/, (m, tr) => `가이드: ${tr(m[1])}`],
  [/^In this result it was one of the main reasons the model chose (\w+)\.$/, (m, tr) => `이 결과에서 모델이 ${tr(m[1])}을(를) 선택한 주요 이유 중 하나였습니다.`],
  [/^In this result it was one of the main things holding the model back from (\w+)\.$/, (m, tr) => `이 결과에서 모델이 ${tr(m[1])}을(를) 선택하지 않게 한 주요 요인 중 하나였습니다.`],
  [/^In this result it nudged the model toward (\w+)\.$/, (m, tr) => `이 결과에서 모델을 ${tr(m[1])} 쪽으로 조금 밀었습니다.`],
  [/^In this result it nudged the model away from (\w+)\.$/, (m, tr) => `이 결과에서 모델을 ${tr(m[1])}에서 조금 멀어지게 했습니다.`],
  [/^Could not load the main drivers\. (.+)$/, (m, tr) => `주요 요인을 불러올 수 없습니다. ${tr(m[1])}`],
  [/^All (\d+) trees in the model voted (\w+)\.$/, (m, tr) => `모델의 트리 ${m[1]}개 모두 ${tr(m[2])}에 투표했습니다.`],
  [/^How the (\d+) trees in the model voted$/, m => `모델의 트리 ${m[1]}개가 투표한 방식`],
  [/^(Low|Intermediate|High|low|intermediate|high) risk$/, (m, tr) => `${tr(m[1].toLowerCase())} 위험`],
  [/^(.+) status$/, (m, tr) => `${tr(m[1])} 상태`],
  [/^with non-conformity threshold q̂ = (.+)$/, m => `비순응 임계값 q̂ = ${m[1]}`],
  [/^(\d+) days$/, m => `${m[1]}일`],
  [/^(\d+) jobs$/, m => `작업 ${m[1]}개`],
  [/^([\d,]+) saved$/, m => `${m[1]}개 저장됨`],
  [/^Drug: (.+)$/, m => `약물: ${m[1]}`],
  [/^Method: (.+)$/, (m, tr) => `방법: ${list(m[1], tr)}`],
  [/^Result: (.+)$/, (m, tr) => `결과: ${list(m[1], tr)}`],
  [/^Filter, (\d+) active$/, m => `필터, ${m[1]}개 적용`],
  [/^(\d+) selected$/, m => `${m[1]}개 선택됨`],
  [/^Mean across (\d+) simulated doses$/, m => `시뮬레이션한 ${m[1]}개 용량의 평균`],
  [/^Simulated at (.+)× Cmax, biomarkers taken as the mean over doses\.$/, m => `${m[1].replace(' and ', ', ')}× Cmax에서 시뮬레이션했으며, 바이오마커는 용량별 평균입니다.`],
  [/^Simulates the heart cell at (.+)× Cmax\.$/, m => `${m[1].replace(' and ', ', ')}× Cmax에서 심장 세포를 시뮬레이션합니다.`],
  [/^Simulating the cell at (.+)× Cmax$/, m => `${m[1].replace(' and ', ', ')}× Cmax에서 세포를 시뮬레이션하는 중`],
  [/^Enter a drug's exposure and ion-channel block\. We simulate a human ventricular cell at (.+)× Cmax, measure 11 biomarkers, and classify the risk for the mean and for each dose\.$/, m => `약물의 노출량과 이온 채널 차단 값을 입력하세요. ${m[1].replace(' and ', ', ')}× Cmax에서 인간 심실 세포를 시뮬레이션하고, 11개 바이오마커를 측정한 뒤 위험도를 분류합니다.`],
  [/^(.+) versus time$/, (m, tr) => `시간에 따른 ${tr(m[1])}`],
  [/^Invalid input: (.+)$/, m => `잘못된 입력: ${m[1]}`],
  [/^Could not start the simulation: (.+)$/, m => `시뮬레이션을 시작할 수 없습니다: ${m[1]}`],
  [/^Could not start the simulation\.$/, () => '시뮬레이션을 시작할 수 없습니다.'],
  [/^Code sent to (\S+)\. It may take a minute to arrive\.$/, m => `${m[1]}(으)로 코드를 보냈습니다. 도착까지 1분 정도 걸릴 수 있습니다.`],
  [/^Code sent to (\S+)\.$/, m => `${m[1]}(으)로 코드를 보냈습니다.`],
  [/^Resend code in (\d+)s$/, m => `${m[1]}초 후 코드 재전송`],
  [/^Digit (\d+)$/, m => `${m[1]}번째 자리`],
  [/^At least (\d+) characters$/, m => `최소 ${m[1]}자`],
  [/^Use at least (\d+) characters\.$/, m => `최소 ${m[1]}자 이상 입력하세요.`],
  [/^Welcome, (.+)\.$/, m => `${m[1]} 님, 환영합니다.`],
  [/^for (\S+)$/, m => `${m[1]} 결과`],
  [/^Show (.+)$/, (m, tr) => `${tr(m[1])} 보기`],
];

export const PATTERNS: Record<ForeignLang, Pattern[]> = { id: ID_PATTERNS, ko: KO_PATTERNS };

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ID_MONTHS: Record<string, string> = { May: 'Mei', Aug: 'Agu', Oct: 'Okt', Dec: 'Des' };

/** Tanggal dari formatWhen ("23 Nov 2026, 20:09" atau "Nov 23, 2026, 8:09 PM") */
export function translateDate(s: string, lang: ForeignLang): string | null {
  if (!/^(\d{1,2} )?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b.*\d{4}/.test(s)) return null;
  if (lang === 'id') return s.replace(/\b(May|Aug|Oct|Dec)\b/, m => ID_MONTHS[m]);
  const dmy = s.match(/^(\d{1,2}) (\w{3}) (\d{4}),? ?(.*)$/);
  const mdy = s.match(/^(\w{3}) (\d{1,2}), (\d{4}),? ?(.*)$/);
  const parts = dmy ? { d: dmy[1], m: dmy[2], y: dmy[3], rest: dmy[4] } : mdy ? { d: mdy[2], m: mdy[1], y: mdy[3], rest: mdy[4] } : null;
  if (!parts) return null;
  const month = MONTH_NAMES.indexOf(parts.m) + 1;
  const time = parts.rest.replace('AM', '오전').replace('PM', '오후');
  return `${parts.y}년 ${month}월 ${parts.d}일${time ? ` ${time}` : ''}`;
}
