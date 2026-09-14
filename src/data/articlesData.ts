export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  /** Citation year; an earlier online publication date is shown separately. */
  year: number;
  journal: string;
  doi: string;
  category: string;
  excerpt: string;
  publicationNote?: string;
  featured?: boolean;
}

// Publication metadata and short summaries checked against the publisher pages.
// DOI links resolve to the original publications.
export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: '1',
    slug: 'tdp-risk-inter-individual-variability',
    title: 'Machine learning approach to evaluate TdP risk of drugs using cardiac electrophysiological model including inter-individual variability',
    authors: [
      'Yunendah Nur Fuadah',
      'Ali Ikhsanul Qauli',
      'Aroli Marcellinus',
      'Muhammad Adnan Pramudito',
      'Ki Moo Lim',
    ],
    year: 2023,
    journal: 'Frontiers in Physiology',
    doi: '10.3389/fphys.2023.1266084',
    category: 'In silico cardiac safety',
    excerpt: 'Combines biomarkers from a virtual population of cardiac cell models with machine learning to evaluate drug-induced TdP risk while accounting for differences between individuals.',
  },
  {
    id: '2',
    slug: 'atrial-fibrillation-heart-failure-classification',
    title: 'Optimal Classification of Atrial Fibrillation and Congestive Heart Failure Using Machine Learning',
    authors: ['Yunendah Nur Fuadah', 'Ki Moo Lim'],
    year: 2022,
    journal: 'Frontiers in Physiology',
    doi: '10.3389/fphys.2021.761013',
    category: 'ECG classification',
    excerpt: 'Investigates ECG features and optimized machine learning classifiers to distinguish atrial fibrillation, congestive heart failure, and normal sinus rhythm.',
  },
  {
    id: '3',
    slug: 'heart-sound-classification-grid-search',
    title: 'An Optimal Approach for Heart Sound Classification Using Grid Search in Hyperparameter Optimization of Machine Learning',
    authors: [
      'Yunendah Nur Fuadah',
      'Muhammad Adnan Pramudito',
      'Ki Moo Lim',
    ],
    year: 2023,
    journal: 'Bioengineering',
    doi: '10.3390/bioengineering10010045',
    category: 'Heart sound classification',
    publicationNote: '2023 volume · Published online 29 Dec 2022',
    excerpt: 'Uses heart-sound features and grid search to tune machine learning classifiers for detecting normal and abnormal recordings from the PhysioNet Challenge 2016 and 2022 datasets.',
  },
  {
    id: '4',
    slug: 'stacking-ensemble-in-silico-cardiac-toxicity',
    title: 'A stacking ensemble machine learning model for evaluating cardiac toxicity of drugs based on in silico biomarkers',
    authors: [
      'Yunendah Nur Fuadah',
      'Ali Ikhsanul Qauli',
      'Muhammad Adnan Pramudito',
      'Aroli Marcellinus',
      'Ulfa Latifa Hanum',
      'Ki Moo Lim',
    ],
    year: 2024,
    journal: 'CPT: Pharmacometrics & Systems Pharmacology',
    doi: '10.1002/psp4.13229',
    featured: true,
    category: 'Stacking ensemble',
    excerpt: 'Evaluates drug-induced TdP risk using stacking ensembles and multiple simulated cardiac biomarkers, incorporating hERG dynamics and investigating variability between individuals.',
  },
  {
    id: '5',
    slug: 'stacking-ensemble-hipsc-cm-mea-cardiac-safety',
    title: 'Stacking Ensemble Machine Learning for Cardiac Safety Assessment Using hiPSC-CM MEA Data',
    authors: [
      'Muhammad Adnan Pramudito',
      'Yunendah Nur Fuadah',
      'Yoo Seok Kim',
      'Ki Moo Lim',
    ],
    year: 2026,
    journal: 'Annals of Biomedical Engineering',
    doi: '10.1007/s10439-026-03978-1',
    category: 'hiPSC-CM assessment',
    excerpt: 'Combines machine learning models to assess TdP risk using two electrophysiological measurements derived from hiPSC-CM microelectrode array data, with evaluation on unseen CiPA reference compounds.',
  },
  {
    id: '6',
    slug: 'explainable-ai-in-silico-cardiac-biomarkers',
    title: 'Explainable artificial intelligence (XAI) to find optimal in-silico biomarkers for cardiac drug toxicity evaluation',
    authors: [
      'Muhammad Adnan Pramudito',
      'Yunendah Nur Fuadah',
      'Ali Ikhsanul Qauli',
      'Aroli Marcellinus',
      'Ki Moo Lim',
    ],
    year: 2024,
    journal: 'Scientific Reports',
    doi: '10.1038/s41598-024-71169-w',
    category: 'Explainable AI',
    excerpt: 'Applies SHAP explainability to compare the contributions of simulated cardiac biomarkers across machine learning models and investigate biomarker selection for drug-induced TdP risk prediction.',
  },
];
