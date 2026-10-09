from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from datetime import datetime

from ..database import get_db
from ..models import (
    User, Student, Faculty, Department, Intervention,
    ScoreConfiguration, AuditLog
)
from ..schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    FacultyCreate, FacultyUpdate, FacultyResponse,
    ScoreConfigurationResponse, ScoreConfigurationUpdate
)
from ..security import require_roles, hash_password, get_current_user
from ..services.scoring_engine import calculate_student_success_score
from ..services.risk_engine import assess_student_risks
from ..services.segmentation import classify_student_segment

router = APIRouter(prefix="/api/admin", tags=["Administrator"])

@router.get("/dashboard-stats")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    """
    Computes real summary metrics directly from database records.
    """
    total_students = db.query(Student).filter(Student.enrollment_status == "active").count()
    total_faculty = db.query(Faculty).filter(Faculty.is_active == True).count()
    dept_count = db.query(Department).count()
    
    avg_score = db.query(func.avg(Student.success_score)).filter(Student.enrollment_status == "active").scalar()
    
    academic_risk_count = db.query(Student).filter(
        Student.enrollment_status == "active",
        Student.academic_risk == "High"
    ).count()
    
    placement_risk_count = db.query(Student).filter(
        Student.enrollment_status == "active",
        Student.placement_risk == "High"
    ).count()
    
    combined_risk_count = db.query(Student).filter(
        Student.enrollment_status == "active",
        Student.combined_risk == "High"
    ).count()
    
    open_interventions = db.query(Intervention).filter(
        Intervention.status.in_(["pending", "in_progress"])
    ).count()
    
    return {
        "total_students": total_students,
        "total_faculty": total_faculty,
        "departments_count": dept_count,
        "average_success_score": round(float(avg_score or 0), 1),
        "academic_risk_count": academic_risk_count,
        "placement_risk_count": placement_risk_count,
        "combined_risk_count": combined_risk_count,
        "open_interventions": open_interventions
    }

@router.get("/students")
def list_students(
    search: Optional[str] = None,
    department: Optional[str] = None,
    current_year: Optional[int] = None,
    semester: Optional[int] = None,
    risk_level: Optional[str] = None, # 'High', 'Moderate', 'Low'
    sort_by: str = "success_score",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin", "faculty"]))
):
    query = db.query(Student)
    
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Student.student_id.ilike(s)) | (Student.full_name.ilike(s)) | (Student.email.ilike(s)))
        
    if department and department != "all":
        query = query.filter(Student.department == department)
        
    if current_year:
        query = query.filter(Student.current_year == current_year)
        
    if semester:
        query = query.filter(Student.semester == semester)
        
    if risk_level and risk_level != "all":
        query = query.filter(Student.combined_risk == risk_level)
        
    # Sorting
    sort_col = getattr(Student, sort_by, Student.success_score)
    if sort_order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))
        
    total = query.count()
    students = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "students": students
    }

@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student_detail(
    student_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin", "faculty"]))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/students", response_model=StudentResponse)
