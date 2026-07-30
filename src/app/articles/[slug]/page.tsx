import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES_DATA } from '@/data/articlesData';

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="relative w-full pt-36 md:pt-48 pb-24 md:pb-40 bg-background font-sans selection:bg-accent selection:text-surface-white">
      
      {/* ==================== 1. MAIN CONTAINER (MAX-W-7XL) ==================== */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* --- TOP HEADER & BREADCRUMB --- */}
        <header className="border-b border-foreground/10 pb-12 md:pb-16 mb-12 md:mb-16">
          
          {/* BREADCRUMB: Articles / Judul */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted">
              <li>
                <Link href="/articles" className="hover:text-foreground transition-colors">
                  Articles
                </Link>
              </li>
              <li className="text-foreground/40">/</li>
              <li className="text-accent truncate max-w-xs sm:max-w-md md:max-w-lg">
                {article.title}
              </li>
            </ol>
          </nav>

          {/* TITLE */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.05] max-w-5xl mb-8">
            {article.title}
          </h1>

          {/* EXCERPT / SUMMARY */}
          <p className="text-base sm:text-lg md:text-xl text-muted font-light leading-relaxed max-w-3xl">
            {article.excerpt}
          </p>
        </header>

        {/* --- FULL WIDTH BANNER IMAGE --- */}
        <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden rounded-sm bg-foreground/5 border border-foreground/10 mb-16 md:mb-24">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-3 py-1.5 bg-background/90 backdrop-blur-md text-[9px] font-mono uppercase tracking-[0.2em] text-foreground border border-foreground/10">
            {article.category}
          </div>
        </div>

        {/* --- 2-COLUMN EDITORIAL LAYOUT (GRID 12) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* KOLOM KIRI: STICKY METADATA & TOMBOL KEMBALI (4 KOLOM) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-36 border-b lg:border-b-0 border-foreground/10 pb-8 lg:pb-0">
            <div className="space-y-8">
              
              {/* KATEGORI & TANGGAL */}
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.25em] text-muted mb-2">
                  Category
                </span>
                <p className="text-sm font-medium text-foreground tracking-wide">
                  {article.category}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.25em] text-muted mb-2">
                  Published Date
                </span>
                <p className="text-sm font-medium text-foreground tracking-wide">
                  {article.date}
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.25em] text-muted mb-2">
                  Reading Time
                </span>
                <p className="text-sm font-medium text-foreground tracking-wide">
                  {article.readTime}
                </p>
              </div>

              {/* TOPIK TERKAIT */}
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.25em] text-muted mb-2">
                  Related Topics
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Machine Learning', 'Cardiology', 'Safety', 'In-Silico'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[10px] font-mono border border-foreground/15 rounded-full text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* TOMBOL KEMBALI KE ARTIKEL */}
              <div className="pt-6 border-t border-foreground/10">
                <Link
                  href="/articles"
                  className="group inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors duration-300"
                >
                  <span>Back to Articles</span>
                </Link>
              </div>

            </div>
          </aside>

          {/* KOLOM KANAN: ISI ARTIKEL (8 KOLOM) */}
          <div className="lg:col-span-8 lg:pl-8">
            <div className="space-y-8 text-base sm:text-lg md:text-xl text-foreground/85 leading-[1.8] font-sans font-light">
              {article.content.map((paragraph, i) => {
                // Drop-Cap elegan di paragraf pertama
                if (i === 0) {
                  return (
                    <p
                      key={i}
                      className="first-letter:text-5xl md:first-letter:text-6xl first-letter:font-normal first-letter:mr-3.5 first-letter:float-left first-letter:text-accent leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  );
                }

                // Kutipan tengah artikel agar lebih menarik
                if (i === 2) {
                  return (
                    <React.Fragment key={i}>
                      <blockquote className="my-12 py-6 px-8 border-l-2 border-accent bg-foreground/2 italic text-foreground text-lg md:text-xl font-normal leading-relaxed">
                        &ldquo;Precision computer modeling is no longer an alternative—it is becoming the benchmark for predictive cardiac safety.&rdquo;
                      </blockquote>
                      <p>{paragraph}</p>
                    </React.Fragment>
                  );
                }

                return (
                  <p key={i} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* --- FOOTNOTE ARTIKEL (TANPA TOMBOL NEXT) --- */}
            <div className="mt-16 pt-8 border-t border-foreground/10 text-xs font-mono text-muted uppercase tracking-widest">
              <span>Cardivex • {article.date}</span>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}