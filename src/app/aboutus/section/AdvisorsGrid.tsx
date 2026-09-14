import Image from 'next/image';
import { TEAM_DATA } from '@/data/teamData';

export default function AdvisorsGrid() {
  const advisors = TEAM_DATA.filter((member) => member.category === 'advisor');

  return (
    <section id="advisors" aria-labelledby="advisors-title" className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-14 pt-8 md:px-12 md:pb-20 md:pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-foreground/15 pb-6 md:mb-10 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">04 / Academic guidance</p>
            <h2 id="advisors-title" className="text-3xl font-medium leading-tight tracking-tight sm:text-4xl">Supervisors <span className="font-serif font-normal italic text-accent">&amp; advisors.</span></h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted">The academic expertise and research perspectives behind our work.</p>
        </div>

        <div className="grid gap-x-10 gap-y-7 lg:grid-cols-2">
          {advisors.map((advisor) => (
            <article key={advisor.id} className="flex min-w-0 gap-4 border-b border-foreground/15 pb-7 sm:gap-6">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-foreground/5 sm:h-28 sm:w-24">
                <Image
                  src={advisor.image}
                  alt={advisor.name}
                  fill
                  sizes="(max-width: 639px) 64px, 96px"
                  style={{ objectPosition: advisor.imagePosition ?? 'center' }}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="mb-1.5 text-[11px] font-medium leading-relaxed text-accent-dark">{advisor.role}</p>
                <h3 className="text-lg font-medium leading-tight tracking-tight sm:text-xl">{advisor.name}</h3>
                <p className="mt-3 text-xs leading-relaxed text-muted">{advisor.institution}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{advisor.location}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4">
                  <a
                    href={`mailto:${advisor.email}`}
                    aria-label={`Email ${advisor.name}: ${advisor.email}`}
                    className="inline-flex min-h-10 max-w-full items-center text-xs leading-relaxed text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors [overflow-wrap:anywhere] hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {advisor.email}
                  </a>
                  {advisor.linkedin && advisor.linkedin !== '#' && (
                    <a
                      href={advisor.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn profile of ${advisor.name} (opens in a new tab)`}
                      className="inline-flex min-h-10 items-center text-xs underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >LinkedIn ↗</a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
