import React from 'react';
import ArticleHero from './section/ArticleHero';
import ArticleGrid from './section/ArticleGrid';
import ResearchConnections from './section/ResearchConnections';

export const metadata = {
  title: 'Research & Publications | Cardivex',
  description: 'Research publications informing Cardivex, covering cardiac drug safety, computational modeling, and machine learning, with links to the original papers.',
};

export default function ArticlesPage() {
  return (
    <>
      <ArticleHero />
      <ArticleGrid />
      <ResearchConnections />
    </>
  );
}
