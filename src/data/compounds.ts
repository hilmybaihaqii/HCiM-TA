import { AlertTriangle, Activity, ShieldCheck } from 'lucide-react';

export const BIOMARKERS = [
  { id: 'qNet', name: 'qNet', unit: 'μA·ms/μF', cat: 'Voltage Integration' },
  { id: 'dvdtmax', name: 'dvdtmax', unit: 'V/s', cat: 'Depolarization Rate' },
  { id: 'vmax', name: 'vmax', unit: 'mV', cat: 'Action Potential' },
  { id: 'vrest', name: 'vrest', unit: 'mV', cat: 'Action Potential' },
  { id: 'APD50', name: 'APD50', unit: 'ms', cat: 'Duration Metrics' },
  { id: 'APD90', name: 'APD90', unit: 'ms', cat: 'Duration Metrics' },
  { id: 'max_dv', name: 'max_dv', unit: 'V/s', cat: 'Depolarization Rate' },
  { id: 'camax', name: 'camax', unit: 'μM', cat: 'Calcium Kinetics' },
  { id: 'carest', name: 'carest', unit: 'μM', cat: 'Calcium Kinetics' },
  { id: 'CaTD50', name: 'CaTD50', unit: 'ms', cat: 'Calcium Kinetics' },
  { id: 'CaTD90', name: 'CaTD90', unit: 'ms', cat: 'Calcium Kinetics' }
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
    values: [44.4372, 72.8815, 41.7375, -88.0142, 338.25, 440.25, -0.2385, 0.0002, 0.0001, 344.5, 773.0]
  },
  {
    id: 'vandetanib',
    name: 'Vandetanib',
    type: 'Anticancer (Kinase)',
    risk: 'High',
    icon: AlertTriangle,
    values: [36.9208, 72.9088, 41.3308, -88.0241, 386.25, 515.25, -0.1779, 0.0002, 0.0001, 407.5, 844.75]
  },
  {
    id: 'disopyramide',
    name: 'Disopyramide',
    type: 'Antiarrhythmic',
    risk: 'High',
    icon: AlertTriangle,
    values: [55.4993, 72.8676, 41.3365, -88.019, 299.25, 384.5, -0.272, 0.0002, 0.0001, 342.25, 770.25]
  },
  {
    id: 'ibutilide',
    name: 'Ibutilide',
    type: 'Antiarrhythmic',
    risk: 'High',
    icon: AlertTriangle,
    values: [12.7589, 73.0257, 43.26, -88.0246, 474.0, 658.25, -0.0958, 0.0002, 0.0001, 399.5, 935.0]
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
    values: [67.1382, 72.7939, 41.0703, -88.0224, 256.0, 320.0, -0.3274, 0.0002, 0.0001, 326.0, 758.0]
  },
  {
    id: 'domperidone',
    name: 'Domperidone',
    type: 'Anti-Nausea (GERD)',
    risk: 'Interm.',
    icon: Activity,
    values: [53.5166, 72.9857, 40.145, -88.0526, 332.25, 417.5, -0.237, 0.0002, 0.0001, 414.5, 868.25]
  },
  {
    id: 'clozapine',
    name: 'Clozapine',
    type: 'Antipsychotic',
    risk: 'Interm.',
    icon: Activity,
    values: [67.7235, 72.7082, 41.2748, -88.0183, 247.5, 304.5, -0.3551, 0.0002, 0.0001, 311.5, 739.5]
  },
  {
    id: 'droperidol',
    name: 'Droperidol',
    type: 'Antiemetic',
    risk: 'Interm.',
    icon: Activity,
    values: [59.8869, 72.9011, 41.7727, -88.0134, 271.75, 336.0, -0.3191, 0.0002, 0.0001, 312.5, 734.5]
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
    values: [70.3091, 72.8998, 41.5892, -88.0163, 237.0, 289.0, -0.3753, 0.0002, 0.0001, 304.5, 731.25]
  },
  {
    id: 'nifedipine',
    name: 'Nifedipine',
    type: 'Antihypertensive',
    risk: 'Low',
    icon: ShieldCheck,
    values: [88.5484, 73.0305, 39.4805, -88.071, 208.75, 260.25, -0.3597, 0.0001, 0.0001, 318.25, 796.5]
  },
  {
    id: 'tamoxifen',
    name: 'Tamoxifen',
    type: 'Breast Cancer Therapy',
    risk: 'Low',
    icon: ShieldCheck,
    values: [68.6737, 72.8962, 41.6301, -88.0153, 242.25, 295.75, -0.3658, 0.0002, 0.0001, 304.75, 730.5]
  },
  {
    id: 'nitrendipine',
    name: 'Nitrendipine',
    type: 'Calcium Channel Blocker',
    risk: 'Low',
    icon: ShieldCheck,
    values: [78.5206, 72.886, 40.4579, -88.0398, 225.5, 277.0, -0.3741, 0.0002, 0.0001, 333.5, 782.25]
  }
];