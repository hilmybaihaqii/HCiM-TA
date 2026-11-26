// src/data/standardsData.ts
//
// Empat pilar yang mendasari Cardivex. Isinya harus bisa ditelusuri: setiap klausul menyebut
// dokumen rujukan atau angka yang memang ada di aplikasi (28 obat CiPA, 11 biomarker, 1–4× Cmax,
// 400 pohon, prediction set konformal, SHAP). Jangan menambahkan klaim sertifikasi atau persetujuan
// regulator yang belum dimiliki.

export interface StandardSection {
  clause: string;
  title: string;
  body: string;
}

/** Tautan ke dokumen aslinya: teks peraturan, situs resmi, atau paper (DOI). */
export interface StandardSource {
  label: string;
  href: string;
  /** Keterangan singkat, mis. "PDF" atau "Dicabut" */
  note?: string;
}

export interface StandardItem {
  id: string;
  slug: string;
  number: string;
  level: string; // International, National, Industrial, Scientific
  title: string;
  subtitle: string;
  excerpt: string;
  /** Satu kalimat: apa arti pilar ini bagi Cardivex */
  implication: string;
  content: StandardSection[]; // Format klausul / pasal regulasi
  date: string;
  image: string;
  featured?: boolean;
  relatedTags: string[];
  sources: StandardSource[];
}

