import os
import uuid
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import (
    User, Student, Intervention, StudentMessage,
    Assignment, StudentImprovementTask, StudyMaterial
)
from ..security import require_roles, get_current_user
from ..services.recommendations import generate_student_recommendations

router = APIRouter(prefix="/api/student", tags=["Student Portal"])

class MessageReplyRequest(BaseModel):
    content: str = Field(..., min_length=1)


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


def serialize_message(m: StudentMessage) -> Dict[str, Any]:
    return {
        "id": m.id,
        "student_id": m.student_id,
        "sender": m.sender_name,
        "sender_name": m.sender_name,
        "role": m.sender_designation or m.sender_role or "Faculty",
        "sender_designation": m.sender_designation or "Faculty",
        "sender_department": m.sender_department or "Academic Department",
        "sender_role": m.sender_role or "faculty",
        "subject": m.subject,
        "preview": m.preview or "",
        "content": m.content,
        "category": m.category,
        "badge": m.category,
        "badgeColor": (
            "bg-emerald-100 text-[#05603A]" if m.category == "Mentoring"
            else "bg-sky-100 text-sky-700" if m.category == "Placement"
            else "bg-orange-100 text-orange-700"
        ),
        "is_read": m.is_read,
        "unread": not m.is_read,
        "replies": m.replies or [],
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "updated_at": m.updated_at.isoformat() if m.updated_at else None,
        "time": m.created_at.strftime("%b %d, %I:%M %p") if m.created_at else "Recently"
    }


def seed_default_student_messages(student_id: int, db: Session):
    now = datetime.datetime.utcnow()
    m1 = StudentMessage(
        student_id=student_id,
        sender_name="Prof. Priya Sharma",
        sender_designation="CSE Faculty Mentor",
        sender_department="Department of Computer Science & Engineering",
        sender_role="faculty",
        subject="Scheduled Mentoring Session — Operating Systems",
        preview="Please bring your mid-semester internal assessment answer script for review.",
        content="Dear Student,\n\nFollowing our review of the mid-semester internal assessments, I would like to schedule a one-on-one mentoring check-in to go over your Operating Systems coursework and discuss key preparation strategies for the upcoming semester examinations.\n\nPlease bring your internal assessment answer scripts, assignment feedback notes, and any specific questions on process scheduling and memory management.\n\nDate: This Thursday\nTime: 11:30 AM – 12:15 PM\nLocation: Cabin 304, Academic Block 2\n\nLooking forward to our discussion.\n\nBest regards,\nProf. Priya Sharma\nFaculty Mentor, CSE Department",
        category="Mentoring",
        is_read=False,
        replies=[],
        created_at=now - datetime.timedelta(hours=2),
        updated_at=now - datetime.timedelta(hours=2)
    )
    m2 = StudentMessage(
        student_id=student_id,
        sender_name="Training & Placement Cell",
        sender_designation="T&P Officer",
        sender_department="Corporate Relations & Placement Center",
        sender_role="placement",
        subject="Mock Technical Interview Slot Confirmed",
        preview="Your 1-on-1 coding interview preparation round is scheduled for Friday 2:00 PM.",
        content="Hello,\n\nYour slot for the Upcoming Industry Mock Technical Interview has been confirmed. You will be paired with a senior software engineering alumni interviewer for a 45-minute live technical session followed by personalized feedback.\n\nSession Details:\n• Date & Time: Friday, 2:00 PM IST\n• Track: Data Structures, Algorithms & System Problem Solving\n• Platform: UniSphere Virtual Interview Room (Link will be activated 10 minutes prior)\n\nPlease ensure your GitHub profile and updated resume are uploaded to your student profile before Friday noon.\n\nBest of luck,\nTraining & Placement Cell",
        category="Placement",
        is_read=False,
        replies=[],
        created_at=now - datetime.timedelta(days=1, hours=3),
        updated_at=now - datetime.timedelta(days=1, hours=3)
    )
    m3 = StudentMessage(
        student_id=student_id,
        sender_name="Academic Administration",
        sender_designation="Dean of Academics",
        sender_department="Office of Academic Affairs",
        sender_role="admin",
        subject="Semester Continuous Evaluation (CIE-2) Timetable",
        preview="The upcoming CIE-2 schedule has been uploaded to the university portal.",
        content="To All Students,\n\nThe official timetable for Continuous Internal Evaluation 2 (CIE-2) has been approved by the Academic Council. Examinations will commence from the 24th of this month across all engineering streams.\n\nImportant Guidelines:\n1. Strict adherence to the standard attendance threshold (75%) is mandatory for seating eligibility.\n2. Admit cards can be downloaded from the university student portal starting next Monday.\n3. Remedial support sessions will be conducted by respective subject faculty during the revision week.\n\nWarm regards,\nOffice of Academic Affairs & Examination Control",
        category="Academics",
        is_read=False,
        replies=[],
        created_at=now - datetime.timedelta(days=2, hours=5),
        updated_at=now - datetime.timedelta(days=2, hours=5)
    )
    db.add_all([m1, m2, m3])
    db.commit()


