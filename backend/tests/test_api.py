import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.db import Base, engine

client = TestClient(app)

def setup_module():
    Base.metadata.create_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_lead_score_endpoint():
    payload = {
        "name": "Sarah Connor",
        "email": "sarah@cyberdyne.io",
        "company": "Cyberdyne",
        "industry": "Tech/SaaS",
        "company_size": "201-1000 employees",
        "budget": 125000.0,
        "urgency": "Immediate (< 1 mo)",
        "engagement": "High (Demo / Webinar)",
        "source": "Inbound Demo"
    }
    response = client.post("/api/leads/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "priority" in data
    assert "confidence" in data
    assert "key_factors" in data

def test_create_and_get_lead():
    payload = {
        "name": "James Holden",
        "email": "james@rocinante.space",
        "company": "Rocinante Logistics",
        "industry": "Manufacturing",
        "company_size": "11-50 employees",
        "budget": 45000.0,
        "urgency": "Short-term (1-3 mos)",
        "engagement": "Medium (3+ Content Downloads)",
        "source": "Direct Referral"
    }
    create_res = client.post("/api/leads", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    lead_id = created["id"]

    get_res = client.get(f"/api/leads/{lead_id}")
    assert get_res.status_code == 200
    lead_data = get_res.json()
    assert lead_data["name"] == "James Holden"
    assert lead_data["company"] == "Rocinante Logistics"

def test_invalid_lead_creation_validation():
    # Missing required email and negative budget
    invalid_payload = {
        "name": "Invalid User",
        "company": "Missing Email",
        "industry": "Other",
        "company_size": "1-10 employees",
        "budget": -500.0,
        "urgency": "Immediate (< 1 mo)",
        "engagement": "High (Demo / Webinar)",
        "source": "Cold List / Event"
    }
    res = client.post("/api/leads", json=invalid_payload)
    assert res.status_code == 422
