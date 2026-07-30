import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STANDARDS_DATA } from '@/data/standardsData';

interface StandardDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StandardDetailPage({ params }: StandardDetailPageProps) {
  const { slug } = await params;
  const standard = STANDARDS_DATA.find((item) => item.slug === slug);

  if (!standard) {
    notFound();
  }

  return (
    <article className="relative w-full pt-36 md:pt-48 pb-24 md:pb-40 bg-background font-sans selection:bg-accent selection:text-surface-white">
      
      {/* ==================== 1. MAIN CONTAINER (MAX-W-7XL) ==================== */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* --- TOP HEADER & BREADCRUMB --- */}
        <header className="border-b border-foreground/10 pb-12 md:pb-16 mb-12 md:mb-16">
          
          {/* BREADCRUMB: Standards / Title */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs font-mono text-muted">
              <li>
                <Link href="/standards" className="hover:text-foreground transition-colors">
                  Standards
                </Link>
              </li>
              <li className="text-foreground/40">/</li>
              <li className="text-accent truncate max-w-xs sm:max-w-md md:max-w-lg">
                {standard.title}
              </li>
            </ol>
          </nav>

          {/* TITLE */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.05] max-w-5xl mb-8">
            {standard.title}
          </h1>

          {/* EXCERPT / SUMMARY */}
          <p className="text-base sm:text-lg md:text-xl text-muted font-light leading-relaxed max-w-3xl">
            {standard.subtitle}
          </p>
        </header>

        {/* --- FULL WIDTH BANNER IMAGE (NO ROUNDED, SHARP EDGES) --- */}
        <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden bg-foreground/5 border-t border-b border-foreground/10 mb-16 md:mb-24">
          <Image
            src={standard.image}
            alt={standard.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-3 py-1.5 bg-background/90 backdrop-blur-md text-[10px] font-mono text-foreground">
            {standard.level} Standard
          </div>
        </div>

        {/* --- 2-COLUMN EDITORIAL LAYOUT (GRID 12) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* KOLOM KIRI: STICKY METADATA & TOMBOL KEMBALI (4 KOLOM) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-36 border-b lg:border-b-0 border-foreground/10 pb-8 lg:pb-0">
            <div className="space-y-8">
              
              <div>
                <span className="block text-xs font-mono text-muted mb-2">
                  Regulatory level
                </span>
                <p className="text-sm font-medium text-foreground tracking-wide">
                  {standard.level} Standard
                </p>
              </div>

              <div>
                <span className="block text-xs font-mono text-muted mb-2">
                  Reference year / code
                </span>
                <p className="text-sm font-medium text-foreground tracking-wide">
                  {standard.date}
                </p>
              </div>

              <div>
                <span className="block text-xs font-mono text-muted mb-2">
                  Domain scope
                </span>
                <p className="text-sm font-medium text-foreground tracking-wide">
                  In-Silico Pharmacovigilance
                </p>
              </div>

              {/* PROTOCOL TAGS (CLEAN HASHTAG STYLE, NO BOXES) */}
              <div>
                <span className="block text-xs font-mono text-muted mb-2">
                  Verification parameters
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                  {standard.relatedTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-muted hover:text-foreground transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* TOMBOL KEMBALI */}
              <div className="pt-6 border-t border-foreground/10">
                <Link
                  href="/standards"
                  className="group inline-flex items-center gap-3 text-xs font-mono text-muted hover:text-foreground transition-colors duration-300"
                >
                  <svg
                    className="w-4 h-4 text-accent transition-transform duration-300 group-hover:-translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l-7-7m-7 7h18" />
                  </svg>
                  <span>Back to Standards</span>
                </Link>
              </div>

            </div>
          </aside>

          {/* KOLOM KANAN: FULL TEXT READER (8 KOLOM - SAMA KAYA ARTIKEL) */}
          <div className="lg:col-span-8 lg:pl-8">
            <div className="space-y-8 text-base sm:text-lg md:text-xl text-foreground/85 leading-[1.8] font-sans font-light">
              {standard.content.map((sec, i) => {
                // Paragraf pembuka: Menggunakan Drop-Cap eksklusif merah aksen
                if (i === 0) {
                  return (
                    <p
                      key={sec.clause}
                      className="first-letter:text-5xl md:first-letter:text-6xl first-letter:font-normal first-letter:mr-3.5 first-letter:float-left first-letter:text-accent leading-relaxed"
                    >
                      {sec.body}
                    </p>
                  );
                }

                // Paragraf tengah: Ditambahkan Pull-Quote agar tidak monoton
                if (i === 1) {
                  return (
                    <React.Fragment key={sec.clause}>
                      <blockquote className="my-12 py-6 px-8 border-l-2 border-accent bg-foreground/1.5 italic text-foreground text-lg md:text-xl font-normal leading-relaxed">
                        &ldquo;Our targets are never arbitrary — every prediction model traces back to a verified legal and scientific foundation.&rdquo;
                      </blockquote>
                      <p className="leading-relaxed">
                        {sec.body}
                      </p>
                    </React.Fragment>
                  );
                }

                // Paragraf lanjutan normal
                return (
                  <p key={sec.clause} className="leading-relaxed">
                    {sec.body}
                  </p>
                );
              })}
            </div>

            {/* --- FOOTNOTE DOCUMENTATION --- */}
            <div className="mt-16 pt-8 border-t border-foreground/10 text-xs font-mono text-muted">
              <span>Cardivex Safety Protocol Verification • Validated {standard.date}</span>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
}