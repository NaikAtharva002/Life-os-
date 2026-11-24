-- Migration 002: Advanced SQL Analytical Views
-- High-Performance Relational Reporting for LIFE OS

-- 1. Monthly Financial Rollup & Cashflow View
CREATE VIEW IF NOT EXISTS v_monthly_financial_summary AS
SELECT 
    strftime('%Y-%m', date) AS month,
    ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 2) AS total_inflow,
    ROUND(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2) AS total_outflow,
    ROUND(
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2
    ) AS net_cashflow,
    ROUND(
        CASE 
            WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) > 0 THEN
                ((SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - 
                  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) / 
                 SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)) * 100.0
            ELSE 0.0
        END, 1
    ) AS savings_rate_percentage
FROM finance_transactions
GROUP BY strftime('%Y-%m', date)
ORDER BY month DESC;

-- 2. Academic Attendance Risk & Bunk Calculus View
CREATE VIEW IF NOT EXISTS v_academic_attendance_risk AS
SELECT 
    id,
    code,
    name,
    credits,
    attended_classes,
    total_classes,
    target_attendance_percentage,
    ROUND(
        CASE 
            WHEN total_classes > 0 THEN (attended_classes * 100.0 / total_classes)
            ELSE 100.0 
        END, 1
    ) AS current_percentage,
    CASE 
        WHEN total_classes > 0 AND (attended_classes * 100.0 / total_classes) < target_attendance_percentage THEN 1
        ELSE 0
    END AS is_danger,
    -- Safe to skip calculation: (attended * 100 / target) - total
    MAX(0, CAST(((attended_classes * 100.0 / target_attendance_percentage) - total_classes) AS INTEGER)) AS safe_skips_remaining,
    -- Must attend consecutive classes to recover: ceil((target * total - 100 * attended) / (100 - target))
    CASE 
        WHEN total_classes > 0 AND (attended_classes * 100.0 / total_classes) < target_attendance_percentage THEN
            MAX(0, CAST(
                (((target_attendance_percentage * total_classes) - (100.0 * attended_classes)) / 
                 (100.0 - target_attendance_percentage) + 0.999) 
            AS INTEGER))
        ELSE 0
    END AS consecutive_classes_needed
FROM academic_subjects;

-- 3. Habit Consistency & 30-Day Adherence View
CREATE VIEW IF NOT EXISTS v_habit_consistency_summary AS
SELECT 
    h.id AS habit_id,
    h.name AS habit_name,
    h.category,
    h.streak,
    h.best_streak,
    COUNT(he.id) AS completions_last_30_days,
    ROUND((COUNT(he.id) * 100.0 / 30.0), 1) AS adherence_percentage
FROM habits h
LEFT JOIN habit_entries he ON h.id = he.habit_id 
    AND he.completed = 1 
    AND he.date >= date('now', '-30 days')
GROUP BY h.id, h.name, h.category, h.streak, h.best_streak;
