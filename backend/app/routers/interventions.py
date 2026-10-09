from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from ..database import get_db
from ..models import Intervention, InterventionUpdate, Student, Faculty, User, AuditLog
from ..schemas import (
    InterventionCreate, InterventionResponse,
    InterventionStatusUpdate, InterventionUpdateCreate,
    InterventionUpdateResponse
)
from ..security import require_roles, get_current_user

router = APIRouter(prefix="/api/interventions", tags=["Interventions"])

@router.get("", response_model=List[InterventionResponse])
def list_interventions(
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    department: Optional[str] = None,
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    query = db.query(Intervention).join(Student)
    
    if status and status != "all":
        query = query.filter(Intervention.status == status)
    if category and category != "all":
        query = query.filter(Intervention.category == category)
    if priority and priority != "all":
        query = query.filter(Intervention.priority == priority)
    if department and department != "all":
        query = query.filter(Student.department == department)
    if student_id:
        query = query.filter(Intervention.student_id == student_id)
        
    interventions = query.order_by(desc(Intervention.created_at)).all()
    
    response = []
    for it in interventions:
        response.append({
            "id": it.id,
            "student_id": it.student_id,
            "faculty_id": it.faculty_id,
            "category": it.category,
            "priority": it.priority,
            "status": it.status,
            "title": it.title,
            "description": it.description,
            "due_date": it.due_date,
            "outcome_notes": it.outcome_notes,
            "impact_rating": it.impact_rating,
            "created_at": it.created_at,
            "updated_at": it.updated_at,
            "student_name": it.student.full_name if it.student else "Unknown",
            "student_roll": it.student.student_id if it.student else "Unknown",
            "department": it.student.department if it.student else "Unknown",
            "faculty_name": it.faculty.full_name if it.faculty else "Unassigned",
            "updates": it.updates
        })
        
    return response

@router.get("/stats")
def get_intervention_stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    all_int = db.query(Intervention).all()
    
    open_cases = sum(1 for i in all_int if i.status in ["pending", "in_progress"])
    now = datetime.utcnow()
    overdue = sum(1 for i in all_int if i.status in ["pending", "in_progress"] and i.due_date and i.due_date < now)
    completed = sum(1 for i in all_int if i.status == "completed")
    
    cat_counts: Dict[str, int] = {}
    for i in all_int:
        c = i.category
        cat_counts[c] = cat_counts.get(c, 0) + 1
        
    return {
        "total_cases": len(all_int),
        "open_cases": open_cases,
        "overdue_cases": overdue,
        "completed_cases": completed,
        "by_category": [{"category": k, "count": v} for k, v in cat_counts.items()]
    }

@router.get("/{intervention_id}", response_model=InterventionResponse)
def get_intervention_detail(
    intervention_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    it = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    return {
        "id": it.id,
        "student_id": it.student_id,
        "faculty_id": it.faculty_id,
        "category": it.category,
        "priority": it.priority,
        "status": it.status,
        "title": it.title,
        "description": it.description,
        "due_date": it.due_date,
        "outcome_notes": it.outcome_notes,
        "impact_rating": it.impact_rating,
        "created_at": it.created_at,
        "updated_at": it.updated_at,
        "student_name": it.student.full_name if it.student else "Unknown",
        "student_roll": it.student.student_id if it.student else "Unknown",
        "department": it.student.department if it.student else "Unknown",
        "faculty_name": it.faculty.full_name if it.faculty else "Unassigned",
        "updates": it.updates
    }

@router.post("", response_model=InterventionResponse)
def create_intervention(
    req: InterventionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # If faculty creates, default faculty_id to their own if not explicitly specified
    fac_id = req.faculty_id
    if user.role == "faculty" and not fac_id:
        if user.faculty_profile:
            fac_id = user.faculty_profile.id
            
    it = Intervention(
        student_id=req.student_id,
        faculty_id=fac_id,
        category=req.category,
        priority=req.priority,
        status=req.status,
        title=req.title,
        description=req.description,
        due_date=req.due_date or (datetime.utcnow() + datetime.timedelta(days=7))
    )
    db.add(it)
    db.commit()
    db.refresh(it)
    
    # Initial creation log entry
    author_name = user.faculty_profile.full_name if user.faculty_profile else user.username.title()
    init_update = InterventionUpdate(
        intervention_id=it.id,
        author_name=author_name,
        notes=f"Intervention created with priority '{req.priority}'."
    )
    db.add(init_update)
    db.commit()
    
    return {
        "id": it.id,
        "student_id": it.student_id,
        "faculty_id": it.faculty_id,
        "category": it.category,
        "priority": it.priority,
        "status": it.status,
        "title": it.title,
        "description": it.description,
        "due_date": it.due_date,
        "outcome_notes": it.outcome_notes,
        "impact_rating": it.impact_rating,
        "created_at": it.created_at,
        "updated_at": it.updated_at,
        "student_name": student.full_name,
        "student_roll": student.student_id,
        "department": student.department,
        "faculty_name": it.faculty.full_name if it.faculty else "Unassigned",
        "updates": [init_update]
    }

@router.patch("/{intervention_id}/status")
def update_intervention_status(
    intervention_id: int,
    req: InterventionStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    it = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    author_name = user.faculty_profile.full_name if user.faculty_profile else user.username.title()
    notes = req.note or f"Status changed to {req.status}"
    
    if req.status:
        it.status = req.status
    if req.outcome_notes:
        it.outcome_notes = req.outcome_notes
    if req.impact_rating:
        it.impact_rating = req.impact_rating
        
    it.updated_at = datetime.utcnow()
    
    update = InterventionUpdate(
        intervention_id=it.id,
        author_name=author_name,
        notes=notes
    )
    db.add(update)
    db.commit()
    return {"status": "success", "message": "Intervention updated successfully"}

@router.post("/{intervention_id}/updates")
def add_intervention_timeline_update(
    intervention_id: int,
    req: InterventionUpdateCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    it = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not it:
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    author_name = user.faculty_profile.full_name if user.faculty_profile else user.username.title()
    update = InterventionUpdate(
        intervention_id=it.id,
        author_name=author_name,
        notes=req.notes
    )
    db.add(update)
    it.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(update)
    return update
