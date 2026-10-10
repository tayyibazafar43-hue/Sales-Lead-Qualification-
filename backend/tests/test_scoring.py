import pytest
from backend.app.services.scoring import calculate_rules_score, score_lead

def test_high_priority_lead_scoring():
    lead = {
        "name": "Enterprise Buyer",
        "email": "buyer@megacorp.com",
        "company": "MegaCorp Inc",
        "industry": "Tech/SaaS",
        "company_size": "1000+ employees",
        "budget": 250000.0,
        "urgency": "Immediate (< 1 mo)",
        "engagement": "High (Demo / Webinar)",
        "source": "Inbound Demo"
    }
    result = score_lead(lead)
    assert result["score"] >= 80
    assert result["priority"] == "High Priority"
    assert result["confidence"] >= 0.85
    assert len(result["positive_factors"]) >= 2
    assert "Immediate" in result["positive_factors"][0] or "budget" in result["positive_factors"][0].lower()

def test_low_priority_lead_scoring():
    lead = {
        "name": "Student Project",
        "email": "student@school.edu",
        "company": "Solo Project",
        "industry": "Education",
        "company_size": "1-10 employees",
        "budget": 2000.0,
        "urgency": "Exploratory (6+ mos)",
        "engagement": "Low (Newsletter / Single Page)",
        "source": "Cold List / Event"
    }
    result = score_lead(lead)
    assert result["score"] <= 40
    assert result["priority"] == "Low Priority"
    assert len(result["negative_factors"]) >= 1

def test_rules_baseline_deterministic():
    lead = {
        "name": "Test",
        "company": "Test Co",
        "industry": "Healthcare",
        "company_size": "51-200 employees",
        "budget": 50000.0,
        "urgency": "Short-term (1-3 mos)",
        "engagement": "Medium (3+ Content Downloads)",
        "source": "Organic Search"
    }
    s1 = calculate_rules_score(lead)
    s2 = calculate_rules_score(lead)
    assert s1 == s2
    assert 0 <= s1 <= 100

def test_review_trigger_on_budget_size_mismatch():
    # Giant company with tiny budget
    lead = {
        "name": "Anomalous Lead",
        "email": "anomaly@giant.com",
        "company": "Giant Global Corp",
        "industry": "Manufacturing",
        "company_size": "1000+ employees",
        "budget": 5000.0,
        "urgency": "Immediate (< 1 mo)",
        "engagement": "High (Demo / Webinar)",
        "source": "Inbound Demo"
    }
    result = score_lead(lead)
    assert result["needs_review"] is True
    assert "anomaly" in result["review_reason"].lower() or "disagreement" in result["review_reason"].lower()
