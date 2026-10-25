'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useInView, type PanInfo } from 'framer-motion';
import { accentSerif } from '@/lib/fonts';
import labPipette from '@/assets/about/lab-pipette.jpg';
import ecgMonitor from '@/assets/about/ecg-monitor.jpg';

/*
 * "Cara lama" vs "cara Cardivex" sebagai karusel dua slide: panah kiri/kanan, titik
 * halaman, geser (swipe) di HP, panah keyboard, dan berputar terus (02 → 01).
 * Berjalan sendiri pelan-pelan, berhenti saat disentuh/di-hover atau tidak terlihat.
 * Foto: Unsplash (lisensi Unsplash), photo-1579165466741-7f35e4755660 & photo-1682706841281-f723c5bfcd83.
 */
const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_MS = 6500;

const SLIDES = [
  {
    tag: 'The usual way',
    title: 'Lab & animal testing',
    image: labPipette,
    alt: 'A pipette dropping liquid into a vial in a lab',
    points: ['Slow and costly lab work', 'Relies on animal studies', 'Animal hearts do not always match humans'],
    tone: 'from-black/80 via-black/40 to-black/5',
  },
  {
    tag: 'With Cardivex',
    title: 'A virtual human heart cell',
    image: ecgMonitor,
    alt: 'Heart rhythm traces on a monitor',
    points: ['A result in about a minute', 'No animals needed', 'Explains which readings drove the answer'],
    tone: 'from-black/80 via-black/35 to-transparent',
  },
];

export default function CompareSlider() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const visible = useInView(frame, { amount: 0.4 });
  const s = SLIDES[index];

  // Berputar: dari slide terakhir kembali ke pertama, dan sebaliknya.
  const go = useCallback((step: number) => setState(([i]) => [(i + step + SLIDES.length) % SLIDES.length, step]), []);
  const goTo = (i: number) => setState(([cur]) => [i, i > cur ? 1 : -1]);

  useEffect(() => {
    if (paused || !visible) return;
    const id = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, visible, go]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="mb-10 md:mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <span className="mb-5 block text-xs font-medium uppercase tracking-[0.2em] text-muted">Two ways to check heart safety</span>
          <h2 className="max-w-3xl text-[clamp(2rem,4.4vw,3.75rem)] font-medium leading-[1.04] tracking-[-0.03em] text-foreground">
            Same question. <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>A faster answer.</em>
          </h2>
        </div>

        {/* kontrol: nomor slide + panah bulat hitam/putih */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted tabular-nums">
            <span className="text-foreground">0{index + 1}</span> / 0{SLIDES.length}
          </span>
          {[
            { step: -1, label: 'Previous', d: 'M15 6l-6 6 6 6' },
            { step: 1, label: 'Next', d: 'M9 6l6 6-6 6' },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => go(b.step)}
              aria-label={`${b.label} slide`}
              className="group relative isolate flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-foreground/15 text-foreground transition-[color,border-color] duration-500 hover:border-foreground hover:text-surface-white"
            >
              <span className="absolute inset-0 -z-10 scale-0 rounded-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100" />
              <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform duration-500 ${b.step > 0 ? 'group-hover:translate-x-0.5' : 'group-hover:-translate-x-0.5'}`} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={b.d} />
              </svg>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        ref={frame}
        role="region"
        aria-roledescription="carousel"
        aria-label="Two ways to check heart safety"
        tabIndex={0}
        onKeyDown={onKey}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-foreground outline-none focus-visible:ring-4 focus-visible:ring-foreground/20 sm:aspect-[16/10] md:rounded-[2.25rem] lg:aspect-[16/8]"
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={{
              enter: (d: number) => ({ clipPath: d > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }),
              center: { clipPath: 'inset(0% 0% 0% 0%)' },
              exit: (d: number) => ({ clipPath: d > 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)', transition: { duration: 1, ease: EASE } }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.1, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={onDragEnd}
            className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          >
            {/* foto bergeser pelan berlawanan arah supaya terasa berlapis */}
            <motion.div
              className="absolute inset-0"
              custom={dir}
              variants={{ enter: (d: number) => ({ x: d > 0 ? '12%' : '-12%', scale: 1.12 }), center: { x: '0%', scale: 1 }, exit: (d: number) => ({ x: d > 0 ? '-8%' : '8%' }) }}
              transition={{ duration: 1.4, ease: EASE }}
            >
              <Image src={s.image} alt={s.alt} fill sizes="(max-width: 1280px) 100vw, 1200px" placeholder="blur" className="pointer-events-none object-cover" priority={index === 0} />
            </motion.div>
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r ${s.tone}`} />

            {/* teks slide: muncul baris demi baris */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white md:inset-y-0 md:left-0 md:right-auto md:flex md:max-w-[34rem] md:flex-col md:justify-end md:p-12">
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
                className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-white/60"
              >
                {s.tag}
              </motion.span>
              <motion.h3
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
                className="text-[clamp(1.8rem,3.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em]"
              >
                {s.title}
              </motion.h3>
              <ul className="mt-5 space-y-2 md:mt-7">
                {s.points.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm text-white/85 md:text-base"
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${index === 0 ? 'bg-white/50' : 'bg-teal'}`} />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* titik halaman */}
        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 md:bottom-8 md:right-8">
          {SLIDES.map((x, i) => (
            <button
              key={x.tag}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${x.tag.toLowerCase()}`}
              aria-current={i === index}
              className="group flex h-6 items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/40 group-hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