def create_student(
    req: StudentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    existing = db.query(Student).filter(Student.student_id == req.student_id.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Student ID '{req.student_id}' already exists.")
        
    # Create corresponding auth account
    user = User(
        username=req.student_id.lower(),
        email=req.email.lower(),
        phone_number=req.phone_number,
        hashed_password=hash_password(req.initial_password or "Student@2026"),
        role="student",
        is_active=True,
        requires_password_change=True
    )
    db.add(user)
    db.commit()
    
    # Calculate score & risks
    s_dict = req.model_dump()
    s_dict["student_id"] = req.student_id.upper()
    score_res = calculate_student_success_score(s_dict)
    s_dict["placement_score"] = score_res["placement_score"]
    risk_res = assess_student_risks(s_dict)
    segment = classify_student_segment(score_res["academic_score"], score_res["placement_score"])
    
    student = Student(
        user_id=user.id,
        student_id=req.student_id.upper(),
        full_name=req.full_name,
        email=req.email.lower(),
        phone_number=req.phone_number,
        department=req.department,
        degree=req.degree,
        academic_year=req.academic_year,
        current_year=req.current_year,
        semester=req.semester,
        enrollment_status=req.enrollment_status,
        cgpa=req.cgpa,
        internal_marks=req.internal_marks,
        backlog_count=req.backlog_count,
        overall_attendance=req.overall_attendance,
        assignment_completion_rate=req.assignment_completion_rate,
        lms_login_frequency=req.lms_login_frequency,
        aptitude_score=req.aptitude_score,
        coding_score=req.coding_score,
        mock_interview_score=req.mock_interview_score,
        soft_skills_score=req.soft_skills_score,
        placement_training_attended=req.placement_training_attended,
        hackathon_count=req.hackathon_count,
        certification_count=req.certification_count,
        club_participation_count=req.club_participation_count,
        satisfaction_score=req.satisfaction_score,
        faculty_feedback=req.faculty_feedback,
        success_score=score_res["success_score"],
        academic_score=score_res["academic_score"],
        attendance_score=score_res["attendance_score"],
        lms_score=score_res["lms_score"],
        placement_score=score_res["placement_score"],
        skills_score=score_res["skills_score"],
        is_provisional=score_res["is_provisional"],
        missing_components=score_res["missing_components"],
        academic_risk=risk_res["academic_risk"],
        placement_risk=risk_res["placement_risk"],
        combined_risk=risk_res["combined_risk"],
        risk_reasons=risk_res["risk_reasons"],
        segment=segment,
        score_last_calculated_at=datetime.utcnow()
    )
    db.add(student)
    
    # Audit log
    audit = AuditLog(
        user_id=admin.id,
        username=admin.username,
        action="CREATE_STUDENT",
        resource_type="student",
        resource_id=req.student_id.upper(),
        details=f"Admin created student {req.full_name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(student)
    return student

@router.put("/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    req: StudentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    update_data = req.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(student, field, val)
        
    # Recalculate score & risks
    s_dict = {
        "cgpa": student.cgpa,
        "internal_marks": student.internal_marks,
        "backlog_count": student.backlog_count,
        "overall_attendance": student.overall_attendance,
        "assignment_completion_rate": student.assignment_completion_rate,
        "lms_login_frequency": student.lms_login_frequency,
        "aptitude_score": student.aptitude_score,
        "coding_score": student.coding_score,
        "mock_interview_score": student.mock_interview_score,
        "soft_skills_score": student.soft_skills_score,
        "hackathon_count": student.hackathon_count,
        "certification_count": student.certification_count,
        "club_participation_count": student.club_participation_count,
        "current_year": student.current_year
    }
    score_res = calculate_student_success_score(s_dict)
    student.success_score = score_res["success_score"]
    student.academic_score = score_res["academic_score"]
    student.attendance_score = score_res["attendance_score"]
    student.lms_score = score_res["lms_score"]
    student.placement_score = score_res["placement_score"]
    student.skills_score = score_res["skills_score"]
    student.is_provisional = score_res["is_provisional"]
    student.missing_components = score_res["missing_components"]
    
    s_dict["placement_score"] = student.placement_score
    risk_res = assess_student_risks(s_dict)
    student.academic_risk = risk_res["academic_risk"]
    student.placement_risk = risk_res["placement_risk"]
    student.combined_risk = risk_res["combined_risk"]
    student.risk_reasons = risk_res["risk_reasons"]
    student.segment = classify_student_segment(student.academic_score, student.placement_score)
    student.score_last_calculated_at = datetime.utcnow()
    
    audit = AuditLog(
        user_id=admin.id,
        username=admin.username,
        action="UPDATE_STUDENT",
        resource_type="student",
        resource_id=student.student_id,
        details=f"Admin updated student metrics for {student.full_name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(student)
    return student

@router.delete("/students/{student_id}")
def deactivate_student(
    student_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student.enrollment_status = "inactive"
    if student.user:
        student.user.is_active = False
        
    audit = AuditLog(
        user_id=admin.id,
        username=admin.username,
        action="DEACTIVATE_STUDENT",
        resource_type="student",
        resource_id=student.student_id,
        details=f"Admin deactivated student record {student.full_name}"
    )
    db.add(audit)
    db.commit()
    return {"status": "success", "message": f"Student {student.student_id} deactivated."}

# Faculty Management
@router.get("/faculty", response_model=List[FacultyResponse])
def list_faculty(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    return db.query(Faculty).all()

@router.post("/faculty", response_model=FacultyResponse)
def create_faculty(
    req: FacultyCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    existing = db.query(Faculty).filter(Faculty.faculty_id == req.faculty_id.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Faculty ID '{req.faculty_id}' already exists.")
        
    user = User(
        username=req.faculty_id.lower(),
        email=req.email.lower(),
        phone_number=req.phone_number,
        hashed_password=hash_password(req.initial_password or "Faculty@2026"),
        role="faculty",
        is_active=True
    )
    db.add(user)
    db.commit()
    
    faculty = Faculty(
        user_id=user.id,
        faculty_id=req.faculty_id.upper(),
        full_name=req.full_name,
        email=req.email.lower(),
        phone_number=req.phone_number,
        department=req.department,
        designation=req.designation,
        assigned_subjects=req.assigned_subjects,
        assigned_classes=req.assigned_classes,
        is_active=True
    )
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty

# Score Configuration
@router.get("/settings/scoring", response_model=ScoreConfigurationResponse)
def get_scoring_settings(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    config = db.query(ScoreConfiguration).first()
    if not config:
        config = ScoreConfiguration()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("/settings/scoring", response_model=ScoreConfigurationResponse)
def update_scoring_settings(
    req: ScoreConfigurationUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    total_weight = round(req.weight_academic + req.weight_attendance + req.weight_lms + req.weight_placement + req.weight_skills, 2)
    if total_weight != 1.00:
        raise HTTPException(
            status_code=400,
            detail=f"Scoring weights must sum to exactly 1.00 (Current sum: {total_weight})."
        )
        
    config = db.query(ScoreConfiguration).first()
    if not config:
        config = ScoreConfiguration()
        db.add(config)
        
    config.weight_academic = req.weight_academic
    config.weight_attendance = req.weight_attendance
    config.weight_lms = req.weight_lms
    config.weight_placement = req.weight_placement
    config.weight_skills = req.weight_skills
    config.attendance_threshold = req.attendance_threshold
    config.academic_cgpa_threshold = req.academic_cgpa_threshold
    config.academic_internal_threshold = req.academic_internal_threshold
    config.placement_threshold = req.placement_threshold
    config.updated_by = admin.username
    config.updated_at = datetime.utcnow()
    
    # Recalculate all active students
    students = db.query(Student).filter(Student.enrollment_status == "active").all()
    weights_dict = {
        "academic": req.weight_academic,
        "attendance": req.weight_attendance,
        "lms": req.weight_lms,
        "placement": req.weight_placement,
        "skills": req.weight_skills,
    }
    thresholds_dict = {
        "attendance": req.attendance_threshold,
        "academic_cgpa": req.academic_cgpa_threshold,
        "academic_internal": req.academic_internal_threshold,
        "placement": req.placement_threshold,
    }
    
    for s in students:
        s_data = {
            "cgpa": s.cgpa,
            "internal_marks": s.internal_marks,
            "backlog_count": s.backlog_count,
            "overall_attendance": s.overall_attendance,
            "assignment_completion_rate": s.assignment_completion_rate,
            "lms_login_frequency": s.lms_login_frequency,
            "aptitude_score": s.aptitude_score,
            "coding_score": s.coding_score,
            "mock_interview_score": s.mock_interview_score,
            "soft_skills_score": s.soft_skills_score,
            "hackathon_count": s.hackathon_count,
            "certification_count": s.certification_count,
            "club_participation_count": s.club_participation_count,
            "current_year": s.current_year
        }
        res = calculate_student_success_score(s_data, weights_dict)
        s.success_score = res["success_score"]
        s.academic_score = res["academic_score"]
        s.attendance_score = res["attendance_score"]
        s.lms_score = res["lms_score"]
        s.placement_score = res["placement_score"]
        s.skills_score = res["skills_score"]
        s.is_provisional = res["is_provisional"]
        s.missing_components = res["missing_components"]
        
        s_data["placement_score"] = s.placement_score
        risk_res = assess_student_risks(s_data, thresholds_dict)
        s.academic_risk = risk_res["academic_risk"]
        s.placement_risk = risk_res["placement_risk"]
        s.combined_risk = risk_res["combined_risk"]
        s.risk_reasons = risk_res["risk_reasons"]
        s.segment = classify_student_segment(s.academic_score, s.placement_score)
        
    db.commit()
    db.refresh(config)
    return config

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    return db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
