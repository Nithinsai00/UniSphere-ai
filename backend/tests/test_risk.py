import pytest
from backend.app.services.risk_engine import assess_student_risks

def test_assess_low_risk_student():
    student = {
        "cgpa": 8.8,
        "internal_marks": 88.0,
        "backlog_count": 0,
        "overall_attendance": 92.0,
        "assignment_completion_rate": 95.0,
        "coding_score": 85.0,
        "aptitude_score": 82.0,
        "mock_interview_score": 80.0
    }
    res = assess_student_risks(student)
    assert res["academic_risk"] == "Low"
    assert res["placement_risk"] == "Low"
    assert res["combined_risk"] == "Low"
    assert len(res["risk_reasons"]) == 0

def test_assess_high_academic_risk():
    student = {
        "cgpa": 5.2,
        "internal_marks": 45.0,
        "backlog_count": 2,
        "overall_attendance": 62.0, # < 65% critical
        "assignment_completion_rate": 40.0,
        "coding_score": 75.0,
        "aptitude_score": 75.0,
        "mock_interview_score": 70.0
    }
    res = assess_student_risks(student)
    assert res["academic_risk"] == "High"
    assert len(res["risk_reasons"]) >= 3
    # Check that attendance indicator was triggered and explained
    att_reason = next((r for r in res["risk_reasons"] if r["indicator"] == "Attendance"), None)
    assert att_reason is not None
    assert "62.0%" in att_reason["value"]
    assert att_reason["severity"] == "high"

def test_assess_high_placement_risk():
    student = {
        "cgpa": 8.5,
        "internal_marks": 85.0,
        "backlog_count": 0,
        "overall_attendance": 90.0,
        "assignment_completion_rate": 90.0,
        "coding_score": 38.0, # severely low
        "aptitude_score": 42.0, # low
        "mock_interview_score": 45.0
    }
    res = assess_student_risks(student)
    assert res["academic_risk"] == "Low"
    assert res["placement_risk"] == "High"
    assert res["combined_risk"] == "High"
    
    coding_reason = next((r for r in res["risk_reasons"] if r["indicator"] == "Coding Assessment"), None)
    assert coding_reason is not None
    assert "38.0/100" in coding_reason["value"]

def test_unassessed_placement_insufficient_data():
    student = {
        "cgpa": 8.0,
        "internal_marks": 80.0,
        "backlog_count": 0,
        "overall_attendance": 85.0,
        "assignment_completion_rate": 80.0,
        "coding_score": None,
        "aptitude_score": None,
        "mock_interview_score": None,
        "current_year": 2
    }
    res = assess_student_risks(student)
    assert res["academic_risk"] == "Low"
    assert res["placement_risk"] == "Insufficient data"
