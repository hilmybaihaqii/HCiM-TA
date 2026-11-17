import styles from './guide.module.css';

export default function GuideSectionHead({ id, title, meta }: {
  id: string; title: string; meta: string;
}) {
  const [number, ...words] = title.split('. ');
  return (
    <header className={styles.sectionHeading}>
      <span className={styles.sectionNumber} aria-hidden="true">{number.padStart(2, '0')}</span>
      <div>
        <p className={styles.sectionMeta}>{meta}</p>
        <h2 id={id}>{words.join('. ')}</h2>
      </div>
    </header>
  );
}
