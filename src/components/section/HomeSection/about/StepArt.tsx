/*
 * Ilustrasi garis untuk tiap langkah "How it works" (viewBox 400 × 280).
 * Kelas animasi (digerakkan GSAP di HowItWorks):
 *   .draw → garis tergambar (pathLength=1, dash 1 → 0)
 *   .pop  → elemen muncul membesar dari 0
 *   .grow → batang memanjang dari porosnya (scaleX 0 → 1); data-origin = sisi poros
 */

const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  pathLength: 1,
  strokeDasharray: 1,
};

const TEXT = 'fill-current text-[12px] font-medium';
const MUTED = 'fill-current text-[11px] opacity-50';

/* ================= 01. Data obat → parameter simulasi ================= */
function Atom({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g className="pop">
      <circle cx={x} cy={y} r={12} className="fill-surface-white stroke-current" strokeWidth={1.75} />
      <text x={x} y={y + 4} textAnchor="middle" className="fill-current text-[11px] font-semibold">
        {label}
      </text>
    </g>
  );
}

function DrugData() {
  const sliders = [
    { y: 96, name: 'Cmax', fill: 0.55 },
    { y: 140, name: 'hERG binding', fill: 0.8 },
    { y: 184, name: 'IC50 · Hill', fill: 0.4 },
  ];
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full text-foreground" aria-hidden>
      {/* cincin molekul + ikatan rangkap */}
      <path className="draw" {...line} d="M110 106 L139.4 123 L139.4 157 L110 174 L80.6 157 L80.6 123 Z" />
      <path className="draw" {...line} d="M113.4 116 L129.1 125 M129.1 155 L113.4 164 M87.5 149 L87.5 131" />
      {/* rantai samping */}
      <path className="draw" {...line} d="M139.4 123 L164 109 M80.6 157 L56 171 M110 106 V82" />
      <Atom x={164} y={109} label="N" />
      <Atom x={56} y={171} label="O" />
      <Atom x={110} y={70} label="F" />

      {/* alur ke parameter */}
      <path className="draw" {...line} strokeOpacity={0.35} d="M196 140 H232 M226 134 L232 140 L226 146" />

      {/* slider parameter */}
      {sliders.map((s) => (
        <g key={s.name}>
          <text className={`pop ${TEXT}`} x={250} y={s.y - 12}>
            {s.name}
          </text>
          <path className="draw" {...line} strokeOpacity={0.18} d={`M250 ${s.y} H380`} />
          <path className="draw text-accent" {...line} strokeWidth={3} d={`M250 ${s.y} H${250 + 130 * s.fill}`} />
          <circle className="pop fill-surface-white stroke-current" cx={250 + 130 * s.fill} cy={s.y} r={6} strokeWidth={1.75} />
        </g>
      ))}
      <text className={`pop ${MUTED}`} x={250} y={222}>
        or the 11 measurements
      </text>
    </svg>
  );
}

/* ================= 02. Simulasi sel → Random Forest ================= */
/** Potensial aksi skematis; apd = lebar plateau dalam px. */
const apPath = (apd: number) =>
  `M36 180 H48 L52 84 C ${52 + apd * 0.3} 88, ${48 + apd * 0.75} 96, ${48 + apd} 148 S ${60 + apd} 180, ${66 + apd} 180 H184`;

