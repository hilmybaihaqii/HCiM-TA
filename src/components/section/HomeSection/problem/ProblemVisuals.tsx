import Image from 'next/image';

/*
 * Visual untuk tiap bab di ProblemStory. Markup di sini selalu menampilkan keadaan AKHIR
 * (dipakai apa adanya saat prefers-reduced-motion). Keadaan awal + animasinya diatur
 * ProblemStory lewat nama kelas (lihat CHAPTER_FX di sana).
 */

export const COLOR = { ink: '#2A2A2A', teal: '#16856F', red: '#B8545C' };

const BIG = 'block text-3xl md:text-5xl font-light tabular-nums tracking-tight';

/* ================= 01. Dari 100 obat, berapa yang disetujui ================= */
/** 100 titik; 8 pertama = ±7,6% (tanpa biomarker), 8 berikutnya = tambahan sampai ±15,9% (dengan biomarker). */
export function DotsVisual() {
  const dots = Array.from({ length: 100 }, (_, i) => i);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 md:gap-8">
      <svg viewBox="0 0 300 300" className="aspect-square h-auto max-h-full w-auto min-h-0 flex-1" aria-hidden>
        {dots.map((i) => {
          const approved = i < 8;
          const bio = i >= 8 && i < 16;
          return (
            <circle
              key={i}
              className={`dot ${approved ? 'dot-approved' : bio ? 'dot-bio' : 'dot-rest'}`}
              cx={15 + (i % 10) * 30}
              cy={15 + Math.floor(i / 10) * 30}
              r={9}
              fill={bio ? COLOR.teal : COLOR.ink}
              fillOpacity={approved || bio ? 1 : 0.12}
            />
          );
        })}
      </svg>
      <div className="grid w-full max-w-md grid-cols-2 gap-4 md:gap-8">
        <div className="dots-legend-a">
          <span className={`${BIG} text-foreground`}>
            <span className="dots-count-a">7.6</span>%
          </span>
          <span className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 shrink-0 rounded-full bg-foreground" /> Usual way of picking drugs
          </span>
        </div>
        <div className="dots-legend-b">
          <span className={`${BIG} text-teal`}>
            <span className="dots-count-b">15.9</span>%
          </span>
          <span className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 shrink-0 rounded-full bg-teal" /> Picked with better early markers
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= 02. Obat yang ditarik karena irama jantung ================= */
/* Foto: Unsplash (lisensi Unsplash), photo-1513224502586-d1e602410265. */
const WITHDRAWN = [
  { year: '1998', name: 'Terfenadine', use: 'Allergy medicine' },
  { year: '1999', name: 'Astemizole', use: 'Allergy medicine' },
  { year: '2000', name: 'Cisapride', use: 'Heartburn medicine' },
];

export function WithdrawnVisual() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-5 md:gap-8">
      <div className="wd-photo relative min-h-0 flex-1 overflow-hidden rounded-[1.25rem] md:max-h-[22rem] md:rounded-[1.75rem]">
        <Image
          src="https://images.unsplash.com/photo-1513224502586-d1e602410265?auto=format&fit=crop&w=1600&q=80"
          alt="A patient monitor showing heart rhythm waves in a hospital room"
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="wd-image object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
        <span className="wd-caption absolute bottom-4 left-4 right-4 md:bottom-5 md:left-6 text-xs md:text-sm font-medium text-white">
          Pulled from the US market after causing dangerous heart rhythms
        </span>
      </div>
      <div className="relative">
        <span className="wd-line absolute inset-x-0 top-[0.35rem] h-px origin-left bg-foreground/15" />
        <ol className="relative grid grid-cols-3 gap-3 md:gap-6">
          {WITHDRAWN.map((d) => (
            <li key={d.name}>
              <span className="wd-dot mb-3 block h-3 w-3 rounded-full border-2 border-background bg-accent" />
              <span className="block overflow-hidden">
                <span className="wd-year block text-xl md:text-3xl font-light tabular-nums tracking-tight text-foreground">{d.year}</span>
              </span>
              <span className="wd-meta block">
                <span className="mt-1 block text-sm font-medium text-foreground">{d.name}</span>
                <span className="block text-xs text-muted">{d.use}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ================= 03. Paradoks hERG (ilustrasi) ================= */
/* Indeks obat yang dianggap berbahaya oleh tiap cara. FLIPPED = alarm palsu (sebenarnya aman). */
const DANGER_A = [0, 2, 3, 5, 6];
const DANGER_B = [2, 5];
const FLIPPED = DANGER_A.filter((i) => !DANGER_B.includes(i));
const DRUG_IDS = Array.from({ length: 8 }, (_, i) => i);

/* HTML, bukan SVG: teksnya tetap tajam & terbaca di layar HP. */
function CapsuleRow({ label, count, row }: { label: string; count: string; row: 'a' | 'b' }) {
  const danger = row === 'a' ? DANGER_A : DANGER_B;
  return (
    <div>
      <div className={`hg-${row}-label mb-3 flex items-baseline justify-between gap-4`}>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted">{count}</span>
      </div>
      <div className="grid grid-cols-8 gap-2 md:gap-3">
        {DRUG_IDS.map((i) => {
          const isDanger = danger.includes(i);
          const flipped = row === 'b' && FLIPPED.includes(i);
          return (
            <span key={i} className="relative flex items-center justify-center">
              {flipped && <span className="hg-ring absolute -inset-1.5 rounded-full bg-teal/15 ring-1 ring-teal" />}
              <span
                className={`hg-${row} ${flipped ? 'hg-flip' : ''} relative block h-4 w-full rounded-full border-[1.5px] md:h-5 ${
                  isDanger ? 'border-accent bg-accent' : flipped ? 'border-teal bg-teal' : 'border-foreground/30'
                }`}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function HergVisual() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-6 md:gap-10">
      <CapsuleRow row="a" label="One-channel test (hERG)" count="5 of 8 flagged" />
      <CapsuleRow row="b" label="Whole heart-cell view" count="2 of 8 flagged" />
      <div className="hg-note border-t border-foreground/10 pt-4 md:pt-5">
        <span className="flex items-start gap-2.5 text-sm text-foreground">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" />3 safe drugs flagged by mistake, and dropped.
        </span>
        <span className="mt-2 block text-[11px] text-muted">Illustration. Red means flagged as dangerous.</span>
      </div>
    </div>
  );
}

/* ================= 04. Biaya rata-rata per obat (miliar USD) ================= */
export const COST = [
  [2013, 1.3], [2014, 1.35], [2015, 1.51], [2016, 1.51], [2017, 1.82], [2018, 2.2],
  [2019, 2.43], [2020, 2.36], [2021, 1.99], [2022, 2.28], [2023, 2.21], [2024, 2.23],
] as const;

/*
 * Garis digambar di SVG yang diregangkan penuh (preserveAspectRatio="none", 100 × 100),
 * sedangkan titik & label berupa HTML yang diposisikan dengan persen. Jadi teks tidak
 * ikut mengecil di HP dan titik tidak ikut gepeng. Garis dimunculkan dengan clip-path
 * dari kiri ke kanan (bukan stroke-dash, yang rusak bila SVG diregangkan tidak proporsional).
 */
export const PX = (year: number) => ((year - 2013) / 11) * 100;
const PY = (v: number) => 100 - ((v - 1) / 1.6) * 100;
const COST_PATH = COST.map(([y, v], i) => `${i ? 'L' : 'M'}${PX(y).toFixed(2)} ${PY(v).toFixed(2)}`).join(' ');
export const COST_MARKS = [
  { year: 2013, v: 1.3, label: '$1.30B', align: 'left' as const, below: true },
  { year: 2019, v: 2.43, label: '$2.43B peak', align: 'center' as const, below: false },
  { year: 2024, v: 2.23, label: '$2.23B', align: 'right' as const, below: false },
];

export function CostVisual() {
  const shift = { left: '0%', center: '-50%', right: '-100%' };
  return (
    <div className="flex h-full w-full flex-col justify-center gap-5 md:gap-6">
      <div>
        <span className={`${BIG} text-foreground`}>
          $<span className="cost-count">2.23</span> billion
        </span>
        <span className="mt-1 block text-xs text-muted">Average cost to bring one new drug to market, 2024</span>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 md:max-h-[19rem]">
        {/* sumbu y */}
        <div className="relative mb-6 w-9 shrink-0 text-[11px] text-muted">
          {[1.5, 2, 2.5].map((v) => (
            <span key={v} className="cost-axis absolute right-0 -translate-y-1/2 tabular-nums" style={{ top: `${PY(v)}%` }}>
              ${v.toFixed(1)}B
            </span>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              {[1.5, 2, 2.5].map((v) => (
                <line key={v} className="cost-axis" x1={0} x2={100} y1={PY(v)} y2={PY(v)} stroke={COLOR.ink} strokeOpacity={0.08} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
            {/* garis + area, dibuka dari kiri ke kanan */}
            <div className="cost-reveal absolute inset-0">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden>
                <path d={`${COST_PATH} L100 100 L0 100 Z`} fill={COLOR.ink} fillOpacity={0.05} />
                <path d={COST_PATH} fill="none" stroke={COLOR.ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            {COST_MARKS.map((m) => (
              <div key={m.year} className="cost-mark absolute" style={{ left: `${PX(m.year)}%`, top: `${PY(m.v)}%` }}>
                <span
                  className={`absolute left-0 top-0 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background ${
                    m.year === 2019 ? 'bg-accent' : 'bg-foreground'
                  }`}
                />
                <span
                  className="absolute left-0 top-0 whitespace-nowrap text-xs font-medium text-foreground"
                  style={{ transform: `translate(${shift[m.align]}, ${m.below ? '0.6rem' : 'calc(-100% - 0.6rem)'})` }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2 h-4 text-[11px] text-muted">
            {[2013, 2016, 2019, 2022, 2024].map((y, i, arr) => (
              <span
                key={y}
                className="cost-axis absolute top-0 tabular-nums"
                style={{ left: `${PX(y)}%`, transform: `translateX(${i === 0 ? '0' : i === arr.length - 1 ? '-100%' : '-50%'})` }}
              >
                {y}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= 05. Hewan untuk riset jantung & darah di Inggris ================= */
/* Foto: Unsplash (lisensi Unsplash), photo-1644916118331-36b2707a881f. */
export const ANIMALS = [
  { year: '2021', n: 45841 },
  { year: '2022', n: 51762 },
  { year: '2023', n: 64010 },
];

export function AnimalsVisual() {
  const max = ANIMALS[ANIMALS.length - 1].n;
  return (
    <div className="grid h-full w-full grid-cols-1 items-center gap-6 md:grid-cols-5 md:gap-8">
      <div className="an-photo relative hidden h-full max-h-[26rem] overflow-hidden rounded-[1.75rem] md:col-span-2 md:block">
        <Image
          src="https://images.unsplash.com/photo-1644916118331-36b2707a881f?auto=format&fit=crop&w=1000&q=80"
          alt="A white laboratory rat"
          fill
          sizes="25vw"
          className="an-image object-cover"
        />
      </div>
      <div className="flex h-full max-h-[26rem] flex-col md:col-span-3">
        <span className="an-badge mb-4 self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">+39.6% in two years</span>
        <div className="flex min-h-0 flex-1 items-end gap-4 border-b border-foreground/15 md:gap-6">
          {ANIMALS.map((a, i) => (
            <div key={a.year} className="flex h-full flex-1 flex-col justify-end">
              <span className="an-val mb-2 block text-center text-sm font-medium tabular-nums text-foreground md:text-base">
                {a.n.toLocaleString('en-US')}
              </span>
              <div
                className={`an-bar w-full origin-bottom rounded-t-xl ${i === ANIMALS.length - 1 ? 'bg-accent' : 'bg-foreground/15'}`}
                // sisakan ruang untuk angka di atas batang
                style={{ height: `calc((100% - 2.25rem) * ${(a.n / max).toFixed(3)})` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-4 md:gap-6">
          {ANIMALS.map((a) => (
            <span key={a.year} className="flex-1 text-center text-xs text-muted">
              {a.year}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= 06. Akurasi: simulasi sel manusia vs jantung hewan ================= */
export function AccuracyVisual() {
  const rows = [
    { label: 'Human heart-cell simulation', note: '62 drugs tested', v: 89, bar: 'bg-teal', text: 'text-teal', cls: 'ac-a' },
    { label: 'Animal heart test (rabbit)', note: '64 drugs tested', v: 75, bar: 'bg-foreground/30', text: 'text-foreground', cls: 'ac-b' },
  ];
  return (
    <div className="flex h-full w-full flex-col justify-center gap-5 md:gap-10">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Correctly predicted heart risk</span>
        <span className="ac-delta rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-teal">+14 points</span>
      </div>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-foreground md:text-base">{r.label}</span>
              <span className="block text-xs text-muted">{r.note}</span>
            </div>
            <span className={`text-4xl font-light tabular-nums tracking-tight md:text-6xl ${r.text}`}>
              <span className={`${r.cls}-count`}>{r.v}</span>%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
            <div className={`${r.cls}-bar h-full origin-left rounded-full ${r.bar}`} style={{ width: `${r.v}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
