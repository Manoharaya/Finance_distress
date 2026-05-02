from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Table, Index, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.db import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    normalized_name = Column(String, index=True)
    abn = Column(String, unique=True, index=True)
    acn = Column(String, unique=True, index=True)
    entity_status = Column(String)
    gst_status = Column(String)
    registration_date = Column(DateTime(timezone=True))
    industry = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    directors = relationship("Director", secondary="company_directors", back_populates="companies")
    distress_events = relationship("DistressEvent", back_populates="company")
    scores = relationship("DistressScore", back_populates="company")
    alerts = relationship("Alert", back_populates="company")

class Director(Base):
    __tablename__ = "directors"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    normalized_name = Column(String, index=True)
    reputation_index = Column(Integer, default=100) # 0-100, lower is worse
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    companies = relationship("Company", secondary="company_directors", back_populates="directors")

class CompanyDirector(Base):
    __tablename__ = "company_directors"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    director_id = Column(Integer, ForeignKey("directors.id"), index=True)
    role = Column(String)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True), nullable=True)

class DistressEvent(Base):
    __tablename__ = "distress_events"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    event_type = Column(String, index=True)
    severity = Column(Integer, index=True)
    source = Column(String)
    title = Column(String)
    summary = Column(Text)
    event_date = Column(DateTime(timezone=True), index=True)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String)
    confidence_score = Column(Integer, default=100)
    recommendation = Column(Text)
    metadata_json = Column(JSONB) # Renamed from metadata to avoid conflict with Base.metadata
    raw_data = Column(JSONB)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="distress_events")

class DistressScore(Base):
    __tablename__ = "distress_scores"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    score = Column(Integer)
    risk_level = Column(String)
    recommendation = Column(Text)
    recommended_action = Column(String) # E.g. "Immediate outreach", "Warm contact"
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="scores")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    alert_type = Column(String)
    message = Column(Text)
    priority = Column(String) # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    is_read = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company", back_populates="alerts")

class ScoreHistory(Base):
    """Persistent time-series log of every distress score change."""
    __tablename__ = "score_history"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    score = Column(Integer, nullable=False)
    risk_level = Column(String)
    change_delta = Column(Integer, default=0)       # +/- points vs previous snapshot
    momentum = Column(String, default="STABLE")     # STABLE | RISING | ESCALATING | CRITICAL
    reason = Column(Text)                           # Human-readable trigger
    calculated_at = Column(DateTime(timezone=True), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company")

class IntelligenceFeed(Base):
    __tablename__ = "intelligence_feed"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    feed_type = Column(String)  # LEGAL_ESCALATION, RISK_SPIKE, NETWORK_ASSOCIATION, etc.
    severity = Column(String)   # CRITICAL, HIGH, MEDIUM, LOW
    source = Column(String)
    title = Column(String)
    summary = Column(String)
    metadata_json = Column(JSON, nullable=True)
    event_time = Column(DateTime(timezone=True), default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    company = relationship("Company")

class ScraperRun(Base):
    __tablename__ = "scraper_runs"

    id = Column(Integer, primary_key=True, index=True)
    scraper_name = Column(String, index=True) # e.g. "Federal Court", "ASIC", "PPSR"
    status = Column(String)                   # SUCCESS, FAILED, RUNNING
    started_at = Column(DateTime(timezone=True), default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    records_processed = Column(Integer, default=0)
    records_inserted = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Indexes
Index("idx_company_abn", Company.abn)
Index("idx_company_name", Company.company_name)
Index("idx_distress_event_date", DistressEvent.event_date)
Index("idx_distress_event_type", DistressEvent.event_type)
Index("idx_distress_event_severity", DistressEvent.severity)
Index("idx_score_history_company_date", ScoreHistory.company_id, ScoreHistory.calculated_at)
