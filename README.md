# LeadMatrix: Sales Lead Qualification Engine

> **A Production-Grade Sales Lead Qualification & Triage Platform for Enterprise Revenue Teams.**  
> Portfolio Project for **Forward Deployed Engineer (FDE) / AI Engineer / Full-Stack Engineer** roles.

---

## 1. Executive Summary & Business Problem

In high-growth B2B enterprise SaaS organizations, incoming lead volume often overwhelms Sales Development Representative (SDR) and Account Executive (AE) teams. Inbound leads arrive from diverse channels—demo requests, webinars, content downloads, paid ads, referrals, and outbound campaigns.

Without automated, explainable qualification:
- **High-intent enterprise opportunities languish** in unread inboxes for days, causing deal slip and lost win rates.
- **SDRs spend up to 40% of their working hours** manually sorting firmographics, reviewing budgets, and debating priority.
- **Black-box AI models generate low sales adoption** because reps cannot see *why* a prospect was marked low or high priority.

**LeadMatrix** solves this operational bottleneck by delivering:
1. **Explainable Dual-Engine Scoring**: An ensemble combining a deterministic, transparent rules baseline with a calibrated Gradient Boosting / Logistic ML model.
2. **Actionable Triage & Prescriptions**: Clear priority classification (`High Priority`, `Medium Priority`, `Low Priority`, `Needs Review`) paired with explicit recommended next actions (e.g., *"Assign to Senior AE for discovery call within 24 hours"*).
3. **Human-in-the-Loop Review Queue**: Automatic routing of borderline scores ($48-53$), data anomalies, or model-rules disagreements ($\Delta \ge 18$ pts) for human review and feedback capture.
4. **Active Drift Monitoring**: Real-time Population Stability Index (PSI) tracking across acquisition channels, industry verticals, and budget tiers to alert sales ops before model degradation occurs.
5. **Simulated Portfolio Metrics**: Over 100+ synthetic leads pre-seeded, demonstrating real data persistence in SQLite, bulk CSV parsing, and sub-15ms inference latency.

---

## 2. Core Architecture & Tech Stack

```
LeadMatrix Application Architecture
┌────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js / React 19 + TypeScript + Tailwind) │
│  • Full-width Green Header                             │
│  • White Horizontal Top Navigation (Zero Left Sidebar) │
│  • Dashboard, Leads Directory, Add Lead, Bulk CSV,     │
│    Analytics, Review Queue, Drift Monitor, Settings    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / JSON
┌──────────────────────────▼─────────────────────────────┐
│  BACKEND (FastAPI / Express + SQLite)                  │
│  • Pydantic & TypeScript request validation            │
│  • Rules-based scoring baseline (0-140 -> 0-100)       │
│  • ML scoring engine (calibrated sigmoid + synergies)  │
│  • Human review queue router & feedback logger         │
│  • Drift PSI calculation service                       │
└──────────────────────────┬─────────────────────────────┘
                           │ SQL
┌──────────────────────────▼─────────────────────────────┐
│  DATABASE (SQLite: leadmatrix.db)                      │
│  • leads, scoring_results, user_feedback, review_queue │
└────────────────────────────────────────────────────────┘
```

### Technology Breakdown
- **Frontend**: Modern React 19, TypeScript, Tailwind CSS, Lucide Icons, Tabular Numerals.
- **Backend API**: Python FastAPI (available in `backend/app/main.py`) and Full-Stack Express Engine (`server.ts`) running unified on port 3000.
- **Machine Learning**: scikit-learn (`GradientBoostingClassifier`, `LogisticRegression`), NumPy, Pandas.
- **Database**: SQLite (`leadmatrix.db`) with tables: `leads`, `scoring_results`, `user_feedback`, `review_queue`.
- **Testing**: pytest suite in `backend/tests/test_scoring.py` and `backend/tests/test_api.py`.

---

## 3. Key Features

