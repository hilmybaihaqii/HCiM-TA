# `/lab` area

Every route keeps its own pieces in its own `components/` folder. `lab/components/` holds what the
whole lab shares, plus the Digital Lab (`/lab` itself).

```
lab/
├── layout.tsx               SessionGuard, ambient background, LabNavbar, LabFooter
├── page.tsx                 Digital Lab: 11 biomarkers → risk model
├── components/
│   ├── LabNavbar.tsx        tabs (sliding pill), profile menu, logout
│   ├── LabFooter.tsx
│   ├── LabContainer.tsx     page width, gutters, top offset under the navbar (use on every lab page)
│   ├── LabPageHeader.tsx    shared page header (use on every lab page)
│   ├── LabForm.tsx          Digital Lab input matrix
│   ├── Skeletons.tsx        shared skeleton loading (page, status panel, lab shell)
│   ├── LabTutorial.tsx      guided tour (targets the #tour-* ids)
│   └── report/              one risk report for Digital Lab and Full Pipeline
│       ├── StageMonitor.tsx     status panel: stages, real output per stage
│       ├── HeartbeatLoader.tsx  animated ECG loader for model work
│       ├── RiskVerdict.tsx      tier, 400-tree votes, conformal output
│       ├── BiomarkerList.tsx    11 biomarkers: change, SHAP influence, tap for details
│       ├── biomarkerText.ts     reference text per biomarker
│       └── ui.tsx               buttons, SectionHead, SlideIndicator
├── pipeline/                Full Pipeline: drug data → heart-cell simulation → risk model
│   ├── page.tsx             state machine (form / running / result), polling, ?job= resume
│   ├── form.ts              form state, validation, request building
│   ├── useDosePredictions.ts  risk per dose (mean from the job, 1–4× on demand), cached per job
│   └── components/
│       ├── JobProgress.tsx      PipelineMonitor (5 real stages) + RunningDetails
│       ├── PipelineResult.tsx   result: verdict, dose strip, 11 biomarkers, one 3-way detail switch
│       ├── SimulationPanel.tsx  traces, per-dose biomarker matrix, warnings, method note
│       ├── DrugInputs.tsx       drug parameters (Cmax, hERG, IC50/Hill) + per-dose run table
│       └── …                    wizard (DrugParamsForm, ModeSelector), TraceChart
├── logs/                    Activity Logs: overview donut, Prediction & SHAP history (components/history.tsx = shared rows, filter, pager)
└── profile/
```

API helpers live in `src/lib/` (`api.ts`, `pipeline.ts`, `predict.ts`, `tierColor.ts`).
`predict.ts` holds the risk model calls (predict + explain, retry on transient errors only) used by
both Digital Lab and the per-dose results.

## Data rules (risk reports)

- Show only what the API returns (job, sim_result, predict, explain) or values derived from it.
  No hand-written protocol numbers (beat counts, cycle length, run time) and no made-up advice.
- Confidence is the vote share of the 400-tree forest (multiples of 1/400). Show it as votes, never
  rounded percentages, so 399/400 does not read as 100%.
- Every prediction is followed by `explain` (SHAP) automatically, with the same `prediction_id`, in
  Digital Lab and for each dose in Full Pipeline. The tier shows first; SHAP fills in a few seconds
  later. This keeps Prediction and SHAP history in Activity Logs one-to-one.
- The 11 biomarkers are two swipeable slides: "Main drivers" (SHAP order) first, then "Change vs
  drug-free" (without drug, with drug, change).
- Reference text (`SHORT_DESC`, `BIOMARKER_INFO`) explains what a biomarker is; it never states a
  result.

## UI rules

- **Header:** start every lab page with `<LabPageHeader eyebrow title accent description />`.
- **Radius:** use the named scale from `globals.css`, never raw sizes.

  | Class | Use for |
  |---|---|
  | `rounded-sheet` | top-level panels |
  | `rounded-card` | cards inside a panel, dropdowns, tooltips |
  | `rounded-control` | buttons, inputs |
  | `rounded-chip` | tiny tags, hover backgrounds |
  | `rounded-full` | only the navbar, avatars, status dots, progress bars |

- **Tier colors:** `getTierColor(tier)` for Tailwind classes, `getTierCssVar(tier)` for SVG and inline styles.
- **Type:** sans only on new pages (no italic). One accent color per view.
- **Charts:** inline SVG, no chart library. Hover readout on every chart.
- **Loading:** page and data loading use a skeleton from `Skeletons.tsx`. Waiting on the model
  (simulation, per-dose prediction, SHAP) uses `HeartbeatLoader`, with steps that match what is
  really running. No spinners, and no made-up progress.
- **Copy:** plain language a lab scientist would say out loud. Avoid machine words like
  "ingestion", "telemetry", "vector matrix" or "engine online", and marketing lines.
- **Status panel:** both pages use `StageMonitor`. Digital Lab: your biomarkers, risk model, main
  drivers. Full Pipeline: drug, queue, simulation, biomarkers, risk model. Each stage shows its real
  output once done.
- **Sliding indicators:** position from the index (`SlideIndicator`) or from a measured element (navbar),
  animated with CSS transform. Not Framer `layoutId`, which jumps when content above changes height.
- **Tables & lists:** alternate rows with `bg-[color-mix(in_srgb,var(--foreground)_3.5%,var(--background))]`
  (solid, about 3.5% darker than the page). Sticky first columns use the same solid colours plus a 1px edge.
- **Biomarker change:** ratios are drug ÷ |drug-free|, so "no change" is −1 for negative biomarkers
  (vrest, max_dv). Always use `ratioChange()` from `lib/pipeline`, never `ratio − 1`.
- **Layout:** few controls, no stacked cards. Separate sections with hairlines, not boxes.
  Rows fill the full width on phones (label left, value right, or centered); avoid left-only text
  that leaves the right side empty. Important data (e.g. per-dose results) never hides in an accordion.
