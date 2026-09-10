import ResearchGraphic from '@/components/research/ResearchGraphic';

export default function AboutPhilosophy() {
  return (
    <section id="research-focus" aria-labelledby="research-question-title" className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-8 md:px-12 md:pb-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-sm border border-accent/20 bg-[#F0E6E3] px-7 py-10 sm:px-10 md:px-12 md:py-14">
        <ResearchGraphic className="pointer-events-none absolute -right-20 -top-10 h-[430px] w-[430px] text-accent opacity-[0.13]" />
        <div className="relative grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-14">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-dark">02 / Our research question</p>
            <div aria-hidden="true" className="mt-7 flex h-16 items-center gap-1.5 text-accent/60">
              {[12, 17, 12, 26, 48, 19, 12, 35, 58, 25, 12, 18, 12].map((height, index) => (
                <span key={index} className="w-[3px] rounded-full bg-current" style={{ height }} />
              ))}
            </div>
          </div>
          <div>
            <h2 id="research-question-title" className="max-w-2xl text-2xl font-medium leading-[1.25] tracking-tight sm:text-3xl lg:text-[36px]">
              How can computational models help us understand the heart&apos;s response to a drug?
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-foreground/75 sm:text-base">
              This question connects our work. Through Cardivex, we explore how simulated cardiac signals and machine learning can support the study of drug-induced cardiotoxicity, drawing on the published research of our supervisors and advisors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