| Feature | Description | Business Benefit |
| :--- | :--- | :--- |
| **Operational Dashboard** | 7 enterprise KPI cards, priority triage feed, interactive charts (priority tier, score distribution, industries, channels). | Immediate situational awareness for Sales Leadership. |
| **Leads Directory** | Filterable, searchable, and sortable table with detailed explainability drawer. | Reps can find their top target accounts in seconds. |
| **Instant Add Lead** | Real-time validation and scoring with positive/negative driver breakdown. | Rapid manual qualification for phone and event inquiries. |
| **Bulk CSV Ingestion** | Drag-and-drop CSV upload, schema validation, data preview, bulk scoring, and scored CSV export. | Frictionless batch ingestion from trade shows and webinars. |
| **Human Review Queue** | Dedicated workflow for borderline scores, disagreements, and budget-size anomalies. | Human-in-the-loop auditability and continuous model improvement. |
| **Analytics & Models** | Rules vs. ML comparison, model accuracy ($89.4\%$), Precision@K ($92.3\%$), and feature importance. | Full visibility into model governance and efficacy. |
| **Drift Monitor** | Automated PSI tracking against baseline training distribution across channels, verticals, and budgets. | Early warning indicator for shifting pipeline economics. |

---

## 4. Color System & UI Design Contract

As specified in the design guidelines:
- **No Left Sidebar**: The entire application uses a modern, responsive horizontal top navigation bar.
- **Full-Width Green Header**: Deep professional green branding (`#14532D` / `#166534` / `#15803D`) with immediate visibility.
- **Color System**: Green + White enterprise palette. Professional green for primary actions, clean off-white / light slate canvas, subtle light gray borders (`#E5E7EB`), and semantic accents (green for High Priority, orange for Medium / Warning, red for Low / Alerts).
- **Anti-Slop Discipline**: Zero gratuitous pills, zero code-comment headers, single-elevation cards with clean hairline borders, and strict tabular numerals (`font-mono tabular-nums`).

---

## 5. Local Setup & Running the Application

### Prerequisites
- Node.js 20+ (with npm)
- Python 3.10+ (optional, for running standalone Python FastAPI & pytest)

### Quick Start (Web Application & Server)
```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack LeadMatrix application (Port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The database will automatically initialize and seed 100+ synthetic leads.

### Running Backend with Python FastAPI (Optional)
```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install requirements
pip install -r backend/requirements.txt

# 3. Start FastAPI server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Backend Tests
```bash
pytest backend/tests/ -v
```

---

## 6. Environment Variables (`.env.example`)

```bash
# Port configuration
PORT=3000

# SQLite Database Location
DATABASE_URL="sqlite:///./leadmatrix.db"

# Public API URL (for frontend communication)
VITE_API_URL=""
```

---

## 7. API Reference Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health and SQLite connection status |
| `GET` | `/api/leads` | Search, filter, sort, and paginate qualified leads |
| `GET` | `/api/leads/{id}` | Retrieve individual lead with explainability and scoring history |
| `POST` | `/api/leads` | Create, score, and persist a new sales lead |
| `PUT` | `/api/leads/{id}` | Update lead parameters and recalculate scoring |
| `DELETE` | `/api/leads/{id}` | Remove lead from system |
| `POST` | `/api/leads/score` | Compute qualification score and drivers in real time (dry-run) |
| `POST` | `/api/leads/bulk-score` | Ingest and score batch leads from CSV upload |
| `GET` | `/api/analytics` | Retrieve aggregate pipeline statistics and model metrics |
| `GET` | `/api/reviews` | List all cases currently in the Human Review Queue |
| `POST` | `/api/reviews/{id}/approve` | Approve lead qualification and discharge from review queue |
| `POST` | `/api/reviews/{id}/feedback` | Override priority and log human operator reasoning |
| `GET` | `/api/drift` | Monitor feature distribution shifts and Population Stability Index |
| `POST` | `/api/reset-demo` | Re-seed clean synthetic portfolio demo dataset |

---

## 8. Disclaimer on Simulated Data

> **Notice**: All conversion rates, model accuracy metrics ($89.4\%$), revenue figures, and hours saved metrics displayed in this application are **Simulated Portfolio Metrics** calculated from synthetic benchmark data. They demonstrate architectural capabilities and should not be construed as actual historical customer outcomes.
