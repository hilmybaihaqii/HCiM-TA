import { ArrowUpRight } from 'lucide-react';
import { ARTICLES_DATA } from '@/data/articlesData';

const publicationLinkStyle = 'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';

export default function ArticleGrid() {
  const publications = ARTICLES_DATA.filter((article) => !article.featured);

  return (
    <section id="publication-library" className="scroll-mt-28 pb-16 md:pb-24" aria-labelledby="library-title">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-foreground/15 pb-6 mb-8">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-accent mb-3">01 / The collection</p>
            <h2 id="library-title" className="text-3xl md:text-4xl font-medium tracking-tight">More research. <span className="font-serif italic font-normal">Broader perspectives.</span></h2>
          </div>
          <span className="text-xs font-mono text-muted">{String(publications.length).padStart(2, '0')} further readings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {publications.map((article, index) => {
            const publicationUrl = `https://doi.org/${article.doi}`;
            const wide = publications.length % 2 === 1 && index === publications.length - 1;

            return (
              <article
                id={`publication-${article.id}`}
                key={article.id}
                className={`group relative flex flex-col min-w-0 rounded-md border border-foreground/10 bg-surface-white/40 p-6 sm:p-8 hover:border-accent/40 hover:bg-surface-white/70 transition-colors scroll-mt-28 ${wide ? 'md:col-span-2' : ''}`}
                aria-labelledby={`publication-title-${article.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-accent">{article.category}</span>
                  <span className="font-serif text-2xl text-foreground/60">{article.year}</span>
                </div>
                <div className={wide ? 'md:grid md:grid-cols-2 md:gap-10' : ''}>
                  <div>
                    <h3 id={`publication-title-${article.id}`} className="text-xl sm:text-2xl font-medium tracking-tight leading-snug mb-4">
                      <a href={publicationUrl} target="_blank" rel="noopener noreferrer" className={`${publicationLinkStyle} hover:text-accent transition-colors`}>
                        {article.title}<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </h3>
                    <p className="text-sm leading-relaxed text-muted mb-3"><span className="sr-only">Authors: </span>{article.authors.join(', ')}</p>
                    <p className="text-sm italic leading-relaxed mb-4"><span className="sr-only">Journal: </span>{article.journal}</p>
                    {article.publicationNote && <p className="text-xs text-muted mb-4">{article.publicationNote}</p>}
                  </div>
                  <p className="text-sm text-muted leading-relaxed mb-7">{article.excerpt}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-foreground/10 pt-4">
                  <p className="text-[11px] text-muted break-all">DOI: {article.doi}</p>
                  <a href={publicationUrl} target="_blank" rel="noopener noreferrer" aria-label={`View Publication: ${article.title} (opens in a new tab)`} className={`${publicationLinkStyle} inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-accent transition-colors`}>
                    View Publication <ArrowUpRight className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
