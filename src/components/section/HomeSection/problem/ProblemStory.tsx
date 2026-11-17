'use client';

import { useRef, type ComponentType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { accentSerif } from '@/lib/fonts';
import BubbleLink from '@/components/ui/BubbleLink';
import FitBox from '@/components/ui/FitBox';
import { ANIMALS, AccuracyVisual, AnimalsVisual, COLOR, COST_MARKS, CostVisual, DotsVisual, HergVisual, PX, WithdrawnVisual } from './ProblemVisuals';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const em = (text: string) => <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>{text}</em>;

type Chapter = { kicker: string; title: ReactNode; body: string; source: string; Visual: ComponentType };

/* Semua angka diambil dari dokumen CD-1 (Bab 1.1) dan sumber aslinya; lihat `source`. */
const CHAPTERS: Chapter[] = [
  {
    kicker: 'Few drugs make it',
    title: <>Only 7.6 in 100 drugs {em('get approved.')}</>,
    body: 'Of every 100 drugs tested in people, fewer than 8 reach the market. Choosing drugs with better early markers doubles that to 15.9.',
    source: 'BIO, Informa Pharma Intelligence & QLS Advisors, 2011–2020',
    Visual: DotsVisual,
  },
  {
    kicker: 'The heart is a weak spot',
    title: <>Some drugs {em('upset the heartbeat.')}</>,
    body: 'They can trigger Torsade de Pointes, a fast and irregular rhythm that can kill. Three widely used medicines were pulled from the US market for it.',
    source: 'US FDA market withdrawals, 1998–2000',
    Visual: WithdrawnVisual,
  },
  {
    kicker: 'False alarms',
    title: <>The usual test {em('drops safe drugs too.')}</>,
    body: 'Standard screening checks one channel in the heart cell, called hERG. Many drugs block it and stay safe, because other channels balance the effect. A one-channel test cannot see that.',
    source: 'Fuadah et al., Front. Physiol. 2023 · Delre et al., Front. Pharmacol. 2022',
    Visual: HergVisual,
  },
  {
    kicker: 'Every mistake is expensive',
    title: <>One new drug now costs {em('over $2 billion.')}</>,
    body: 'The average cost nearly doubled between 2013 and 2024. Each safe drug dropped by mistake throws away years of work.',
    source: 'Deloitte, top 20 biopharma companies, 2013–2024',
    Visual: CostVisual,
  },
  {
    kicker: 'Still tested on animals',
    title: <>Animal use is {em('going up, not down.')}</>,
    body: 'In Great Britain, animals used in heart and blood research rose by almost 40% in just two years.',
    source: 'UK Home Office, statistics of scientific procedures, 2021–2023',
    Visual: AnimalsVisual,
  },
  {
    kicker: 'A better way exists',
    title: <>Human cell simulations {em('predict better.')}</>,
    body: 'Computer models of human heart cells judged drug heart risk more accurately than tests on animal hearts.',
    source: 'Passini et al., Frontiers in Physiology, 2017',
    Visual: AccuracyVisual,
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

/* Baris teks dibungkus "jendela" overflow-hidden; pb kecil supaya ekor huruf serif tidak terpotong. */
function Mask({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden pb-[0.12em] -mb-[0.12em] ${className}`}>{children}</div>;
}

type Q = (sel: string) => Element[];
type Tl = gsap.core.Timeline;

/** Angka yang naik/turun mengikuti scroll (bisa mundur karena memakai scrub). */
const count = (
  tl: Tl,
  el: Element | undefined,
  from: number,
  to: number,
  fmt: (v: number) => string,
  at?: gsap.Position,
  duration = 0.9,
) => {
  if (!el) return;
  const o = { v: from };
  tl.fromTo(o, { v: from }, { v: to, duration, ease: 'power1.out', onUpdate: () => (el.textContent = fmt(o.v)) }, at);
};
const fixed = (d: number) => (v: number) => v.toFixed(d);
const thousands = (v: number) => Math.round(v).toLocaleString('en-US');

/*
 * Efek tiap bab dibuat berbeda supaya tidak monoton:
 * 01 titik menyebar dari tengah · 02 foto terbuka melingkar · 03 kapsul berjalan seperti ban berjalan
 * 04 grafik terbuka dari kiri · 05 foto naik + batang tumbuh & menghitung · 06 batang akurasi berlomba.
 * `init` = keadaan awal, `enter` = animasi saat bab masuk, `extra` = langkah kedua ("oh ini... lalu oh ini").
 */
const CHAPTER_FX: { init: (q: Q) => void; enter: (tl: Tl, q: Q) => void; extra?: (tl: Tl, q: Q) => void }[] = [
  {
    init: (q) => {
      gsap.set(q('.dot'), { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(q('.dot-bio'), { fill: COLOR.ink, fillOpacity: 0.12 });
      gsap.set(q('.dot-approved'), { fillOpacity: 0.12 });
      gsap.set(q('.dots-legend-a, .dots-legend-b'), { autoAlpha: 0, y: 16 });
    },
    enter: (tl, q) => {
      tl.to(q('.dot'), { scale: 1, duration: 0.6, stagger: { grid: [10, 10], from: 'center', amount: 0.9 }, ease: 'back.out(1.7)' })
        .to(q('.dot-approved'), { fillOpacity: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out' })
        .to(q('.dots-legend-a'), { autoAlpha: 1, y: 0, duration: 0.5 }, '<');
      count(tl, q('.dots-count-a')[0], 0, 7.6, fixed(1), '<', 0.7);
    },
    extra: (tl, q) => {
      tl.to(q('.dot-bio'), { fill: COLOR.teal, fillOpacity: 1, duration: 0.45, stagger: 0.07, ease: 'power2.out' }).to(
        q('.dots-legend-b'),
        { autoAlpha: 1, y: 0, duration: 0.5 },
        '<',
      );
      count(tl, q('.dots-count-b')[0], 7.6, 15.9, fixed(1), '<', 0.7);
    },
  },
  {
    init: (q) => {
      gsap.set(q('.wd-photo'), { clipPath: 'circle(0% at 50% 55%)' });
      gsap.set(q('.wd-image'), { scale: 1.35 });
      gsap.set(q('.wd-caption'), { autoAlpha: 0, y: 12 });
      gsap.set(q('.wd-line'), { scaleX: 0 });
      gsap.set(q('.wd-dot'), { scale: 0 });
      gsap.set(q('.wd-year'), { yPercent: 110 });
      gsap.set(q('.wd-meta'), { autoAlpha: 0, y: 10 });
    },
    enter: (tl, q) => {
      tl.to(q('.wd-photo'), { clipPath: 'circle(80% at 50% 55%)', duration: 1.2, ease: 'power2.inOut' })
        .to(q('.wd-image'), { scale: 1, duration: 1.5, ease: 'power2.out' }, '<')
        .to(q('.wd-caption'), { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.5')
        .to(q('.wd-line'), { scaleX: 1, duration: 1, ease: 'power2.inOut' }, '-=0.3');
      // tiap titik muncul tepat saat garis melewatinya
      q('li').forEach((_, i) => {
        tl.to(q('.wd-dot')[i], { scale: 1, duration: 0.35, ease: 'back.out(2)' }, i === 0 ? '<0.15' : '<0.3')
          .to(q('.wd-year')[i], { yPercent: 0, duration: 0.6, ease: 'power3.out' }, '<0.05')
          .to(q('.wd-meta')[i], { autoAlpha: 1, y: 0, duration: 0.5 }, '<0.15');
      });
    },
  },
  {
    init: (q) => {
      gsap.set(q('.hg-a'), { x: -36, autoAlpha: 0 });
      gsap.set(q('.hg-b'), { scale: 0.4, autoAlpha: 0 });
      gsap.set(q('.hg-flip'), { backgroundColor: COLOR.red, borderColor: COLOR.red });
      gsap.set(q('.hg-a-label, .hg-b-label, .hg-note'), { autoAlpha: 0, y: 12 });
      gsap.set(q('.hg-ring'), { autoAlpha: 0, scale: 0.5 });
    },
    enter: (tl, q) => {
      tl.to(q('.hg-a-label'), { autoAlpha: 1, y: 0, duration: 0.5 }).to(
        q('.hg-a'),
        { x: 0, autoAlpha: 1, duration: 0.6, stagger: 0.09, ease: 'power3.out' },
        '<0.15',
      );
    },
    extra: (tl, q) => {
      tl.to(q('.hg-b-label'), { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(q('.hg-b'), { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)' }, '<0.15')
        // alarm palsu "berbalik" dari merah ke hijau
        .to(q('.hg-flip'), { backgroundColor: COLOR.teal, borderColor: COLOR.teal, scale: 1.18, duration: 0.45, stagger: 0.12, ease: 'power2.out' }, '+=0.2')
        .to(q('.hg-flip'), { scale: 1, duration: 0.4, stagger: 0.12, ease: 'power2.inOut' }, '<0.25')
        .to(q('.hg-ring'), { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.6)' }, '<')
        .to(q('.hg-note'), { autoAlpha: 1, y: 0, duration: 0.5 }, '<0.3');
    },
  },
  {
    init: (q) => {
      gsap.set(q('.cost-reveal'), { clipPath: 'inset(-10% 100% -10% -2%)' });
      gsap.set(q('.cost-axis'), { autoAlpha: 0 });
      gsap.set(q('.cost-mark'), { autoAlpha: 0, scale: 0.6 });
    },
    enter: (tl, q) => {
      const draw = 1.8;
      tl.to(q('.cost-axis'), { autoAlpha: 1, duration: 0.5, stagger: 0.04 }).to(
        q('.cost-reveal'),
        { clipPath: 'inset(-10% -2% -10% -2%)', duration: draw, ease: 'none' },
        '<0.2',
      );
      const start = tl.duration() - draw;
      // titik & label muncul tepat saat garis sampai di tahunnya
      COST_MARKS.forEach((m, i) =>
        tl.to(q('.cost-mark')[i], { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)' }, start + (PX(m.year) / 100) * draw),
      );
      count(tl, q('.cost-count')[0], 1.3, 2.23, fixed(2), start, draw);
    },
  },
  {
    init: (q) => {
      gsap.set(q('.an-photo'), { clipPath: 'inset(100% 0% 0% 0% round 28px)' });
      gsap.set(q('.an-image'), { scale: 1.3, yPercent: 8 });
      gsap.set(q('.an-bar'), { scaleY: 0 });
      gsap.set(q('.an-val'), { autoAlpha: 0 });
      gsap.set(q('.an-badge'), { autoAlpha: 0, scale: 0.8 });
    },
    enter: (tl, q) => {
      tl.to(q('.an-photo'), { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.1, ease: 'power3.inOut' })
        .to(q('.an-image'), { scale: 1, yPercent: 0, duration: 1.4, ease: 'power2.out' }, '<');
      ANIMALS.forEach((a, i) => {
        const at = i === 0 ? '-=0.6' : '<0.3';
        tl.to(q('.an-bar')[i], { scaleY: 1, duration: 0.8, ease: 'power2.out' }, at).to(q('.an-val')[i], { autoAlpha: 1, duration: 0.3 }, '<');
        count(tl, q('.an-val')[i], 0, a.n, thousands, '<', 0.8);
      });
      tl.to(q('.an-badge'), { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.8)' });
    },
  },
  {
    init: (q) => {
      gsap.set(q('.ac-a-bar, .ac-b-bar'), { scaleX: 0 });
      gsap.set(q('.ac-delta'), { autoAlpha: 0, scale: 0.8 });
    },
    enter: (tl, q) => {
      // dua batang "berlomba"; batang simulasi manusia sampai lebih jauh
      tl.to(q('.ac-a-bar'), { scaleX: 1, duration: 1.4, ease: 'power2.out' }).to(q('.ac-b-bar'), { scaleX: 1, duration: 1.4, ease: 'power2.out' }, '<');
      count(tl, q('.ac-a-count')[0], 0, 89, fixed(0), '<', 1.4);
      count(tl, q('.ac-b-count')[0], 0, 75, fixed(0), '<', 1.4);
      tl.to(q('.ac-delta'), { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.8)' });
    },
  },
];

export default function ProblemStory() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const chapters = gsap.utils.toArray<HTMLElement>('.ps-chapter');
        const qs = chapters.map((c) => gsap.utils.selector(c) as Q);

        // Teks naik dari balik "jendela" (overflow-hidden) baris demi baris, gaya editorial.
        gsap.set('.ps-line', { yPercent: 110 });
        gsap.set('.ps-cta', { autoAlpha: 0, y: 20 });
        gsap.set('.ps-visual', { autoAlpha: 0, scale: 1.04, filter: 'blur(8px)' });
        CHAPTER_FX.forEach((fx, i) => fx.init(qs[i]));

        /** Animasi visual dibungkus timeline sendiri lalu diperlambat, supaya temponya setara dengan teks. */
        const slow = (build: (sub: Tl) => void) => {
          const sub = gsap.timeline({ defaults: { immediateRender: false } });
          build(sub);
          return sub.timeScale(0.7);
        };

        const enter = (tl: Tl, i: number, at: gsap.Position) => {
          const q = qs[i];
          tl.to(q('.ps-line'), { yPercent: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, at)
            .to(q('.ps-visual'), { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power2.out' }, '<0.3')
            .to(q('.ps-cta'), { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '<0.6');
          tl.add(slow((sub) => CHAPTER_FX[i].enter(sub, q)), '<0.1');
        };

        /** Bab keluar: teks naik kembali ke balik jendelanya, visual mundur sambil memudar & kabur. */
        const leave = (tl: Tl, i: number) => {
          const q = qs[i];
          tl.to(q('.ps-line'), { yPercent: -110, duration: 1, stagger: 0.07, ease: 'power2.in' })
            .to(q('.ps-cta'), { autoAlpha: 0, y: -16, duration: 0.6 }, '<')
            .to(q('.ps-visual'), { autoAlpha: 0, scale: 0.96, filter: 'blur(8px)', duration: 1.1, ease: 'power1.in' }, '<0.1');
        };

        // Bab pertama muncul saat section mendekati atas layar, sebelum panel menempel.
        const intro = gsap.timeline({
          defaults: { immediateRender: false },
          scrollTrigger: { trigger: scope.current, start: 'top 80%', end: 'top top', scrub: 1 },
        });
        enter(intro, 0, 0);

        /*
         * Tanpa snap & tanpa progress bar: semua murni mengikuti scroll pengunjung (scroll halus
         * dari Lenis + scrub). Tiap bab punya jeda baca yang panjang, dan bab baru mulai muncul
         * saat bab lama hampir hilang, jadi pergantiannya bersambung.
         */
        const tl = gsap.timeline({
          defaults: { immediateRender: false },
          scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
        });

        chapters.forEach((_, i) => {
          if (i > 0) {
            leave(tl, i - 1);
            enter(tl, i, '-=0.4');
          }
          const extra = CHAPTER_FX[i].extra;
          if (extra) {
            tl.to({}, { duration: 1.4 }); // jeda baca sebelum langkah kedua
            tl.add(slow((sub) => extra(sub, qs[i])));
          }
          tl.to({}, { duration: 2.4 }); // jeda baca
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative bg-background motion-safe:h-[1500svh]">
      <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-dvh motion-safe:overflow-hidden">
        <div className="mx-auto h-full w-full max-w-7xl px-6 md:px-12 motion-safe:pt-20 motion-safe:pb-6 md:motion-safe:pt-28 md:motion-safe:pb-10">
          {/* bab-bab: ditumpuk di satu tempat saat ada animasi, berurutan biasa saat reduced motion */}
          <div className="relative h-full">
            {CHAPTERS.map(({ kicker, title, body, source, Visual }, i) => (
              <article
                key={kicker}
                className="ps-chapter py-16 motion-safe:absolute motion-safe:inset-0 motion-safe:py-0"
              >
                {/* FitBox: kalau layar terlalu pendek, isi bab mengecil sedikit supaya tidak terpotong */}
                <FitBox>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-center md:gap-12">
                <div className="order-2 md:order-1 md:col-span-5">
                  <Mask className="mb-3 md:mb-6">
                    <span className="ps-line flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                      <span className="font-mono text-foreground">{pad(i + 1)}</span>
                      <span className="h-px w-8 bg-foreground/20" />
                      {kicker}
                    </span>
                  </Mask>
                  <Mask className="mb-3 md:mb-6">
                    <h3 className="ps-line text-[clamp(1.55rem,min(3.4vw,6.5svh),3.25rem)] font-medium leading-[1.06] tracking-[-0.03em] text-foreground">
                      {title}
                    </h3>
                  </Mask>
                  <Mask>
                    <p className="ps-line max-w-md text-sm leading-relaxed text-muted md:text-base">{body}</p>
                  </Mask>
                  <Mask className="mt-3 md:mt-6">
                    <p className="ps-line text-[11px] text-muted/80">
                      <span className="font-medium text-muted">Source:</span> {source}
                    </p>
                  </Mask>
                  {i === CHAPTERS.length - 1 && (
                    <div className="ps-cta mt-5 md:mt-8">
                      <BubbleLink href="#architecture" primary arrow="down">
                        See how Cardivex does it
                      </BubbleLink>
                    </div>
                  )}
                </div>
                <div className="ps-visual order-1 h-[30svh] will-change-[filter,transform] md:order-2 md:col-span-7 md:h-[min(58svh,32rem)]">
                  <Visual />
                </div>
                </div>
                </FitBox>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
