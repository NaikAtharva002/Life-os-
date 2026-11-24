-- Migration 001: Initial Core Relational Schema
-- Storage: SQLite 3 for LIFE OS Tier-2 Structured Storage

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Core Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date TEXT,
    due_time TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    is_scheduled_today INTEGER NOT NULL DEFAULT 0,
    is_overdue INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
);

-- Long-Term Goals & Milestones
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    target_date TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goal_milestones (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    due_date TEXT
);

-- Habits & Rituals
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_days_per_week INTEGER NOT NULL DEFAULT 7,
    category TEXT NOT NULL,
    color TEXT,
    streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS habit_entries (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 1,
    UNIQUE(habit_id, date)
);

-- Financial Operations
CREATE TABLE IF NOT EXISTS finance_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount REAL NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    payment_method TEXT,
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finance_budgets (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    monthly_limit REAL NOT NULL CHECK (monthly_limit > 0),
    month TEXT NOT NULL, -- Format: YYYY-MM
    UNIQUE(category, month)
);

CREATE TABLE IF NOT EXISTS savings_goals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target_amount REAL NOT NULL CHECK (target_amount > 0),
    current_amount REAL NOT NULL DEFAULT 0,
    target_date TEXT,
    category TEXT
);

-- Academic Command
CREATE TABLE IF NOT EXISTS academic_subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3,
    professor TEXT,
    room_or_link TEXT,
    attended_classes INTEGER NOT NULL DEFAULT 0,
    total_classes INTEGER NOT NULL DEFAULT 0,
    target_attendance_percentage REAL NOT NULL DEFAULT 75.0,
    color TEXT
);

CREATE TABLE IF NOT EXISTS academic_assignments (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES academic_subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    due_time TEXT,
    weightage_percentage REAL DEFAULT 10.0,
    is_submitted INTEGER NOT NULL DEFAULT 0,
    score REAL
);

-- Fitness & Physical Conditioning
CREATE TABLE IF NOT EXISTS workout_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    split_type TEXT NOT NULL,
    date TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_volume_kg REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS body_metrics (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    weight_kg REAL NOT NULL,
    body_fat_percentage REAL,
    waist_cm REAL,
    chest_cm REAL,
    arms_cm REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evening Reviews
CREATE TABLE IF NOT EXISTS evening_reviews (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    tasks_completed_count INTEGER DEFAULT 0,
    tasks_pending_count INTEGER DEFAULT 0,
    habits_completed_count INTEGER DEFAULT 0,
    productivity_score INTEGER DEFAULT 0,
    reflection TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    tomorrow_priorities TEXT, -- JSON array of strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
