import { useEffect, type RefObject } from 'react';

/*
 * Gerak "sel hidup" untuk CellDiagram: sel kenyal seperti jeli. Membran menggembung pelan,
 * badan sel memipih dan memanjang dengan pegas teredam, organel dan butiran sitoplasma ikut
 * bergoyang terlambat. Satu requestAnimationFrame mengubah beberapa atribut SVG, tanpa render
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
const POINTS = 64;

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

/**
 * Gembungan membran ke arah luar pada posisi s dan waktu t (detik): gelombang lebar yang berjalan pelan.
 * `ripple` = simpangan riak setelah sel ditekan (mode 3 dan 4 yang ikut memantul lalu mereda).
 */
function wobble(s: number, t: number, ripple = 0) {
  const k = Math.PI * 2 * s;
  return 3.8 * Math.sin(2 * k + 0.8 * t) + 2.2 * Math.sin(3 * k - 1.05 * t + 1.7) + 1.1 * Math.sin(5 * k + 0.7 * t + 0.4)
    + ripple * (Math.sin(3 * k + 0.6) + 0.6 * Math.sin(4 * k - 1.1));
}

/** Jalur tertutup yang halus (Catmull-Rom → Bezier) */
export function membranePath(t: number, ripple = 0) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < POINTS; i++) {
    const s = i / POINTS;
    const p = stadium(s);
    const d = wobble(s, t, ripple);
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
 *  data-floater (organel yang bergoyang), data-granule (butiran sitoplasma yang melayang).
 *
 * Gerak jeli memakai pegas teredam (bukan sinus murni): badan sel mengejar target yang bergeser
 * pelan lalu memantul melewatinya dan tenang kembali; organel mengikuti dengan pegas yang lebih
 * lembek sehingga terlambat dan ikut bergoyang, seperti isi agar-agar.
 */

type Spring = { x: number; v: number };
/** Satu langkah pegas teredam (semi-implicit Euler) */
function step(s: Spring, target: number, k: number, c: number, dt: number) {
  s.v += (-k * (s.x - target) - c * s.v) * dt;
  s.x += s.v * dt;
}

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
      return { el, cx: b.x + b.width / 2, cy: b.y + b.height / 2, ox: { x: 0, v: 0 }, oy: { x: 0, v: 0 } };
    });
    const granules = [...svg.querySelectorAll<SVGCircleElement>('[data-granule]')];
    const edges = [...svg.querySelectorAll<SVGGElement>('[data-edge-s]')].map(el => {
      const s = Number(el.dataset.edgeS);
      const { nx, ny } = stadium(s);
      return { el, s, nx, ny };
    });

    // Pegas badan sel: squash (memipih/memanjang), shear (miring), geser horizontal, dan riak membran
    const squash: Spring = { x: 0, v: 0 };
    const shear: Spring = { x: 0, v: 0 };
    const drift: Spring = { x: 0, v: 0 };
    const ripple: Spring = { x: 0, v: 0 };

    let raf = 0;
    let last = 0;
    let prev = 0;
    // Langsung jalan; observer hanya menjeda saat sel keluar layar (dan melanjutkan saat kembali)
    let visible = true;
    const start = performance.now();

    // Ditekan: dorongan ke pegas, jadi sel memantul beberapa kali lalu tenang
    const onPoke = () => {
      squash.v += 2.6;
      shear.v -= 1.4;
      ripple.v += 9;
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onPoke(); };
    svg.addEventListener('pointerdown', onPoke);
    svg.addEventListener('keydown', onKey);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (minFrame && now - last < minFrame) return;
      last = now;
      // dt dibatasi: setelah tab kembali aktif, pegas tidak meledak karena jeda panjang
      const dt = prev ? Math.min((now - prev) / 1000, 1 / 24) : 1 / 60;
      prev = now;
      const t = (now - start) / 1000;

      // Target bergeser pelan; pegas lembek (redaman rendah) membuatnya memantul seperti jeli
      step(squash, 0.55 * Math.sin(t * 0.9) + 0.35 * Math.sin(t * 0.47 + 1.3), 26, 2.4, dt);
      step(shear, 0.5 * Math.sin(t * 0.6 + 0.4), 18, 2.2, dt);
      step(drift, 3.2 * Math.sin(t * 0.38), 10, 3, dt);
      step(ripple, 0, 30, 2.6, dt);

      const d = membranePath(t, ripple.x);
      membranes.forEach(el => el.setAttribute('d', d));
      edges.forEach(({ el, s, nx, ny }) => {
        const w = wobble(s, t, ripple.x);
        el.setAttribute('transform', `translate(${(nx * w).toFixed(2)} ${(ny * w).toFixed(2)})`);
      });

      const q = squash.x;
      const sx = 1 + 0.034 * q;
      const sy = 1 - 0.042 * q; // memipih saat melebar: volume terasa tetap, seperti jeli
      body?.setAttribute(
        'transform',
        `translate(${(CX + drift.x).toFixed(2)} ${CY}) skewX(${(shear.x * 2.6).toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-CX} ${-CY})`,
      );

      // Organel mengejar posisinya (ikut terdorong squash) dengan pegas lebih lembek -> terlambat & bergoyang
      floaters.forEach((f, i) => {
        const tx = 2.6 * Math.sin(t * 0.55 + i * 1.9) + q * ((f.cx - CX) / 250) * 7;
        const ty = 2.2 * Math.cos(t * 0.47 + i * 2.3) - q * ((f.cy - CY) / 110) * 5;
        step(f.ox, tx, 12, 1.6, dt);
        step(f.oy, ty, 12, 1.6, dt);
        const r = 3 * Math.sin(t * 0.6 + i * 1.3) + f.ox.v * 0.6;
        f.el.setAttribute('transform', `translate(${f.ox.x.toFixed(2)} ${f.oy.x.toFixed(2)}) rotate(${r.toFixed(2)} ${f.cx.toFixed(1)} ${f.cy.toFixed(1)})`);
      });

      // Butiran sitoplasma melayang pelan (gerak Brown yang dihaluskan)
      granules.forEach((g, i) => {
        const x = 4 * Math.sin(t * (0.23 + (i % 5) * 0.04) + i * 2.1);
        const y = 3 * Math.cos(t * (0.19 + (i % 3) * 0.05) + i * 1.7);
        g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      });
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === visible) return;
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      prev = 0;
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
