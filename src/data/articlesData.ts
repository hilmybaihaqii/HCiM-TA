// src/data/articlesData.ts

export interface ArticleItem {
  id: string;
  slug: string;
  number: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  date: string;
  image: string;
  featured?: boolean;
}

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: '1',
    slug: 'in-silico-cardiotoxicity-prediction-frameworks',
    number: '01',
    title: 'Beyond the Petri Dish: How Machine Learning Predicts Drug-Induced Cardiotoxicity',
    excerpt:
      'Exploring how cellular electrophysiology simulations combined with stacking ensemble classifiers are rendering early-stage animal testing obsolete while uncovering hidden QT prolongation risks.',
    content: [
      'For decades, evaluating the cardiac safety of novel pharmaceuticals relied heavily on animal testing and late-stage clinical trials. However, drug-induced cardiotoxicity—specifically fatal arrhythmias like Torsade de Pointes (TdP)—remains one of the primary reasons drugs are withdrawn from the market.',
      'By combining in-silico electrophysiological heart cell simulations with Stacking Ensemble machine learning architectures, modern computational toxicology can now read subtle cellular biomarkers long before a physical compound is ever synthesized.',
      'Our approach examines eleven crucial intracellular metrics, from calcium handling dynamics (CaTD90) to net electrical charge transfer (qNet). The result is a highly precise, animal-free early warning system that flags arrhythmia risks with unprecedented accuracy.',
      'Unlike traditional simple classifiers, ensemble architectures leverage the variance reduction of Random Forests alongside the gradient optimization of XGBoost. When tested against unseen compounds, this multi-layered approach demonstrates superior sensitivity without overfitting to common drug profiles.'
    ],
    category: 'Pharmacovigilance',
    readTime: '6 MIN READ',
    date: 'JULY 2026',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop',
    featured: true,
  },
  {
    id: '2',
    slug: 'understanding-torsade-de-pointes-biomarkers',
    number: '02',
    title: 'The Anatomy of Torsade de Pointes: Eleven Biomarkers You Cannot Ignore',
    excerpt:
      'Why electrical charge (qNet) and action potential duration (APD90) remain the gold standard metrics when evaluating lethal ventricular arrhythmia.',
    content: [
      'When an ion channel in a cardiomyocyte is blocked by a chemical compound, the electrical reset time of the heart cell is prolonged. This delay appears on an ECG as QT prolongation, a known precursor to Torsade de Pointes.',
      'While APD90 (Action Potential Duration at 90% repolarization) has traditionally served as the primary metric for risk, recent consensus in computational pharmacovigilance highlights qNet—the net integrated membrane current—as a far superior differentiator.',
      'Understanding the interplay between potassium channel blockades and intracellular calcium accumulation allows researchers to separate benign QT prolongation from truly lethal pro-arrhythmic risks.'
    ],
    category: 'Electrophysiology',
    readTime: '4 MIN READ',
    date: 'JUNE 2026',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: '3',
    slug: 'algorithmic-precision-in-drug-discovery',
    number: '03',
    title: 'Algorithmic Precision: Designing Reliable AI Models for Cardiac Safety',
    excerpt:
      'A technical deep dive into balancing imbalanced biomedical datasets using ADASYN and validation techniques across novel chemical compounds.',
    content: [
      'One of the greatest engineering hurdles in biochemical machine learning is dataset imbalance. High-risk, highly toxic compounds occur far less frequently in historical pharmacological databases than safe compounds.',
      'To prevent predictive models from biasing toward safety, we implement ADASYN (Adaptive Synthetic Sampling Approach). Unlike simple oversampling, ADASYN dynamically generates synthetic data along the decision boundaries of the most complex, hard-to-classify chemical structures.',
      'When paired with a Stacking Ensemble classifier—combining the predictive strengths of Gradient Boosting, Random Forests, and Deep Neural Networks—the pipeline achieves remarkable sensitivity across unseen drug validations.'
    ],
    category: 'Machine Learning',
    readTime: '8 MIN READ',
    date: 'MAY 2026',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
    featured: false,
  },
  {
    id: '4',
    slug: 'ciwidey-optical-backbone-case-study',
    number: '04',
    title: 'The Architecture of Precision: Low-Latency Infrastructure for Cloud Bio-Simulations',
    excerpt:
      'How robust optical backbones and dense wavelength networking ensure real-time cellular simulation processing across remote medical laboratories.',
    content: [
      'Executing millions of differential equations to simulate ion channel kinetics requires massive computational bandwidth and near-zero network latency.',
      'In our latest infrastructure design study, we explore how DWDM (Dense Wavelength Division Multiplexing) optical backbones can interconnect remote bio-simulation clusters with research institutions across high-latency topologies.',
      'By optimizing optical signal-to-noise ratios and minimizing fiber dispersion, distributed medical teams can interact with real-time in-silico cardiotoxicity models without experiencing rendering bottleneck or data degradation.'
    ],
    category: 'Infrastructure',
    readTime: '5 MIN READ',
    date: 'APRIL 2026',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    featured: false,
  },
];