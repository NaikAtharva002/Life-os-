"""
Unit Tests for Natural Language Task Parser.
"""
from nlp.parser import nlp_parser

def test_parse_task_with_priority_and_category():
    raw = "Submit Distributed Systems assignment tomorrow at 5pm #academics !critical"
    res = nlp_parser.parse(raw)
    
    assert res.priority == "critical"
    assert res.category == "Academics"
    assert "academics" in res.tags
    assert res.due_time == "17:00"
    assert res.due_date is not None
    assert "Distributed Systems assignment" in res.title

def test_parse_task_relative_dates():
    raw_today = "Gym workout today at 10am #fitness !high"
    res_today = nlp_parser.parse(raw_today)
    assert res_today.is_scheduled_today is True
    assert res_today.priority == "high"
    assert res_today.category == "Fitness"
    assert res_today.due_time == "10:00"

def test_parse_task_default_fallback():
    raw = "Read 20 pages of clean architecture book"
    res = nlp_parser.parse(raw)
    assert res.priority == "medium"
    assert res.category == "General"
    assert res.title == "Read 20 pages of clean architecture book"
