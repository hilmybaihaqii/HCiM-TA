import styles from './guide.module.css';

/** Judul bagian panduan: nomor kecil, label, lalu judul */
export default function GuideSectionHead({ id, number, title, meta }: {
  id: string; number: number; title: string; meta: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.sectionMeta}>
        <span className={styles.sectionNumber} aria-hidden="true">{String(number).padStart(2, '0')}</span>
        {meta}
      </p>
      <h2 id={id}>{title}</h2>
    </header>
  );
}
