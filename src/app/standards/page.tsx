import React from 'react';
import StandardsHero from './section/StandardsHero';
import StandardsGrid from './section/StandardsGrid';

export const metadata = {
  title: 'Standards & Regulatory Basis — Cardivex',
  description: 'How Cardivex traces to recognized international, national, industrial, and scientific standards.',
};

export default function StandardsPage() {
  return (
    <>
      <StandardsHero />
      <StandardsGrid />
    </>
  );
}