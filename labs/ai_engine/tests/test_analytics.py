"""
Unit Tests for Analytics Engine and Academic Bunk Calculus.
"""
from analytics.engine import analytics_engine
from database.repository import repo

def test_attendance_bunk_calculus():
    test_subjects = [
        {
            "id": "sub-devops",
            "code": "CS404",
            "name": "Cloud Computing & DevOps",
            "credits": 3,
            "attendedClasses": 14,
            "totalClasses": 20,
            "targetAttendancePercentage": 75.0
        }
    ]
    repo.sync_academic_subjects(test_subjects)
    risks = repo.get_attendance_risk()
    devops = [s for s in risks if s["code"] == "CS404"][0]
    
    assert devops["current_percentage"] == 70.0
    assert devops["is_danger"] == 1
    # Needs: (75 * 20 - 100 * 14) / (100 - 75) = (1500 - 1400) / 25 = 100 / 25 = 4
    assert devops["consecutive_classes_needed"] == 4

def test_deep_analytics_computation():
    res = analytics_engine.compute_deep_analytics()
    assert 0 <= res.composite_index <= 100
    assert len(res.domain_scores) == 3
