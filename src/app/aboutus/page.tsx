import Link from 'next/link';
import AboutHero from './section/AboutHero';
import AboutPhilosophy from './section/AboutPhilosophy';
import TeamGrid from './section/TeamGrid';
import AdvisorsGrid from './section/AdvisorsGrid';

export const metadata = {
  title: 'About Us | Cardivex',
  description: 'Meet the student research team, supervisors, and scientific advisors behind Cardivex and its exploration of in-silico cardiac safety.',
};

export default function AboutPage() {
  return (
    <div className="w-full bg-background text-foreground">
      <AboutHero />
      <AboutPhilosophy />
      <TeamGrid />
      <AdvisorsGrid />
      <section aria-labelledby="research-reading-title" className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-12 md:pb-28">
        <div className="mx-auto grid max-w-[1184px] gap-8 rounded-sm bg-foreground px-7 py-10 text-background sm:px-10 md:grid-cols-[1fr_auto] md:items-center md:gap-14 md:px-14 md:py-14">
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-background/70">05 / Continue exploring</p>
            <h2 id="research-reading-title" className="text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Behind the project,<br />
              <span className="font-serif font-normal italic text-secondary">a body of research.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-background/75">
              Explore the publications that inform our questions, methods, and approach to cardiac safety.
            </p>
          </div>
          <Link
            href="/articles"
            className="inline-flex min-h-12 w-fit items-center gap-8 rounded-sm border border-background/40 px-5 py-3 text-sm font-medium transition-colors hover:border-background hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background"
          >
            Explore the research <span aria-hidden="true" className="text-xl">↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
