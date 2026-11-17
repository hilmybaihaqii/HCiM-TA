'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Menjaga isi panel yang menempel (sticky) selalu utuh di layar. Bila tinggi layar lebih kecil
 * dari isinya (HP pendek, atau bar alamat Safari sedang tampil), isi diperkecil secukupnya;
 * bila layar cukup, ukurannya normal. Tinggi panel memakai dvh, jadi ikut berubah saat bar
 * browser muncul/sembunyi, dan FitBox menyesuaikan skalanya otomatis.
 *
 * Pembungkus luar harus punya tinggi pasti (mis. h-full di dalam panel h-dvh).
 */
export default function FitBox({
  children,
  className = '',
  align = 'items-center',
  min = 0.7,
}: {
  children: ReactNode;
  className?: string;
  /** Posisi vertikal saat isi muat (kelas Tailwind, boleh responsif). Saat diperkecil, isi selalu mulai dari atas. */
  align?: string;
  min?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const avail = o.clientHeight;
      const need = i.offsetHeight; // ukuran asli: transform tidak memengaruhi layout
      const next = need > avail && avail > 0 ? Math.max(min, avail / need) : 1;
      setScale((prev) => (Math.abs(prev - next) < 0.005 ? prev : next));
    };
    // Hanya ukuran LUAR yang diamati (layar/bar browser berubah), supaya skala tidak bergoyang
    // saat isi di dalamnya membuka-menutup mengikuti scroll. Diukur ulang sekali setelah font siap.
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [min]);

  return (
    <div ref={outer} className={`flex h-full w-full justify-center ${scale < 1 ? 'items-start' : align} ${className}`}>
      <div
        ref={inner}
        className="w-full shrink-0"
        style={scale < 1 ? { transform: `scale(${scale})`, transformOrigin: 'center top' } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
