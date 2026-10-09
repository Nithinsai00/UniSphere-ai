import csv
import io
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from ..models import Student, DataImportJob
from .scoring_engine import calculate_student_success_score
from .risk_engine import assess_student_risks
from .segmentation import classify_student_segment

# Flexible column aliases
COLUMN_ALIASES = {
    "student_id": ["student_id", "roll_number", "roll_no", "id", "usn", "reg_no"],
    "full_name": ["full_name", "name", "student_name"],
    "email": ["email", "college_email", "mail"],
    "phone_number": ["phone_number", "phone", "mobile", "contact"],
    "department": ["department", "dept", "branch"],
    "current_year": ["current_year", "year", "year_of_study"],
    "semester": ["semester", "sem"],
    "cgpa": ["cgpa", "gpa", "overall_cgpa"],
    "internal_marks": ["internal_marks", "internal_score", "internals", "cie"],
    "backlog_count": ["backlog_count", "backlogs", "arrears", "active_backlogs"],
    "overall_attendance": ["overall_attendance", "attendance", "attendance_pct", "att_pct"],
    "assignment_completion_rate": ["assignment_completion_rate", "assignment_pct", "assignments"],
    "lms_login_frequency": ["lms_login_frequency", "login_freq", "logins_per_week"],
    "aptitude_score": ["aptitude_score", "aptitude", "quant_score"],
    "coding_score": ["coding_score", "coding", "dsa_score"],
    "mock_interview_score": ["mock_interview_score", "interview_score", "interview"],
    "hackathon_count": ["hackathon_count", "hackathons"],
    "certification_count": ["certification_count", "certifications", "certs"],
    "club_participation_count": ["club_participation_count", "clubs"],
}

def map_column_name(header: str) -> str:
    cleaned = header.strip().lower().replace(" ", "_").replace("-", "_")
    for standard_col, aliases in COLUMN_ALIASES.items():
        if cleaned in aliases:
            return standard_col
    return cleaned

def parse_and_validate_csv(
    file_content: str,
    category: str
) -> Dict[str, Any]:
    """
    Parses CSV, maps columns, and performs strict validation checks.
    """
    stream = io.StringIO(file_content.strip())
    reader = csv.reader(stream)
    
    headers = next(reader, None)
    if not headers:
        return {
            "error": "Empty CSV file",
            "can_commit": False,
            "total_rows": 0,
            "valid_rows_count": 0,
            "invalid_rows_count": 0,
            "detected_columns": [],
            "preview_rows": [],
            "validation_errors": []
        }
        
    mapped_headers = [map_column_name(h) for h in headers]
    
    rows: List[Dict[str, Any]] = []
    errors: List[Dict[str, Any]] = []
    seen_ids = set()
    row_idx = 1
    
    for row in reader:
        row_idx += 1
        if not any(row):
            continue # skip empty lines
            
        row_dict = {}
        for h, val in zip(mapped_headers, row):
            row_dict[h] = val.strip() if val else None
            
        row_errors = []
        
        # Validation: Student ID must exist
        sid = row_dict.get("student_id")
        if not sid:
            row_errors.append("Missing student_id")
        else:
            if sid in seen_ids:
                row_errors.append(f"Duplicate student_id '{sid}' within CSV")
            seen_ids.add(sid)
            
        # Numerical validations
        if "cgpa" in row_dict and row_dict["cgpa"]:
            try:
                cgpa = float(row_dict["cgpa"])
                if cgpa < 0.0 or cgpa > 10.0:
                    row_errors.append(f"Invalid CGPA {cgpa} (must be between 0.0 and 10.0)")
            except ValueError:
                row_errors.append(f"CGPA '{row_dict['cgpa']}' is not a valid number")
                
        if "overall_attendance" in row_dict and row_dict["overall_attendance"]:
            try:
                att = float(row_dict["overall_attendance"])
                if att < 0.0 or att > 100.0:
                    row_errors.append(f"Invalid attendance percentage {att}% (must be 0-100)")
            except ValueError:
                row_errors.append("Attendance is not a valid number")
                
        if "internal_marks" in row_dict and row_dict["internal_marks"]:
            try:
                im = float(row_dict["internal_marks"])
                if im < 0.0 or im > 100.0:
                    row_errors.append(f"Invalid internal marks {im} (must be 0-100)")
            except ValueError:
                row_errors.append("Internal marks is not a valid number")
                
        if "backlog_count" in row_dict and row_dict["backlog_count"]:
            try:
                bc = int(row_dict["backlog_count"])
                if bc < 0:
                    row_errors.append("Backlogs count cannot be negative")
            except ValueError:
                row_errors.append("Backlog count must be an integer")
                
        if row_errors:
            errors.append({
                "row_number": row_idx,
                "student_id": sid or "UNKNOWN",
                "errors": row_errors
            })
            
        rows.append(row_dict)
        
    return {
        "filename": "uploaded.csv",
        "category": category,
        "total_rows": len(rows),
        "valid_rows_count": len(rows) - len(errors),
        "invalid_rows_count": len(errors),
        "detected_columns": mapped_headers,
        "preview_rows": rows[:10], # first 10 for preview
        "validation_errors": errors,
        "can_commit": len(errors) == 0,
        "raw_parsed_data": rows
    }

