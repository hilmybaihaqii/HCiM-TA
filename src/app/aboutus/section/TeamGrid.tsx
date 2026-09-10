import Image from 'next/image';
import { TEAM_DATA } from '@/data/teamData';

export default function TeamGrid() {
  const researchers = TEAM_DATA.filter((member) => member.category === 'core');

  return (
    <section id="team" aria-labelledby="core-team-title" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-14 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-col justify-between gap-5 border-b border-foreground/15 pb-6 md:mb-12 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">03 / Core team</p>
            <h2 id="core-team-title" className="text-3xl font-medium tracking-tight sm:text-4xl">Different skills.<br className="sm:hidden" /> <span className="font-serif font-normal italic text-accent">One project.</span></h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted">The students turning research questions into the Cardivex experience.</p>
        </div>

        <div className="grid gap-x-7 gap-y-12 md:grid-cols-3 lg:gap-x-10">
          {researchers.map((member, index) => (
            <article key={member.id} className="group flex min-w-0 flex-col">
              <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-sm bg-foreground/5">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1279px) 30vw, 375px"
                  style={{ objectPosition: member.imagePosition ?? 'center' }}
                  className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.025]"
                />
                <span aria-hidden="true" className="absolute bottom-3 left-3 border border-background/70 bg-background/95 px-2.5 py-1 font-mono text-[10px] tracking-widest text-foreground">
                  0{index + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="mb-2 text-xs font-medium leading-relaxed text-accent-dark">{member.role}</p>
                <h3 className="text-2xl font-medium leading-tight tracking-tight lg:text-[27px]">{member.name}</h3>
                <p className="mb-5 mt-3 text-xs leading-relaxed text-muted">{member.institution}<br />{member.location}</p>
                {member.bio && <p className="mb-6 text-sm leading-relaxed text-muted">{member.bio}</p>}
                <div className="mt-auto flex items-start justify-between gap-3 border-t border-foreground/15 pt-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex min-h-10 min-w-0 items-center text-xs leading-relaxed text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors [overflow-wrap:anywhere] hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    aria-label={`Email ${member.name}: ${member.email}`}
                  >
                    {member.email}
                  </a>
                  {member.linkedin && member.linkedin !== '#' && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 shrink-0 items-center text-xs underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      aria-label={`LinkedIn profile of ${member.name} (opens in a new tab)`}
                    >LinkedIn ↗</a>
                  )}
                  <span className="pt-2 text-lg text-accent" aria-hidden="true">↗</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
