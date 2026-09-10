import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const connections = [
  {
    number: '01',
    title: 'The cell.',
    label: 'Computational modeling',
    description: 'Cardiac cell simulations and in silico biomarkers provide a foundation for studying how drugs affect electrical activity, including variation between individuals.',
    href: '#publication-1',
    link: 'Explore the modeling research',
  },
  {
    number: '02',
    title: 'The signal.',
    label: 'Machine learning',
    description: 'Studies of ECGs, heart sounds, and cellular recordings offer perspectives on feature selection and classification across different types of cardiac data.',
    href: '#publication-2',
    link: 'Explore the classification research',
  },
  {
    number: '03',
    title: 'The explanation.',
    label: 'Interpretable predictions',
    description: 'Explainable AI research examines which simulated biomarkers influence a prediction, informing questions about interpretability in cardiac risk assessment.',
    href: '#publication-6',
    link: 'Explore the explainability research',
  },
];

export default function ResearchConnections() {
  return (
    <section className="border-y border-foreground/10 bg-foreground/3 py-14 md:py-20" aria-labelledby="connections-title">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-16 mb-10 md:mb-14">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-accent mb-4">02 / Connecting the ideas</p>
            <h2 id="connections-title" className="text-3xl md:text-4xl leading-tight font-medium tracking-tight">How this research<br />informs <span className="font-serif italic font-normal text-accent">Cardivex.</span></h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed text-muted md:self-end max-w-lg">Our reading brings together three perspectives: how cardiac cells behave, what we can learn from their signals, and how model decisions can be understood.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {connections.map((connection) => (
            <div key={connection.number} className="flex flex-col border-t border-foreground/20 pt-5">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-muted mb-7"><span>{connection.label}</span><span>{connection.number}</span></div>
              <h3 className="text-3xl font-serif italic mb-4">{connection.title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-6">{connection.description}</p>
              <a href={connection.href} className="mt-auto inline-flex items-center gap-2 min-h-11 text-xs font-medium hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">{connection.link}<ArrowRight className="size-3.5 shrink-0" aria-hidden="true" /></a>
            </div>
          ))}
        </div>
        <div className="mt-12 md:mt-16 pt-6 border-t border-foreground/15 flex flex-wrap justify-between items-center gap-3">
          <p className="text-sm text-muted">Meet the people bringing these ideas together.</p>
          <Link href="/aboutus" className="inline-flex items-center gap-2 min-h-11 text-sm font-medium hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">About the team <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
