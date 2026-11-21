"""
Pydantic Data Contracts and Schemas for LIFE OS AI Engine.
Strictly mirrors TypeScript types to guarantee inter-service safety.
"""
from typing import Optional, Literal
from pydantic import BaseModel, Field

# --- Natural Language Parsing Contracts ---

class NLPTaskParseRequest(BaseModel):
    text: str = Field(..., description="Raw human string (e.g., 'Submit ML report tomorrow at 5pm #academics !high')")

class NLPTaskParseResponse(BaseModel):
    title: str
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    category: str = "General"
    is_scheduled_today: bool = False
    raw_prompt: str
    tags: list[str] = Field(default_factory=list)
    confidence: float = 1.0

# --- Deep Analytics Contracts ---

class ProductivityDomainScore(BaseModel):
    domain: str
    score: int
    status: Literal["optimal", "warning", "critical"]
    detail: str

class DeepAnalyticsResponse(BaseModel):
    composite_index: int
    domain_scores: list[ProductivityDomainScore]
    financial_velocity: dict
    attendance_risk: list[dict]
    habit_adherence: list[dict]
    strategic_interventions: list[dict]

# --- Executive Daily Brief Contracts ---

class DailyBriefRequest(BaseModel):
    user_name: str = "Atharva"
    date_str: str

class DailyBriefResponse(BaseModel):
    headline: str
    focus_score_target: int
    focus_recommendation: str
    urgent_interventions: list[str]
    motivational_quote: str

# --- Client to SQLite Sync Contracts ---

class SyncPayload(BaseModel):
    tasks: list[dict] = Field(default_factory=list)
    goals: list[dict] = Field(default_factory=list)
    habits: list[dict] = Field(default_factory=list)
    habit_entries: list[dict] = Field(default_factory=list)
    transactions: list[dict] = Field(default_factory=list)
    subjects: list[dict] = Field(default_factory=list)

class SyncResponse(BaseModel):
    status: str = "success"
    synced_counts: dict[str, int]
    database_stats: dict[str, int]

# --- Health Contract ---

class HealthResponse(BaseModel):
    status: str = "healthy"
    engine_version: str
    database_connected: bool
    mode: str = "local_first_hybrid"