def commit_import_data(
    db: Session,
    rows: List[Dict[str, Any]],
    category: str,
    filename: str
) -> Dict[str, Any]:
    """
    Commits valid CSV records into the database with atomic transaction,
    re-computing scores and risk indicators for all updated or inserted students.
    """
    created_count = 0
    updated_count = 0
    rejected_count = 0
    errors: List[Dict[str, Any]] = []
    
    for idx, row in enumerate(rows):
        sid = row.get("student_id")
        if not sid:
            rejected_count += 1
            errors.append({"row": idx + 1, "error": "Missing student_id"})
            continue
            
        student = db.query(Student).filter(Student.student_id == sid).first()
        is_new = False
        
        if not student:
            if category != "students" and not row.get("full_name"):
                # Non-student sheet referencing non-existent student
                rejected_count += 1
                errors.append({"row": idx + 1, "student_id": sid, "error": f"Student ID '{sid}' not found in database"})
                continue
                
            student = Student(
                student_id=sid,
                full_name=row.get("full_name") or f"Student {sid}",
                email=row.get("email") or f"{sid.lower()}@unisphere.edu",
                department=row.get("department") or "Computer Science",
            )
            db.add(student)
            is_new = True
            created_count += 1
        else:
            updated_count += 1
            
        # Update fields if present in row
        for field in [
            "full_name", "email", "phone_number", "department", "degree",
            "academic_year", "enrollment_status"
        ]:
            if row.get(field) is not None:
                setattr(student, field, row[field])
                
        # Integer fields
        for field in ["current_year", "semester", "backlog_count", "hackathon_count", "certification_count", "club_participation_count"]:
            if row.get(field) is not None:
                try:
                    setattr(student, field, int(row[field]))
                except (ValueError, TypeError):
                    pass
                    
        # Float fields
        for field in [
            "cgpa", "internal_marks", "overall_attendance",
            "assignment_completion_rate", "lms_login_frequency",
            "aptitude_score", "coding_score", "mock_interview_score",
            "soft_skills_score", "satisfaction_score"
        ]:
            if row.get(field) is not None:
                try:
                    setattr(student, field, float(row[field]))
                except (ValueError, TypeError):
                    pass
                    
        # Recalculate score and risk immediately
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
        
    db.commit()
    
    # Save job record
    job = DataImportJob(
        filename=filename,
        category=category,
        status="completed" if rejected_count == 0 else "partial",
        total_rows=len(rows),
        imported_rows=created_count,
        updated_rows=updated_count,
        rejected_rows=rejected_count,
        warnings_count=len(errors),
        errors_json=errors
    )
    db.add(job)
    db.commit()
    
    return {
        "job_id": job.id,
        "total_processed": len(rows),
        "created_count": created_count,
        "updated_count": updated_count,
        "rejected_count": rejected_count,
        "message": f"Successfully imported {created_count} new, updated {updated_count} existing, rejected {rejected_count} records."
    }