export const STANDARDS_DATA: StandardItem[] = [
  {
    id: '1',
    slug: 'ich-s7b-e14-software-quality',
    number: '01',
    level: 'International',
    title: 'ICH S7B and E14: the 2022 Q&A',
    subtitle: 'The guidance that lets a simulated heart cell count as evidence.',
    excerpt:
      'Since 2022, the international guidance that governs cardiac safety testing recognises in-silico models of the human heart cell as supporting evidence, provided the model and its inputs are documented and reproducible.',
    implication:
      'Cardivex is built to produce exactly the kind of record this guidance asks for: a stated model, stated inputs, and a result anyone can re-run.',
    content: [
      {
        clause: '§ 01',
        title: 'What the two guidelines cover',
        body: 'ICH S7B covers the non-clinical work: what is measured in cells and animals before a drug reaches people. ICH E14 covers the clinical side: the thorough QT study in human volunteers. Together they decide whether a drug is treated as a cardiac risk. Both were written when the only accepted evidence came from laboratory animals and human trials.',
      },
      {
        clause: '§ 02',
        title: 'What changed in the 2022 Q&A',
        body: 'The 2022 question-and-answer document, adopted by regulators including the FDA and the EMA, added in-silico modelling of the human ventricular action potential to the list of evidence that can support a cardiac safety conclusion. It is corroborative evidence: it strengthens or helps interpret laboratory results, and does not replace the studies a submission still requires.',
      },
      {
        clause: '§ 03',
        title: 'The conditions attached to it',
        body: 'The guidance only accepts a simulation when the model is a published and validated one, the ion-channel inputs are measured and reported, and the result can be reproduced from those inputs. A number produced by an undocumented model carries no weight, however accurate it looks.',
      },
      {
        clause: '§ 04',
        title: 'How Cardivex meets those conditions',
        body: 'Every run states the cell model and engine version it used, the drug parameters it received (Cmax, hERG binding, IC50 and Hill coefficients) and which of those came from the CiPA database or from the user. The eleven biomarkers, the simulated concentrations and the SHAP contributions behind each result are all stored, so a run can be inspected and repeated later from the Activity Logs.',
      },
    ],
    date: 'ICH Q&A, 2022',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1200&auto=format&fit=crop',
    featured: true,
    relatedTags: ['ICH S7B', 'ICH E14', 'In-silico evidence', 'Reproducibility'],
    sources: [
      { label: 'ICH E14 / S7B Questions & Answers (Step 4, 2022)', href: 'https://database.ich.org/sites/default/files/E14-S7B_QAs_Step4_2022_0221.pdf', note: 'PDF' },
      { label: 'ICH Safety Guidelines (S7B)', href: 'https://www.ich.org/page/safety-guidelines' },
      { label: 'ICH Efficacy Guidelines (E14)', href: 'https://www.ich.org/page/efficacy-guidelines' },
    ],
  },
  {
    id: '2',
    slug: 'bpom-no-15-2022-pharmacovigilance',
    number: '02',
    level: 'National',
    title: 'BPOM Regulation No. 4 of 2026',
    subtitle: 'Indonesia expects drug safety to be watched, recorded and acted on.',
    excerpt:
      'Indonesia’s drug authority requires companies to run a pharmacovigilance system: adverse reactions must be detected, documented and reported, with cardiac events among the most serious. The duty now sits in Regulation No. 4 of 2026, which replaced No. 15 of 2022.',
    implication:
      'Cardivex sits before that system, as a screening tool that flags a cardiac liability while a compound can still be changed or dropped.',
    content: [
      {
        clause: '§ 01',
        title: 'What the regulation requires',
        body: 'Indonesian law requires every marketing authorisation holder to operate a pharmacovigilance system: to detect adverse drug reactions, keep records of them, assess the risk and report to the authority. Drug-induced arrhythmia and QT prolongation are among the reactions treated most seriously, because they can be fatal and can appear long after approval. The duty was set out in BPOM Regulation No. 15 of 2022 and now sits in Regulation No. 4 of 2026, which revoked and replaced it.',
      },
      {
        clause: '§ 02',
        title: 'Why prediction matters before that point',
        body: 'Pharmacovigilance acts on harm that has already happened to a patient. The cheapest cardiac risk to handle is the one found before a compound reaches people at all. A screening step that reads a compound’s ion-channel data and flags a likely Torsade de Pointes liability moves that decision years earlier in the project.',
      },
      {
        clause: '§ 03',
        title: 'Records that survive the project',
        body: 'Every prediction in Cardivex is stored with its inputs, its risk level, the vote share behind it and the SHAP explanation, under the account that ran it. Long after the run, a team can show the result, the inputs the model received and the reasons for its decision.',
      },
      {
        clause: '§ 04',
        title: 'What this tool is not',
        body: 'Cardivex is a research tool. It is not registered as a medical device, it is not an approved regulatory submission method, and it does not replace the clinical or non-clinical studies that BPOM or any other authority requires. It is used to decide which compounds deserve those studies.',
      },
    ],
    date: 'BPOM RI, 2026',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop',
    featured: false,
    relatedTags: ['BPOM RI', 'Pharmacovigilance', 'Adverse reactions', 'Screening'],
    sources: [
      { label: 'Peraturan BPOM No. 4 Tahun 2026 tentang Pelaksanaan Farmakovigilans', href: 'https://peraturan.bpk.go.id/Details/345742/peraturan-bpom-no-4-tahun-2026', note: 'In force' },
      { label: 'Peraturan BPOM No. 15 Tahun 2022 tentang Penerapan Farmakovigilans', href: 'https://peraturan.bpk.go.id/Details/223976/peraturan-bpom-no-15-tahun-2022', note: 'Revoked' },
      { label: 'Badan POM RI', href: 'https://www.pom.go.id/' },
    ],
  },
  {
    id: '3',
    slug: 'cipa-protocol-multi-channel-analysis',
    number: '03',
    level: 'Industrial',
    title: 'The CiPA initiative',
    subtitle: 'One ion channel is not enough to judge a drug.',
    excerpt:
      'CiPA replaced the single hERG test with a multi-channel assessment: several ion currents measured in the laboratory, run through a simulated human heart cell, and read as biomarkers rather than as one number.',
    implication:
      'CiPA defines what Cardivex simulates, which drugs it was tested against, and the three risk levels it reports.',
    content: [
      {
        clause: '§ 01',
        title: 'The problem with the hERG test alone',
        body: 'For years a compound was judged mainly by how strongly it blocked the hERG potassium channel. The test is sensitive but not specific: several drugs block hERG and remain safe, because blocking other channels, particularly the late sodium and L-type calcium currents, offsets the effect. Judging on hERG alone discards safe compounds and can still miss unsafe ones.',
      },
      {
        clause: '§ 02',
        title: 'What CiPA put in its place',
        body: 'The CiPA initiative, led by the FDA with regulators and industry, measures the drug’s effect on several ion currents, feeds those measurements into a mathematical model of a human ventricular myocyte, and reads the simulated cell. The question is no longer "does it block hERG" but "what happens to the whole cell when it does".',
      },
      {
        clause: '§ 03',
        title: 'The reference set of 28 drugs',
        body: 'CiPA designated 28 reference drugs with an agreed Torsade de Pointes risk level, each with published ion-channel parameters. They are the shared yardstick: any new method can be run against them and compared. Cardivex loads those parameters directly, so a CiPA drug can be simulated without entering a single number.',
      },
      {
        clause: '§ 04',
        title: 'Eleven biomarkers, three risk levels',
        body: 'Cardivex simulates the cell at 1, 2, 3 and 4 times the drug’s peak plasma concentration and measures eleven biomarkers from the action potential and the calcium transient, including qNet, APD50, APD90 and peak calcium. Each is expressed as a ratio to a drug-free cell, averaged across the four concentrations, and classified into the three CiPA tiers: low, intermediate or high risk.',
      },
    ],
    date: 'FDA-led initiative',
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
    featured: false,
    relatedTags: ['CiPA', '28 reference drugs', '11 biomarkers', 'Three risk tiers'],
    sources: [
      { label: 'CiPA initiative', href: 'https://cipaproject.org/' },
      { label: 'Dutta et al. (2017): the CiPA-optimised human ventricular model', href: 'https://doi.org/10.3389/fphys.2017.00616', note: 'DOI' },
      { label: 'O’Hara et al. (2011): the original O’Hara-Rudy model', href: 'https://doi.org/10.1371/journal.pcbi.1002061', note: 'DOI' },
    ],
  },
  {
    id: '4',
    slug: 'scientific-ensemble-ml-maas',
    number: '04',
    level: 'Scientific',
    title: 'How the model was trained and tested',
    subtitle: 'A result is only worth as much as the test behind it.',
    excerpt:
      'The classifier learned from 12 of the CiPA reference drugs and was tested on the remaining 16, which it never saw while learning. Every prediction reports how confident it is and which biomarkers drove it.',
    implication:
      'The accuracy figures shown on this site come from drugs the model had never seen, not from the data it learned on.',
    content: [
      {
        clause: '§ 01',
        title: 'Separating what it learns from what it is judged on',
        body: 'The 28 CiPA reference drugs were split in two. The model learned from 12 of them and the other 16 were held back until the final evaluation. The split is by drug, never by individual simulated cell, because cells of the same drug resemble each other closely; splitting them would let the model recognise a drug it had effectively already seen.',
      },
      {
        clause: '§ 02',
        title: 'The classifier',
        body: 'A random forest of 400 decision trees reads the eleven averaged biomarker ratios. Each tree learned from a different random sample of the training data and votes for a risk level; the share of votes becomes the probability of each level. No single tree decides, so the individual mistakes largely cancel out.',
      },
      {
        clause: '§ 03',
        title: 'Saying when it is unsure',
        body: 'A single risk label hides doubt. Cardivex adds conformal prediction: alongside the predicted tier it reports a prediction set, the levels it cannot confidently rule out at the stated error rate. When two levels are too close to call it says so and recommends the more cautious one, instead of presenting a borderline case as a decision.',
      },
      {
        clause: '§ 04',
        title: 'Showing the reasoning',
        body: 'Every prediction is paired with a SHAP explanation that measures how much each of the eleven biomarkers pushed the result toward or away from the chosen level. A reviewer can see whether the model leaned on the measures CiPA itself considers meaningful, such as qNet and repolarisation time, rather than on an artefact of the data.',
      },
    ],
    date: 'Model evaluation',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    featured: false,
    relatedTags: ['Random forest', 'Held-out drugs', 'Conformal prediction', 'SHAP'],
    sources: [
      { label: 'The papers this work builds on', href: '/articles' },
      { label: 'Passini et al. (2017): simulation outperformed animal hearts for this risk', href: 'https://doi.org/10.3389/fphys.2017.00668', note: 'DOI' },
    ],
  },
];
