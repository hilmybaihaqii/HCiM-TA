import { notFound } from 'next/navigation';
import GuideContent from '../../lab/guide/GuideContent';

export default function GuidePreviewPage() {
  // This preview renders documentation only. Lab authentication remains unchanged.
  if (process.env.NODE_ENV !== 'development') notFound();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-foreground/10 bg-surface-white/95 px-5 py-4 shadow-sm backdrop-blur-md md:inset-x-12 md:top-6">
        <span className="text-sm font-medium">cardivex<span className="text-accent">.</span></span>
        <span className="text-right text-xs text-muted">Guide preview · No account data</span>
      </header>
      <main>
        <GuideContent loadHistory={false} />
      </main>
    </div>
  );
}
