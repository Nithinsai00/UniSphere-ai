from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Student, Intervention
from ..security import require_roles, get_current_user
from ..services.recommendations import generate_student_recommendations

router = APIRouter(prefix="/api/student", tags=["Student Portal"])

def get_authenticated_student(
    current_user: User = Depends(require_roles(["student", "admin"])),
    db: Session = Depends(get_db)
) -> Student:
    if current_user.role == "admin":
        # For testing/demo as admin, default to first student STU1001
        student = db.query(Student).filter(Student.student_id == "STU1001").first()
        if not student:
            student = db.query(Student).first()
        return student
        
    student = current_user.student_profile
    if not student:
        raise HTTPException(
            status_code=403,
            detail="Student profile not linked to this account."
        )
    return student

@router.get("/me/dashboard")
def get_student_dashboard(
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    """
    Returns the student's personal dashboard. Never exposes other students' data
    or private administrative risk notes.
    """
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
    
    # Generate supportive "Your Next Steps" recommendations
    next_steps = generate_student_recommendations(
        s_dict,
        student.academic_risk or "Low",
        student.placement_risk or "Low"
    )
    
    # Assigned support programs (excluding private staff notes)
    interventions = db.query(Intervention).filter(
        Intervention.student_id == student.id
    ).all()
    
    student_interventions = []
    for it in interventions:
        student_interventions.append({
            "id": it.id,
            "category": it.category,
            "title": it.title,
            "status": it.status,
            "due_date": it.due_date,
            "outcome_notes": it.outcome_notes,
            "faculty_name": it.faculty.full_name if it.faculty else "Faculty Mentor"
        })
        
    return {
        "student": {
            "id": student.id,
            "student_id": student.student_id,
            "full_name": student.full_name,
            "email": student.email,
            "phone_number": student.phone_number,
            "department": student.department,
            "degree": student.degree,
            "academic_year": student.academic_year,
            "current_year": student.current_year,
            "semester": student.semester,
            "enrollment_status": student.enrollment_status
        },
        "success_score": {
            "overall": student.success_score,
            "academic": student.academic_score,
            "attendance": student.attendance_score,
            "lms": student.lms_score,
            "placement": student.placement_score,
            "skills": student.skills_score,
            "is_provisional": student.is_provisional,
            "missing_components": student.missing_components or []
        },
        "academic": {
            "cgpa": student.cgpa,
            "internal_marks": student.internal_marks,
            "backlog_count": student.backlog_count,
            "status": "In Good Standing" if student.backlog_count == 0 else f"{student.backlog_count} Pending Subject(s)"
        },
        "attendance": {
            "overall_attendance": student.overall_attendance,
            "status": "Optimal" if (student.overall_attendance or 0) >= 75 else "Shortage Warning"
        },
        "lms": {
            "assignment_completion_rate": student.assignment_completion_rate,
            "login_frequency": student.lms_login_frequency
        },
        "placement": {
            "aptitude_score": student.aptitude_score,
            "coding_score": student.coding_score,
            "mock_interview_score": student.mock_interview_score,
            "soft_skills_score": student.soft_skills_score,
            "training_attended": student.placement_training_attended,
            "assessed": student.placement_score is not None
        },
        "skills_engagement": {
            "hackathons": student.hackathon_count,
            "certifications": student.certification_count,
            "clubs": student.club_participation_count
        },
        "next_steps": next_steps,
        "assigned_support_programs": student_interventions
    }
