'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { accentSerif } from '@/lib/fonts';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * Pembuka section Problem: foto penuh layar yang mengecil jadi kartu (kanan di desktop,
 * bawah di HP). Teks ditulis dua kali: versi putih di dalam bingkai foto (ikut terpotong
 * clip-path) dan versi gelap di belakangnya. Hasilnya teks berganti warna tepat di tepi foto.
 * Foto: Unsplash (lisensi Unsplash), photo-1675851143055-23ae996bb212.
 */
const PHOTO = 'https://images.unsplash.com/photo-1675851143055-23ae996bb212?auto=format&fit=crop&w=2400&q=80';

function Copy({ light = false }: { light?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-start md:items-center pt-28 md:pt-0">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-12">
        <div className="max-w-xl md:max-w-[44%]">
          <span className={`mb-5 md:mb-7 block text-xs font-medium uppercase tracking-[0.2em] ${light ? 'text-white/70' : 'text-muted'}`}>
            The problem
          </span>
          <h2
            className={`text-[clamp(2.1rem,min(5vw,9svh),4.5rem)] font-medium leading-[1.04] tracking-[-0.035em] ${light ? 'text-white' : 'text-foreground'}`}
          >
            Most new medicines{' '}
            <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>never reach a patient.</em>
          </h2>
          <p className={`po-sub mt-6 max-w-md text-base md:text-lg leading-relaxed ${light ? 'text-white/80' : 'text-muted'}`}>
            Many are stopped late in testing, after years of work. Problems with the heart are a common reason. Here is what the numbers say.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProblemOpener() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          // Posisi akhir foto: kartu di kanan (desktop) atau di bawah teks (HP).
          const end = ctx.conditions?.desktop ? 'inset(15% 5% 15% 54% round 28px)' : 'inset(56% 6% 7% 6% round 22px)';
          gsap.set('.po-sub', { autoAlpha: 0, y: 24 });

          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
            })
            .to({}, { duration: 0.3 }) // foto penuh sebentar sebelum mulai mengecil
            .fromTo('.po-frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: end, duration: 1.2, ease: 'power2.inOut' })
            .fromTo('.po-image', { scale: 1.25 }, { scale: 1, duration: 1.5 }, 0)
            .fromTo('.po-shade', { opacity: 1 }, { opacity: 0.2, duration: 0.9 }, 0.5)
            .to('.po-sub', { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.25)
            .to({}, { duration: 0.6 });
        },
      );
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative bg-background motion-safe:h-[320svh]">
      <div className="relative h-dvh overflow-hidden motion-safe:sticky motion-safe:top-0">
        <Copy />
        <div className="po-frame absolute inset-0 overflow-hidden will-change-[clip-path]">
          <Image
            src={PHOTO}
            alt="Medicine capsules falling against a grey background"
            fill
            sizes="100vw"
            className="po-image object-cover will-change-transform"
          />
          <div className="po-shade absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/15" />
          <Copy light />
        </div>
      </div>
    </section>
  );
}
