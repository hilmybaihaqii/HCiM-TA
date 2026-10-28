import { FEATURES } from '@/lib/pipeline';

type Feature = (typeof FEATURES)[number];

/** Keterangan pendek (satu baris) untuk daftar biomarker */
export const SHORT_DESC: Record<Feature, string> = {
  qNet: 'Net charge per beat',
  dvdtmax: 'Upstroke speed',
  vmax: 'Peak voltage',
  vrest: 'Resting voltage',
  APD50: 'Time to 50% recovery',
  APD90: 'Time to 90% recovery',
  max_dv: 'Fastest recovery slope',
  camax: 'Peak calcium',
  carest: 'Resting calcium',
  CaTD50: 'Calcium, 50% recovery',
  CaTD90: 'Calcium, 90% recovery',
};

/**
 * Penjelasan biomarker untuk orang yang belum hafal istilahnya: apa yang diukur, lalu arti perubahannya.
 * Teks referensi, bukan hasil: tidak pernah menyebut nilai run tertentu.
 */
export const BIOMARKER_INFO: Record<Feature, string> = {
  qNet:
    'The net electric charge that flows through the cell’s main ion channels during one beat. In the CiPA framework, a value lower than in the drug-free cell is linked to higher TdP risk.',
  dvdtmax:
    'How fast the voltage shoots up at the start of each beat. This upstroke is driven by sodium channels, so a clear drop means the drug blocks them and the electrical signal may spread more slowly through the heart.',
  vmax:
    'The highest voltage the cell reaches during a beat. It usually moves very little; a clear drop is another sign of sodium channel block.',
  vrest:
    'The cell’s voltage between beats, while it is at rest. It should stay close to the drug-free value; a shift means the cell is less stable and easier to trigger.',
  APD50:
    'How long the cell takes to get halfway back to rest after a beat. A longer time means each beat is being stretched out.',
  APD90:
    'How long the cell takes to get 90% of the way back to rest. It is the single-cell counterpart of the QT interval on an ECG; a longer value points to QT prolongation.',
  max_dv:
    'The fastest the voltage falls while the cell recovers. Slower recovery leaves a window in which extra, unwanted beats (EADs) can start.',
  camax:
    'The highest calcium level inside the cell during a beat. Calcium makes the heart muscle contract, so large changes affect how strongly it pumps.',
  carest:
    'The calcium level inside the cell between beats. A rise means calcium is building up, which can set off extra beats on its own.',
  CaTD50:
    'How long the calcium signal takes to fall halfway back to rest. A longer value means calcium stays high for longer after each beat.',
  CaTD90:
    'How long the calcium signal takes to fall 90% of the way back. Read together with APD90, it shows whether the whole beat is being stretched out.',
};
