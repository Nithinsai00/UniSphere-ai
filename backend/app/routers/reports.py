import csv
import io
import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models import Student, Faculty, Department, User, GeneratedReport
from ..security import require_roles

router = APIRouter(prefix="/api/reports", tags=["Reports"])

# -------------------------------------------------------------------------
# Request Schema for Report Generation
# -------------------------------------------------------------------------
class ReportGenerateRequest(BaseModel):
    report_type: str # student_success_score, at_risk_students, attendance, academic_performance, lms_engagement, placement_readiness, department_performance, comprehensive_analytics
    department: Optional[str] = "all"
    academic_year: Optional[str] = "all"
    risk_level: Optional[str] = "all"
    start_date: Optional[str] = None
    end_date: Optional[str] = None

# Report Title & Category Lookup
REPORT_METADATA: Dict[str, Dict[str, str]] = {
    "student_success_score": {
        "title": "Student Success Score Report",
        "category": "Success Analytics",
        "desc": "Calculated multi-factor student success index scores and segment classification."
    },
    "at_risk_students": {
        "title": "At-Risk Students Report",
        "category": "Risk Analysis",
        "desc": "Diagnostic flags identifying learners vulnerable to academic failure or attendance shortages."
    },
    "attendance": {
        "title": "Attendance & LMS Compliance Report",
        "category": "Attendance",
        "desc": "Lecture attendance records, university 75% threshold compliance, and shortage warnings."
    },
    "academic_performance": {
        "title": "Academic Performance & Backlogs Report",
        "category": "Academics",
        "desc": "Cumulative grade point averages (CGPA), continuous evaluation marks, and backlog tracking."
    },
    "lms_engagement": {
        "title": "LMS Engagement & Assignment Report",
        "category": "Engagement",
        "desc": "Digital learning engagement metrics and assignment submission fulfillment rates."
    },
    "placement_readiness": {
        "title": "Placement Readiness & Skills Report",
        "category": "Placement & Career",
        "desc": "Technical coding assessments, quantitative aptitude scores, and mock interview performance."
    },
    "department_performance": {
        "title": "Department Performance Benchmark Report",
        "category": "Institutional KPIs",
        "desc": "Comparative institutional performance KPIs aggregated across academic branches."
    },
    "comprehensive_analytics": {
        "title": "Comprehensive College Analytics Report",
        "category": "Comprehensive",
        "desc": "Master audit data covering all academic, attendance, placement, and predictive risk indicators."
    }
}

