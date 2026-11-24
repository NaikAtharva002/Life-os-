"""
Unit Tests for Database Migrations and Repository.
"""
from database.migrator import run_migrations
from database.repository import repo

def test_migrations_execute():
    applied = run_migrations()
    assert isinstance(applied, list)

def test_sync_and_query_tasks():
    test_tasks = [
        {
            "id": "test-task-1",
            "title": "Implement multi-technology engine",
            "description": "Python, TypeScript, SQL, Rust integration",
            "priority": "critical",
            "dueDate": "2026-11-25",
            "isCompleted": False,
            "category": "Engineering"
        }
    ]
    count = repo.sync_tasks(test_tasks)
    assert count == 1
    
    stats = repo.get_database_stats()
    assert stats["tasks"] >= 1

def test_sync_transactions_and_summary_view():
    test_txs = [
        {
            "id": "tx-1",
            "type": "income",
            "amount": 3500.0,
            "category": "Engineering",
            "description": "Consulting milestone",
            "date": "2026-11-01"
        },
        {
            "id": "tx-2",
            "type": "expense",
            "amount": 1000.0,
            "category": "Living",
            "description": "Monthly rent",
            "date": "2026-11-02"
        }
    ]
    repo.sync_transactions(test_txs)
    summary = repo.get_financial_summary()
    assert len(summary) >= 1
    nov_summary = [s for s in summary if s["month"] == "2026-11"][0]
    assert nov_summary["total_inflow"] == 3500.0
    assert nov_summary["total_outflow"] == 1000.0
    assert nov_summary["net_cashflow"] == 2500.0
