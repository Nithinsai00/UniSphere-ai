import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_admin_login_success():
    res = client.post("/api/auth/login", json={
        "identifier": "admin",
        "password": "Hope@50",
        "role": "admin"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"

def test_admin_login_invalid_password():
    res = client.post("/api/auth/login", json={
        "identifier": "admin",
        "password": "WrongPassword123",
        "role": "admin"
    })
    assert res.status_code == 401

def test_faculty_login():
    res = client.post("/api/auth/login", json={
        "identifier": "FAC001",
        "password": "Faculty@2026",
        "role": "faculty"
    })
    assert res.status_code == 200
    assert res.json()["role"] == "faculty"

def test_student_login():
    res = client.post("/api/auth/login", json={
        "identifier": "STU1001",
        "password": "Student@2026",
        "role": "student"
    })
    assert res.status_code == 200
    assert res.json()["role"] == "student"

def test_dashboard_stats_authenticated():
    # Login as admin
    login_res = client.post("/api/auth/login", json={
        "identifier": "admin",
        "password": "Hope@50",
        "role": "admin"
    })
    token = login_res.json()["access_token"]
    
    res = client.get(
        "/api/admin/dashboard-stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_students"] >= 300
    assert data["total_faculty"] >= 5
    assert data["average_success_score"] > 0
    assert data["academic_risk_count"] >= 0

def test_csv_parser_validation():
    from backend.app.services.data_importer import parse_and_validate_csv
    
    valid_csv = "student_id,full_name,cgpa\nSTU9991,Test Student,8.5\nSTU9992,Another Student,7.2"
    res = parse_and_validate_csv(valid_csv, "students")
    assert res["can_commit"] is True
    assert res["total_rows"] == 2
    assert len(res["validation_errors"]) == 0
    
    # Invalid CGPA (15.0) and missing student_id
    invalid_csv = "student_id,full_name,cgpa\nSTU9991,Test Student,15.5\n,Missing ID,7.2"
    res2 = parse_and_validate_csv(invalid_csv, "students")
    assert res2["can_commit"] is False
    assert len(res2["validation_errors"]) == 2

def test_campus_assistant_query():
    login_res = client.post("/api/auth/login", json={
        "identifier": "admin",
        "password": "Hope@50",
        "role": "admin"
    })
    token = login_res.json()["access_token"]
    
    res = client.post(
        "/api/assistant/query",
        json={"query": "Which department has the highest academic risk?"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "highest academic risk" in data["answer"].lower()
    assert len(data["suggested_actions"]) > 0
