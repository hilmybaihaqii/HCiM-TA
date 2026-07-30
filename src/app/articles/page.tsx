import React from 'react';
import ArticleHero from './section/ArticleHero';
import ArticleGrid from './section/ArticleGrid';

export const metadata = {
  title: 'Articles | Cardiotoxicity Prediction',
  description: 'Journal, perspectives, and research notes on computational cardiology and machine learning.',
};

export default function ArticlesPage() {
  return (
    <>
      <ArticleHero />
      <ArticleGrid />
    </>
  );
}