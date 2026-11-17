'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { accentSerif } from '@/lib/fonts';
import labScientist from '@/assets/about/lab-scientist.jpg';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * Foto kecil di tengah layar yang membesar sampai memenuhi layar saat di-scroll.
 * Dibuat dengan clip-path (bukan ubah lebar/tinggi) supaya animasinya ringan di HP.
 * Foto: Unsplash (lisensi Unsplash), photo-1579165466949-3180a3d056d5.
 */
export default function PhotoZoom() {
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
          // Ukuran awal foto: kotak potret di tengah (inset = jarak dari tepi layar).
          // Sisi atas dibuat lebih lebar dari bawah supaya teks pembuka muat di antara navbar dan foto.
          const start = ctx.conditions?.desktop ? 'inset(25% 34% 15% 34% round 28px)' : 'inset(26% 16% 18% 16% round 24px)';

          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
            })
            .fromTo('.pz-frame', { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1 })
            .fromTo('.pz-image', { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
            .to('.pz-intro', { autoAlpha: 0, y: -30, duration: 0.3 }, 0)
            .fromTo('.pz-shade', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.55)
            .fromTo('.pz-copy > *', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: 'power2.out' }, 0.6)
            .to({}, { duration: 0.6 }); // jeda dengan foto penuh sebelum lanjut
        },
      );
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative bg-background motion-safe:h-[320svh]">
      <div className="relative h-dvh overflow-hidden motion-safe:sticky motion-safe:top-0">
        {/* teks pembuka di atas foto kecil */}
        {/* posisinya di tengah celah antara navbar (±83px) dan tepi atas foto (25%) */}
        <p className="pz-intro absolute inset-x-0 top-[calc(12.5%+2.6rem)] z-10 hidden text-center text-xs font-medium uppercase tracking-[0.2em] text-muted motion-safe:block">
          A faster way to check heart safety
        </p>

        <div className="pz-frame absolute inset-0 overflow-hidden will-change-[clip-path]">
          <Image
            src={labScientist}
            alt="A scientist pipetting drug samples in a laboratory"
            fill
            sizes="100vw"
            placeholder="blur"
            // dimuat lebih awal supaya tidak sempat blur saat mulai membesar (±176 KB webp)
            loading="eager"
            className="pz-image object-cover object-[50%_25%] will-change-transform"
          />
          {/* gelap lembut supaya teks putih mudah dibaca */}
          <div className="pz-shade absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10 motion-safe:opacity-0" />

          <div className="pz-copy absolute inset-x-0 bottom-0 px-6 pb-16 md:px-12 md:pb-24 lg:px-24">
            <div className="mx-auto max-w-7xl">
              <span className="mb-5 block text-xs font-medium uppercase tracking-[0.2em] text-white/70">Why Cardivex</span>
              <h2 className="max-w-4xl text-[clamp(2rem,min(5vw,9svh),4.75rem)] font-medium leading-[1.04] tracking-[-0.035em] text-white">
                Lab and animal studies are slow. A virtual heart cell{' '}
                <em className={`${accentSerif.className} italic text-[1.08em] font-normal tracking-normal`}>answers in about a minute.</em>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
