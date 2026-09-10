import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { ARTICLES_DATA } from '@/data/articlesData';
import ResearchGraphic from '@/components/research/ResearchGraphic';

export default function ArticleHero() {
  const featured = ARTICLES_DATA.find((article) => article.featured);
  const years = ARTICLES_DATA.map((article) => article.year);

  return (
    <section className="relative w-full pt-32 md:pt-44 pb-12 md:pb-20" aria-labelledby="publications-title">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-4 border-b border-foreground/15 pb-4 text-[10px] sm:text-xs font-mono uppercase tracking-[0.16em]">
          <span className="flex items-center gap-2.5"><span className="size-1.5 rounded-full bg-accent" /> The Cardivex reading room</span>
          <span className="hidden sm:block text-muted">Science behind the platform</span>
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end py-10 md:py-14">
          <div>
            <h1 id="publications-title" className="text-[clamp(2.75rem,6.2vw,5.5rem)] font-medium tracking-[-0.055em] leading-[1.02]">
              Research &amp;<br />
              <span className="font-serif italic font-normal text-accent tracking-[-0.045em]">Publications.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base md:text-lg text-muted leading-relaxed">
              Every idea has a foundation. Explore the studies that inform
              our work in computational cardiac safety.
            </p>
          </div>
          <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-1 border-l md:border-l-0 border-foreground/15 pl-5 md:pl-0">
            <span className="font-serif text-6xl md:text-8xl leading-none text-accent/80">{String(ARTICLES_DATA.length).padStart(2, '0')}</span>
            <div className="md:text-right">
              <p className="text-sm font-medium">Selected publications</p>
              <p className="mt-1 text-xs font-mono text-muted">{Math.min(...years)} — {Math.max(...years)}</p>
            </div>
          </div>
        </div>

        {featured && (
          <article id={`publication-${featured.id}`} aria-labelledby="featured-publication-title" className="grid lg:grid-cols-[0.8fr_1.4fr] overflow-hidden rounded-lg border border-foreground/15 bg-surface-white/45 scroll-mt-28">
            <div className="relative flex flex-col justify-between overflow-hidden bg-primary text-background p-6 sm:p-8 min-h-64 lg:min-h-full">
              <div className="flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.16em]">
                <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-secondary" /> Featured reading</span>
                <span className="text-background/60">{featured.year}</span>
              </div>
              <ResearchGraphic className="w-full max-w-72 lg:max-w-none self-center text-secondary my-3 lg:my-6" />
              <div className="flex flex-wrap justify-between gap-3 border-t border-background/20 pt-4 text-[10px] font-mono uppercase tracking-widest text-background/70">
                <span>In silico biomarkers</span><span>Stacking ensemble</span>
              </div>
            </div>
            <div className="flex flex-col p-6 sm:p-9 lg:p-10">
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent mb-4">A closer look at cardiac safety</p>
              <h2 id="featured-publication-title" className="text-2xl sm:text-3xl lg:text-[2rem] font-medium leading-[1.2] tracking-tight">
                <a href={`https://doi.org/${featured.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                  {featured.title}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted">{featured.authors.join(', ')}</p>
              <p className="mt-2 text-sm italic">{featured.journal} · {featured.year}</p>
              <p className="mt-6 text-sm leading-relaxed text-muted">{featured.excerpt}</p>
              <div className="mt-8 pt-5 border-t border-foreground/10 flex flex-wrap items-center justify-between gap-4">
                <a href={`https://doi.org/${featured.doi}`} target="_blank" rel="noopener noreferrer" aria-label={`View Publication: ${featured.title} (opens in a new tab)`} className="inline-flex min-h-11 items-center gap-3 rounded-sm bg-foreground px-5 py-3 text-sm text-background hover:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                  View Publication <ArrowUpRight className="size-4" aria-hidden="true" />
                </a>
                <span className="text-[11px] text-muted break-all">DOI: {featured.doi}</span>
              </div>
            </div>
          </article>
        )}

        <a href="#publication-library" className="group mt-7 inline-flex min-h-11 items-center gap-3 text-xs font-mono text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          Continue to the collection <ArrowDown className="size-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-y-1" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
