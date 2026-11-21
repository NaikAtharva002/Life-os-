"""
LIFE OS AI Engine - FastAPI Application Entrypoint.
Provides REST and RPC endpoints for advanced NLP, analytics, and SQLite persistence.
"""
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure root package in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database.migrator import run_migrations
from database.repository import repo
from schemas.models import (
    HealthResponse,
    NLPTaskParseRequest,
    NLPTaskParseResponse,
    DeepAnalyticsResponse,
    DailyBriefRequest,
    DailyBriefResponse,
    SyncPayload,
    SyncResponse,
)
from nlp.parser import nlp_parser
from nlp.summarizer import summarizer
from analytics.engine import analytics_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run database migrations automatically
    try:
        applied = run_migrations()
        if applied:
            print(f"[LIFE OS AI Engine] Applied {len(applied)} database migrations: {', '.join(applied)}")
        else:
            print("[LIFE OS AI Engine] Database schema verified and up-to-date.")
    except Exception as e:
        print(f"[LIFE OS AI Engine] Migration warning: {e}")
    yield
    # Shutdown hook
    print("[LIFE OS AI Engine] Engine shut down gracefully.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Python & SQL Intelligence Engine for LIFE OS",
    lifespan=lifespan,
)

# Enable CORS for local-first web and desktop clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Liveness probe and connection verification."""
    return HealthResponse(
        status="healthy",
        engine_version=settings.VERSION,
        database_connected=settings.DATABASE_PATH.exists(),
        mode="local_first_hybrid"
    )

@app.post("/api/nlp/parse-task", response_model=NLPTaskParseResponse)
def parse_natural_language_task(payload: NLPTaskParseRequest):
    """
    Parses unstructured text into a fully structured task with deadline, priority, and tags.
    Example: 'Finish Distributed Systems lab report on Friday at 5pm #academics !critical'
    """
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")
    return nlp_parser.parse(payload.text)

@app.get("/api/analytics/deep-dive", response_model=DeepAnalyticsResponse)
def get_deep_analytics():
    """
    Runs cross-domain analytical queries on SQLite relational views.
    Returns composite indices, cashflow velocity, attendance risk, and strategic interventions.
    """
    return analytics_engine.compute_deep_analytics()

@app.post("/api/analytics/daily-brief", response_model=DailyBriefResponse)
def get_daily_brief(payload: DailyBriefRequest):
    """Generates an executive briefing and prioritized daily recommendations."""
    return summarizer.generate_daily_brief(payload.user_name, payload.date_str)

@app.post("/api/database/sync", response_model=SyncResponse)
def sync_client_data_to_sqlite(payload: SyncPayload):
    """
    Synchronizes client-side IndexedDB stores into the local SQLite relational database.
    Ensures long-term data sovereignty, multi-device backup, and complex SQL query readiness.
    """
    synced = {
        "tasks": repo.sync_tasks(payload.tasks),
        "goals": repo.sync_goals(payload.goals),
        "transactions": repo.sync_transactions(payload.transactions),
        "subjects": repo.sync_academic_subjects(payload.subjects),
        "habits": repo.sync_habits(payload.habits, payload.habit_entries),
    }
    stats = repo.get_database_stats()
    return SyncResponse(
        status="success",
        synced_counts=synced,
        database_stats=stats
    )

@app.get("/api/database/stats")
def get_database_stats():
    """Returns row counts across all SQLite tables."""
    return repo.get_database_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