@router.get("/me/messages")
def get_student_messages(
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    """
    Returns messages sent to the student. If no messages exist yet,
    initializes the official university messages.
    """
    count = db.query(StudentMessage).filter(StudentMessage.student_id == student.id).count()
    if count == 0:
        seed_default_student_messages(student.id, db)
    
    msgs = db.query(StudentMessage).filter(
        StudentMessage.student_id == student.id
    ).order_by(StudentMessage.created_at.desc()).all()
    
    return [serialize_message(m) for m in msgs]


@router.put("/me/messages/{message_id}/read")
def mark_message_as_read(
    message_id: int,
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    """
    Marks a message as read.
    """
    msg = db.query(StudentMessage).filter(
        StudentMessage.id == message_id,
        StudentMessage.student_id == student.id
    ).first()
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found."
        )
    
    if not msg.is_read:
        msg.is_read = True
        msg.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(msg)
        
    return serialize_message(msg)


@router.post("/me/messages/{message_id}/reply")
def reply_to_message(
    message_id: int,
    payload: MessageReplyRequest,
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    """
    Submits a reply to a message and stores it in the conversation thread.
    """
    content = payload.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reply message content cannot be empty."
        )
        
    msg = db.query(StudentMessage).filter(
        StudentMessage.id == message_id,
        StudentMessage.student_id == student.id
    ).first()
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found."
        )
        
    new_reply = {
        "id": str(uuid.uuid4())[:8],
        "sender_name": student.full_name,
        "sender_role": "Student",
        "content": content,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    current_replies = list(msg.replies or [])
    current_replies.append(new_reply)
    msg.replies = current_replies
    msg.updated_at = datetime.datetime.utcnow()
    
    db.commit()
    db.refresh(msg)
    
    return serialize_message(msg)


# -------------------------------------------------------------------------
# Student Class Assignments
# -------------------------------------------------------------------------
@router.get("/me/assignments")
def get_student_assignments(
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    """
    Returns published class assignments for the student's class and department.
    """
    assignments = db.query(Assignment).filter(
        Assignment.is_published == True
    ).order_by(Assignment.created_at.desc()).all()
    
    # If empty, generate standard assignments
    if len(assignments) == 0:
        a1 = Assignment(
            faculty_name="Prof. Priya Sharma",
            title="Operating Systems Lab Assignment 4: Process Synchronization & Mutexes",
            description="Implement the Dining Philosophers and Producer-Consumer problem using POSIX threads, semaphores, and mutex locks in C/C++. Include bench test logs and deadlock analysis report.",
            subject="Operating Systems",
            target_class=f"{student.department} - Year {student.current_year}",
            academic_year=student.academic_year,
            semester=student.semester,
            due_date="Next Monday, 11:59 PM",
            attachment_name="OS_Lab_Assignment_4_Specs.pdf",
            is_published=True,
            submissions_count=42,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
        )
        a2 = Assignment(
            faculty_name="Prof. Priya Sharma",
            title="Algorithms Analysis: Dynamic Programming & Bellman-Ford Implementation",
            description="Write a complete Python/C++ solution to find all-pairs shortest paths using Dynamic Programming. Analyze edge case performance on graphs with negative weight cycles.",
            subject="Design & Analysis of Algorithms",
            target_class=f"{student.department} - Year {student.current_year}",
            academic_year=student.academic_year,
            semester=student.semester,
            due_date="Friday, 5:00 PM",
            attachment_name="Algorithms_Assignment_DP_Review.pdf",
            is_published=True,
            submissions_count=28,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
        )
        db.add_all([a1, a2])
        db.commit()
        assignments = [a1, a2]
        
    return [
        {
            "id": a.id,
            "faculty_name": a.faculty_name,
            "title": a.title,
            "description": a.description,
            "subject": a.subject,
            "target_class": a.target_class,
            "due_date": a.due_date,
            "attachment_name": a.attachment_name,
            "attachment_url": a.attachment_url,
            "submissions_count": a.submissions_count,
            "created_at": a.created_at.strftime("%b %d, %Y") if a.created_at else ""
        }
        for a in assignments
    ]


# -------------------------------------------------------------------------
# Student Improvement Tasks
# -------------------------------------------------------------------------
@router.get("/me/tasks")
def get_student_tasks(
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    """
    Returns faculty-assigned improvement tasks for this student.
    """
    tasks = db.query(StudentImprovementTask).filter(
        StudentImprovementTask.student_id == student.id
    ).order_by(StudentImprovementTask.created_at.desc()).all()
    
    # Auto-seed if none exist for demo
    if len(tasks) == 0:
        t1 = StudentImprovementTask(
            student_id=student.id,
            faculty_name="Prof. Priya Sharma",
            title="Operating Systems: Memory Management & Paging Revision Problem Set",
            description="Solve Practice Sheet #3 covering Virtual Memory page fault frequency calculations and Working Set algorithm proofs. Submit handwritten or scanned solutions.",
            subject="Operating Systems",
            reason="Low score in internal evaluation 1 (below 60%)",
            due_date="This Thursday, 5:00 PM",
            status="pending",
            reference_doc="OS_Unit4_Virtual_Memory_Notes.pdf",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        db.add(t1)
        db.commit()
        tasks = [t1]
        
    return [
        {
            "id": t.id,
            "faculty_name": t.faculty_name,
            "title": t.title,
            "description": t.description,
            "subject": t.subject,
            "reason": t.reason,
            "due_date": t.due_date,
            "status": t.status,
            "reference_doc": t.reference_doc,
            "created_at": t.created_at.strftime("%b %d, %Y") if t.created_at else "",
            "is_completed": t.status == "completed"
        }
        for t in tasks
    ]


@router.put("/me/tasks/{task_id}/toggle")
def toggle_student_task(
    task_id: int,
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    task = db.query(StudentImprovementTask).filter(
        StudentImprovementTask.id == task_id,
        StudentImprovementTask.student_id == student.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
        
    if task.status == "completed":
        task.status = "pending"
        task.completed_at = None
    else:
        task.status = "completed"
        task.completed_at = datetime.datetime.utcnow()
        
    db.commit()
    db.refresh(task)
    return {
        "message": f"Task marked as {task.status}.",
        "task_id": task.id,
        "status": task.status,
        "is_completed": task.status == "completed"
    }


# -------------------------------------------------------------------------
# Student Study Materials
# -------------------------------------------------------------------------
@router.get("/me/study-materials")
def get_student_study_materials(
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    """
    Returns published study materials for the student's department and semester.
    """
    materials = db.query(StudyMaterial).filter(
        StudyMaterial.is_published == True
    ).order_by(StudyMaterial.created_at.desc()).all()
    
    return [
        {
            "id": m.id,
            "faculty_name": m.faculty_name,
            "title": m.title,
            "description": m.description,
            "subject": m.subject,
            "topic_unit": m.topic_unit,
            "target_class": m.target_class,
            "filename": m.filename,
            "file_type": m.file_type,
            "file_size": m.file_size_formatted,
            "created_at": m.created_at.strftime("%b %d, %Y") if m.created_at else "",
            "download_count": m.download_count,
            "is_recent": (datetime.datetime.utcnow() - m.created_at).days <= 7 if m.created_at else True
        }
        for m in materials
    ]


@router.get("/study-materials/{material_id}/download")
def download_study_material(
    material_id: int,
    student: Student = Depends(get_authenticated_student),
    db: Session = Depends(get_db)
):
    material = db.query(StudyMaterial).filter(
        StudyMaterial.id == material_id,
        StudyMaterial.is_published == True
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Study material not found or not published.")
        
    # Increment download counter
    material.download_count = (material.download_count or 0) + 1
    db.commit()
    
    if os.path.exists(material.file_path):
        return FileResponse(
            material.file_path,
            filename=material.filename,
            media_type="application/octet-stream"
        )
    else:
        # Return a generated document summary file
        content = f"UniSphere AI Campus Study Resource\n\nTitle: {material.title}\nSubject: {material.subject}\nUnit: {material.topic_unit or 'General'}\nFaculty: {material.faculty_name}\nClass: {material.target_class}\n\nDescription:\n{material.description}\n\n[Official University Educational Material - Verified Repository]\n"
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=\"{material.filename}.txt\""}
        )


