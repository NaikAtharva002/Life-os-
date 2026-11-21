"""
Advanced Analytics & Telemetry Engine for LIFE OS.
Synthesizes cross-domain metrics from SQLite views and relational tables.
"""
from typing import Any
from database.repository import repo
from schemas.models import DeepAnalyticsResponse, ProductivityDomainScore

class AnalyticsEngine:
    """Computes composite indices and generates domain-specific interventions."""

    def compute_deep_analytics(self) -> DeepAnalyticsResponse:
        fin_summary = repo.get_financial_summary()
        att_risks = repo.get_attendance_risk()
        habit_stats = repo.get_habit_consistency()
        db_stats = repo.get_database_stats()

        # 1. Financial Velocity Analysis
        latest_month = fin_summary[0] if fin_summary else {
            "month": "Current", "total_inflow": 0, "total_outflow": 0, 
            "net_cashflow": 0, "savings_rate_percentage": 0.0
        }
        savings_rate = latest_month.get("savings_rate_percentage", 0.0)

        # 2. Academic Attendance Risk Analysis
        danger_subjects = [s for s in att_risks if s.get("is_danger") == 1]
        overall_attendance = 100.0
        if att_risks:
            tot_att = sum(s.get("attended_classes", 0) for s in att_risks)
            tot_cls = sum(s.get("total_classes", 0) for s in att_risks)
            overall_attendance = round((tot_att * 100.0 / tot_cls), 1) if tot_cls > 0 else 100.0

        # 3. Habit Consistency Analysis
        avg_habit_adherence = 0.0
        if habit_stats:
            avg_habit_adherence = round(sum(h.get("adherence_percentage", 0.0) for h in habit_stats) / len(habit_stats), 1)

        # 4. Domain Scores
        domain_scores = [
            ProductivityDomainScore(
                domain="Financial Velocity",
                score=min(100, int(savings_rate * 1.5)),
                status="optimal" if savings_rate >= 40 else "warning" if savings_rate >= 20 else "critical",
                detail=f"Net cashflow of {latest_month.get('net_cashflow', 0)} ({savings_rate}% savings rate)"
            ),
            ProductivityDomainScore(
                domain="Academic Health",
                score=min(100, int(overall_attendance)),
                status="critical" if danger_subjects else "warning" if overall_attendance < 80 else "optimal",
                detail=f"{len(danger_subjects)} subjects below 75% threshold" if danger_subjects else "All course attendance compliant"
            ),
            ProductivityDomainScore(
                domain="Habit Adherence",
                score=min(100, int(avg_habit_adherence)),
                status="optimal" if avg_habit_adherence >= 75 else "warning" if avg_habit_adherence >= 50 else "critical",
                detail=f"{avg_habit_adherence}% 30-day consistency across tracked rituals"
            )
        ]

        # 5. Composite Life OS Index
        composite_index = int(
            (domain_scores[0].score * 0.35) + 
            (domain_scores[1].score * 0.35) + 
            (domain_scores[2].score * 0.30)
        )

        # 6. Strategic Interventions
        interventions = []
        if danger_subjects:
            for s in danger_subjects:
                interventions.append({
                    "type": "critical",
                    "domain": "Academics",
                    "title": f"Mandatory Attendance Recovery: {s['code']}",
                    "action": f"Must attend next {s['consecutive_classes_needed']} consecutive lectures to restore 75% threshold."
                })

        if savings_rate < 30 and latest_month.get("total_outflow", 0) > 0:
            interventions.append({
                "type": "warning",
                "domain": "Finance",
                "title": "Cashflow Optimization Recommended",
                "action": f"Current savings velocity is {savings_rate}%. Review discretionary outflow to reach 40% capital accumulation target."
            })

        for h in habit_stats:
            if h.get("streak", 0) == 0 and h.get("adherence_percentage", 0) < 50:
                interventions.append({
                    "type": "intervention",
                    "domain": "Habits",
                    "title": f"Habit Momentum Reset: {h['habit_name']}",
                    "action": f"Streak is currently zero. Complete a minimal 5-minute activation rep today."
                })

        return DeepAnalyticsResponse(
            composite_index=composite_index,
            domain_scores=domain_scores,
            financial_velocity=latest_month,
            attendance_risk=att_risks,
            habit_adherence=habit_stats,
            strategic_interventions=interventions
        )

analytics_engine = AnalyticsEngine()
