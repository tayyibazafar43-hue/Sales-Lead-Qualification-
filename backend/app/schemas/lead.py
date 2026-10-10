from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class LeadBase(BaseModel):
    name: str = Field(..., min_length=1, description="Lead full name")
    email: str = Field(..., description="Lead business email")
    company: str = Field(..., min_length=1, description="Company name")
    industry: str = Field(..., description="Industry vertical")
    company_size: str = Field(..., description="Company employee count tier")
    budget: float = Field(..., ge=0, description="Annual project budget in USD")
    urgency: str = Field(..., description="Purchase / implementation urgency")
    engagement: str = Field(..., description="Digital engagement depth")
    source: str = Field(..., description="Acquisition channel")

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    budget: Optional[float] = None
    urgency: Optional[str] = None
    engagement: Optional[str] = None
    source: Optional[str] = None

class ScoringResultResponse(BaseModel):
    score: int
    priority: str
    confidence: float
    rules_score: int
    ml_score: int
    key_factors: List[str]
    positive_factors: List[str]
    negative_factors: List[str]
    recommended_action: str
    needs_review: bool
    review_reason: Optional[str] = None
    inference_time_ms: Optional[float] = None

class LeadResponse(LeadBase):
    id: int
    score: int
    priority: str
    confidence: float
    recommended_action: str
    needs_review: bool
    positive_factors: List[str]
    negative_factors: List[str]
    review_reason: Optional[str] = None
    status: str
    rules_score: Optional[int] = None
    ml_score: Optional[int] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    corrected_priority: str = Field(..., description="Human-overridden priority tier")
    feedback: str = Field(..., description="Sales operator qualification notes")
    reviewed_by: Optional[str] = "Sales Ops Lead"

class ReviewQueueItemResponse(BaseModel):
    id: int
    lead_id: int
    reason: str
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    lead: LeadResponse

class BulkScoreRequest(BaseModel):
    leads: List[LeadCreate]

class DriftMetricResponse(BaseModel):
    feature: str
    status: str
    psi_score: float
    baseline_distribution: Dict[str, float]
    current_distribution: Dict[str, float]
    explanation: str

class AnalyticsResponse(BaseModel):
    total_leads: int
    high_priority_count: int
    high_priority_pct: float
    medium_priority_count: int
    low_priority_count: int
    needs_review_count: int
    avg_score: float
    hours_saved: int
    model_accuracy: float
    precision: float
    recall: float
    precision_at_k: float
    avg_inference_time_ms: float
    human_override_rate: float
    pipeline_completion_rate: float
    priority_distribution: Dict[str, int]
    score_buckets: Dict[str, int]
    industry_distribution: Dict[str, int]
    source_distribution: Dict[str, int]
