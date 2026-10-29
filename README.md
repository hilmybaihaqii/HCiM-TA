# Cardivex

**Animal-free cardiotoxicity screening on the web.** Cardivex predicts a drug's risk of
*Torsade de Pointes* (TdP), a dangerous heart rhythm, without animal testing. A drug's ion-channel
data goes through a simulated human heart cell, and a machine-learning model sorts the result into
**low**, **intermediate** or **high** risk. SHAP then shows which measurements drove the result.

This repository is the **frontend**: a Next.js app with a public site and a signed-in lab area. The
simulation, the risk model and the database run on a separate backend.

---

## Contents

- [How it works](#how-it-works)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Backend API](#backend-api)
- [Design and data rules](#design-and-data-rules)
- [Deployment](#deployment)
- [Team](#team)

---

## How it works

```
Drug data                Heart-cell simulation           Risk model                 Explanation
(Cmax, hERG, IC50)  ──►  ORd model, without and    ──►  random forest,        ──►  SHAP: which of the
                         with the drug at 1–4× Cmax      400 trees                  11 biomarkers mattered
                         → 11 biomarker ratios           → low / intermediate / high
```

1. **Simulation.** The O'Hara–Rudy (ORd) human ventricular cell model runs once without the drug and
   once with it at each dose (1×, 2×, 3×, 4× Cmax). The drug blocks ion channels according to its
   hERG and IC50/Hill values.
2. **Biomarkers.** Eleven biomarkers are measured from each beat (qNet, dvdtmax, vmax, vrest, APD50,
   APD90, max_dv, camax, carest, CaTD50, CaTD90). Each one becomes a ratio:
   `with drug ÷ |without drug|`. A ratio of 1 means no change (−1 for the negative biomarkers vrest
   and max_dv).
3. **Risk.** The 11 ratios of one dose (or their mean) go to the risk model. The result is the vote
   of 400 decision trees, shown as votes rather than a rounded percentage.
4. **Explanation.** SHAP measures how much each biomarker pushed the model toward or away from the
   predicted risk group.

---

## Features

### Public site

| Route | What it is |
|---|---|
| `/` | Landing page: 3D heart, the problem with animal testing, how the model works (train/test split, random forest walkthrough, SHAP), the three input modes |
| `/aboutus` | Team and research background |
| `/articles`, `/articles/[slug]` | Research papers behind the method (TdP risk with in-silico biomarkers, cardiac ML) |
| `/standards`, `/standards/[slug]` | The standards the approach follows (ICH S7B & E14, ISO/IEC 25002) |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Account and password flows |

### Lab (after sign-in)

| Route | What it does |
|---|---|
| `/lab/pipeline` | **Full Pipeline.** Drug data → heart-cell simulation → risk for the mean and for each dose. Three modes: a CiPA drug by name, a new compound (Cmax, hERG, IC50/Hill), or a CiPA drug with your own re-measured values. Shows a per-dose risk strip, the 11 biomarkers (main drivers and drug effect), action-potential and calcium traces, and the raw values behind every ratio. |
| `/lab` | **Digital Lab.** Enter 11 biomarker ratios from your own simulation and get the risk and its main drivers directly. |
| `/lab/logs` | **Activity Logs.** Overview of past results (counts and a risk bar chart), with searchable and filterable prediction and SHAP history. |
| `/lab/profile` | Profile, password change and account deletion. |
| `/lab/admin` | **Admin only.** Platform overview, account management (search, filter, deactivate, restore) and every sign-in event, prediction and SHAP analysis, searchable by person. |

Other lab behaviour:

- Every prediction is followed by its SHAP analysis automatically, so the prediction and SHAP history
  stay one-to-one.
- While you are signed in, the public site and the sign-in pages send you back to the lab until you
  log out (`src/proxy.ts`).
- A running prediction or simulation survives switching tabs inside the lab. It is cleared only by
  **New prediction** / **New simulation**, or on logout.
- Biomarker ratios are marked red only for a meaningful change: qNet below 0.9, APD50 or APD90 above
  1.1, or any other biomarker that moved more than 10%.
- Layouts work from 375 px phones up, including the Safari toolbar and the notch (`dvh`, safe-area insets).

---

## Tech stack

| Area | Tools |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Motion | Framer Motion, GSAP, Lenis (smooth scroll on the public site) |
| 3D | three.js, React Three Fiber, drei |
| Icons | lucide-react, react-icons |
| Onboarding | react-joyride (guided tour in the Digital Lab) |
| Charts | Hand-written inline SVG, no chart library |

---

## Getting started

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
git clone https://github.com/hilmybaihaqii/HCiM-TA.git
cd HCiM-TA
npm install
npm run dev
```

Open <http://localhost:3000>.

### Environment

Create `.env.local` in the project root:

```bash
# Backend that serves auth, the simulation, the risk model and history. Required:
# the build stops with an error when it is missing.
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com
```

The browser never calls the backend directly. `next.config.ts` rewrites every `/api/*` request to
`NEXT_PUBLIC_API_BASE_URL`, so the session cookie stays on the frontend's own domain.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

> **Note:** on folders synced by OneDrive, the dev server sometimes misses changes to
> `globals.css` or new route files. Restart `npm run dev` if a style or page does not update.

---

## Project structure

```
src/
├── app/                       Routes (App Router)
│   ├── page.tsx               Landing page
│   ├── aboutus/  articles/  standards/
│   ├── login/  register/  forgot-password/  reset-password/
│   └── lab/                   Signed-in area (see src/app/lab/README.md)
│       ├── page.tsx           Digital Lab
│       ├── pipeline/          Full Pipeline: form, job polling, result
│       ├── logs/              Activity Logs: overview, prediction & SHAP history
│       ├── profile/           Account settings
│       ├── admin/             Users and system logs (admin only)
│       └── components/        Lab shell (navbar, footer, form) and the shared risk report
├── components/                Public-site layout, sections, 3D heart, session guard
├── data/                      Static content: articles, standards, team, CiPA compounds
└── lib/                       API helpers and shared logic
    ├── api.ts                 fetch wrapper (same-origin, cookies)
    ├── pipeline.ts            Simulation jobs, drug database, biomarker helpers
    ├── predict.ts             Risk model and SHAP calls with retry
    ├── historyCache.ts        Cache for history requests
    ├── biomarkerHighlight.ts  When a ratio counts as a strong change
    └── tierColor.ts           Colours per risk tier
```

The lab area has its own guide with folder layout, data rules and UI rules:
[`src/app/lab/README.md`](src/app/lab/README.md).

---

## Backend API

Paths as the frontend calls them (all through the `/api` rewrite):

| Group | Endpoints |
|---|---|
| Auth | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/password/forgot`, `/auth/password/reset`, `/auth/password/change/{request,confirm}`, `/auth/account/delete/{request,confirm}` |
| Risk model | `POST /api/predict`, `POST /api/explain` (SHAP, linked to the prediction by `prediction_id`) |
| Simulation | `GET /api/pipeline/drugs`, `POST /api/pipeline/jobs`, `GET /api/pipeline/jobs/{id}` |
| History | `/api/history/summary`, `/api/history/predictions`, `/api/history/explanations` (paged with `limit` / `offset`) |

Lab endpoints reject requests without a signed-in session (401). Access control lives in the backend,
not in hiding these paths: the browser's network tab shows every request a web app makes.

The backend runs on a free hosting plan, so the frontend keeps requests low:

- History responses are cached and refreshed only after a new prediction.
- The drug database is loaded once per tab.
- Jobs are polled every 3 seconds and never again once finished.

---

## Design and data rules

- **Real data only.** Every number on screen comes from the API or is derived from it. There are no
  placeholder figures and no invented advice.
- **One function, one colour.**
  - Red: only buttons that run the model (*Predict risk*, *Run full pipeline*).
  - Black: every other main action.
  - Black outline: second actions.
  - Elsewhere, red means risk or a strong change.
- **Tier colours.** Teal is low, amber is intermediate, crimson is high, everywhere in the app.
- **Plain language.** Labels a lab scientist would say out loud, with no marketing lines.

---

## Deployment

The frontend deploys to [Vercel](https://vercel.com) (`vercel.json`: `npm install`, `npm run build`).
Set `NEXT_PUBLIC_API_BASE_URL` in the project's Environment Variables (Production and Preview). The
build fails without it, and Vercel keeps the last working deployment live.

---

## Team

| Name | Role | Institution |
|---|---|---|
| Hilmy Baihaqi | Frontend Engineering & UI/UX | Telkom University |
| Citra Kusumadewi Sribawono | Machine Learning & Integration | Telkom University |
| Mitchel Mohamad Affandi | Systems & Infrastructure | Telkom University |
| R. Yunendah Nur Fu'adah | Research Supervisor | Telecommunication Eng., Telkom University |
| Ali Ikhsanul Qauli | AI & Robotics Advisor | Robotics and AI Eng., Universitas Airlangga |
| Muhammad Adnan Pramudito | Medical IT Convergence Advisor | Kumoh National Institute of Technology |
| Prof. Ki Moo Lim | Principal Scientific Advisor | Medical IT Convergence Eng., Kumoh National Institute of Technology |
