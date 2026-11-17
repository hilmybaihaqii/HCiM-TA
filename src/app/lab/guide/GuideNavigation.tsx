'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './guide.module.css';

export default function GuideNavigation({ sections }: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0].id);
  const mobileMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = window.innerHeight * 0.3;
      let current = sections[0].id;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= marker) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  const links = sections.map((section, index) => (
    <a
      key={section.id}
      href={`#${section.id}`}
      aria-current={active === section.id ? 'location' : undefined}
      onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}
      className={styles.chapterLink}
    >
      <span className={styles.chapterNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <span>{section.title.replace(/^\d+\. /, '')}</span>
    </a>
  ));

  return (
    <aside className={styles.navigation}>
      <div className={styles.desktopNavigation}>
        <div className={styles.navLabel}>Guide Sections</div>
        <nav aria-label="Table of contents">{links}</nav>
        <div className={styles.navFooter}>
          <span>Ready to explore your results?</span>
          <Link href="/lab/pipeline">Open Full Pipeline <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
      <details ref={mobileMenu} className={styles.mobileNavigation}>
        <summary>
          <span>{sections.find(section => section.id === active)?.title}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        <nav aria-label="Table of contents">{links}</nav>
      </details>
    </aside>
  );
}
