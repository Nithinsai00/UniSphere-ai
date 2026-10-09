from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models import User, Student, Faculty, Intervention
from ..schemas import StudentResponse
from ..security import require_roles, get_current_user
from ..services.recommendations import generate_student_recommendations

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])

def get_current_faculty(
    current_user: User = Depends(require_roles(["faculty", "admin"])),
    db: Session = Depends(get_db)
) -> Faculty:
    if current_user.role == "admin":
        # Admin inspecting faculty portal defaults to first faculty profile
        fac = db.query(Faculty).first()
        return fac
    fac = current_user.faculty_profile
    if not fac:
        raise HTTPException(status_code=403, detail="Faculty profile not linked to user account.")
    return fac

@router.get("/dashboard")
def get_faculty_dashboard(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    """
    Returns department-scoped metrics for faculty members.
    """
    dept = faculty.department
    
    total_assigned = db.query(Student).filter(
        Student.department == dept,
        Student.enrollment_status == "active"
    ).count()
    
    academic_risk_count = db.query(Student).filter(
        Student.department == dept,
        Student.academic_risk == "High",
        Student.enrollment_status == "active"
    ).count()
    
    placement_risk_count = db.query(Student).filter(
        Student.department == dept,
        Student.placement_risk == "High",
        Student.enrollment_status == "active"
    ).count()
    
    combined_risk_count = db.query(Student).filter(
        Student.department == dept,
        Student.combined_risk == "High",
        Student.enrollment_status == "active"
    ).count()
    
    avg_score = db.query(func.avg(Student.success_score)).filter(
        Student.department == dept,
        Student.enrollment_status == "active"
    ).scalar() or 0
    
    avg_att = db.query(func.avg(Student.overall_attendance)).filter(
        Student.department == dept,
        Student.enrollment_status == "active"
    ).scalar() or 0
    
    # Interventions assigned to this faculty
    my_interventions = db.query(Intervention).filter(
        Intervention.faculty_id == faculty.id
    ).all()
    
    open_cases = [i for i in my_interventions if i.status in ["pending", "in_progress"]]
    
    # Priority students needing immediate follow-up
    priority_students = db.query(Student).filter(
        Student.department == dept,
        Student.combined_risk == "High",
        Student.enrollment_status == "active"
    ).limit(6).all()
    
    return {
        "faculty_info": {
            "name": faculty.full_name,
            "department": faculty.department,
            "designation": faculty.designation,
            "assigned_classes": faculty.assigned_classes
        },
        "total_assigned": total_assigned,
        "academic_risk_count": academic_risk_count,
        "placement_risk_count": placement_risk_count,
        "combined_risk_count": combined_risk_count,
        "average_success_score": round(float(avg_score), 1),
        "average_attendance": round(float(avg_att), 1),
        "my_open_interventions_count": len(open_cases),
        "priority_students": priority_students
    }

@router.get("/students")
def list_faculty_students(
    search: Optional[str] = None,
    current_year: Optional[int] = None,
    risk_level: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    query = db.query(Student).filter(
        Student.department == faculty.department,
        Student.enrollment_status == "active"
    )
    
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Student.student_id.ilike(s)) | (Student.full_name.ilike(s)))
        
    if current_year:
        query = query.filter(Student.current_year == current_year)
        
    if risk_level and risk_level != "all":
        query = query.filter(Student.combined_risk == risk_level)
        
    total = query.count()
    students = query.order_by(desc(Student.combined_risk == "High"), desc(Student.success_score)).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "department": faculty.department,
        "students": students
    }

@router.get("/students/{student_id}", response_model=StudentResponse)
def get_faculty_student_detail(
    student_id: int,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.department == faculty.department
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found or not in your departmental purview."
        )
    return student

@router.get("/students/{student_id}/recommendations")
def get_student_recommendations_route(
    student_id: int,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.department == faculty.department
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    s_dict = {
        "cgpa": student.cgpa,
        "internal_marks": student.internal_marks,
        "backlog_count": student.backlog_count,
        "overall_attendance": student.overall_attendance,
        "assignment_completion_rate": student.assignment_completion_rate,
        "coding_score": student.coding_score,
        "aptitude_score": student.aptitude_score,
        "mock_interview_score": student.mock_interview_score
    }
    
    recs = generate_student_recommendations(s_dict, student.academic_risk, student.placement_risk)
    return {
        "student_id": student.student_id,
        "student_name": student.full_name,
        "recommendations": recs
    }
