import { AlertTriangle, Activity, ShieldCheck } from 'lucide-react';

export const BIOMARKERS = [
  { id: 'qNet', name: 'qNet', unit: 'ratio to control', cat: 'Voltage Integration' },
  { id: 'dvdtmax', name: 'dvdtmax', unit: 'ratio to control', cat: 'Depolarization Rate' },
  { id: 'vmax', name: 'vmax', unit: 'ratio to control', cat: 'Action Potential' },
  { id: 'vrest', name: 'vrest', unit: 'ratio to control', cat: 'Action Potential' },
  { id: 'APD50', name: 'APD50', unit: 'ratio to control', cat: 'Duration Metrics' },
  { id: 'APD90', name: 'APD90', unit: 'ratio to control', cat: 'Duration Metrics' },
  { id: 'max_dv', name: 'max_dv', unit: 'ratio to control', cat: 'Depolarization Rate' },
  { id: 'camax', name: 'camax', unit: 'ratio to control', cat: 'Calcium Kinetics' },
  { id: 'carest', name: 'carest', unit: 'ratio to control', cat: 'Calcium Kinetics' },
  { id: 'CaTD50', name: 'CaTD50', unit: 'ratio to control', cat: 'Calcium Kinetics' },
  { id: 'CaTD90', name: 'CaTD90', unit: 'ratio to control', cat: 'Calcium Kinetics' }
];

export const COMPOUND_LIBRARY = [
  // ==========================================
  // HIGH RISK (TdP Arrhythmogenic)
  // ==========================================
  {
    id: 'azimilide',
    name: 'Azimilide',
    type: 'Antiarrhythmic',
    risk: 'High',
    icon: AlertTriangle,
    values: [0.62631, 0.99975, 1.003687, -0.999976, 1.422269, 1.521552, -0.631328, 1.063894, 1.02, 1.121262, 1.056818]
  },
  {
    id: 'vandetanib',
    name: 'Vandetanib',
    type: 'Anticancer (Kinase)',
    risk: 'High',
    icon: AlertTriangle,
    values: [0.518977, 0.998022, 0.99734, -1.000036, 1.616597, 1.775862, -0.472144, 1.02015, 1.0, 1.225083, 1.126033]
  },
  {
    id: 'disopyramide',
    name: 'Disopyramide',
    type: 'Antiarrhythmic',
    risk: 'High',
    icon: AlertTriangle,
    values: [0.866951, 0.996498, 0.990098, -1.000025, 1.240546, 1.305172, -0.745638, 1.049315, 1.01, 1.060631, 1.02135]
  },
  {
    id: 'ibutilide',
    name: 'Ibutilide',
    type: 'Antiarrhythmic',
    risk: 'High',
    icon: AlertTriangle,
    values: [0.328534, 0.992545, 1.021056, -1.000187, 1.994748, 2.303448, -0.235329, 1.019505, 0.992, 1.240864, 1.277893]
  },

  // ==========================================
  // INTERMEDIATE RISK
  // ==========================================
  {
    id: 'clarithromycin',
    name: 'Clarithromycin',
    type: 'Antibiotic',
    risk: 'Interm.',
    icon: Activity,
    values: [0.918296, 0.999048, 0.990152, -1.000058, 1.115546, 1.14569, -0.838632, 0.937907, 0.99, 1.080565, 1.038912]
  },
  {
    id: 'domperidone',
    name: 'Domperidone',
    type: 'Anti-Nausea (GERD)',
    risk: 'Interm.',
    icon: Activity,
    values: [0.6731, 1.000821, 1.00564, -1.000038, 1.385504, 1.435345, -0.671481, 1.046307, 1.01, 1.120432, 1.049242]
  },
  {
    id: 'clozapine',
    name: 'Clozapine',
    type: 'Antipsychotic',
    risk: 'Interm.',
    icon: Activity,
    values: [0.957191, 0.999981, 0.999269, -1.000005, 1.064076, 1.076724, -0.913798, 1.011336, 1.0, 1.017442, 1.00551]
  },
  {
    id: 'droperidol',
    name: 'Droperidol',
    type: 'Antiemetic',
    risk: 'Interm.',
    icon: Activity,
    values: [0.876561, 1.00005, 1.001491, -0.999996, 1.139706, 1.157759, -0.841512, 1.028294, 1.01, 1.037375, 1.011708]
  },

  // ==========================================
  // LOW RISK (Safe Baseline)
  // ==========================================
  {
    id: 'loratadine',
    name: 'Loratadine',
    type: 'Antihistamine (Alergi)',
    risk: 'Low',
    icon: ShieldCheck,
    values: [0.999578, 1.0, 1.0, -1.0, 1.0, 1.0, -0.998329, 1.000133, 1.0, 1.0, 1.0]
  },
  {
    id: 'nifedipine',
    name: 'Nifedipine',
    type: 'Antihypertensive',
    risk: 'Low',
    icon: ShieldCheck,
    values: [1.188624, 1.000936, 0.965735, -1.000383, 0.921218, 0.932759, -0.986335, 0.713658, 0.916, 1.097176, 1.0823]
  },
  {
    id: 'tamoxifen',
    name: 'Tamoxifen',
    type: 'Breast Cancer Therapy',
    risk: 'Low',
    icon: ShieldCheck,
    values: [0.985585, 0.999987, 1.000175, -0.999998, 1.013655, 1.016379, -0.97662, 1.003312, 1.0, 1.003322, 1.001377]
  },
  {
    id: 'nitrendipine',
    name: 'Nitrendipine',
    type: 'Calcium Channel Blocker',
    risk: 'Low',
    icon: ShieldCheck,
    values: [1.03339, 1.000121, 0.996312, -1.00004, 0.985294, 0.987931, -0.998975, 0.96478, 0.993, 1.01412, 1.009642]
  }
];