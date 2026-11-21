"""
Executive Summarizer and Reflection Synthesis.
Generates tailored daily briefs, priority recommendations, and friction audits.
"""
from schemas.models import DailyBriefResponse
from database.repository import repo

class ExecutiveSummarizer:
    """Produces editorial-grade daily briefs and focus advisories."""

    QUOTES = [
        "Focus on the wild possibilities of today, not the limitations of yesterday.",
        "Discipline is choosing between what you want now and what you want most.",
        "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
        "Your system is your strategy. Optimize the feedback loop.",
    ]

    def generate_daily_brief(self, user_name: str, date_str: str) -> DailyBriefResponse:
        att_risks = repo.get_attendance_risk()
        habit_stats = repo.get_habit_consistency()
        
        urgent: list[str] = []
        for s in att_risks:
            if s.get("is_danger"):
                urgent.append(f"Attend {s['code']} lecture ({s['current_percentage']}% attendance, {s['consecutive_classes_needed']} needed)")

        broken_habits = [h['habit_name'] for h in habit_stats if h.get('streak', 0) == 0]
        if broken_habits:
            urgent.append(f"Reignite habit streak for: {', '.join(broken_habits[:2])}")

        headline = f"Ready for execution, {user_name}."
        focus_recommendation = "Protect a 90-minute uninterrupted deep work block before midday. Complete high-impact goal milestones first."
        
        import random
        quote = random.choice(self.QUOTES)

        return DailyBriefResponse(
            headline=headline,
            focus_score_target=85,
            focus_recommendation=focus_recommendation,
            urgent_interventions=urgent,
            motivational_quote=quote
        )

summarizer = ExecutiveSummarizer()
