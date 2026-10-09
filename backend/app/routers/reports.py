import csv
import io
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Student, Intervention, User
from ..security import require_roles

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/summary")
def get_reports_summary(
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    query = db.query(Student).filter(Student.enrollment_status == "active")
    if department and department != "all":
        query = query.filter(Student.department == department)
        
    students = query.all()
    total = len(students)
    
    if total == 0:
        return {"total_students": 0}
        
    avg_success = sum((s.success_score or 0) for s in students) / total
    avg_cgpa = sum((s.cgpa or 0) for s in students if s.cgpa is not None) / max(1, sum(1 for s in students if s.cgpa is not None))
    avg_attendance = sum((s.overall_attendance or 0) for s in students if s.overall_attendance is not None) / max(1, sum(1 for s in students if s.overall_attendance is not None))
    
    high_academic = sum(1 for s in students if s.academic_risk == "High")
    high_placement = sum(1 for s in students if s.placement_risk == "High")
    high_combined = sum(1 for s in students if s.combined_risk == "High")
    
    # Interventions stats
    int_query = db.query(Intervention)
    if department and department != "all":
        int_query = int_query.join(Student).filter(Student.department == department)
        
    total_interventions = int_query.count()
    completed_interventions = int_query.filter(Intervention.status == "completed").count()
    improved_outcomes = int_query.filter(Intervention.impact_rating == "improved").count()
    
    return {
        "report_generated_at": func.now(),
        "total_students": total,
        "average_success_score": round(avg_success, 1),
        "average_cgpa": round(avg_cgpa, 2),
        "average_attendance": round(avg_attendance, 1),
        "high_academic_risk_count": high_academic,
        "high_academic_risk_pct": round((high_academic / total) * 100.0, 1),
        "high_placement_risk_count": high_placement,
        "high_placement_risk_pct": round((high_placement / total) * 100.0, 1),
        "high_combined_risk_count": high_combined,
        "high_combined_risk_pct": round((high_combined / total) * 100.0, 1),
        "total_interventions": total_interventions,
        "completed_interventions": completed_interventions,
        "improved_outcomes_count": improved_outcomes
    }

@router.get("/export/students-csv")
def export_students_csv(
    department: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    query = db.query(Student).filter(Student.enrollment_status == "active")
    if department and department != "all":
        query = query.filter(Student.department == department)
    if risk_level and risk_level != "all":
        query = query.filter(Student.combined_risk == risk_level)
        
    students = query.all()
    
    stream = io.StringIO()
    writer = csv.writer(stream)
    
    writer.writerow([
        "Student ID", "Full Name", "Department", "Current Year", "Semester",
        "CGPA", "Internal Marks", "Backlogs", "Attendance %",
        "LMS Completion %", "Coding Score", "Aptitude Score",
        "Success Score", "Academic Risk", "Placement Risk", "Combined Risk", "Segment"
    ])
    
    for s in students:
        writer.writerow([
            s.student_id, s.full_name, s.department, s.current_year, s.semester,
            s.cgpa or "", s.internal_marks or "", s.backlog_count, s.overall_attendance or "",
            s.assignment_completion_rate or "", s.coding_score or "", s.aptitude_score or "",
            s.success_score or "", s.academic_risk, s.placement_risk, s.combined_risk, s.segment
        ])
        
    return PlainTextResponse(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=unisphere_students_report.csv"}
    )
