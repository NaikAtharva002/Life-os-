"""
Relational Data Repository for LIFE OS.
Implements the Repository Pattern for structured SQLite access.
"""
from typing import Any
from database.connection import db_session

class LifeOSRepository:
    """Encapsulates all SQL transactions and analytical queries."""

    # --- Sync & Upsert Operations ---

    def sync_tasks(self, tasks: list[dict[str, Any]]) -> int:
        with db_session() as conn:
            for t in tasks:
                conn.execute("""
                    INSERT INTO tasks (
                        id, title, description, priority, due_date, due_time, 
                        is_completed, completed_at, is_scheduled_today, is_overdue, category
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        title = excluded.title,
                        description = excluded.description,
                        priority = excluded.priority,
                        due_date = excluded.due_date,
                        due_time = excluded.due_time,
                        is_completed = excluded.is_completed,
                        completed_at = excluded.completed_at,
                        is_scheduled_today = excluded.is_scheduled_today,
                        is_overdue = excluded.is_overdue,
                        category = excluded.category,
                        updated_at = CURRENT_TIMESTAMP;
                """, (
                    t["id"], t["title"], t.get("description"), t.get("priority", "medium"),
                    t.get("dueDate"), t.get("dueTime"), 1 if t.get("isCompleted") else 0,
                    t.get("completedAt"), 1 if t.get("isScheduledToday") else 0,
                    1 if t.get("isOverdue") else 0, t.get("category")
                ))
            return len(tasks)

    def sync_goals(self, goals: list[dict[str, Any]]) -> int:
        with db_session() as conn:
            for g in goals:
                conn.execute("""
                    INSERT INTO goals (
                        id, title, description, category, priority, progress, target_date, is_archived
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        title = excluded.title,
                        description = excluded.description,
                        category = excluded.category,
                        priority = excluded.priority,
                        progress = excluded.progress,
                        target_date = excluded.target_date,
                        is_archived = excluded.is_archived,
                        updated_at = CURRENT_TIMESTAMP;
                """, (
                    g["id"], g["title"], g.get("description"), g.get("category", "General"),
                    g.get("priority", "medium"), g.get("progress", 0),
                    g.get("targetDate"), 1 if g.get("isArchived") else 0
                ))
            return len(goals)

    def sync_transactions(self, transactions: list[dict[str, Any]]) -> int:
        with db_session() as conn:
            for tx in transactions:
                conn.execute("""
                    INSERT INTO finance_transactions (
                        id, type, amount, category, description, date, payment_method, tags
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        type = excluded.type,
                        amount = excluded.amount,
                        category = excluded.category,
                        description = excluded.description,
                        date = excluded.date,
                        payment_method = excluded.payment_method,
                        tags = excluded.tags;
                """, (
                    tx["id"], tx["type"], float(tx["amount"]), tx["category"],
                    tx["description"], tx["date"], tx.get("paymentMethod"),
                    ",".join(tx.get("tags", [])) if isinstance(tx.get("tags"), list) else None
                ))
            return len(transactions)

    def sync_academic_subjects(self, subjects: list[dict[str, Any]]) -> int:
        with db_session() as conn:
            for s in subjects:
                conn.execute("""
                    INSERT INTO academic_subjects (
                        id, code, name, credits, professor, room_or_link,
                        attended_classes, total_classes, target_attendance_percentage, color
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        code = excluded.code,
                        name = excluded.name,
                        credits = excluded.credits,
                        professor = excluded.professor,
                        room_or_link = excluded.room_or_link,
                        attended_classes = excluded.attended_classes,
                        total_classes = excluded.total_classes,
                        target_attendance_percentage = excluded.target_attendance_percentage,
                        color = excluded.color;
                """, (
                    s["id"], s["code"], s["name"], s.get("credits", 3),
                    s.get("professor"), s.get("roomOrLink"), s.get("attendedClasses", 0),
                    s.get("totalClasses", 0), s.get("targetAttendancePercentage", 75.0),
                    s.get("color")
                ))
            return len(subjects)

    def sync_habits(self, habits: list[dict[str, Any]], entries: list[dict[str, Any]]) -> int:
        with db_session() as conn:
            for h in habits:
                conn.execute("""
                    INSERT INTO habits (id, name, frequency, target_days_per_week, category, color, streak, best_streak)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        name = excluded.name,
                        frequency = excluded.frequency,
                        target_days_per_week = excluded.target_days_per_week,
                        category = excluded.category,
                        color = excluded.color,
                        streak = excluded.streak,
                        best_streak = excluded.best_streak;
                """, (
                    h["id"], h["name"], h.get("frequency", "daily"),
                    h.get("targetDaysPerWeek", 7), h.get("category", "General"),
                    h.get("color"), h.get("streak", 0), h.get("bestStreak", 0)
                ))
            for e in entries:
                conn.execute("""
                    INSERT INTO habit_entries (id, habit_id, date, completed)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(habit_id, date) DO UPDATE SET
                        completed = excluded.completed;
                """, (e["id"], e["habitId"], e["date"], 1 if e.get("completed") else 0))
            return len(habits)

    # --- Analytical Queries from SQL Views ---

    def get_financial_summary(self) -> list[dict[str, Any]]:
        with db_session() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM v_monthly_financial_summary;")
            return [dict(row) for row in cursor.fetchall()]

    def get_attendance_risk(self) -> list[dict[str, Any]]:
        with db_session() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM v_academic_attendance_risk;")
            return [dict(row) for row in cursor.fetchall()]

    def get_habit_consistency(self) -> list[dict[str, Any]]:
        with db_session() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM v_habit_consistency_summary;")
            return [dict(row) for row in cursor.fetchall()]

    def get_database_stats(self) -> dict[str, int]:
        with db_session() as conn:
            cursor = conn.cursor()
            tables = [
                "tasks", "goals", "habits", "habit_entries", 
                "finance_transactions", "academic_subjects", 
                "workout_sessions", "evening_reviews"
            ]
            stats = {}
            for t in tables:
                cursor.execute(f"SELECT COUNT(*) as count FROM {t};")
                stats[t] = cursor.fetchone()["count"]
            return stats

repo = LifeOSRepository()
