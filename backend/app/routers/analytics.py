from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from ..database import get_db
from ..models import Student, Department, User
from ..security import require_roles
from ..services.segmentation import run_ml_clustering

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    query = db.query(Student).filter(Student.enrollment_status == "active")
    if department and department != "all":
        query = query.filter(Student.department == department)
        
    students = query.all()
    
    # Distribution brackets
    brackets = {
        "0-40 (Critical)": 0,
        "41-60 (Needs Support)": 0,
        "61-75 (Moderate)": 0,
        "76-85 (Proficient)": 0,
        "86-100 (Exemplary)": 0
    }
    
    for s in students:
        score = s.success_score or 0
        if score <= 40:
            brackets["0-40 (Critical)"] += 1
        elif score <= 60:
            brackets["41-60 (Needs Support)"] += 1
        elif score <= 75:
            brackets["61-75 (Moderate)"] += 1
        elif score <= 85:
            brackets["76-85 (Proficient)"] += 1
        else:
            brackets["86-100 (Exemplary)"] += 1
            
    distribution = [{"range": k, "count": v} for k, v in brackets.items()]
    
    # Combined Risk counts
    risk_summary = {
        "High": sum(1 for s in students if s.combined_risk == "High"),
        "Moderate": sum(1 for s in students if s.combined_risk == "Moderate"),
        "Low": sum(1 for s in students if s.combined_risk == "Low"),
        "Insufficient data": sum(1 for s in students if s.combined_risk == "Insufficient data")
    }
    
    return {
        "total_analyzed": len(students),
        "score_distribution": distribution,
        "risk_summary": [{"level": k, "count": v} for k, v in risk_summary.items()]
    }

@router.get("/risk-by-department")
def get_risk_by_department(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    depts = db.query(
        Student.department,
        func.count(Student.id).label("total"),
        func.sum(case((Student.academic_risk == 'High', 1), else_=0)).label("academic_high"),
        func.sum(case((Student.placement_risk == 'High', 1), else_=0)).label("placement_high"),
        func.sum(case((Student.combined_risk == 'High', 1), else_=0)).label("combined_high"),
        func.avg(Student.success_score).label("avg_score")
    ).filter(Student.enrollment_status == "active").group_by(Student.department).all()
    
    results = []
    for dept, total, acad_high, place_high, comb_high, avg_score in depts:
        results.append({
            "department": dept,
            "total_students": total,
            "academic_high_risk": acad_high or 0,
            "placement_high_risk": place_high or 0,
            "combined_high_risk": comb_high or 0,
            "average_success_score": round(float(avg_score or 0), 1),
            "high_risk_rate": round(((comb_high or 0) / total * 100.0), 1) if total > 0 else 0
        })
        
    return results

@router.get("/placement-by-department")
def get_placement_by_department(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    depts = db.query(
        Student.department,
        func.avg(Student.coding_score).label("avg_coding"),
        func.avg(Student.aptitude_score).label("avg_aptitude"),
        func.avg(Student.mock_interview_score).label("avg_interview"),
        func.avg(Student.placement_score).label("avg_placement")
    ).filter(Student.enrollment_status == "active").group_by(Student.department).all()
    
    return [
        {
            "department": d,
            "avg_coding": round(float(c or 0), 1),
            "avg_aptitude": round(float(a or 0), 1),
            "avg_interview": round(float(i or 0), 1),
            "avg_placement_overall": round(float(p or 0), 1)
        }
        for d, c, a, i, p in depts
    ]

@router.get("/attendance-trends")
def get_attendance_trends(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    students = db.query(Student).filter(Student.enrollment_status == "active").all()
    
    brackets = {
        "< 65% (Severe Deficit)": 0,
        "65% - 74.9% (Warning)": 0,
        "75% - 84.9% (Satisfactory)": 0,
        "85% - 100% (Excellent)": 0
    }
    
    for s in students:
        att = s.overall_attendance or 0
        if att < 65:
            brackets["< 65% (Severe Deficit)"] += 1
        elif att < 75:
            brackets["65% - 74.9% (Warning)"] += 1
        elif att < 85:
            brackets["75% - 84.9% (Satisfactory)"] += 1
        else:
            brackets["85% - 100% (Excellent)"] += 1
            
    return [{"bracket": k, "count": v} for k, v in brackets.items()]

@router.get("/academic-vs-placement")
def get_academic_vs_placement_quadrant(
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    query = db.query(Student).filter(Student.enrollment_status == "active")
    if department and department != "all":
        query = query.filter(Student.department == department)
        
    students = query.limit(200).all() # Sample for quadrant visualization
    
    points = []
    for s in students:
        points.append({
            "student_id": s.student_id,
            "name": s.full_name,
            "department": s.department,
            "academic_score": s.academic_score or 50.0,
            "placement_score": s.placement_score or 50.0,
            "success_score": s.success_score or 50.0,
            "combined_risk": s.combined_risk,
            "segment": s.segment
        })
        
    return points

@router.get("/segmentation")
def get_student_segmentation(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    students = db.query(Student).filter(Student.enrollment_status == "active").all()
    
    # 1. Rule-based segmentation counts
    seg_counts: Dict[str, int] = {}
    for s in students:
        seg = s.segment or "Insufficient Data"
        seg_counts[seg] = seg_counts.get(seg, 0) + 1
        
    rule_based = [
        {
            "segment": k,
            "count": v,
            "percentage": round((v / len(students)) * 100.0, 1) if students else 0
        }
        for k, v in seg_counts.items()
    ]
    
    # 2. Scikit-learn ML Clustering
    s_dicts = [
        {
            "academic_score": s.academic_score,
            "attendance_score": s.attendance_score,
            "lms_score": s.lms_score,
            "placement_score": s.placement_score,
            "skills_score": s.skills_score
        }
        for s in students
    ]
    
    ml_results = run_ml_clustering(s_dicts, n_clusters=4)
    
    return {
        "total_students": len(students),
        "rule_based_segments": rule_based,
        "machine_learning_clusters": ml_results
    }
