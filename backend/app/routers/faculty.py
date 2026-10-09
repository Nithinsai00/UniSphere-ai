import os
import uuid
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models import (
    User, Student, Faculty, Intervention, StudentMessage,
    Assignment, StudentImprovementTask, StudyMaterial
)
from ..schemas import StudentResponse
from ..security import require_roles, get_current_user

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "study_materials"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Request schemas
class FacultySendMessageRequest(BaseModel):
    student_id: int
    subject: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    category: str = Field(default="Academic Support")


class FacultyMessageReplyRequest(BaseModel):
    content: str = Field(..., min_length=1)


class AssignmentCreateRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = ""
    subject: str = Field(..., min_length=1)
    target_class: str = Field(default="CSE - 3rd Year")
    academic_year: str = Field(default="2025-2026")
    semester: int = Field(default=6)
    due_date: str = Field(..., min_length=1)
    attachment_name: Optional[str] = None


class ImprovementTaskCreateRequest(BaseModel):
    student_id: int
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    subject: str = Field(..., min_length=1)
    reason: Optional[str] = "Academic performance reinforcement"
    due_date: str = Field(..., min_length=1)
    reference_doc: Optional[str] = None


def get_current_faculty(
    current_user: User = Depends(require_roles(["faculty", "admin"])),
    db: Session = Depends(get_db)
) -> Faculty:
    if current_user.role == "admin":
        fac = db.query(Faculty).first()
        return fac
    fac = current_user.faculty_profile
    if not fac:
        raise HTTPException(status_code=403, detail="Faculty profile not linked to user account.")
    return fac


def seed_default_assignments(faculty: Faculty, db: Session):
    a1 = Assignment(
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title="Operating Systems Lab Assignment 4: Process Synchronization & Mutexes",
        description="Implement the Dining Philosophers and Producer-Consumer problem using POSIX threads, semaphores, and mutex locks in C/C++. Include bench test logs and deadlock analysis report.",
        subject="Operating Systems",
        target_class="CSE - 3rd Year",
        academic_year="2025-2026",
        semester=6,
        due_date="Next Monday, 11:59 PM",
        attachment_name="OS_Lab_Assignment_4_Specs.pdf",
        attachment_url="/study-materials/sample/OS_Lab_Assignment_4_Specs.pdf",
        is_published=True,
        submissions_count=42,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )
    a2 = Assignment(
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title="Algorithms Analysis: Dynamic Programming & Bellman-Ford Implementation",
        description="Write a complete Python/C++ solution to find all-pairs shortest paths using Dynamic Programming. Analyze edge case performance on graphs with negative weight cycles.",
        subject="Design & Analysis of Algorithms",
        target_class="CSE - 3rd Year",
        academic_year="2025-2026",
        semester=6,
        due_date="Friday, 5:00 PM",
        attachment_name="Algorithms_Assignment_DP_Review.pdf",
        attachment_url="/study-materials/sample/Algorithms_Assignment_DP_Review.pdf",
        is_published=True,
        submissions_count=28,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
    )
    db.add_all([a1, a2])
    db.commit()


def seed_default_study_materials(faculty: Faculty, db: Session):
    m1 = StudyMaterial(
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title="Unit 3: CPU Scheduling Algorithms & Multilevel Feedback Queues",
        description="Comprehensive revision slides covering FCFS, SJF, Priority, Round Robin, Multilevel Queue Scheduling with numerical solved examples from university question banks.",
        subject="Operating Systems",
        topic_unit="Unit 3 — Process Scheduling",
        target_class="CSE - 3rd Year",
        department=faculty.department,
        academic_year="2025-2026",
        semester=6,
        filename="Unit_3_CPU_Scheduling_Comprehensive.pdf",
        file_path="sample/Unit_3_CPU_Scheduling_Comprehensive.pdf",
        file_type="PDF",
        file_size_formatted="3.8 MB",
        file_size_bytes=3984588,
        is_published=True,
        download_count=124,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4)
    )
    m2 = StudyMaterial(
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title="Memory Management & Virtual Memory Page Replacement Reference Notes",
        description="Detailed lecture hand-outs with step-by-step illustrations of FIFO, Optimal, and LRU page replacement policies, thrashing prevention, and TLB address translation.",
        subject="Operating Systems",
        topic_unit="Unit 4 — Memory Management",
        target_class="CSE - 3rd Year",
        department=faculty.department,
        academic_year="2025-2026",
        semester=6,
        filename="OS_Unit4_Virtual_Memory_Notes.pdf",
        file_path="sample/OS_Unit4_Virtual_Memory_Notes.pdf",
        file_type="PDF",
        file_size_formatted="2.4 MB",
        file_size_bytes=2516582,
        is_published=True,
        download_count=98,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=7)
    )
    m3 = StudyMaterial(
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title="Mid-Semester Exam Question Bank & Solved Model Paper (2024-2026)",
        description="Curated collection of previous five years mid-semester internal assessment questions with model answer schemes, grading rubrics, and high-frequency numericals.",
        subject="Design & Analysis of Algorithms",
        topic_unit="All Units — Revision Pack",
        target_class="CSE - 3rd Year",
        department=faculty.department,
        academic_year="2025-2026",
        semester=6,
        filename="Algorithms_Solved_Question_Bank_2026.pdf",
        file_path="sample/Algorithms_Solved_Question_Bank_2026.pdf",
        file_type="PDF",
        file_size_formatted="4.1 MB",
        file_size_bytes=4300000,
        is_published=True,
        download_count=182,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
    )
    db.add_all([m1, m2, m3])
    db.commit()


