"""
SQLite Connection Manager and Transaction Handler.
"""
import sqlite3
from typing import Generator
from contextlib import contextmanager
from config import settings

def get_connection() -> sqlite3.Connection:
    """Creates an optimized SQLite connection with foreign keys and WAL mode."""
    conn = sqlite3.connect(str(settings.DATABASE_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

@contextmanager
def db_session() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for atomic database transactions."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
