import { useEffect, type RefObject } from 'react';

/*
 * Gerak "sel hidup" untuk CellDiagram: sel kenyal seperti jeli. Membran menggembung pelan,
 * badan sel memipih dan memanjang bergantian sambil sedikit miring, dan organel bergoyang
 * dengan jeda kecil. Satu requestAnimationFrame mengubah beberapa atribut SVG, tanpa render
 * ulang React. Loop berhenti saat sel di luar layar atau pengguna memilih gerak minimal.
 */

/** Kapsul sel: x 70–570, y 90–310, jari-jari ujung 110 (sama dengan bentuk dasarnya) */
const R = 110;
const LEFT = 180;
const RIGHT = 460;
const TOP = 90;
const BOTTOM = 310;
const CX = 320;
const CY = 200;
const STRAIGHT = RIGHT - LEFT;
const ARC = Math.PI * R;
const PERIMETER = 2 * STRAIGHT + 2 * ARC;
const POINTS = 56;

type Pt = { x: number; y: number; nx: number; ny: number };

/** Titik dan arah normal pada keliling kapsul, s = 0..1 searah jarum jam dari kiri atas */
function stadium(s: number): Pt {
  let u = (((s % 1) + 1) % 1) * PERIMETER;
  if (u < STRAIGHT) return { x: LEFT + u, y: TOP, nx: 0, ny: -1 };
  u -= STRAIGHT;
  if (u < ARC) {
    const a = -Math.PI / 2 + u / R;
    return { x: RIGHT + R * Math.cos(a), y: CY + R * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
  }
  u -= ARC;
  if (u < STRAIGHT) return { x: RIGHT - u, y: BOTTOM, nx: 0, ny: 1 };
  u -= STRAIGHT;
  const a = Math.PI / 2 + u / R;
  return { x: LEFT + R * Math.cos(a), y: CY + R * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
}

/** Gembungan membran ke arah luar pada posisi s dan waktu t (detik): gelombang lebar yang berjalan pelan */
function wobble(s: number, t: number) {
  const k = Math.PI * 2 * s;
  return 4.2 * Math.sin(2 * k + 1.1 * t) + 2.6 * Math.sin(3 * k - 1.4 * t + 1.7) + 1.4 * Math.sin(5 * k + 0.9 * t + 0.4);
}

/** Jalur tertutup yang halus (Catmull-Rom → Bezier) */
export function membranePath(t: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < POINTS; i++) {
    const s = i / POINTS;
    const p = stadium(s);
    const d = wobble(s, t);
    pts.push({ x: p.x + p.nx * d, y: p.y + p.ny * d });
  }
  const at = (i: number) => pts[(i + POINTS) % POINTS];
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < POINTS; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return `${d}Z`;
}

/** Posisi s untuk titik di tepi atas atau bawah sel pada koordinat x (bagian lurus maupun ujung bulat) */
export function edgeS(x: number, top: boolean) {
  const left = x < LEFT;
  const right = x > RIGHT;
  if (!left && !right) return top ? (x - LEFT) / PERIMETER : (STRAIGHT + ARC + (RIGHT - x)) / PERIMETER;
  const c = Math.max(-1, Math.min(1, (x - (left ? LEFT : RIGHT)) / R));
  let a = Math.acos(c);
  if (right) {
    if (top) a = -a;
    return (STRAIGHT + (a + Math.PI / 2) * R) / PERIMETER;
  }
  if (top) a = 2 * Math.PI - a;
  return (2 * STRAIGHT + ARC + (a - Math.PI / 2) * R) / PERIMETER;
}

/**
 * Elemen yang digerakkan ditandai di dalam <svg>:
 *  data-membrane (path bentuk membran), data-body (wadah seluruh sel yang memipih/memanjang),
 *  data-edge-s (channel dan T-tubule yang menempel di membran),
 *  data-floater (organel yang bergoyang).
 */
export function useLivingCell(root: RefObject<SVGSVGElement | null>) {
  useEffect(() => {
    const svg = root.current;
    if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nav = navigator as Navigator & { deviceMemory?: number };
    // Perangkat lemah: 30 fps sudah cukup halus untuk gerak selambat ini
    const minFrame = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 ? 32 : 0;

    const membranes = [...svg.querySelectorAll<SVGPathElement>('[data-membrane]')];
    const body = svg.querySelector<SVGGElement>('[data-body]');
    // Pusat tiap organel, supaya ia berputar di tempatnya sendiri
    const floaters = [...svg.querySelectorAll<SVGGElement>('[data-floater]')].map(el => {
      const b = el.getBBox();
      return { el, cx: b.x + b.width / 2, cy: b.y + b.height / 2 };
    });
    const edges = [...svg.querySelectorAll<SVGGElement>('[data-edge-s]')].map(el => {
      const s = Number(el.dataset.edgeS);
      const { nx, ny } = stadium(s);
      return { el, s, nx, ny };
    });

    let raf = 0;
    let last = 0;
    // Langsung jalan; observer hanya menjeda saat sel keluar layar (dan melanjutkan saat kembali)
    let visible = true;
    const start = performance.now();
    // Saat sel ditekan: sel "membal" sebentar seperti jeli yang disentuh, lalu tenang lagi
    let poke = -Infinity;
    const onPoke = () => { poke = performance.now(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onPoke(); };
    svg.addEventListener('pointerdown', onPoke);
    svg.addEventListener('keydown', onKey);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (minFrame && now - last < minFrame) return;
      last = now;
      const t = (now - start) / 1000;

      const d = membranePath(t);
      membranes.forEach(el => el.setAttribute('d', d));
      edges.forEach(({ el, s, nx, ny }) => {
        const w = wobble(s, t);
        el.setAttribute('transform', `translate(${(nx * w).toFixed(2)} ${(ny * w).toFixed(2)})`);
      });

      // Kenyal: dua gelombang yang tidak seirama supaya goyangannya tidak terasa mekanis
      const squish = 0.6 * Math.sin(t * 2.1) + 0.4 * Math.sin(t * 1.3 + 1);
      const since = (now - poke) / 1000;
      const kick = since < 1.4 ? Math.exp(-3.5 * since) * Math.sin(15 * since) : 0;
      const sx = 1 + 0.03 * squish + 0.04 * kick;
      const sy = 1 - 0.04 * squish - 0.05 * kick;
      const tilt = 1.4 * Math.sin(t * 0.7);
      const skew = 1.8 * Math.sin(t * 1.1 + 0.5);
      const dx = 3 * Math.sin(t * 0.5);
      body?.setAttribute(
        'transform',
        `translate(${(CX + dx).toFixed(2)} ${CY}) rotate(${tilt.toFixed(2)}) skewX(${skew.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-CX} ${-CY})`,
      );

      // Organel bergoyang sedikit terlambat dari badan sel, seperti isi jeli
      floaters.forEach(({ el, cx, cy }, i) => {
        const lag = 0.6 * Math.sin(t * 2.1 - 0.9) + 0.4 * Math.sin(t * 1.3 + 0.1);
        const x = 3.2 * Math.sin(t * 0.8 + i * 1.9) + 2.4 * lag;
        const y = 2.6 * Math.cos(t * 0.65 + i * 2.3) - 1.6 * lag;
        const r = 4 * Math.sin(t * 0.9 + i * 1.3);
        el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)} ${cx.toFixed(1)} ${cy.toFixed(1)})`);
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === visible) return;
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(svg);
    raf = requestAnimationFrame(frame);
    return () => {
      svg.removeEventListener('pointerdown', onPoke);
      svg.removeEventListener('keydown', onKey);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [root]);
}
