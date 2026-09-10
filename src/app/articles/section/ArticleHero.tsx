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

  return (
    <section className="relative w-full pt-32 md:pt-40 pb-16 md:pb-28 bg-background font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* ==================== 1. HEADER ==================== */}
        <div className="mb-12 md:mb-16 border-b border-foreground/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: luxEase }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground mb-4">
              Blog & articles
            </h1>
            <p className="text-base text-muted max-w-xl font-light leading-relaxed">
              Discover our latest strategies, technical insights, and updates on in-silico pharmacovigilance.
            </p>
          </motion.div>
        </div>

        {/* ==================== 2. FEATURED CARD (PERFECT 50:50 ALIGNMENT) ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.1, ease: luxEase }}
          // items-center di sini adalah kunci agar teks dan gambar sejajar secara vertikal (tengah-tengah)
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
        >
          {/* SISI GAMBAR: 50% Lebar, Rounded-2xl presisi */}
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="relative w-full aspect-4/3 rounded-md overflow-hidden bg-foreground/5 block group"
          >
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          </Link>

          {/* SISI KONTEN: 50% Lebar */}
          <div className="flex flex-col items-start w-full">
            
            {/* Badge Kategori: Persis seperti referensi (Latar abu-abu, teks uppercase kecil) */}
            <div className="px-3 py-1 bg-foreground/5 text-foreground/80 text-[11px] font-semibold rounded-md mb-6 uppercase tracking-wider">
              {featuredArticle.category || 'PHARMACOVIGILANCE'}
            </div>

            {/* Judul Besar: Leading-tight agar jarak antar baris teks besar tidak terlalu renggang */}
            <Link href={`/articles/${featuredArticle.slug}`}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.15] hover:text-accent transition-colors duration-300 mb-6">
                {featuredArticle.title}
              </h2>
            </Link>

            {/* Ringkasan: Menggunakan teks abu-abu terang (muted) dengan ketebalan tipis (font-light) */}
            <p className="text-base lg:text-lg text-muted/90 font-light leading-relaxed mb-8 max-w-[95%]">
              {featuredArticle.excerpt}
            </p>

            {/* Tombol Solid + Ikon Teks Arrow */}
            <Link
              href={`/articles/${featuredArticle.slug}`}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#2A2A2A] text-[#F9F9F9] dark:bg-zinc-100 dark:text-zinc-900 rounded-md text-sm font-medium hover:opacity-90 transition-all duration-300 group/btn"
            >
              Read more 
              <span className="text-lg leading-none transition-transform duration-300 group-hover/btn:translate-x-1.5 font-normal">
                &rarr;
              </span>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}