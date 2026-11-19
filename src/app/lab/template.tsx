/*
 * Dipasang ulang setiap pindah halaman di area /lab: isi halaman baru memudar masuk (opacity saja,
 * tanpa geser), jadi pergantian halaman terasa halus tanpa "jedug". Animasi via CSS, tanpa JavaScript.
 * Berpindah tab di dalam panel admin tidak memicu ini (segmen /lab/admin tetap sama).
 */
export default function LabTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in w-full flex-1 flex flex-col">{children}</div>;
}
