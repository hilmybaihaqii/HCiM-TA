import Image from 'next/image';
import { TEAM_DATA } from '@/data/teamData';

export default function AboutHero() {
  const researchers = TEAM_DATA.filter((member) => member.category === 'core');
  const advisors = TEAM_DATA.filter((member) => member.category === 'advisor');

  return (
    <section aria-labelledby="about-title" className="mx-auto max-w-7xl px-6 pb-14 pt-32 md:px-12 md:pb-20 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-foreground/15 pb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted md:mb-14">
          <p className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />01 / About us</p>
          <p>People, ideas &amp; cardiac science</p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h1 id="about-title" className="max-w-xl text-[44px] font-medium leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[70px] xl:text-[80px]">
              The people<br />
              behind<br />
              <span className="font-serif font-normal italic tracking-[-0.055em] text-accent">Cardivex.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              A student research project bringing together cardiac modelling, machine learning, and thoughtful digital design.
            </p>
            <a
              href="#team"
              className="mt-8 inline-flex min-h-12 items-center gap-8 border-b border-foreground pb-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Meet the team <span aria-hidden="true" className="text-xl">↓</span>
            </a>
          </div>

          <figure className="relative mx-auto w-full max-w-xl">
            <div className="relative rounded-sm border border-foreground/15 bg-[#EFE9E6] px-4 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
              <div className="mb-6 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted sm:text-[10px]">
                <span>Cardivex / Research team</span>
                <span className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  <span className="h-1 w-1 rounded-full bg-accent/50" />
                  <span className="h-1 w-1 rounded-full bg-accent/25" />
                </span>
              </div>
              <div className="grid grid-cols-3 items-start gap-2.5 sm:gap-4">
                {researchers.map((member, index) => (
                  <div key={member.id} className={index === 1 ? 'pb-8' : 'pt-8'}>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-background">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 639px) 28vw, (max-width: 1023px) 150px, 160px"
                        style={{ objectPosition: member.imagePosition ?? 'center' }}
                        className="object-cover"
                        preload={index === 1}
                      />
                    </div>
                    <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-foreground sm:text-[10px]">
                      {member.name.split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-foreground/15 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2 sm:gap-3">
                    {advisors.map((member) => (
                      <div key={member.id} className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-background bg-background sm:h-14 sm:w-14">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          sizes="56px"
                          style={{ objectPosition: member.imagePosition ?? 'center' }}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    Guided by<br /><span className="font-medium text-foreground">our advisors.</span>
                  </p>
                </div>
              </div>
            </div>
            <figcaption className="mt-4 flex flex-wrap justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted sm:text-[10px]">
              <span>{researchers.length} students · {advisors.length} supervisors &amp; advisors</span>
              <span>A shared curiosity.</span>
            </figcaption>
          </figure>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-foreground/15 pt-5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted md:mt-16">
          {['Cardiac electrophysiology', 'Machine learning', 'In-silico research'].map((area) => (
            <span key={area} className="flex items-center gap-3"><span className="text-accent" aria-hidden="true">+</span>{area}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
