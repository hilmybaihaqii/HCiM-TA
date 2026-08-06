import React from 'react';
import AboutHero from './section/AboutHero';
import AboutPhilosophy from './section/AboutPhilosophy';
import TeamGrid from './section/TeamGrid';

export const metadata = {
  title: 'About Us | Cardiotoxicity Prediction',
  description: 'The multidisciplinary research group and scientific advisors behind Cardivex in-silico pharmacovigilance.',
};

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col bg-background">
      <AboutHero />
      <AboutPhilosophy />
      <TeamGrid />
    </div>
  );
}