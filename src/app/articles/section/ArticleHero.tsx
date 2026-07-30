'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ARTICLES_DATA, ArticleItem } from '@/data/articlesData';

const luxEase = [0.16, 1, 0.3, 1] as const;

export default function ArticleHero() {
  const featuredArticle: ArticleItem =
    ARTICLES_DATA.find((a) => a.featured) || ARTICLES_DATA[0];

  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
  };

  return (
    <section className="relative w-full pt-36 md:pt-44 pb-16 md:pb-28 bg-background overflow-hidden border-b border-foreground/10 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* ==================== TOP EDITORIAL HEADER ==================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-foreground/10 pb-8 mb-12 md:mb-16 gap-6">
          <motion.div
            {...reveal}
            transition={{ duration: 0.9, ease: luxEase }}
          >
            {/* Label tanpa All Caps yang berlebihan */}
            <div className="flex items-center gap-2.5 text-xs font-mono text-muted mb-3">
              <span className="text-accent">02</span>
              <span>/</span>
              <span>Research & essays</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-foreground leading-[1.02]">
              The Cardivex <br className="hidden sm:block" />
              <span className="italic font-normal text-muted">Journal.</span>
            </h1>
          </motion.div>

          <motion.p
            {...reveal}
            transition={{ duration: 0.9, delay: 0.1, ease: luxEase }}
            className="text-sm md:text-base text-muted max-w-sm leading-relaxed font-light"
          >
            Perspectives on computational cardiology, machine learning pipelines, and animal-free bio-simulations.
          </motion.p>
        </div>

        {/* ==================== FEATURED CARD (EDITORIAL SHOWCASE) ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.1, ease: luxEase }}
          className="group relative grid grid-cols-1 lg:grid-cols-12 border border-foreground/15 rounded-sm overflow-hidden bg-foreground/1.5 hover:border-foreground/30 transition-colors duration-500"
        >
          {/* IMAGE SIDE */}
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-foreground/5 block"
          >
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 filter grayscale-15 group-hover:grayscale-0"
            />
            
            {/* Badge berkelas di atas foto */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 px-3.5 py-1.5 bg-background/90 backdrop-blur-md text-xs font-mono text-foreground border border-foreground/10 rounded-full">
              Featured publication
            </div>
          </Link>

          {/* CONTENT SIDE */}
          <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Meta Kategori & Durasi Baca */}
              <div className="flex items-center gap-2.5 text-xs font-mono text-accent mb-4">
                <span className="font-medium">{featuredArticle.category}</span>
                <span className="text-muted/40">•</span>
                <span className="text-muted">{featuredArticle.readTime}</span>
              </div>

              {/* Judul Artikel Featured */}
              <Link href={`/articles/${featuredArticle.slug}`}>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground leading-snug hover:text-accent transition-colors duration-300 mb-5 block">
                  {featuredArticle.title}
                </h2>
              </Link>

              {/* Ringkasan Paragraf */}
              <p className="text-sm md:text-base text-muted font-light leading-relaxed mb-8">
                {featuredArticle.excerpt}
              </p>
            </div>

            {/* ACTION CTA (BAGIAN BAWAH KARTU) */}
            <div className="pt-6 border-t border-foreground/10 flex items-center justify-between">
              <span className="text-xs font-mono text-muted">
                {featuredArticle.date}
              </span>

              <Link
                href={`/articles/${featuredArticle.slug}`}
                className="group/btn relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-foreground/20 text-xs font-mono text-foreground hover:bg-foreground hover:text-surface-white hover:border-foreground transition-all duration-300"
              >
                <span>Read article</span>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}