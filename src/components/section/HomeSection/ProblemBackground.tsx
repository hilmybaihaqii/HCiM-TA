import ProblemOpener from './problem/ProblemOpener';
import ProblemStory from './problem/ProblemStory';

/**
 * Section 02 "The problem": foto pembuka yang mengecil, lalu enam bab data yang
 * muncul satu per satu saat di-scroll (gagal disetujui → efek ke jantung → alarm palsu
 * tes hERG → biaya → hewan uji → simulasi sel manusia lebih akurat).
 */
export default function ProblemBackground() {
  return (
    <div id="problem" className="relative bg-background">
      <ProblemOpener />
      <ProblemStory />
    </div>
  );
}
