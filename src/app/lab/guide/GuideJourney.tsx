import styles from './visual-guide.module.css';

const GROUPS = [
  { label: 'Explore the simulation', indexes: [0, 1, 2] },
  { label: 'Read the prediction', indexes: [3, 4] },
  { label: 'Understand & revisit', indexes: [5, 6] },
];

export default function GuideJourney({ sections, active, onSelect }: {
  sections: { id: string; title: string }[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className={styles.journey} aria-label="Choose a guide topic">
      <div className={styles.intro}>
        <div><p className={styles.eyebrow}>Your reading map</p><h2>One topic at a time.</h2></div>
        <p>Pick a topic below, or follow the steps in order.</p>
      </div>
      <div className={styles.groups}>
        {GROUPS.map((group, index) => (
          <div className={styles.group} key={group.label}>
            <div className={styles.groupHeading}><span>0{index + 1}</span>{group.label}</div>
            {group.indexes.map((i) => (
              <button key={sections[i].id} type="button" aria-current={active === i ? 'step' : undefined}
                aria-controls={sections[i].id} onClick={() => onSelect(i)}>
                <span className={styles.dot} aria-hidden="true" />
                {sections[i].title.replace(/^\d+\. /, '')}
                <span className={styles.step} aria-hidden="true">0{i + 1}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.position} role="status">Topic {active + 1} of {sections.length} · {sections[active].title.replace(/^\d+\. /, '')}</div>
    </nav>
  );
}
