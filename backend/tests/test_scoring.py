import pytest
from backend.app.services.scoring_engine import (
    normalize_academic, normalize_attendance, normalize_lms,
    normalize_placement, normalize_skills_engagement, calculate_student_success_score
)

def test_normalize_academic():
    # Perfect score: CGPA 10.0, Internal 100, 0 backlogs -> 100
    assert normalize_academic(10.0, 100.0, 0) == 100.0
    
    # Half score: CGPA 5.0 (50), Internal 50 (50), 0 backlogs -> 50
    assert normalize_academic(5.0, 50.0, 0) == 50.0
    
    # Backlogs penalty: 2 backlogs -> 50 - 14 = 36
    assert normalize_academic(5.0, 50.0, 2) == 36.0
    
    # Missing data handling
    assert normalize_academic(None, None, 0) is None
    assert normalize_academic(8.0, None, 0) == 80.0

def test_normalize_attendance():
    assert normalize_attendance(85.5) == 85.5
    assert normalize_attendance(None) is None
    # Clamping
    assert normalize_attendance(120.0) == 100.0
    assert normalize_attendance(-5.0) == 0.0

def test_normalize_lms():
    # 100% completion (70 pts) + 5 logins (30 pts) = 100
    assert normalize_lms(100.0, 5.0) == 100.0
    assert normalize_lms(50.0, 2.5) == 50.0
    assert normalize_lms(None, None) is None

def test_normalize_placement():
    # Aptitude 80 (28) + Coding 80 (32) + Mock 80 (20) = 80
    assert normalize_placement(80.0, 80.0, 80.0) == 80.0
    assert normalize_placement(None, None, None) is None

def test_calculate_student_success_score_complete():
    student = {
        "cgpa": 8.5,
        "internal_marks": 85.0,
        "backlog_count": 0,
        "overall_attendance": 90.0,
        "assignment_completion_rate": 90.0,
        "lms_login_frequency": 5.0,
        "aptitude_score": 85.0,
        "coding_score": 85.0,
        "mock_interview_score": 85.0,
        "hackathon_count": 2,
        "certification_count": 2,
        "club_participation_count": 1,
        "soft_skills_score": 90.0
    }
    res = calculate_student_success_score(student)
    assert res["success_score"] is not None
    assert 80.0 <= res["success_score"] <= 95.0
    assert not res["is_provisional"]
    assert len(res["missing_components"]) == 0

def test_calculate_student_success_score_provisional():
    # Missing placement data should NOT be 0; it should be flagged as provisional and re-normalized
    student = {
        "cgpa": 9.0,
        "internal_marks": 90.0,
        "backlog_count": 0,
        "overall_attendance": 95.0,
        "assignment_completion_rate": 90.0,
        "lms_login_frequency": 5.0,
        "aptitude_score": None,
        "coding_score": None,
        "mock_interview_score": None,
        "hackathon_count": 1,
        "certification_count": 1,
        "club_participation_count": 1
    }
    res = calculate_student_success_score(student)
    assert res["is_provisional"] is True
    assert "placement" in res["missing_components"]
    assert res["success_score"] is not None
    # Ensure missing placement didn't drag high academic student to low score!
    assert res["success_score"] >= 75.0
