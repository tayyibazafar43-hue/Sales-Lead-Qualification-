import math
from typing import Dict, Any, Tuple

# Weights for categorical encodings
INDUSTRY_WEIGHTS = {
    'Tech/SaaS': 1.0,
    'Financial Services': 1.0,
    'Healthcare': 0.9,
    'Manufacturing': 0.7,
    'Retail & E-commerce': 0.6,
    'Education': 0.5,
    'Professional Services': 0.7,
    'Other': 0.4,
}

SOURCE_WEIGHTS = {
    'Inbound Demo': 1.0,
    'Direct Referral': 1.0,
    'Organic Search': 0.67,
    'Paid Campaign': 0.53,
    'Outbound SDR': 0.40,
    'Cold List / Event': 0.20,
}

SIZE_WEIGHTS = {
    '1000+ employees': 1.0,
    '201-1000 employees': 0.83,
    '51-200 employees': 0.60,
    '11-50 employees': 0.40,
    '1-10 employees': 0.17,
}

URGENCY_WEIGHTS = {
    'Immediate (< 1 mo)': 1.0,
    'Short-term (1-3 mos)': 0.72,
    'Medium-term (3-6 mos)': 0.40,
    'Exploratory (6+ mos)': 0.12,
}

ENGAGEMENT_WEIGHTS = {
    'High (Demo / Webinar)': 1.0,
    'Medium (3+ Content Downloads)': 0.60,
    'Low (Newsletter / Single Page)': 0.20,
}

class LeadScoringMLModel:
    """
    Simulated Calibrated Gradient Boosting / Logistic Regression Model.
    Employs feature scaling, non-linear interaction terms, and sigmoid conversion.
    """
    def __init__(self, model_version: str = "v1.2-gbm"):
        self.model_version = model_version

    def predict(self, lead_data: Dict[str, Any]) -> Tuple[int, float]:
        budget = float(lead_data.get("budget", 0))
        size = str(lead_data.get("company_size", "11-50 employees"))
        urgency = str(lead_data.get("urgency", "Medium-term (3-6 mos)"))
        engagement = str(lead_data.get("engagement", "Low (Newsletter / Single Page)"))
        source = str(lead_data.get("source", "Inbound Demo"))
        industry = str(lead_data.get("industry", "Tech/SaaS"))

        budget_norm = min(1.0, math.log10(max(1000.0, budget)) / 5.5)
        size_idx = SIZE_WEIGHTS.get(size, 0.4)
        urgency_idx = URGENCY_WEIGHTS.get(urgency, 0.4)
        eng_idx = ENGAGEMENT_WEIGHTS.get(engagement, 0.2)
        source_idx = SOURCE_WEIGHTS.get(source, 0.5)
        ind_idx = INDUSTRY_WEIGHTS.get(industry, 0.6)

        # Interaction terms
        urgency_budget_synergy = urgency_idx * budget_norm * 0.25
        intent_synergy = eng_idx * source_idx * 0.20

        # Logit
        logit = (
            -3.8
            + (budget_norm * 1.8)
            + (urgency_idx * 1.7)
            + (eng_idx * 1.5)
            + (size_idx * 1.2)
            + (source_idx * 0.9)
            + (ind_idx * 0.6)
            + urgency_budget_synergy
            + intent_synergy
        )

        prob = 1.0 / (1.0 + math.exp(-logit))
        ml_score = int(round(prob * 100))
        ml_score = max(0, min(100, ml_score))

        # Confidence metric
        dist = abs(prob - 0.5) * 2.0
        confidence = round(min(0.98, max(0.62, 0.72 + (dist * 0.25))), 2)

        return ml_score, confidence

ml_service = LeadScoringMLModel()
