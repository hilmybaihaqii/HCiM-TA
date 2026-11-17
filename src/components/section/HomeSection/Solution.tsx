import ModelScroll from './solution/ModelScroll';
import TrainTestSplit from './solution/TrainTestSplit';

/**
 * Section 03 "The model": pengantar tiga mode, lalu tiap mode ditampilkan satu per satu
 * sambil di-scroll (input → sel jantung virtual FDA CiPA → 11 biomarker → model 400 pohon
 * → tingkat risiko). Ditutup dengan bukti bahwa model diuji pada obat yang belum pernah dilihat.
 */
export default function SolutionSection() {
  return (
    <section id="architecture" className="relative w-full bg-background pt-28 pb-24 md:pt-40 md:pb-40">
      <ModelScroll />
      <div className="mt-16 md:mt-24">
        <TrainTestSplit />
      </div>
    </section>
  );
}
