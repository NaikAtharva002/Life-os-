"""
Database Migrator for LIFE OS.
Applies versioned SQL migrations incrementally and idempotently.
"""
import re
import sys
from pathlib import Path

# Ensure root package is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.connection import db_session
from config import settings

def run_migrations() -> list[str]:
    """Scans the migrations directory and executes pending SQL files."""
    applied: list[str] = []
    migrations_dir = settings.MIGRATIONS_DIR
    
    if not migrations_dir.exists():
        migrations_dir.mkdir(parents=True, exist_ok=True)
        return applied

    with db_session() as conn:
        # Ensure migration tracking table exists
        conn.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Get currently applied versions
        cursor = conn.cursor()
        cursor.execute("SELECT version FROM schema_migrations ORDER BY version ASC;")
        applied_versions = {row["version"] for row in cursor.fetchall()}
        
        # Find all .sql files matching NNN_name.sql
        sql_files = sorted(migrations_dir.glob("*.sql"))
        
        for sql_file in sql_files:
            match = re.match(r"^(\d+)_", sql_file.name)
            if not match:
                continue
            
            version = int(match.group(1))
            if version not in applied_versions:
                sql_content = sql_file.read_text(encoding="utf-8")
                conn.executescript(sql_content)
                conn.execute(
                    "INSERT INTO schema_migrations (version, name) VALUES (?, ?);",
                    (version, sql_file.name)
                )
                applied.append(sql_file.name)
                
    return applied

if __name__ == "__main__":
    newly_applied = run_migrations()
    if newly_applied:
        print(f"Applied {len(newly_applied)} migrations: {', '.join(newly_applied)}")
    else:
        print("Database schema is fully up-to-date.")
