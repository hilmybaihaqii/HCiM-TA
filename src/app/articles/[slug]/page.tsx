'use client';

import React, { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ARTICLES_DATA } from '@/data/articlesData';

const luxEase = [0.16, 1, 0.3, 1] as const;

// Variasi animasi untuk efek beruntun (stagger) yang mewah
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: luxEase } }
};

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  // Menggunakan React.use() untuk unwrap Promise params di Next.js 15 (Client Component)
  const { slug } = use(params);
  const article = ARTICLES_DATA.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="relative w-full pt-32 md:pt-44 pb-24 md:pb-40 bg-background font-sans selection:bg-accent selection:text-surface-white">
      
      {/* ==================== 1. MAIN CONTAINER ==================== */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* --- TOP HEADER & BREADCRUMB --- */}
        <motion.header 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="border-b border-foreground/10 pb-12 md:pb-16 mb-12 md:mb-16"
        >
          {/* BREADCRUMB */}
          <motion.nav variants={fadeUp} aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-muted">
              <li>
                <Link href="/articles" className="hover:text-foreground transition-colors duration-300">
                  Articles
                </Link>
              </li>
              <li className="text-foreground/30">/</li>
              <li className="text-foreground font-medium truncate max-w-50 sm:max-w-md md:max-w-lg">
                {article.title}
              </li>
            </ol>
          </motion.nav>

          {/* TITLE */}
          <motion.h1 
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.05] max-w-5xl mb-8"
          >
            {article.title}
          </motion.h1>

          {/* EXCERPT / SUMMARY */}
          <motion.p 
            variants={fadeUp}
            className="text-lg sm:text-xl md:text-2xl text-muted font-light leading-relaxed max-w-3xl"
          >
            {article.excerpt}
          </motion.p>
        </motion.header>

        {/* --- FULL WIDTH BANNER IMAGE (CINEMATIC REVEAL) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.4, ease: luxEase }}
          className="relative w-full aspect-video md:aspect-21/9 overflow-hidden rounded-md bg-foreground/5 mb-16 md:mb-24 group"
        >
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          {/* Kategori Badge di dalam gambar */}
          <div className="absolute bottom-6 right-6 px-4 py-2 bg-background/95 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider text-foreground rounded-md">
            {article.category}
          </div>
        </motion.div>

        {/* --- 2-COLUMN EDITORIAL LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-start">
          
          {/* KOLOM KIRI: STICKY METADATA (4 KOLOM) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-36 border-b lg:border-b-0 border-foreground/10 pb-10 lg:pb-0 lg:pr-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: luxEase }}
              className="space-y-10"
            >
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                  Category
                </span>
                <span className="text-sm font-medium text-foreground">
                  {article.category}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                  Published Date
                </span>
                <span className="text-sm font-medium text-foreground">
                  {article.date}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                  Reading Time
                </span>
                <span className="text-sm font-medium text-foreground">
                  {article.readTime}
                </span>
              </div>

              {/* TOPIK TERKAIT */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                  Related Topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Machine Learning', 'Cardiology', 'Safety', 'In-Silico'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-[10px] font-medium bg-foreground/5 rounded-md text-foreground/80 hover:bg-foreground/10 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* TOMBOL KEMBALI */}
              <div className="pt-8 border-t border-foreground/10">
                <Link
                  href="/articles"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors duration-300"
                >
                  <span className="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span>
                  <span>Back to Articles</span>
                </Link>
              </div>

            </motion.div>
          </aside>

          {/* KOLOM KANAN: ISI ARTIKEL (8 KOLOM) */}
          {/* Menambahkan garis vertikal pemisah (border-l) di desktop agar lebih editorial */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: luxEase }}
            className="lg:col-span-8 lg:pl-16 lg:border-l border-foreground/10"
          >
            {/* max-w-prose membatasi lebar teks agar nyaman dibaca (optimal line length) */}
            <div className="max-w-prose space-y-8 text-base md:text-lg lg:text-xl text-foreground/80 leading-[1.8] font-light">
              
              {article.content.map((paragraph, i) => {
                
                // Drop-Cap elegan di paragraf pertama
                if (i === 0) {
                  return (
                    <p key={i} className="first-letter:text-6xl md:first-letter:text-7xl first-letter:font-medium first-letter:mr-4 first-letter:float-left first-letter:text-foreground first-letter:mt-2 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                }

                // Kutipan menonjol (Pull-quote) di tengah artikel
                if (i === 2) {
                  return (
                    <React.Fragment key={i}>
                      <blockquote className="relative my-16 py-8 px-8 md:px-10 border-l-4 border-accent bg-foreground/2 text-foreground text-xl md:text-2xl font-medium leading-relaxed rounded-r-md">
                        &quot;Precision computer modeling is no longer an alternative—it is becoming the benchmark for predictive cardiac safety.&quot;
                      </blockquote>
                      <p className="leading-relaxed">{paragraph}</p>
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

            {/* --- FOOTNOTE ARTIKEL --- */}
            <div className="mt-20 pt-8 border-t border-foreground/10 text-[10px] font-mono text-muted uppercase tracking-widest flex items-center justify-between">
              <span>Cardivex Journal</span>
              <span>{article.date}</span>
            </div>
          </motion.div>

        </div>
      </div>
    </article>
  );
}