function SimulatePredict() {
  const traces = [
    { apd: 74, o: 0.3 },
    { apd: 86, o: 0.5 },
    { apd: 98, o: 0.75 },
    { apd: 110, o: 1 },
  ];
  const leaves = [
    { x: 254, high: true },
    { x: 284, high: true },
    { x: 316, high: false },
    { x: 346, high: true },
  ];
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full text-foreground" aria-hidden>
      {/* sumbu plot */}
      <path className="draw" {...line} strokeOpacity={0.2} d="M36 66 V188 H190" />
      {traces.map((t) => (
        <path key={t.apd} className="draw text-accent" {...line} strokeWidth={2} strokeOpacity={t.o} d={apPath(t.apd)} />
      ))}
      <text className={`pop ${TEXT}`} x={36} y={212}>
        Cell simulated at 1–4 × Cmax
      </text>
      <text className={`pop ${MUTED}`} x={36} y={230}>
        11 biomarkers per run
      </text>

      <path className="draw" {...line} strokeOpacity={0.35} d="M204 128 H232 M226 122 L232 128 L226 134" />

      {/* pohon keputusan */}
      <path
        className="draw"
        {...line}
        d="M300 66 L270 108 M300 66 L330 108 M270 108 L254 150 M270 108 L284 150 M330 108 L316 150 M330 108 L346 150"
      />
      {[
        [300, 66],
        [270, 108],
        [330, 108],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} className="pop fill-surface-white stroke-current" cx={cx} cy={cy} r={7} strokeWidth={1.75} />
      ))}
      {leaves.map((l) => (
        <circle key={l.x} className={`pop ${l.high ? 'text-accent' : 'text-foreground/30'}`} cx={l.x} cy={150} r={7} fill="currentColor" />
      ))}
      <text className={`pop ${TEXT}`} x={300} y={184} textAnchor="middle">
        × 400 trees
      </text>

      {/* hasil voting rata-rata */}
      <rect className="grow text-accent" data-origin="left" x={244} y={206} width={70} height={10} rx={5} fill="currentColor" />
      <rect className="grow text-amber" data-origin="left" x={316} y={206} width={28} height={10} rx={5} fill="currentColor" />
      <rect className="grow text-teal" data-origin="left" x={346} y={206} width={12} height={10} rx={5} fill="currentColor" />
      <text className={`pop ${MUTED}`} x={300} y={236} textAnchor="middle">
        votes averaged
      </text>
    </svg>
  );
}

/* ================= 03. Hasil: tier + kontribusi biomarker ================= */
/* Urutan mengikuti 5 biomarker paling berpengaruh (CD-4, TreeSHAP); panjang batang ilustratif. */
const SHAP = [
  { name: 'qNet', v: 0.9 },
  { name: 'APD50', v: 0.7 },
  { name: 'APD90', v: 0.55 },
  { name: 'max_dv', v: -0.35 },
  { name: 'vrest', v: -0.2 },
];

function ClearResult() {
  const axis = 220;
  const tiers = [
    { name: 'Low', x: 40, color: 'text-teal', on: false },
    { name: 'Intermediate', x: 148, color: 'text-amber', on: false },
    { name: 'High', x: 256, color: 'text-accent', on: true },
  ];
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full text-foreground" aria-hidden>
      {/* skala tier */}
      {tiers.map((t) => (
        <g key={t.name}>
          <rect
            className={`grow ${t.color}`}
            data-origin="left"
            x={t.x}
            y={44}
            width={104}
            height={10}
            rx={5}
            fill="currentColor"
            fillOpacity={t.on ? 1 : 0.25}
          />
          <text
            className={`pop text-[12px] ${t.on ? 'fill-current font-semibold' : 'fill-current opacity-40'}`}
            x={t.x + 52}
            y={74}
            textAnchor="middle"
          >
            {t.name}
          </text>
        </g>
      ))}
      <path className="pop text-accent" d="M302 26 L314 26 L308 36 Z" fill="currentColor" />

      {/* kontribusi biomarker */}
      <path className="draw" {...line} strokeOpacity={0.25} d={`M${axis} 102 V256`} />
      {SHAP.map((b, i) => {
        const y = 118 + i * 28;
        const w = Math.abs(b.v) * 130;
        const up = b.v > 0;
        return (
          <g key={b.name}>
            <text className={`pop ${TEXT}`} x={40} y={y + 4}>
              {b.name}
            </text>
            <rect
              className={`grow ${up ? 'text-accent' : 'text-foreground/30'}`}
              data-origin={up ? 'left' : 'right'}
              x={up ? axis : axis - w}
              y={y - 6}
              width={w}
              height={12}
              rx={6}
              fill="currentColor"
            />
          </g>
        );
      })}
      <text className={`pop ${MUTED}`} x={axis - 8} y={272} textAnchor="end">
        ← lowers risk
      </text>
      <text className={`pop ${MUTED}`} x={axis + 8} y={272}>
        raises risk →
      </text>
    </svg>
  );
}

export const STEP_ART = [DrugData, SimulatePredict, ClearResult];