# -------------------------------------------------------------------------
# 1. Executive Summary Cards & Department KPIs
# -------------------------------------------------------------------------
@router.get("/summary")
def get_reports_summary(
    department: Optional[str] = None,
    academic_year: Optional[str] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    query = db.query(Student).filter(Student.enrollment_status == "active")
    if department and department != "all":
        query = query.filter(Student.department == department)
    if academic_year and academic_year != "all":
        query = query.filter(Student.academic_year == academic_year)
    if semester:
        query = query.filter(Student.semester == semester)
        
    students = query.all()
    total = len(students)
    
    total_faculty = db.query(Faculty).filter(Faculty.is_active == True).count()
    dept_count = db.query(Department).count() or 5
    
    if total == 0:
        return {
            "summary_cards": {
                "total_students": 0,
                "avg_success_score": 0.0,
                "avg_attendance": 0.0,
                "at_risk_count": 0,
                "avg_cgpa": 0.0,
                "placement_readiness": "0%"
            },
            "department_performance": [],
            "charts_data": {"cgpa_by_dept": [], "attendance_by_dept": [], "risk_distribution": []},
            "at_risk_summary": []
        }
        
    avg_cgpa = sum((s.cgpa or 0) for s in students if s.cgpa is not None) / max(1, sum(1 for s in students if s.cgpa is not None))
    avg_attendance = sum((s.overall_attendance or 0) for s in students if s.overall_attendance is not None) / max(1, sum(1 for s in students if s.overall_attendance is not None))
    avg_score = sum((s.success_score or 0) for s in students if s.success_score is not None) / max(1, sum(1 for s in students if s.success_score is not None))
    at_risk_count = sum(1 for s in students if s.combined_risk in ["High", "Moderate"])
    
    ready_count = sum(1 for s in students if (s.coding_score or 0) >= 60 and (s.aptitude_score or 0) >= 60)
    placement_readiness_pct = round((ready_count / total) * 100.0, 1)
    
    # Department-wise breakdown
    all_depts = db.query(Department.name).all()
    dept_names = [d[0] for d in all_depts] if all_depts else list(set(s.department for s in students))
    
    dept_performance = []
    cgpa_by_dept = []
    attendance_by_dept = []
    placement_by_dept = []
    
    for dname in dept_names:
        d_students = [s for s in students if s.department == dname]
        d_total = len(d_students)
        if d_total > 0:
            d_cgpa = round(sum((s.cgpa or 0) for s in d_students) / d_total, 2)
            d_att = round(sum((s.overall_attendance or 0) for s in d_students) / d_total, 1)
            d_risk = sum(1 for s in d_students if s.combined_risk in ["High", "Moderate"])
            d_ready = round((sum(1 for s in d_students if (s.coding_score or 0) >= 60 and (s.aptitude_score or 0) >= 60) / d_total) * 100, 1)
            
            dept_performance.append({
                "department": dname,
                "total_students": d_total,
                "avg_cgpa": d_cgpa,
                "avg_attendance": f"{d_att}%",
                "at_risk_count": d_risk,
                "at_risk_pct": f"{round((d_risk / d_total) * 100, 1)}%",
                "placement_readiness": f"{d_ready}%"
            })
            
            short_name = dname.replace("Department of ", "").replace("Engineering", "Eng.").replace("Computer Science & Eng.", "CSE")
            cgpa_by_dept.append({"department": short_name, "avg_cgpa": d_cgpa})
            attendance_by_dept.append({"department": short_name, "avg_attendance": d_att})
            placement_by_dept.append({"department": short_name, "readiness_pct": d_ready})
            
    # Risk Distribution
    high_risk = sum(1 for s in students if s.combined_risk == "High")
    mod_risk = sum(1 for s in students if s.combined_risk == "Moderate")
    low_risk = sum(1 for s in students if s.combined_risk == "Low" or s.combined_risk is None)
    
    risk_distribution = [
        {"name": "Low Risk", "value": low_risk, "color": "#10B981"},
        {"name": "Moderate Risk", "value": mod_risk, "color": "#F59E0B"},
        {"name": "High Risk", "value": high_risk, "color": "#EF4444"}
    ]
    
    # At-risk students summary list with evidence
    at_risk_records = [s for s in students if s.combined_risk in ["High", "Moderate"]]
    at_risk_records.sort(key=lambda s: (0 if s.combined_risk == "High" else 1, s.success_score or 0))
    
    at_risk_summary = []
    for s in at_risk_records[:10]:
        reasons = []
        if (s.overall_attendance or 100) < 75:
            reasons.append(f"Attendance {round(s.overall_attendance)}%")
        if (s.cgpa or 10) < 6.0:
            reasons.append(f"CGPA {s.cgpa}")
        if (s.coding_score or 100) < 60:
            reasons.append(f"Coding readiness low ({round(s.coding_score)}%)")
            
        at_risk_summary.append({
            "id": s.id,
            "student_id": s.student_id,
            "name": s.full_name,
            "department": s.department,
            "year": f"Year {s.current_year}",
            "risk_level": s.combined_risk or "Moderate",
            "attendance": f"{round(s.overall_attendance or 0)}%",
            "cgpa": f"{s.cgpa or 0}",
            "score": round(s.success_score or 0),
            "evidence": ", ".join(reasons) or "Multi-metric risk",
            "recommended_action": "Mentoring check-in" if (s.overall_attendance or 100) >= 75 else "Attendance shortage warning"
        })

    return {
        "summary_cards": {
            "total_students": total,
            "avg_success_score": round(avg_score, 1),
            "avg_attendance": round(avg_attendance, 1),
            "at_risk_count": at_risk_count,
            "avg_cgpa": round(avg_cgpa, 2),
            "placement_readiness": f"{placement_readiness_pct}%"
        },
        "department_performance": dept_performance,
        "charts_data": {
            "cgpa_by_dept": cgpa_by_dept,
            "attendance_by_dept": attendance_by_dept,
            "risk_distribution": risk_distribution,
            "placement_by_dept": placement_by_dept
        },
        "at_risk_summary": at_risk_summary
    }

# -------------------------------------------------------------------------
# 2. Dynamic Report Generation Engine
# -------------------------------------------------------------------------
@router.post("/generate")
def generate_report(
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    rtype = payload.report_type.strip().lower()
    meta = REPORT_METADATA.get(rtype)
    if not meta:
        # Default fallback
        rtype = "student_success_score"
        meta = REPORT_METADATA["student_success_score"]
        
    query = db.query(Student).filter(Student.enrollment_status == "active")
    
    if payload.department and payload.department != "all":
        query = query.filter(Student.department == payload.department)
    if payload.academic_year and payload.academic_year != "all":
        query = query.filter(Student.academic_year == payload.academic_year)
    if payload.risk_level and payload.risk_level != "all":
        query = query.filter(Student.combined_risk == payload.risk_level)
        
    students = query.all()
    
    # Build report columns and rows based on report_type
    columns: List[str] = []
    rows: List[List[Any]] = []
    summary_metrics: Dict[str, Any] = {}
    
    if rtype == "student_success_score":
        columns = [
            "Student ID", "Full Name", "Department", "Academic Year",
            "Success Score", "Academic Risk", "Placement Risk", "Combined Risk", "Segment"
        ]
        for s in students:
            rows.append([
                s.student_id,
                s.full_name,
                s.department,
                s.academic_year or "2025-2026",
                round(s.success_score or 0, 1),
                s.academic_risk or "Low",
                s.placement_risk or "Low",
                s.combined_risk or "Low",
                s.segment or "On Track"
            ])
        avg_score = round(sum((s.success_score or 0) for s in students) / max(1, len(students)), 1)
        summary_metrics = {
            "Total Students Evaluated": len(students),
            "Cohort Average Score": f"{avg_score}/100",
            "High Performers (Score ≥ 80)": sum(1 for s in students if (s.success_score or 0) >= 80),
            "Critical Support Needed": sum(1 for s in students if (s.success_score or 0) < 50)
        }
        
    elif rtype == "at_risk_students":
        columns = [
            "Student ID", "Full Name", "Department", "Current Year",
            "Attendance %", "CGPA", "Backlogs", "Coding Score", "Risk Tier", "Diagnostic Triggers"
        ]
        # Filter for at-risk if not already filtered
        target_students = [s for s in students if s.combined_risk in ["High", "Moderate"]]
        if payload.risk_level and payload.risk_level != "all":
            target_students = [s for s in students if s.combined_risk == payload.risk_level]
            
        for s in target_students:
            triggers = []
            if (s.overall_attendance or 100) < 75: triggers.append(f"Low Attendance ({round(s.overall_attendance)}%)")
            if (s.cgpa or 10) < 6.0: triggers.append(f"Low CGPA ({s.cgpa})")
            if (s.backlog_count or 0) > 0: triggers.append(f"{s.backlog_count} Backlogs")
            if (s.coding_score or 100) < 60: triggers.append(f"Low Coding ({round(s.coding_score)}%)")
            rows.append([
                s.student_id,
                s.full_name,
                s.department,
                f"Year {s.current_year}",
                f"{round(s.overall_attendance or 0)}%",
                s.cgpa or 0.0,
                s.backlog_count or 0,
                f"{round(s.coding_score or 0)}%",
                s.combined_risk or "Moderate",
                ", ".join(triggers) or "Multi-metric risk"
            ])
        summary_metrics = {
            "Total Flagged Students": len(target_students),
            "High Risk Count": sum(1 for s in target_students if s.combined_risk == "High"),
            "Moderate Risk Count": sum(1 for s in target_students if s.combined_risk == "Moderate"),
            "Attendance Shortages (< 75%)": sum(1 for s in target_students if (s.overall_attendance or 100) < 75)
        }
        
    elif rtype == "attendance":
        columns = [
            "Student ID", "Full Name", "Department", "Current Year", "Semester",
            "Attendance Rate", "University Threshold (75%)", "Exam Eligibility", "Attendance Status"
        ]
        for s in students:
            att = round(s.overall_attendance or 0, 1)
            is_eligible = att >= 75.0
            rows.append([
                s.student_id,
                s.full_name,
                s.department,
                f"Year {s.current_year}",
                f"Sem {s.semester}",
                f"{att}%",
                "75.0%",
                "Eligible" if is_eligible else "Shortage Warning",
                "Good Standing" if att >= 85 else "Satisfactory" if is_eligible else "Critical Shortage"
            ])
        avg_att = round(sum((s.overall_attendance or 0) for s in students) / max(1, len(students)), 1)
        shortage_count = sum(1 for s in students if (s.overall_attendance or 100) < 75)
        summary_metrics = {
            "Total Students Audited": len(students),
            "Cohort Average Attendance": f"{avg_att}%",
            "Below 75% Threshold": shortage_count,
            "Compliance Rate": f"{round(((len(students) - shortage_count) / max(1, len(students))) * 100, 1)}%"
        }
        
    elif rtype == "academic_performance":
        columns = [
            "Student ID", "Full Name", "Department", "Current Year",
            "CGPA", "Internal Marks (100)", "Pending Backlogs", "Academic Risk Level"
        ]
        for s in students:
            rows.append([
                s.student_id,
                s.full_name,
                s.department,
                f"Year {s.current_year}",
                s.cgpa or 0.0,
                round(s.internal_marks or 0, 1),
                s.backlog_count or 0,
                s.academic_risk or "Low"
            ])
        avg_cgpa = round(sum((s.cgpa or 0) for s in students) / max(1, len(students)), 2)
        total_backlogs = sum((s.backlog_count or 0) for s in students)
        summary_metrics = {
            "Total Students Reviewed": len(students),
            "Average CGPA": f"{avg_cgpa}/10.0",
            "Total Active Backlogs": total_backlogs,
            "Students with Zero Backlogs": sum(1 for s in students if (s.backlog_count or 0) == 0)
        }
        
    elif rtype == "lms_engagement":
        columns = [
            "Student ID", "Full Name", "Department", "Assignment Completion %",
            "Attendance %", "Internal Marks", "Engagement Tier"
        ]
        for s in students:
            comp = round(s.assignment_completion_rate or 75.0, 1)
            tier = "High Engagement" if comp >= 85 else "Moderate Engagement" if comp >= 65 else "Low Engagement"
            rows.append([
                s.student_id,
                s.full_name,
                s.department,
                f"{comp}%",
                f"{round(s.overall_attendance or 0)}%",
                round(s.internal_marks or 0, 1),
                tier
            ])
        avg_comp = round(sum((s.assignment_completion_rate or 75.0) for s in students) / max(1, len(students)), 1)
        summary_metrics = {
            "Total LMS Accounts Monitored": len(students),
            "Avg Assignment Completion": f"{avg_comp}%",
            "Active Learners (≥ 80%)": sum(1 for s in students if (s.assignment_completion_rate or 75.0) >= 80),
            "Low LMS Engagement (< 60%)": sum(1 for s in students if (s.assignment_completion_rate or 75.0) < 60)
        }
        
    elif rtype == "placement_readiness":
        columns = [
            "Student ID", "Full Name", "Department", "Current Year",
            "Coding DSA Score", "Aptitude Score", "Mock Interview", "Overall Readiness Score", "Placement Risk"
        ]
        for s in students:
            rows.append([
                s.student_id,
                s.full_name,
                s.department,
                f"Year {s.current_year}",
                f"{round(s.coding_score or 0)}%",
                f"{round(s.aptitude_score or 0)}%",
                f"{round(s.mock_interview_score or 0)}%",
                f"{round(s.placement_score or 0)}%",
                s.placement_risk or "Low"
            ])
        ready_count = sum(1 for s in students if (s.coding_score or 0) >= 60 and (s.aptitude_score or 0) >= 60)
        summary_metrics = {
            "Total Candidates Assessed": len(students),
            "Campus Placement Ready": f"{ready_count} ({round((ready_count / max(1, len(students))) * 100, 1)}%)",
            "Needs Coding Training": sum(1 for s in students if (s.coding_score or 100) < 60),
            "Needs Aptitude Training": sum(1 for s in students if (s.aptitude_score or 100) < 60)
        }
        
    elif rtype == "department_performance":
        columns = [
            "Department", "Total Students", "Average CGPA", "Average Attendance",
            "Placement Ready %", "At-Risk Count", "At-Risk %"
        ]
        depts = list(set(s.department for s in students))
        for d in depts:
            d_stus = [s for s in students if s.department == d]
            d_tot = len(d_stus)
            if d_tot > 0:
                d_cgpa = round(sum((s.cgpa or 0) for s in d_stus) / d_tot, 2)
                d_att = round(sum((s.overall_attendance or 0) for s in d_stus) / d_tot, 1)
                d_ready = round((sum(1 for s in d_stus if (s.coding_score or 0) >= 60 and (s.aptitude_score or 0) >= 60) / d_tot) * 100, 1)
                d_risk = sum(1 for s in d_stus if s.combined_risk in ["High", "Moderate"])
                rows.append([
                    d,
                    d_tot,
                    d_cgpa,
                    f"{d_att}%",
                    f"{d_ready}%",
                    d_risk,
                    f"{round((d_risk / d_tot) * 100, 1)}%"
                ])
        summary_metrics = {
            "Total Departments Audited": len(depts),
            "Overall Enrolled Cohort": len(students),
            "Top Placement Branch": max(rows, key=lambda r: float(r[4].replace("%", "")))[0] if rows else "N/A"
        }
        
    else: # comprehensive_analytics
        columns = [
            "Student ID", "Full Name", "Department", "Current Year", "Semester",
            "CGPA", "Internal Marks", "Backlogs", "Attendance %",
            "Coding Score", "Aptitude Score", "Success Score", "Combined Risk"
        ]
        for s in students:
            rows.append([
                s.student_id,
                s.full_name,
                s.department,
                f"Year {s.current_year}",
                f"Sem {s.semester}",
                s.cgpa or 0.0,
                round(s.internal_marks or 0, 1),
                s.backlog_count or 0,
                f"{round(s.overall_attendance or 0)}%",
                f"{round(s.coding_score or 0)}%",
                f"{round(s.aptitude_score or 0)}%",
                round(s.success_score or 0, 1),
                s.combined_risk or "Low"
            ])
        summary_metrics = {
            "Total Master Records": len(students),
            "Avg Success Score": f"{round(sum((s.success_score or 0) for s in students) / max(1, len(students)), 1)}/100",
            "Avg CGPA": round(sum((s.cgpa or 0) for s in students) / max(1, len(students)), 2),
            "At-Risk Count": sum(1 for s in students if s.combined_risk in ["High", "Moderate"])
        }

    # Record into GeneratedReport history table
    applied_filters = {
        "report_type": rtype,
        "department": payload.department or "all",
        "academic_year": payload.academic_year or "all",
        "risk_level": payload.risk_level or "all",
        "date_range": f"{payload.start_date or 'Start'} to {payload.end_date or 'Present'}" if payload.start_date else "Current Semester"
    }
    
    new_report = GeneratedReport(
        report_name=meta["title"],
        report_type=rtype,
        category=meta["category"],
        department=payload.department or "all",
        academic_year=payload.academic_year or "all",
        risk_level=payload.risk_level or "all",
        date_range=applied_filters["date_range"],
        filters_applied=applied_filters,
        summary_metrics=summary_metrics,
        status="Ready",
        file_format="CSV",
        generated_by=user.username.title() if hasattr(user, "username") else "Administrator",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return {
        "report_id": new_report.id,
        "report_title": meta["title"],
        "report_type": rtype,
        "category": meta["category"],
        "description": meta["desc"],
        "generated_at": new_report.created_at.strftime("%b %d, %Y • %I:%M %p"),
        "filters": applied_filters,
        "summary_metrics": summary_metrics,
        "columns": columns,
        "rows": rows,
        "total_records": len(rows)
    }

# -------------------------------------------------------------------------
# 3. Report History Listing
# -------------------------------------------------------------------------
@router.get("/history")
def get_report_history(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    count = db.query(GeneratedReport).count()
    if count == 0:
        # Seed realistic initial report history
        now = datetime.datetime.utcnow()
        seed_reports = [
            GeneratedReport(
                report_name="At-Risk Students Report",
                report_type="at_risk_students",
                category="Risk Analysis",
                department="all",
                academic_year="2025-2026",
                risk_level="High",
                date_range="Current Semester",
                filters_applied={"department": "all", "academic_year": "2025-2026", "risk_level": "High"},
                summary_metrics={"Total Flagged Students": 127, "High Risk Count": 127, "Attendance Shortages": 42},
                status="Ready",
                file_format="CSV",
                generated_by="Admin",
                created_at=now - datetime.timedelta(hours=2)
            ),
            GeneratedReport(
                report_name="Placement Readiness & Skills Report",
                report_type="placement_readiness",
                category="Placement & Career",
                department="Computer Science & Engineering",
                academic_year="2025-2026",
                risk_level="all",
                date_range="Current Semester",
                filters_applied={"department": "Computer Science & Engineering", "academic_year": "2025-2026", "risk_level": "all"},
                summary_metrics={"Total Candidates Assessed": 72, "Campus Placement Ready": "28 (38.9%)", "Needs Coding Training": 35},
                status="Ready",
                file_format="CSV",
                generated_by="Admin",
                created_at=now - datetime.timedelta(days=1, hours=3)
            ),
            GeneratedReport(
                report_name="Attendance & LMS Compliance Report",
                report_type="attendance",
                category="Attendance",
                department="all",
                academic_year="2025-2026",
                risk_level="all",
                date_range="Current Semester",
                filters_applied={"department": "all", "academic_year": "2025-2026", "risk_level": "all"},
                summary_metrics={"Total Students Audited": 360, "Cohort Average Attendance": "80.9%", "Below 75% Threshold": 56},
                status="Ready",
                file_format="CSV",
                generated_by="Admin",
                created_at=now - datetime.timedelta(days=2, hours=5)
            ),
            GeneratedReport(
                report_name="Comprehensive College Analytics Report",
                report_type="comprehensive_analytics",
                category="Comprehensive",
                department="all",
                academic_year="2025-2026",
                risk_level="all",
                date_range="Current Semester",
                filters_applied={"department": "all", "academic_year": "2025-2026", "risk_level": "all"},
                summary_metrics={"Total Master Records": 360, "Avg Success Score": "74.2/100", "Avg CGPA": 7.57},
                status="Ready",
                file_format="CSV",
                generated_by="Admin",
                created_at=now - datetime.timedelta(days=4)
            )
        ]
        db.add_all(seed_reports)
        db.commit()

    reports = db.query(GeneratedReport).order_by(desc(GeneratedReport.created_at)).limit(30).all()
    
    return [
        {
            "id": r.id,
            "report_name": r.report_name,
            "report_type": r.report_type,
            "category": r.category,
            "department": r.department,
            "academic_year": r.academic_year,
            "risk_level": r.risk_level,
            "date_range": r.date_range,
            "filters_applied": r.filters_applied,
            "summary_metrics": r.summary_metrics,
            "status": r.status,
            "file_format": r.file_format,
            "generated_by": r.generated_by,
            "created_at": r.created_at.strftime("%b %d, %Y • %I:%M %p") if r.created_at else "Recently",
            "timestamp_iso": r.created_at.isoformat() if r.created_at else None
        }
        for r in reports
    ]

# -------------------------------------------------------------------------
# 4. Delete Report From History
# -------------------------------------------------------------------------
@router.delete("/history/{report_id}")
def delete_report_from_history(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin"]))
):
    r = db.query(GeneratedReport).filter(GeneratedReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report record not found.")
    db.delete(r)
    db.commit()
    return {"message": "Report record removed from history."}

# -------------------------------------------------------------------------
# 5. Export Report Dataset to CSV
# -------------------------------------------------------------------------
@router.get("/export")
def export_report_csv(
    report_type: Optional[str] = "comprehensive_analytics",
    department: Optional[str] = "all",
    academic_year: Optional[str] = "all",
    risk_level: Optional[str] = "all",
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    rtype = (report_type or "comprehensive_analytics").strip().lower()
    meta = REPORT_METADATA.get(rtype, REPORT_METADATA["comprehensive_analytics"])
    
    query = db.query(Student).filter(Student.enrollment_status == "active")
    if department and department != "all":
        query = query.filter(Student.department == department)
    if academic_year and academic_year != "all":
        query = query.filter(Student.academic_year == academic_year)
    if risk_level and risk_level != "all":
        query = query.filter(Student.combined_risk == risk_level)
        
    students = query.all()
    
    stream = io.StringIO()
    writer = csv.writer(stream)
    
    date_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
    
    if rtype == "at_risk_students":
        target_students = [s for s in students if s.combined_risk in ["High", "Moderate"]]
        if risk_level and risk_level != "all":
            target_students = [s for s in students if s.combined_risk == risk_level]
            
        writer.writerow([
            "Student ID", "Full Name", "Department", "Current Year", "Semester",
            "Attendance %", "CGPA", "Backlogs", "Coding Score", "Risk Level", "Risk Reasons"
        ])
        for s in target_students:
            triggers = []
            if (s.overall_attendance or 100) < 75: triggers.append(f"Attendance {round(s.overall_attendance)}%")
            if (s.cgpa or 10) < 6.0: triggers.append(f"CGPA {s.cgpa}")
            if (s.backlog_count or 0) > 0: triggers.append(f"{s.backlog_count} Backlogs")
            if (s.coding_score or 100) < 60: triggers.append(f"Coding {round(s.coding_score)}%")
            writer.writerow([
                s.student_id, s.full_name, s.department, s.current_year, s.semester,
                round(s.overall_attendance or 0, 1), s.cgpa or "", s.backlog_count or 0,
                round(s.coding_score or 0, 1), s.combined_risk or "Moderate", "; ".join(triggers)
            ])
            
    elif rtype == "attendance":
        writer.writerow([
            "Student ID", "Full Name", "Department", "Year", "Semester",
            "Overall Attendance %", "Eligibility (< 75%)", "Status"
        ])
        for s in students:
            att = round(s.overall_attendance or 0, 1)
            writer.writerow([
                s.student_id, s.full_name, s.department, s.current_year, s.semester,
                att, "Eligible" if att >= 75.0 else "Shortage Warning",
                "Good" if att >= 85 else "Satisfactory" if att >= 75 else "Critical"
            ])
            
    elif rtype == "placement_readiness":
        writer.writerow([
            "Student ID", "Full Name", "Department", "Year",
            "Coding DSA Score", "Aptitude Score", "Mock Interview", "Placement Readiness Score", "Placement Risk"
        ])
        for s in students:
            writer.writerow([
                s.student_id, s.full_name, s.department, s.current_year,
                round(s.coding_score or 0, 1), round(s.aptitude_score or 0, 1),
                round(s.mock_interview_score or 0, 1), round(s.placement_score or 0, 1),
                s.placement_risk or "Low"
            ])
            
    else: # Comprehensive default
        writer.writerow([
            "Student ID", "Full Name", "Department", "Academic Year", "Current Year", "Semester",
            "CGPA", "Internal Marks", "Backlogs", "Attendance %",
            "Coding Score", "Aptitude Score", "Mock Interview Score",
            "Success Score", "Academic Risk", "Placement Risk", "Combined Risk", "Segment"
        ])
        for s in students:
            writer.writerow([
                s.student_id, s.full_name, s.department, s.academic_year or "2025-2026", s.current_year, s.semester,
                s.cgpa or "", s.internal_marks or "", s.backlog_count or 0, round(s.overall_attendance or 0, 1),
                round(s.coding_score or 0, 1), round(s.aptitude_score or 0, 1), round(s.mock_interview_score or 0, 1),
                round(s.success_score or 0, 1), s.academic_risk or "Low", s.placement_risk or "Low",
                s.combined_risk or "Low", s.segment or "On Track"
            ])
            
    filename = f"unisphere_{rtype}_report_{date_str}.csv"
    
    return PlainTextResponse(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# -------------------------------------------------------------------------
# 6. Legacy Export Route for Backward Compatibility
# -------------------------------------------------------------------------
@router.get("/export/students-csv")
def export_students_csv(
    department: Optional[str] = None,
    academic_year: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(["admin", "faculty"]))
):
    return export_report_csv(
        report_type="comprehensive_analytics",
        department=department,
        academic_year=academic_year,
        risk_level=risk_level,
        db=db,
        user=user
    )
