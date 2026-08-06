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
    <section className="relative w-full py-16 md:py-24 bg-background font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* ==================== 1. SECTION HEADER ==================== */}
        {/* Header yang lebih bersih dan ramah layaknya platform modern */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-foreground/10 pb-6 mb-12 gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-2">
              Latest insights and trends
            </h3>
            <p className="text-sm md:text-base text-muted font-light max-w-lg">
              Explore our comprehensive archive of research, computational strategies, and technical dispatches.
            </p>
          </div>
          <div className="px-4 py-2 bg-foreground/5 rounded-md">
            <span className="text-sm font-medium text-foreground/80">
              {gridArticles.length} Articles
            </span>
          </div>
        </div>

        {/* ==================== 2. ARTICLES GRID ==================== */}
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
              <Link href={`/articles/${article.slug}`} className="flex flex-col grow">
                
                {/* THUMBNAIL (Rounded-2xl, Full Color, Smooth Zoom) */}
                <div className="block relative w-full aspect-4/3 overflow-hidden rounded-md bg-foreground/5 mb-6">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>

                {/* META DATA (Badge Kategori & Waktu Baca) */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-2.5 py-1 bg-foreground/5 text-foreground/80 text-[10px] font-semibold rounded-md uppercase tracking-wider">
                    {article.category}
                  </div>
                  <span className="text-muted/40">•</span>
                  <span className="text-xs text-muted font-medium">
                    {article.readTime}
                  </span>
                </div>

                {/* TITLE (Tegas & Proporsional) */}
                <h4 className="text-xl md:text-2xl font-medium tracking-tight text-foreground leading-tight group-hover:text-accent transition-colors duration-300 mb-3">
                  {article.title}
                </h4>

                {/* EXCERPT (Terbaca Jelas & Terbatas 3 Baris) */}
                <p className="text-sm text-muted/90 font-light leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>
                
              </Link>

              {/* ACTION & DATE (Bagian Bawah Kartu) */}
              <div className="pt-5 border-t border-foreground/10 flex items-center justify-between mt-auto">
                <span className="text-xs text-muted/80 font-medium">
                  {article.date}
                </span>
                
                {/* Teks Link dengan Panah Interaktif */}
                <Link
                  href={`/articles/${article.slug}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors duration-300 group/link"
                >
                  Read more 
                  <span className="text-lg leading-none font-normal transition-transform duration-300 group-hover/link:translate-x-1.5">
                    &rarr;
                  </span>
                </Link>
              </div>

            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}