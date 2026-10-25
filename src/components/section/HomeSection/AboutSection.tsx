import StoryLine from './about/StoryLine';
import PhotoZoom from './about/PhotoZoom';
import HowItWorks from './about/HowItWorks';
import CompareSlider from './about/CompareSlider';
import BiomarkerMarquee from './about/BiomarkerMarquee';
import RiskSimulator from './about/RiskSimulator';

/**
 * Section 01, berurutan: storyline singkat "Cardivex itu apa" → foto yang membesar
 * → cara kerja (scroll horizontal) → perbandingan foto yang bisa di-drag →
 * pita 11 biomarker → demo simulasi interaktif.
 */
export default function AboutSection() {
  return (
    <>
      <StoryLine />
      <PhotoZoom />
      <HowItWorks />
      <CompareSlider />
      <section className="relative bg-background pb-24 md:pb-40">
        <BiomarkerMarquee />
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <RiskSimulator />
        </div>
      </section>
    </>
  );
}
