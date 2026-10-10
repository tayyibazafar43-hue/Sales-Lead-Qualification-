from typing import Dict, Any, List, Tuple
from backend.app.ml.model import ml_service, SIZE_WEIGHTS, URGENCY_WEIGHTS, ENGAGEMENT_WEIGHTS, SOURCE_WEIGHTS, INDUSTRY_WEIGHTS

def get_budget_points(budget: float) -> int:
    if budget >= 150000:
        return 35
    elif budget >= 75000:
        return 28
    elif budget >= 30000:
        return 20
    elif budget >= 10000:
        return 12
    return 5

def calculate_rules_score(lead_data: Dict[str, Any]) -> int:
    """
    Transparent, deterministic rules-based baseline.
    Max points = 140 -> Normalized to 0-100.
    """
    budget = float(lead_data.get("budget", 0))
    budget_pts = get_budget_points(budget)

    size = str(lead_data.get("company_size", "11-50 employees"))
    size_pts = int(SIZE_WEIGHTS.get(size, 0.4) * 30)

    urgency = str(lead_data.get("urgency", "Medium-term (3-6 mos)"))
    urgency_pts = int(URGENCY_WEIGHTS.get(urgency, 0.4) * 25)

    eng = str(lead_data.get("engagement", "Low (Newsletter / Single Page)"))
    eng_pts = int(ENGAGEMENT_WEIGHTS.get(eng, 0.2) * 25)

    source = str(lead_data.get("source", "Inbound Demo"))
    source_pts = int(SOURCE_WEIGHTS.get(source, 0.5) * 15)

    industry = str(lead_data.get("industry", "Tech/SaaS"))
    industry_pts = int(INDUSTRY_WEIGHTS.get(industry, 0.6) * 10)

    raw = budget_pts + size_pts + urgency_pts + eng_pts + source_pts + industry_pts
    return max(0, min(100, int(round((raw / 140.0) * 100))))

def score_lead(lead_data: Dict[str, Any]) -> Dict[str, Any]:
    rules_score = calculate_rules_score(lead_data)
    ml_score, raw_confidence = ml_service.predict(lead_data)

    # Ensemble: 65% ML + 35% Rules Baseline
    final_score = int(round((ml_score * 0.65) + (rules_score * 0.35)))

    budget = float(lead_data.get("budget", 0))
    company_size = str(lead_data.get("company_size", ""))
    urgency = str(lead_data.get("urgency", ""))
    engagement = str(lead_data.get("engagement", ""))
    source = str(lead_data.get("source", ""))
    industry = str(lead_data.get("industry", ""))

    # Review triggers
    score_diff = abs(ml_score - rules_score)
    is_borderline = 48 <= final_score <= 53
    is_anomaly = (budget < 15000 and "1000+" in company_size) or (budget >= 150000 and "1-10" in company_size)

    needs_review = False
    review_reason = None
    confidence = raw_confidence

    if score_diff >= 18:
        needs_review = True
        review_reason = f"High model-rules disagreement (Δ = {score_diff} pts: ML {ml_score} vs Rules {rules_score})"
        confidence = min(confidence, 0.68)
    elif is_borderline:
        needs_review = True
        review_reason = f"Borderline score threshold ({final_score}/100) near priority cutoff"
        confidence = min(confidence, 0.69)
    elif is_anomaly:
        needs_review = True
        review_reason = f"Company size vs budget anomaly (${budget:,.0f} for {company_size})"
        confidence = min(confidence, 0.71)

    # Priority determination
    if needs_review and (50 <= final_score <= 78):
        priority = "Needs Review"
    elif final_score >= 75:
        priority = "High Priority"
    elif final_score >= 50:
        priority = "Medium Priority"
    else:
        priority = "Low Priority"

    # Explainability: Positive & Negative Factors
    positive_factors: List[str] = []
    negative_factors: List[str] = []

    if budget >= 75000:
        positive_factors.append(f"Substantial budget allocation (${budget:,.0f})")
    elif budget < 15000:
        negative_factors.append(f"Limited budget tier (${budget:,.0f})")

    if "Immediate" in urgency:
        positive_factors.append("Immediate implementation timeline (< 1 month)")
    elif "Short-term" in urgency:
        positive_factors.append("Near-term target deployment (1-3 months)")
    elif "Exploratory" in urgency:
        negative_factors.append("Long exploratory discovery horizon (6+ months)")

    if "High" in engagement:
        positive_factors.append("High intent signal (Direct demo or webinar engagement)")
    elif "Low" in engagement:
        negative_factors.append("Low initial digital touchpoint depth (Newsletter/single visit)")

    if "1000+" in company_size or "201-1000" in company_size:
        positive_factors.append(f"Enterprise ICP profile ({company_size})")
    elif "1-10" in company_size:
        negative_factors.append(f"Early-stage team size ({company_size})")

    if source in ["Inbound Demo", "Direct Referral"]:
        positive_factors.append(f"High-conversion acquisition channel ({source})")
    elif source == "Cold List / Event":
        negative_factors.append(f"Cold outbound channel origin ({source})")

    if industry in ["Tech/SaaS", "Financial Services", "Healthcare"]:
        positive_factors.append(f"Core target vertical ({industry})")

    if not positive_factors:
        positive_factors.append("Active lead submission in target market segment")
    if not negative_factors:
        negative_factors.append("No critical qualification blockers identified")

    key_factors = positive_factors[:2] + negative_factors[:1]

    # Recommended action
    if priority == "High Priority":
        recommended_action = "Assign to Senior Account Executive for discovery call within 24 hours"
    elif priority == "Medium Priority":
        recommended_action = "Enroll in 14-day SDR nurture sequence with tailored vertical case study"
    elif priority == "Needs Review":
        recommended_action = "Hold automated outreach; manual review by Sales Operations Specialist"
    else:
        recommended_action = "Add to low-touch marketing product newsletter and quarterly check-in"

    return {
        "score": final_score,
        "priority": priority,
        "confidence": confidence,
        "rules_score": rules_score,
        "ml_score": ml_score,
        "key_factors": key_factors,
        "positive_factors": positive_factors,
        "negative_factors": negative_factors,
        "recommended_action": recommended_action,
        "needs_review": needs_review,
        "review_reason": review_reason,
    }
