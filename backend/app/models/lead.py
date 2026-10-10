from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class LeadModel(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False)
    company_size = Column(String(100), nullable=False)
    budget = Column(Float, nullable=False)
    urgency = Column(String(100), nullable=False)
    engagement = Column(String(100), nullable=False)
    source = Column(String(100), nullable=False)
    score = Column(Integer, nullable=False, index=True)
    priority = Column(String(50), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    recommended_action = Column(Text, nullable=False)
    needs_review = Column(Integer, default=0, index=True)
    positive_factors = Column(Text, nullable=False)  # JSON serialized
    negative_factors = Column(Text, nullable=False)  # JSON serialized
    review_reason = Column(Text, nullable=True)
    status = Column(String(50), default="Active")
    rules_score = Column(Integer, nullable=True)
    ml_score = Column(Integer, nullable=True)
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())

    scoring_results = relationship("ScoringResultModel", back_populates="lead", cascade="all, delete-orphan")
    feedback = relationship("UserFeedbackModel", back_populates="lead", cascade="all, delete-orphan")
    reviews = relationship("ReviewQueueModel", back_populates="lead", cascade="all, delete-orphan")

class ScoringResultModel(Base):
    __tablename__ = "scoring_results"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    priority = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    model_version = Column(String(50), default="v1.2-gbm")
    key_factors = Column(Text, nullable=False)  # JSON serialized
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())

    lead = relationship("LeadModel", back_populates="scoring_results")

class UserFeedbackModel(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    original_score = Column(Integer, nullable=False)
    original_priority = Column(String(50), nullable=False)
    corrected_priority = Column(String(50), nullable=False)
    feedback = Column(Text, nullable=False)
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())

    lead = relationship("LeadModel", back_populates="feedback")

class ReviewQueueModel(Base):
    __tablename__ = "review_queue"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="Pending")
    reviewed_by = Column(String(255), nullable=True)
    reviewed_at = Column(String(50), nullable=True)

    lead = relationship("LeadModel", back_populates="reviews")