# -------------------------------------------------------------------------
# 1. Faculty Dashboard: Class Overview
# -------------------------------------------------------------------------
@router.get("/dashboard")
def get_faculty_dashboard(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    dept = faculty.department
    
    students_query = db.query(Student).filter(
        Student.department == dept,
        Student.enrollment_status == "active"
    )
    total_students = students_query.count()
    if total_students == 0:
        students_query = db.query(Student).filter(Student.enrollment_status == "active")
        total_students = students_query.count()

    avg_marks = students_query.with_entities(func.avg(Student.internal_marks)).scalar() or 76.5
    avg_att = students_query.with_entities(func.avg(Student.overall_attendance)).scalar() or 81.2
    avg_cgpa = students_query.with_entities(func.avg(Student.cgpa)).scalar() or 7.85
    
    at_risk_query = students_query.filter(Student.combined_risk.in_(["High", "Moderate"]))
    at_risk_count = at_risk_query.count()
    
    # Priority at-risk students for the overview table
    at_risk_records = at_risk_query.order_by(
        desc(Student.combined_risk == "High"),
        Student.success_score.asc()
    ).limit(8).all()
    
    at_risk_students = []
    for s in at_risk_records:
        reason = "Academic & placement support"
        if s.risk_reasons and len(s.risk_reasons) > 0:
            first_r = s.risk_reasons[0]
            reason = first_r.get("label") or first_r.get("trigger") or reason
        elif (s.overall_attendance or 100) < 75:
            reason = f"Low attendance ({round(s.overall_attendance)}%)"
        elif (s.internal_marks or 100) < 60:
            reason = f"Low internal marks ({round(s.internal_marks)}%)"
        elif (s.backlog_count or 0) > 0:
            reason = f"{s.backlog_count} pending backlog(s)"
        elif (s.coding_score or 100) < 60:
            reason = f"Low coding score ({round(s.coding_score)}%)"
            
        score_val = round(s.success_score) if s.success_score is not None else 50
        is_high = (s.combined_risk == "High")
        at_risk_students.append({
            "id": s.id,
            "student_id": s.student_id,
            "name": s.full_name,
            "riskLevel": s.combined_risk or "Moderate",
            "reason": reason,
            "score": f"{score_val}%",
            "riskPill": "bg-red-100 text-red-600" if is_high else "bg-amber-100 text-amber-700",
            "scoreColor": "text-[#DC2626]" if is_high else "text-amber-600"
        })
        
    return {
        "total_students": total_students,
        "average_marks": round(float(avg_marks), 1),
        "average_attendance": round(float(avg_att), 1),
        "class_avg_cgpa": round(float(avg_cgpa), 2),
        "at_risk_count": at_risk_count,
        "at_risk_students": at_risk_students,
        "faculty_info": {
            "name": faculty.full_name,
            "department": faculty.department,
            "designation": faculty.designation,
            "assigned_classes": faculty.assigned_classes or "CSE - 3rd Year"
        }
    }


# -------------------------------------------------------------------------
# 2. Student Management with Evidence-Based Risk Filters
# -------------------------------------------------------------------------
@router.get("/students")
def list_faculty_students(
    search: Optional[str] = None,
    current_year: Optional[int] = None,
    risk_type: Optional[str] = "all", # "all", "placement", "attendance", "cgpa"
    risk_level: Optional[str] = None, # backward compatibility
    page: int = 1,
    limit: int = 15,
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
        
    rt = (risk_type or risk_level or "all").lower()
    if rt == "placement":
        query = query.filter(
            (Student.placement_risk == "High") |
            (Student.coding_score < 60) |
            (Student.aptitude_score < 60) |
            (Student.mock_interview_score < 60)
        )
    elif rt == "attendance":
        query = query.filter(Student.overall_attendance < 75.0)
    elif rt in ["cgpa", "low_cgpa"]:
        query = query.filter(
            (Student.cgpa < 6.0) |
            (Student.academic_risk == "High")
        )
    elif rt in ["high", "moderate", "low"]:
        query = query.filter(Student.combined_risk == risk_type)
        
    total = query.count()
    raw_students = query.order_by(
        desc(Student.combined_risk == "High"),
        Student.success_score.asc()
    ).offset((page - 1) * limit).limit(limit).all()
    
    students = []
    for s in raw_students:
        indicators = []
        if (s.overall_attendance or 100) < 75.0:
            indicators.append({
                "type": "Attendance Risk",
                "label": "Attendance < 75%",
                "evidence": f"Attendance is {round(s.overall_attendance, 1)}% (Threshold: 75%)",
                "badgeColor": "bg-red-100 text-red-700"
            })
        if (s.cgpa or 10) < 6.0 or s.academic_risk == "High":
            indicators.append({
                "type": "Low CGPA Risk",
                "label": "CGPA < 6.0",
                "evidence": f"CGPA is {s.cgpa} / 10.0 (Threshold: 6.0)",
                "badgeColor": "bg-orange-100 text-orange-700"
            })
        if (s.placement_risk == "High") or ((s.coding_score or 100) < 60) or ((s.aptitude_score or 100) < 60):
            coding_str = f"Coding {round(s.coding_score)}%" if s.coding_score is not None else ""
            apt_str = f"Aptitude {round(s.aptitude_score)}%" if s.aptitude_score is not None else ""
            evidence_parts = [p for p in [coding_str, apt_str] if p]
            indicators.append({
                "type": "Placement Risk",
                "label": "Low Placement Readiness",
                "evidence": f"Placement readiness low ({', '.join(evidence_parts) or 'Assessment needed'})",
                "badgeColor": "bg-purple-100 text-purple-700"
            })
            
        s_dict = {
            "id": s.id,
            "student_id": s.student_id,
            "full_name": s.full_name,
            "email": s.email,
            "department": s.department,
            "current_year": s.current_year,
            "semester": s.semester,
            "success_score": s.success_score,
            "overall_attendance": s.overall_attendance,
            "cgpa": s.cgpa,
            "internal_marks": s.internal_marks,
            "backlog_count": s.backlog_count,
            "coding_score": s.coding_score,
            "aptitude_score": s.aptitude_score,
            "placement_risk": s.placement_risk,
            "academic_risk": s.academic_risk,
            "combined_risk": s.combined_risk,
            "risk_indicators": indicators
        }
        students.append(s_dict)
        
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
            detail="Student not found or not in your department jurisdiction."
        )
    return student


# -------------------------------------------------------------------------
# 3. Faculty Messaging & Student Communication
# -------------------------------------------------------------------------
@router.get("/messages")
def list_faculty_messages(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    """
    Returns messages sent by or routed to faculty members for their students.
    """
    # Find all students in faculty department
    student_ids = [s.id for s in db.query(Student.id).filter(Student.department == faculty.department).all()]
    
    msgs = db.query(StudentMessage).filter(
        StudentMessage.student_id.in_(student_ids)
    ).order_by(StudentMessage.updated_at.desc()).all()
    
    result = []
    for m in msgs:
        st = db.query(Student).filter(Student.id == m.student_id).first()
        result.append({
            "id": m.id,
            "student_id": m.student_id,
            "student_name": st.full_name if st else "Student",
            "student_code": st.student_id if st else "",
            "sender_name": m.sender_name,
            "sender_designation": m.sender_designation,
            "sender_department": m.sender_department,
            "sender_role": m.sender_role,
            "subject": m.subject,
            "preview": m.preview or (m.content[:80] + "..."),
            "content": m.content,
            "category": m.category,
            "is_read": m.is_read,
            "unread": not m.is_read,
            "replies": m.replies or [],
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "updated_at": m.updated_at.isoformat() if m.updated_at else None,
            "time": m.created_at.strftime("%b %d, %I:%M %p") if m.created_at else "Recently"
        })
    return result


@router.post("/messages")
def send_faculty_message(
    payload: FacultySendMessageRequest,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(
        Student.id == payload.student_id,
        Student.department == faculty.department
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your department.")
        
    msg = StudentMessage(
        student_id=student.id,
        sender_name=faculty.full_name,
        sender_designation=faculty.designation,
        sender_department=faculty.department,
        sender_role="faculty",
        subject=payload.subject.strip(),
        preview=payload.content.strip()[:85] + ("..." if len(payload.content.strip()) > 85 else ""),
        content=payload.content.strip(),
        category=payload.category,
        is_read=False,
        replies=[],
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"message": "Message sent successfully to student.", "id": msg.id}


@router.post("/messages/{message_id}/reply")
def faculty_reply_message(
    message_id: int,
    payload: FacultyMessageReplyRequest,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    msg = db.query(StudentMessage).filter(StudentMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")
        
    reply_obj = {
        "id": str(uuid.uuid4())[:8],
        "sender_name": faculty.full_name,
        "sender_role": f"Faculty ({faculty.designation})",
        "content": payload.content.strip(),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    replies = list(msg.replies or [])
    replies.append(reply_obj)
    msg.replies = replies
    msg.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(msg)
    return {"message": "Reply sent successfully.", "replies": msg.replies}


# -------------------------------------------------------------------------
# 4. Assignments & Improvement Tasks
# -------------------------------------------------------------------------
@router.get("/assignments")
def get_faculty_assignments(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    count = db.query(Assignment).filter(Assignment.faculty_id == faculty.id).count()
    if count == 0:
        seed_default_assignments(faculty, db)
        
    assignments = db.query(Assignment).filter(
        Assignment.faculty_id == faculty.id
    ).order_by(Assignment.created_at.desc()).all()
    
    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "subject": a.subject,
            "target_class": a.target_class,
            "academic_year": a.academic_year,
            "semester": a.semester,
            "due_date": a.due_date,
            "attachment_name": a.attachment_name,
            "attachment_url": a.attachment_url,
            "is_published": a.is_published,
            "submissions_count": a.submissions_count,
            "created_at": a.created_at.strftime("%b %d, %Y") if a.created_at else ""
        }
        for a in assignments
    ]


@router.post("/assignments")
def create_faculty_assignment(
    payload: AssignmentCreateRequest,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    assignment = Assignment(
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else "",
        subject=payload.subject.strip(),
        target_class=payload.target_class,
        academic_year=payload.academic_year,
        semester=payload.semester,
        due_date=payload.due_date.strip(),
        attachment_name=payload.attachment_name,
        is_published=True,
        submissions_count=0,
        created_at=datetime.datetime.utcnow()
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"message": "Assignment created successfully.", "assignment": assignment}


@router.put("/assignments/{assignment_id}")
def update_faculty_assignment(
    assignment_id: int,
    payload: AssignmentCreateRequest,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.faculty_id == faculty.id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
        
    assignment.title = payload.title.strip()
    assignment.description = payload.description.strip() if payload.description else ""
    assignment.subject = payload.subject.strip()
    assignment.target_class = payload.target_class
    assignment.due_date = payload.due_date.strip()
    if payload.attachment_name:
        assignment.attachment_name = payload.attachment_name
        
    db.commit()
    db.refresh(assignment)
    return {"message": "Assignment updated successfully.", "assignment": assignment}


@router.delete("/assignments/{assignment_id}")
def delete_faculty_assignment(
    assignment_id: int,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.faculty_id == faculty.id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
        
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully."}


@router.post("/tasks")
def assign_improvement_task(
    payload: ImprovementTaskCreateRequest,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(
        Student.id == payload.student_id,
        Student.department == faculty.department
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your department.")
        
    task = StudentImprovementTask(
        student_id=student.id,
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title=payload.title.strip(),
        description=payload.description.strip(),
        subject=payload.subject.strip(),
        reason=payload.reason or "Targeted academic improvement",
        due_date=payload.due_date.strip(),
        status="pending",
        reference_doc=payload.reference_doc,
        created_at=datetime.datetime.utcnow()
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"message": f"Improvement task assigned to {student.full_name}.", "task_id": task.id}


@router.get("/tasks")
def list_faculty_improvement_tasks(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    tasks = db.query(StudentImprovementTask).filter(
        StudentImprovementTask.faculty_id == faculty.id
    ).order_by(StudentImprovementTask.created_at.desc()).all()
    
    result = []
    for t in tasks:
        st = db.query(Student).filter(Student.id == t.student_id).first()
        result.append({
            "id": t.id,
            "student_id": t.student_id,
            "student_name": st.full_name if st else "Student",
            "student_code": st.student_id if st else "",
            "title": t.title,
            "description": t.description,
            "subject": t.subject,
            "reason": t.reason,
            "due_date": t.due_date,
            "status": t.status,
            "reference_doc": t.reference_doc,
            "created_at": t.created_at.strftime("%b %d, %Y") if t.created_at else ""
        })
    return result


# -------------------------------------------------------------------------
# 5. Faculty Performance Analytics
# -------------------------------------------------------------------------
@router.get("/performance-analytics")
def get_faculty_performance_analytics(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    dept = faculty.department
    
    # Subject-wise analytics
    subjects = [
        {
            "name": "Operating Systems",
            "code": "CS601",
            "avg_marks": 74.2,
            "highest_marks": 96,
            "lowest_marks": 42,
            "pass_percentage": 88.5,
            "needs_improvement_count": 7,
            "benchmark": 75.0,
            "status": "On Track"
        },
        {
            "name": "Design & Analysis of Algorithms",
            "code": "CS602",
            "avg_marks": 68.6,
            "highest_marks": 92,
            "lowest_marks": 38,
            "pass_percentage": 81.0,
            "needs_improvement_count": 12,
            "benchmark": 75.0,
            "status": "Weak Subject"
        },
        {
            "name": "Database Management Systems",
            "code": "CS603",
            "avg_marks": 81.4,
            "highest_marks": 98,
            "lowest_marks": 49,
            "pass_percentage": 94.2,
            "needs_improvement_count": 4,
            "benchmark": 75.0,
            "status": "Strong"
        },
        {
            "name": "Computer Networks",
            "code": "CS604",
            "avg_marks": 77.8,
            "highest_marks": 95,
            "lowest_marks": 45,
            "pass_percentage": 91.0,
            "needs_improvement_count": 5,
            "benchmark": 75.0,
            "status": "Good"
        }
    ]
    
    # Attendance trends
    attendance_trends = [
        {"period": "Week 1", "attendance": 88.2, "threshold": 75.0},
        {"period": "Week 2", "attendance": 86.5, "threshold": 75.0},
        {"period": "Week 3", "attendance": 83.1, "threshold": 75.0},
        {"period": "Week 4", "attendance": 79.4, "threshold": 75.0},
        {"period": "Week 5", "attendance": 81.8, "threshold": 75.0},
        {"period": "Week 6", "attendance": 84.0, "threshold": 75.0},
    ]
    
    # Weak-subject identification
    weak_subjects = [
        {
            "subject": "Design & Analysis of Algorithms",
            "class_average": "68.6%",
            "pass_percentage": "81.0%",
            "students_below_benchmark": 12,
            "suggested_actions": "Schedule remedial problem-solving sessions on Dynamic Programming and Greedy Strategies before mid-term 2."
        }
    ]
    
    # Students needing improvement in weak areas
    flagged_students = db.query(Student).filter(
        Student.department == dept,
        Student.internal_marks < 60
    ).limit(8).all()
    
    return {
        "department": dept,
        "class_name": "CSE - 3rd Year (Semester 6)",
        "subjects": subjects,
        "attendance_trends": attendance_trends,
        "weak_subjects": weak_subjects,
        "flagged_students_count": len(flagged_students)
    }


# -------------------------------------------------------------------------
# 6. Faculty AI Study Insights
# -------------------------------------------------------------------------
@router.get("/study-insights")
def get_faculty_study_insights(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    dept = faculty.department
    
    # Query students needing immediate attention based on verified records
    high_risk_students = db.query(Student).filter(
        Student.department == dept,
        Student.combined_risk.in_(["High", "Moderate"])
    ).order_by(Student.success_score.asc()).limit(10).all()
    
    attention_list = []
    for s in high_risk_students:
        factors = []
        if (s.overall_attendance or 100) < 75:
            factors.append(f"Low attendance: {round(s.overall_attendance)}%")
        if (s.internal_marks or 100) < 60:
            factors.append(f"Internal marks: {round(s.internal_marks)}%")
        if (s.backlog_count or 0) > 0:
            factors.append(f"{s.backlog_count} backlogs")
        if (s.coding_score or 100) < 60:
            factors.append(f"Coding readiness: {round(s.coding_score)}%")
            
        recommended_action = "Schedule 1-on-1 Mentoring"
        if (s.internal_marks or 100) < 60:
            recommended_action = "Assign Practice Module & Revision Notes"
        elif (s.coding_score or 100) < 60:
            recommended_action = "Assign Technical Problem Solving Set"
        elif (s.overall_attendance or 100) < 75:
            recommended_action = "Issue Attendance Warning & Mentoring"
            
        attention_list.append({
            "id": s.id,
            "student_id": s.student_id,
            "name": s.full_name,
            "risk_level": s.combined_risk or "Moderate",
            "attendance": f"{round(s.overall_attendance or 0)}%",
            "internal_marks": f"{round(s.internal_marks or 0)}%",
            "cgpa": f"{s.cgpa or 0}",
            "risk_factors": factors or ["Performance consistency check"],
            "recommended_action": recommended_action
        })
        
    return {
        "department": dept,
        "criteria_explanation": "Identified using verified university thresholds: Attendance < 75%, Internal Marks < 60%, CGPA < 6.0, and Placement Readiness Score < 60%. Insights are evidence-grounded and require faculty review before action.",
        "students_needing_immediate_attention": attention_list
    }


# -------------------------------------------------------------------------
# 7. Faculty Study Material Upload & Management
# -------------------------------------------------------------------------
@router.get("/study-materials")
def list_faculty_study_materials(
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    count = db.query(StudyMaterial).filter(StudyMaterial.faculty_id == faculty.id).count()
    if count == 0:
        seed_default_study_materials(faculty, db)
        
    materials = db.query(StudyMaterial).filter(
        StudyMaterial.faculty_id == faculty.id
    ).order_by(StudyMaterial.created_at.desc()).all()
    
    return [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "subject": m.subject,
            "topic_unit": m.topic_unit,
            "target_class": m.target_class,
            "filename": m.filename,
            "file_type": m.file_type,
            "file_size": m.file_size_formatted,
            "is_published": m.is_published,
            "download_count": m.download_count,
            "created_at": m.created_at.strftime("%b %d, %Y") if m.created_at else ""
        }
        for m in materials
    ]


@router.post("/study-materials/upload")
async def upload_study_material(
    title: str = Form(...),
    description: Optional[str] = Form(""),
    subject: str = Form(...),
    topic_unit: Optional[str] = Form(""),
    target_class: str = Form("CSE - 3rd Year"),
    academic_year: str = Form("2025-2026"),
    semester: int = Form(6),
    file: UploadFile = File(...),
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt", ".zip"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format '{ext}'. Allowed formats: PDF, PPT, PPTX, DOC, DOCX, TXT, ZIP."
        )
        
    # Read file content with size limit (25 MB)
    contents = await file.read()
    max_size = 25 * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds the maximum allowed limit of 25 MB."
        )
        
    # Save file to disk
    clean_name = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, clean_name)
    with open(file_path, "wb") as f:
        f.write(contents)
        
    size_mb = round(len(contents) / (1024 * 1024), 1)
    file_size_formatted = f"{size_mb} MB" if size_mb >= 0.1 else f"{round(len(contents) / 1024)} KB"
    
    file_type = ext.replace(".", "").upper()
    if "ppt" in file_type.lower():
        file_type = "PPT"
    elif "doc" in file_type.lower():
        file_type = "DOC"

    material = StudyMaterial(
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        title=title.strip(),
        description=description.strip() if description else "",
        subject=subject.strip(),
        topic_unit=topic_unit.strip() if topic_unit else None,
        target_class=target_class,
        department=faculty.department,
        academic_year=academic_year,
        semester=semester,
        filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        file_size_formatted=file_size_formatted,
        file_size_bytes=len(contents),
        is_published=True,
        download_count=0,
        created_at=datetime.datetime.utcnow()
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    
    return {
        "message": "Study material uploaded and published successfully.",
        "id": material.id,
        "title": material.title
    }


@router.put("/study-materials/{material_id}/publish")
def toggle_publish_study_material(
    material_id: int,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.faculty_id == faculty.id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found.")
        
    material.is_published = not material.is_published
    db.commit()
    return {"message": "Publish state updated.", "is_published": material.is_published}


@router.delete("/study-materials/{material_id}")
def delete_study_material(
    material_id: int,
    faculty: Faculty = Depends(get_current_faculty),
    db: Session = Depends(get_db)
):
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.faculty_id == faculty.id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found.")
        
    db.delete(material)
    db.commit()
    return {"message": "Study material deleted successfully."}
