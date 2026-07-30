'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ARTICLES_DATA } from '@/data/articlesData';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function ArticleGrid() {
  const gridArticles = ARTICLES_DATA.filter((a) => !a.featured);

  return (
    <section className="relative w-full py-20 md:py-32 bg-background font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* SECTION HEADER */}
        <div className="flex items-end justify-between border-b border-foreground/10 pb-6 mb-12 md:mb-16">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-[0.25em] text-muted mb-1.5">
              Archive & Dispatches
            </span>
            <h3 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">
              Recent Publications
            </h3>
          </div>
          <span className="text-xs font-mono text-muted">
            {gridArticles.length} ARTICLES
          </span>
        </div>

        {/* ARTICLES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 md:gap-x-12">
          {gridArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: luxEase }}
              className="group flex flex-col justify-between h-full"
            >
              <div>
                {/* THUMBNAIL */}
                <Link
                  href={`/articles/${article.slug}`}
                  className="block relative w-full aspect-16/10 overflow-hidden rounded-sm bg-foreground/5 mb-6"
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 filter grayscale-20 group-hover:grayscale-0"
                  />
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-surface-white/90 bg-foreground/70 px-2 py-0.5 rounded-sm">
                    {article.number}
                  </div>
                </Link>

                {/* META */}
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-muted mb-3">
                  <span>{article.category}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>

                {/* TITLE */}
                <Link href={`/articles/${article.slug}`}>
                  <h4 className="text-lg md:text-xl font-medium tracking-tight text-foreground leading-snug group-hover:text-accent transition-colors duration-300 mb-3 block">
                    {article.title}
                  </h4>
                </Link>

                {/* EXCERPT */}
                <p className="text-xs md:text-sm text-muted leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>
              </div>

              {/* READ CTA */}
              <div className="pt-4 border-t border-foreground/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted uppercase tracking-[0.15em]">
                  {article.date}
                </span>
                <Link
                  href={`/articles/${article.slug}`}
                  className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-foreground group-hover:text-accent transition-colors duration-300"
                >
                  <span>Read Article</span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}