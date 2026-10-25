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
│   ├── LabPageHeader.tsx    shared page header (use on every lab page)
│   ├── EngineStatus.tsx     shared "Engine status" panel (steps, progress, status text)
│   ├── EngineVisualizer.tsx Digital Lab stages → EngineStatus
│   ├── LabForm.tsx          Digital Lab input matrix
│   ├── LabResults.tsx       verdict, confidence, conformal set, SHAP (also used by Full Pipeline)
│   ├── Skeletons.tsx        shared skeleton loading (page, engine, result, lab shell)
│   └── LabTutorial.tsx      guided tour (targets the #tour-* ids)
├── pipeline/                Full Pipeline: drug data → heart-cell simulation → risk model
│   ├── page.tsx             state machine (form / running / result), polling, ?job= resume
│   ├── form.ts              form state, validation, request building
│   └── components/          wizard, progress, simulation panel, trace chart
├── logs/                    Activity Logs (history tables, risk donut)
└── profile/
```

API helpers live in `src/lib/` (`api.ts`, `pipeline.ts`, `tierColor.ts`).

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
- **Loading:** always a skeleton from `Skeletons.tsx`. No spinners, no pulsing dots or rings.
- **Copy:** plain language a lab scientist would say out loud. Avoid machine words like
  "ingestion", "telemetry", "vector matrix" or "engine online".
- **Engine status:** both Digital Lab and Full Pipeline show `EngineStatus` under the header,
  with four steps: input, processing, analysis, result.
