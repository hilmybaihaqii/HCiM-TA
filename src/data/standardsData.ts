// src/data/standardsData.ts

export interface StandardSection {
  clause: string;
  title: string;
  body: string;
}

export interface StandardItem {
  id: string;
  slug: string;
  number: string;
  level: string; // International, National, Industrial, Scientific
  title: string;
  subtitle: string;
  excerpt: string;
  content: StandardSection[]; // Format klausul / pasal regulasi
  date: string;
  image: string;
  featured?: boolean;
  relatedTags: string[];
}

export const STANDARDS_DATA: StandardItem[] = [
  {
    id: '1',
    slug: 'ich-s7b-e14-software-quality',
    number: '01',
    level: 'International',
    title: 'ICH S7B & E14 (2022) with ISO/IEC 25002:2024 (SQuaRE)',
    subtitle: 'Admitting in-silico modeling into the global clinical safety pathway.',
    excerpt:
      'How the revised ICH guidelines formally acknowledge computer-simulated heart cell assays, backed by international software quality standards for medical reliability.',
    content: [
      {
        clause: '§ 01',
        title: 'Regulatory Evolution & In-Silico Recognition',
        body: 'For decades, global regulatory bodies required animal pharmacology and human QTc clinical trials as the sole evidence for cardiac safety. With the release of the updated ICH S7B and E14 (2022) Q&A guidelines, regulatory authorities including the FDA and EMA now explicitly recognize validated in-silico electrophysiological models as corroborative evidence.',
      },
      {
        clause: '§ 02',
        title: 'Reduction of Animal Testing Dependency',
        body: 'Under this framework, computational pharmacology can reduce or clarify inconclusive animal data. By simulating ionic currents mathematically, researchers can demonstrate whether a compound carries pro-arrhythmic risk before entering late-stage human trials.',
      },
      {
        clause: '§ 03',
        title: 'Software Quality Assurance (ISO/IEC 25002:2024)',
        body: 'To ensure algorithmic integrity, our software architecture conforms to ISO/IEC 25002:2024 (SQuaRE — Software product Quality Requirements and Evaluation). This guarantees reproducibility, deterministic input handling, and rigorous documentation across all simulation outputs.',
      },
    ],
    date: 'Revised 2022 / 2024',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    relatedTags: ['ICH S7B', 'ICH E14', 'ISO/IEC 25002', 'Global Standard'],
  },
  {
    id: '2',
    slug: 'bpom-no-15-2022-pharmacovigilance',
    number: '02',
    level: 'National',
    title: 'BPOM No. 15 / 2022 on Pharmacovigilance',
    subtitle: 'Ensuring adverse drug reaction (ADR) data integrity in Indonesia.',
    excerpt:
      'Aligning predictive cardiotoxicity workflows with Indonesian National Food and Drug Authority standards for pre-market and post-market safety monitoring.',
    content: [
      {
        clause: '§ 01',
        title: 'National Regulatory Mandate',
        body: 'Regulation BPOM No. 15 / 2022 mandates strict pharmacovigilance protocols for all pharmaceutical industries operating in Indonesia. It emphasizes proactive monitoring of Adverse Drug Reactions (ADRs), particularly fatal cardiac events such as QT prolongation and lethal arrhythmia.',
      },
      {
        clause: '§ 02',
        title: 'Pre-Market & Post-Market Risk Screening',
        body: 'By integrating Cardivex early in the drug development and evaluation lifecycle, researchers can screen compounds against known cardiotoxic profiles before submission, ensuring compliance with national drug safety audits.',
      },
      {
        clause: '§ 03',
        title: 'ADR Data Integrity & Transparency',
        body: 'Our data reporting structure is designed to support transparent documentation required by BPOM, bridging computational prediction with national regulatory reporting standards.',
      },
    ],
    date: 'BPOM RI 2022',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop',
    featured: false,
    relatedTags: ['BPOM RI', 'Pharmacovigilance', 'ADR Integrity', 'National Law'],
  },
  {
    id: '3',
    slug: 'cipa-protocol-multi-channel-analysis',
    number: '03',
    level: 'Industrial',
    title: 'CiPA Protocol (Comprehensive In Vitro Proarrhythmia Assay)',
    subtitle: 'Mandating 3-tier risk classification and multi-channel electrophysiology.',
    excerpt:
      'Why evaluating eleven ionic currents—including qNet and calcium dynamics—replaces outdated single-channel hERG testing for Torsade de Pointes prediction.',
    content: [
      {
        clause: '§ 01',
        title: 'Beyond Single-Channel hERG Testing',
        body: 'The traditional approach of evaluating cardiac safety solely based on hERG potassium channel blockade has led to the premature abandonment of many safe chemical compounds. The CiPA initiative was established to overcome this limitation.',
      },
      {
        clause: '§ 02',
        title: 'Holistic Multi-Channel Electrophysiology',
        body: 'Instead of looking at a single channel, CiPA mandates a holistic evaluation across multiple ionic currents (including sodium, calcium, and potassium) combined with in-silico cardiomyocyte simulations.',
      },
      {
        clause: '§ 03',
        title: 'Standardized 3-Tier Risk Stratification',
        body: 'Cardivex directly implements the CiPA standard by reading 11 intracellular biomarkers and outputting a standardized 3-tier risk stratification: Low Risk, Intermediate Risk, and High Risk for Torsade de Pointes.',
      },
    ],
    date: 'CiPA Standard',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
    featured: false,
    relatedTags: ['CiPA', '3-Tier Risk', 'Electrophysiology', 'Ion Channels'],
  },
  {
    id: '4',
    slug: 'scientific-ensemble-ml-maas',
    number: '04',
    level: 'Scientific',
    title: 'Ensemble ML + Model-as-a-Service (MaaS)',
    subtitle: 'Peer-reviewed mathematical basis for cloud-delivered predictive precision.',
    excerpt:
      'Combining stacking ensemble classifiers with ADASYN synthetic data balancing to deliver peer-reviewed toxicology models via cloud infrastructure.',
    content: [
      {
        clause: '§ 01',
        title: 'Peer-Reviewed Stacking Ensemble Architecture',
        body: 'A regulatory standard must be supported by transparent, peer-reviewed mathematical foundations. Our predictive engine utilizes a Stacking Ensemble architecture that synthesizes Gradient Boosting, Random Forests, and Deep Neural Networks.',
      },
      {
        clause: '§ 02',
        title: 'Synthetic Balancing via ADASYN',
        body: 'To prevent prediction bias toward safe compounds caused by imbalanced pharmacological datasets, we apply ADASYN (Adaptive Synthetic Sampling Approach) along complex chemical decision boundaries.',
      },
      {
        clause: '§ 03',
        title: 'Model-as-a-Service (MaaS) Delivery',
        body: 'Delivered through a scalable Model-as-a-Service (MaaS) cloud pipeline, laboratories can execute zero-latency cardiotoxicity evaluations that are fully reproducible and scientifically defensible.',
      },
    ],
    date: 'Peer-Reviewed Basis',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    featured: false,
    relatedTags: ['Stacking ML', 'ADASYN', 'MaaS', 'Cloud Toxicology'],
  },
];