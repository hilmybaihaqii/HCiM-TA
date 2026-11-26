'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './guide.module.css';

/**
 * Daftar isi panduan. Desktop: menempel di kiri, dikelompokkan (Simulasi, Prediksi, Catatan),
 * bagian yang sedang dibaca ditandai. HP & tablet: satu baris yang bisa dibuka.
 */
export default function GuideNavigation({ sections, groups }: {
  sections: { id: string; title: string }[];
  groups: { label: string; indexes: number[] }[];
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

  const activeIndex = sections.findIndex(s => s.id === active);
  const label = (title: string) => title.replace(/^\d+\. /, '');

  const list = (
    <nav aria-label="Table of contents">
      {groups.map(group => (
        <div key={group.label} className={styles.navGroup}>
          <p className={styles.navGroupLabel}>{group.label}</p>
          {group.indexes.map(i => {
            const section = sections[i];
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={active === section.id ? 'location' : undefined}
                onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}
                className={styles.chapterLink}
              >
                <span className={styles.chapterNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span>{label(section.title)}</span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <aside className={styles.navigation}>
      <div className={styles.desktopNavigation}>
        <p className={styles.navLabel}>On this page</p>
        {list}
      </div>
      <details ref={mobileMenu} className={styles.mobileNavigation}>
        <summary>
          <span className={styles.chapterNumber} aria-hidden="true">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span>{label(sections[Math.max(0, activeIndex)].title)}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </summary>
        {list}
      </details>
    </aside>
  );
}
