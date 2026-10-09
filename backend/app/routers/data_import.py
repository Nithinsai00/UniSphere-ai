from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import User, DataImportJob
from ..security import require_roles
from ..services.data_importer import parse_and_validate_csv, commit_import_data
from ..schemas import CSVValidationResponse, CSVCommitResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/data-import", tags=["Data Integration"])

class CommitRequest(BaseModel):
    category: str
    filename: str
    rows: List[Dict[str, Any]]

CSV_TEMPLATES = {
    "students": "student_id,full_name,email,phone_number,department,current_year,semester,degree\nSTU2001,Karan Kapoor,karan@unisphere.edu,+91 98765 00001,Computer Science,3,6,B.Tech\nSTU2002,Meera Nambiar,meera@unisphere.edu,+91 98765 00002,Information Technology,3,6,B.Tech",
    "academics": "student_id,cgpa,internal_marks,backlog_count\nSTU2001,8.45,82.5,0\nSTU2002,6.10,54.0,2",
    "attendance": "student_id,overall_attendance\nSTU2001,88.5\nSTU2002,63.0",
    "lms": "student_id,assignment_completion_rate,lms_login_frequency\nSTU2001,92.0,5.5\nSTU2002,48.0,1.8",
    "placement": "student_id,aptitude_score,coding_score,mock_interview_score\nSTU2001,85.0,90.0,82.0\nSTU2002,45.0,38.0,50.0",
    "skills": "student_id,hackathon_count,certification_count,club_participation_count\nSTU2001,2,3,1\nSTU2002,0,1,0"
}

@router.post("/preview")
async def preview_csv(
    file: UploadFile = File(...),
    category: str = Form("students"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    """
    Validates CSV file, checks constraints, detects errors, and returns preview.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
        
    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_str = content_bytes.decode("latin-1")
        
    validation_res = parse_and_validate_csv(content_str, category)
    validation_res["filename"] = file.filename
    return validation_res

@router.post("/commit")
def commit_csv(
    req: CommitRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    """
    Commits validated rows to database with score recalculation.
    """
    result = commit_import_data(
        db=db,
        rows=req.rows,
        category=req.category,
        filename=req.filename
    )
    return result

@router.get("/template/{category}")
def get_csv_template(
    category: str,
    user: User = Depends(require_roles(["admin"]))
):
    if category not in CSV_TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")
        
    return PlainTextResponse(
        content=CSV_TEMPLATES[category],
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=template_{category}.csv"}
    )

@router.get("/history")
def get_import_history(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles(["admin"]))
):
    return db.query(DataImportJob).order_by(desc(DataImportJob.created_at)).limit(20).all()
