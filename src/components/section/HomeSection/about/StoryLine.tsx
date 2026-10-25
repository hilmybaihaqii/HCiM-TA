'use client';

import { Fragment, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { accentSerif } from '@/lib/fonts';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * Lima kalimat pendek yang menjawab "web ini sebenarnya apa".
 * Frasa di antara ==tanda== diberi penekanan; tiap kalimat punya efek berbeda.
 */
type Effect = 'highlight' | 'wave' | 'strike' | 'underline' | 'tiers';

const BEATS: { text: string; effect: Effect }[] = [
  { text: 'Every new medicine must prove it is ==safe for the heart.==', effect: 'highlight' },
  { text: 'Some drugs throw the heartbeat out of rhythm and can cause a deadly condition called ==Torsade de Pointes.==', effect: 'wave' },
  { text: 'Today it is checked with lab tests and animal studies, which are ==slow and costly== and don’t always match humans.', effect: 'strike' },
  { text: 'Cardivex checks it on a ==virtual human heart cell== instead.', effect: 'underline' },
  { text: 'In about a minute, you get a clear answer: ==Low, Intermediate or High== risk.', effect: 'tiers' },
];

/* Garis yang "tergambar" dibuat dari background gradient; lebarnya dianimasikan 0% → 100%. */
const sweep = (color: string, y: string, thickness: string): CSSProperties => ({
  backgroundImage: `linear-gradient(${color}, ${color})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: `0 ${y}`,
  backgroundSize: `0% ${thickness}`,
});

const EFFECT_STYLE: Partial<Record<Effect, CSSProperties>> = {
  highlight: sweep('rgba(247, 213, 100, 0.75)', '88%', '0.42em'),
  strike: sweep('currentColor', '58%', '0.07em'),
  underline: sweep('currentColor', '100%', '0.07em'),
};

/*
 * Garis gelombang dipasang di tiap kata, karena text-decoration tidak diteruskan
 * ke anak yang berupa inline-block (dan tiap kata memang inline-block supaya bisa dianimasikan).
 */
const WAVE_WORD: CSSProperties = {
  textDecorationLine: 'underline',
  textDecorationStyle: 'wavy',
  textDecorationThickness: '0.06em',
  textUnderlineOffset: '0.22em',
  textDecorationColor: 'rgba(184, 84, 92, 0)',
};

const THICKNESS: Partial<Record<Effect, string>> = { highlight: '0.42em', strike: '0.07em', underline: '0.07em' };
const TIER_COLOR: Record<string, string> = { 'Low,': 'var(--accent-teal)', Intermediate: 'var(--accent-amber)', High: 'var(--accent-red)' };

function toSegments(text: string) {
  return text.split('==').map((part, i) => ({ words: part.split(' ').filter(Boolean), marked: i % 2 === 1 }));
}

/** Kata-kata satu potongan kalimat; tiap kata dibungkus supaya bisa muncul bergantian. */
/** `tight`: tanpa spasi setelah kata terakhir, supaya garis penekanan tidak memanjang ke spasi. */
function Words({ words, wordStyle, tight = false }: { words: string[]; wordStyle?: CSSProperties; tight?: boolean }) {
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="story-word inline-block" style={wordStyle} data-tier={TIER_COLOR[w] ? w : undefined}>
            {w}
          </span>
          {tight && i === words.length - 1 ? null : ' '}
        </Fragment>
      ))}
    </>
  );
}

export default function StoryLine() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const beats = gsap.utils.toArray<HTMLElement>('.story-beat');

        gsap.set(beats, { autoAlpha: 0 });
        gsap.set('.story-word', { autoAlpha: 0, y: 30, filter: 'blur(4px)' });

        /** Efek penekanan untuk satu kalimat, sesuai jenisnya. */
        const emphasize = (t: gsap.core.Timeline, beat: HTMLElement, effect: Effect) => {
          const mark = beat.querySelector<HTMLElement>('.story-mark');
          if (!mark) return;
          const thickness = THICKNESS[effect];
          if (thickness) {
            t.fromTo(mark, { backgroundSize: `0% ${thickness}` }, { backgroundSize: `100% ${thickness}`, duration: 0.9, ease: 'power2.inOut' }, '-=0.1');
            if (effect === 'strike') t.to(mark, { color: 'var(--text-muted)', duration: 0.6, ease: 'power1.out' }, '<0.3');
          } else if (effect === 'wave') {
            t.fromTo(mark, { color: 'var(--foreground)' }, { color: 'var(--accent-red)', duration: 0.9, ease: 'power2.out' }, '-=0.1').fromTo(
              mark.querySelectorAll('.story-word'),
              { textDecorationColor: 'rgba(184, 84, 92, 0)' },
              { textDecorationColor: 'rgba(184, 84, 92, 1)', duration: 0.6, stagger: 0.12, ease: 'power1.out' },
              '<0.2',
            );
          } else if (effect === 'tiers') {
            const tiers = mark.querySelectorAll<HTMLElement>('[data-tier]');
            tiers.forEach((w, i) =>
              t.fromTo(w, { color: 'var(--foreground)' }, { color: TIER_COLOR[w.dataset.tier!], duration: 0.6, ease: 'power1.out' }, i === 0 ? '-=0.1' : '-=0.35'),
            );
          }
        };

        /** Kalimat i masuk: kata-kata naik bergantian (tempo santai), lalu efek penekanannya. */
        const enter = (t: gsap.core.Timeline, i: number, at?: gsap.Position) => {
          const beat = beats[i];
          t.set(beat, { autoAlpha: 1, y: 0, filter: 'blur(0px)' }, at).fromTo(
            beat.querySelectorAll('.story-word'),
            { autoAlpha: 0, y: 30, filter: 'blur(4px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.07, ease: 'power2.out' },
            '<',
          );
          emphasize(t, beat, BEATS[i].effect);
        };

        // Kalimat pertama muncul saat section masuk layar (sebelum panel menempel).
        const intro = gsap.timeline({
          defaults: { immediateRender: false },
          scrollTrigger: { trigger: scope.current, start: 'top 80%', end: 'top 0%', scrub: 1 },
        });
        enter(intro, 0);

        /*
         * Panel menempel (CSS sticky) selama section di-scroll; timeline ini yang
         * mengganti kalimat. Semua tween fromTo + immediateRender:false, jadi hasilnya
         * selalu konsisten walau pengunjung scroll sangat cepat. Tanpa snap: semuanya murni
         * mengikuti scroll pengunjung, dengan scrub 1 detik di atas scroll halus Lenis.
         * Kalimat baru mulai muncul saat kalimat lama hampir hilang, jadi pergantiannya bersambung.
         */
        const tl = gsap.timeline({
          defaults: { immediateRender: false },
          scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
        });

        beats.forEach((_, i) => {
          if (i === 0) return;
          tl.to({}, { duration: 1.6 }) // jeda baca
            .fromTo(
              beats[i - 1],
              { autoAlpha: 1, y: 0, filter: 'blur(0px)' },
              { autoAlpha: 0, y: -32, filter: 'blur(4px)', duration: 0.9, ease: 'power1.inOut' },
            );
          enter(tl, i, '-=0.3');
        });
        tl.to({}, { duration: 1.4 });
      });

      // Tanpa animasi: semua kalimat tampil berurutan dengan penekanan langsung jadi.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.utils.toArray<HTMLElement>('.story-beat').forEach((beat, i) => {
          const mark = beat.querySelector<HTMLElement>('.story-mark');
          const effect = BEATS[i].effect;
          if (!mark) return;
          if (THICKNESS[effect]) gsap.set(mark, { backgroundSize: `100% ${THICKNESS[effect]}` });
          if (effect === 'strike') gsap.set(mark, { color: 'var(--text-muted)' });
          if (effect === 'wave') {
            gsap.set(mark, { color: 'var(--accent-red)' });
            gsap.set(mark.querySelectorAll('.story-word'), { textDecorationColor: 'rgba(184, 84, 92, 1)' });
          }
          if (effect === 'tiers') mark.querySelectorAll<HTMLElement>('[data-tier]').forEach((w) => gsap.set(w, { color: TIER_COLOR[w.dataset.tier!] }));
        });
      });
    },
    { scope },
  );

  return (
    <section id="about" ref={scope} className="relative bg-background motion-safe:h-[820svh]">
      {/* pt memberi ruang navbar; pb sedikit lebih besar supaya isi duduk sedikit di atas tengah (titik tengah optis). */}
      <div className="flex flex-col items-center justify-center px-6 py-28 text-center md:px-12 motion-safe:sticky motion-safe:top-0 motion-safe:h-dvh motion-safe:py-0 motion-safe:pt-24 motion-safe:pb-[10svh]">
        <span className="mb-8 text-xs font-medium uppercase tracking-[0.2em] text-muted">What is Cardivex?</span>

        {/* Semua kalimat menumpuk di satu sel grid: selalu di tempat yang sama. */}
        <div className="grid w-full max-w-4xl place-items-center gap-16 motion-safe:gap-0">
          {BEATS.map((beat, i) => (
            <p
              key={i}
              className="story-beat motion-safe:col-start-1 motion-safe:row-start-1 motion-safe:invisible text-balance text-[clamp(1.75rem,4vw,3.4rem)] font-medium leading-[1.22] tracking-[-0.025em] text-foreground"
            >
              {toSegments(beat.text).map((seg, si) =>
                seg.marked ? (
                  <Fragment key={si}>
                    {/* frasa penting: serif italic (senada aksen "heart risk" di hero) + efeknya sendiri */}
                    <span
                      className={`story-mark ${accentSerif.className} italic text-[1.08em] font-normal tracking-normal rounded-[0.2em] px-[0.06em] -mx-[0.06em]`}
                      style={EFFECT_STYLE[beat.effect]}
                    >
                      <Words words={seg.words} wordStyle={beat.effect === 'wave' ? WAVE_WORD : undefined} tight />
                    </span>{' '}
                  </Fragment>
                ) : (
                  <Words key={si} words={seg.words} />
                ),
              )}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
