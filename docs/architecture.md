# LeadMatrix Architecture & Forward Deployed Engineering Guide

## 1. System Overview & Problem Statement

**LeadMatrix** is an enterprise sales lead qualification engine designed to solve the high-volume inbound triage bottleneck faced by B2B sales teams. In modern enterprise revenue operations, SDRs and Account Executives spend an estimated 25–40% of their working hours manually qualifying leads, cross-referencing firmographic databases, and deciding which prospects to prioritize.

LeadMatrix automates lead triage through an explainable, dual-engine ML and deterministic rules ensemble, backed by a human-in-the-loop review queue and active distribution drift monitoring.

---

## 2. Architectural Components

```
                                  [Inbound Leads / CSV Bulk Upload / Webhooks]
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (React 19 / TypeScript)                              │
│  • Full-Width Emerald Header with Operational Status Indicators                                 │
│  • Horizontal Top Navigation (Zero Left Sidebar)                                                │
│  • Views: Dashboard, Leads Directory, Add Lead, Bulk CSV Ingestion, Analytics, Human Review, Drift│
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │ REST API (JSON / FormData)
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               FASTAPI & EXPRESS APPLICATION ENGINE                             │
│  • Input Validation (Pydantic / Type Guard Enforcers)                                           │
│  • Health Checks & API Middleware (CORS, Rate Limiting, Request Telemetry)                      │
│                                                                                                 │
│  ┌─────────────────────────────┐            ┌─────────────────────────────┐                     │
│  │   Rules-Based Baseline      │            │   ML Scoring Engine         │                     │
│  │   • Deterministic weights   │            │   • Logarithmic budget      │                     │
│  │   • 0-140 raw scale         │            │   • Non-linear synergies    │                     │
│  │   • Instant auditability    │            │   • Calibrated sigmoid      │                     │
│  └──────────────┬──────────────┘            └──────────────┬──────────────┘                     │
│                 │                                          │                                    │
│                 └─────────────────┬────────────────────────┘                                    │
│                                   ▼                                                             │
│                    [Ensemble & Disagreement Engine]                                             │
│                                   │                                                             │
│                    ┌──────────────┴──────────────┐                                              │
│                    ▼                             ▼                                              │
│            [High Confidence]              [Review Triggered]                                    │
│         Assign Priority (High/Med/Low)   Enqueue in Human Review                                │
│         Generate Explainability Factors  Flag Disagreement Reason                              │
│         Produce Next Recommended Action                                                         │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PERSISTENCE LAYER (SQLite)                                    │
│  • `leads`: Core entity records, scores, priorities, confidence, factors, and review states     │
│  • `scoring_results`: Historical audit log of every scoring execution & model version          │
│  • `user_feedback`: Sales operator overrides, annotations, and training ground truth labels    │
│  • `review_queue`: Pending review cases with trigger rationale and audit trail                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Lead Qualification Engine & Math

### 3.1 Rules-Based Baseline
The rules-based baseline provides a deterministic, transparent scoring baseline built on validated sales heuristics:
$$\text{Raw Score} = w_{\text{budget}} + w_{\text{size}} + w_{\text{urgency}} + w_{\text{engagement}} + w_{\text{source}} + w_{\text{industry}}$$
Normalized to a 0–100 scale:
$$\text{Rules Score} = \min\left(100, \max\left(0, \text{round}\left(\frac{\text{Raw Score}}{140} \times 100\right)\right)\right)$$

### 3.2 Machine Learning Model (Gradient Boosting / Calibrated Logistic)
The ML model accounts for non-linear feature interactions:
- **Urgency × Budget Synergy**: High urgency combined with enterprise budget yields disproportionately higher close rates.
- **Intent Synergy**: Direct Inbound demo requests combined with high digital engagement.

$$\text{Logit} = \beta_0 + \sum_{i=1}^n \beta_i x_i + \beta_{\text{synergy}} (x_{\text{urgency}} \cdot x_{\text{budget}}) + \beta_{\text{intent}} (x_{\text{eng}} \cdot x_{\text{source}})$$
$$P(\text{Qualified}) = \frac{1}{1 + e^{-\text{Logit}}}$$
$$\text{ML Score} = \text{round}(P(\text{Qualified}) \times 100)$$

### 3.3 Confidence & Review Routing
Confidence is estimated based on distance from the 50% decision boundary and feature completeness:
$$\text{Confidence} = 0.72 + 0.25 \times 2 \cdot |P - 0.5|$$

A lead enters the **Human Review Queue** when:
1. Model vs. Rules Disagreement: $|\text{ML Score} - \text{Rules Score}| \ge 18$ points.
2. Borderline Score: $48 \le \text{Score} \le 53$.
3. Data Anomaly: Enterprise headcount ($>1,000$) with sub-$15k budget, or solo team ($1-10$) claiming $> \$150k$ budget.

---

## 4. Drift Monitoring & Population Stability Index (PSI)

To prevent silent model degradation, LeadMatrix computes the Population Stability Index (PSI) across key dimensions:
$$\text{PSI} = \sum_{k=1}^K (A_k - E_k) \times \ln\left(\frac{A_k}{E_k}\right)$$
Where:
- $E_k$ = Expected (baseline training) distribution proportion for bucket $k$
- $A_k$ = Actual (monitored live cohort) distribution proportion for bucket $k$

**Interpretation**:
- $\text{PSI} < 0.10$: **Normal** (No significant population shift)
- $0.10 \le \text{PSI} < 0.25$: **Warning** (Moderate shift; review channel health)
- $\text{PSI} \ge 0.25$: **Drift Detected** (Significant shift; model recalibration recommended)

---

## 5. Security & Production Readiness

- **Strict Validation**: All payloads validated against Pydantic models (in Python) and TypeScript interfaces with bounds checking.
- **No Hardcoded Secrets**: Configuration driven by environment variables (`DATABASE_URL`, `PORT`).
- **File Upload Safeguards**: CSV uploads checked for size limits, valid MIME types, required headers, and sanitized string fields.
- **Auditability**: Complete audit trail preserved in `scoring_results` and `user_feedback` for compliance and model re-training.
