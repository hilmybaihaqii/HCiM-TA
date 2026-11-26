import React from 'react';
import styles from './guide.module.css';

/*
 * Potongan isi panduan dengan gaya yang seragam, supaya setiap bagian tersusun sama:
 * poin bertumpuk, rumus, dan kotak catatan.
 */

type Point = { title: string; text: string; example?: string };

/** Poin-poin bertumpuk: judul pendek di kiri (atas di HP), penjelasan di kanan */
export function Points({ items, compact = false }: { items: Point[]; compact?: boolean }) {
  return (
    <dl className={`${styles.points} ${compact ? styles.pointsCompact : ''}`}>
      {items.map(p => (
        <div key={p.title}>
          <dt>{p.title}</dt>
          <dd>
            <p>{p.text}</p>
            {p.example && <p className={styles.pointExample}>{p.example}</p>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Rumus atau ekspresi, huruf monospace dalam kotak tipis */
export function Formula({ children }: { children: React.ReactNode }) {
  return <p className={styles.formula} data-i18n-skip>{children}</p>;
}

/** Kotak catatan: note (netral), key (inti penting), warn (perhatian) */
export function Callout({ tone, title, children }: { tone: 'note' | 'key' | 'warn'; title: string; children: React.ReactNode }) {
  return (
    <aside className={styles.callout} data-tone={tone}>
      <p className={styles.calloutTitle}>{title}</p>
      <div className={styles.calloutBody}>{children}</div>
    </aside>
  );
}
