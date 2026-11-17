'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { accentSerif } from '@/lib/fonts';
import { STEP_ART } from './StepArt';
import FitBox from '@/components/ui/FitBox';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * "How it works" sebagai scroll horizontal: panel intro + satu panel per langkah.
 * Tambah langkah baru cukup dengan menambah item di STEPS (dan ilustrasinya di StepArt).
 */
const STEPS = [
  {
    nav: 'Input',
    title: 'Enter your drug',
    body: 'Pick one of 28 reference drugs or enter your own lab values. Already have the 11 heart-cell measurements? Enter those directly.',
    details: ['28 drugs', 'Own lab data', '11 biomarkers'],
  },
  {
    nav: 'Simulate',
    title: 'We test it on a virtual heart cell',
    body: 'Cardivex runs the FDA-backed heart-cell model at four doses and records how the cell reacts. Then 400 decision trees vote on the risk.',
    details: ['CiPA cell model', '4 doses', '400 trees'],
  },
  {
    nav: 'Result',
    title: 'Get a clear answer',
    body: 'You get a Low, Intermediate or High risk level, plus the measurements that pushed the result up or down.',
    details: ['3 risk levels', 'Safety check', 'Explained'],
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

/* "Jendela" overflow-hidden: teks naik dari baliknya. pb kecil supaya ekor huruf tidak terpotong. */
function Mask({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden pb-[0.12em] -mb-[0.12em] ${className}`}>{children}</div>;
}

export default function HowItWorks() {
  const scope = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('.hiw-panel');

        panels.slice(1).forEach((panel) => {
          const q = gsap.utils.selector(panel);
          gsap.set(q('.hiw-in'), { yPercent: 110 });
          gsap.set(q('.hiw-chip'), { autoAlpha: 0, y: 12 });
          gsap.set(q('.draw'), { strokeDashoffset: 1 });
          gsap.set(q('.pop'), { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' });
          gsap.set(q('.hiw-art'), { xPercent: 14 });
          q('.grow').forEach((el) => gsap.set(el, { scaleX: 0, transformOrigin: el.dataset.origin === 'right' ? '100% 50%' : '0% 50%' }));
          gsap.set(q('.hiw-body'), { scale: 0.94, autoAlpha: 0.25 });
        });

        /*
         * Satu timeline, murni mengikuti scroll (tanpa snap, tanpa progress bar). Tiap perpindahan
         * panel memakai ease masuk-keluar lalu jeda diam, jadi track melambat dan berhenti sendiri.
         * Panel yang pergi sedikit mengecil & memudar, panel yang datang membesar: kesan berlapis.
         */
        const tl = gsap.timeline({
          defaults: { immediateRender: false },
          scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
        });

        tl.to({}, { duration: 1.4 }); // baca intro dulu
        panels.slice(1).forEach((panel, k) => {
          const i = k + 1;
          const q = gsap.utils.selector(panel);
          const prev = gsap.utils.selector(panels[i - 1]);
          tl.to(track.current, { xPercent: -100 * i, duration: 2, ease: 'power2.inOut' })
            .to(prev('.hiw-body'), { scale: 0.94, autoAlpha: 0.25, duration: 2, ease: 'power2.inOut' }, '<')
            .to(q('.hiw-body'), { scale: 1, autoAlpha: 1, duration: 2, ease: 'power2.inOut' }, '<')
            .to(q('.hiw-art'), { xPercent: 0, duration: 2.2, ease: 'power2.out' }, '<')
            .to(q('.hiw-in'), { yPercent: 0, duration: 1.1, stagger: 0.15, ease: 'power3.out' }, '<1')
            .to(q('.hiw-chip'), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '<0.5')
            .to(q('.draw'), { strokeDashoffset: 0, duration: 1.5, stagger: 0.05, ease: 'power1.inOut' }, '<-0.6')
            .to(q('.pop'), { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: 'back.out(1.4)' }, '<0.7')
            .to(q('.grow'), { scaleX: 1, duration: 0.8, stagger: 0.07, ease: 'power2.out' }, '<0.2')
            .to({}, { duration: 2.2 }); // jeda baca di panel ini
        });
      });
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative bg-background motion-safe:h-[680svh]">
      <div className="motion-safe:sticky motion-safe:top-0 motion-safe:h-dvh motion-safe:overflow-hidden">
        <div ref={track} className="flex h-full flex-col motion-safe:flex-row">
          {/* ---------- intro ---------- */}
          <div className="hiw-panel flex min-h-svh w-full shrink-0 flex-col justify-center px-6 pt-24 pb-16 md:px-12 md:pt-32 md:pb-28 lg:px-24">
            <FitBox>
            <div className="hiw-body mx-auto w-full max-w-7xl will-change-transform">
              <span className="mb-8 block text-xs font-medium uppercase tracking-[0.2em] text-muted">How it works</span>
              <h2 className="max-w-4xl text-[clamp(2.25rem,min(6vw,10svh),5.75rem)] font-medium leading-[1.02] tracking-[-0.035em] text-foreground">
                From drug data to a <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>clear risk level,</em> in
                three steps.
              </h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">
                Made for drug safety teams. It runs in your browser, with nothing to install. Enter a drug, read the result.
              </p>
              <p className="mt-10 hidden items-center gap-4 text-sm text-foreground motion-safe:flex">
                Keep scrolling
                <span className="relative block h-px w-20 overflow-hidden bg-foreground/15">
                  <span className="absolute inset-y-0 left-0 w-1/2 animate-[hiw-nudge_2.4s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-foreground" />
                </span>
              </p>
            </div>
            </FitBox>
          </div>

          {/* ---------- langkah ---------- */}
          {STEPS.map((step, i) => {
            const Art = STEP_ART[i];
            return (
              <div key={step.title} className="hiw-panel flex min-h-svh w-full shrink-0 items-center px-6 pt-24 pb-16 md:px-12 md:pt-32 md:pb-28 lg:px-24">
                <FitBox>
                <div className="hiw-body mx-auto grid w-full max-w-7xl items-center gap-6 will-change-transform md:grid-cols-12 md:gap-12">
                  <div className="order-2 md:order-1 md:col-span-5">
                    <Mask className="mb-5">
                      <span className="hiw-in flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                        <span className="font-mono text-foreground">{pad(i + 1)}</span>
                        <span className="h-px w-8 bg-foreground/20" />
                        {step.nav}
                      </span>
                    </Mask>
                    <Mask className="mb-5">
                      <h3 className="hiw-in text-[clamp(1.75rem,min(3.8vw,7svh),3.5rem)] font-medium leading-[1.04] tracking-[-0.03em] text-foreground">
                        {step.title}
                      </h3>
                    </Mask>
                    <Mask className="mb-7">
                      <p className="hiw-in max-w-md text-sm leading-relaxed text-muted md:text-[1.05rem]">{step.body}</p>
                    </Mask>
                    {/* tiga pill selalu sama lebar & satu baris, di desktop maupun HP */}
                    <ul className="grid max-w-md grid-cols-3 gap-2">
                      {step.details.map((d) => (
                        <li
                          key={d}
                          className="hiw-chip flex items-center justify-center truncate rounded-full border border-foreground/10 bg-surface-white/50 px-2 py-2 text-center text-[11px] text-foreground/80 md:text-xs transition-[background-color,border-color,color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-surface-white hover:text-foreground"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ilustrasi di atas "panggung" cahaya lembut, tanpa kotak */}
                  <div className="relative order-1 h-[30svh] md:order-2 md:col-span-7 md:h-[min(52svh,34rem)]">
                    <div
                      aria-hidden
                      className="absolute inset-[-6%] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.95),rgba(255,255,255,0))]"
                    />
                    <div className="hiw-art relative h-full w-full">
                      <Art />
                    </div>
                  </div>
                </div>
                </FitBox>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes hiw-nudge {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
}
