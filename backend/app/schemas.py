from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    username: str
    full_name: str
    requires_password_change: bool

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    identifier: str # username, email, student_id, faculty_id, or phone
    password: str
    role: str # student, faculty, admin

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    phone_number: Optional[str] = None
    role: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    requires_password_change: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Student schemas
class StudentBase(BaseModel):
    student_id: str
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    department: str = "Computer Science"
    degree: str = "B.Tech"
    academic_year: str = "2025-2026"
    current_year: int = 3
    semester: int = 6
    enrollment_status: str = "active"
    
    # Academic
    cgpa: Optional[float] = None
    internal_marks: Optional[float] = None
    backlog_count: int = 0
    
    # Attendance
    overall_attendance: Optional[float] = None
    
    # LMS
    assignment_completion_rate: Optional[float] = None
    lms_login_frequency: Optional[float] = None
    
    # Placement
    aptitude_score: Optional[float] = None
    coding_score: Optional[float] = None
    mock_interview_score: Optional[float] = None
    soft_skills_score: Optional[float] = None
    placement_training_attended: Optional[bool] = False
    
    # Engagement
    hackathon_count: int = 0
    certification_count: int = 0
    club_participation_count: int = 0
    
    # Feedback
    satisfaction_score: Optional[float] = None
    faculty_feedback: Optional[str] = None

class StudentCreate(StudentBase):
    initial_password: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    academic_year: Optional[str] = None
    current_year: Optional[int] = None
    semester: Optional[int] = None
    enrollment_status: Optional[str] = None
    
    cgpa: Optional[float] = None
    internal_marks: Optional[float] = None
    backlog_count: Optional[int] = None
    overall_attendance: Optional[float] = None
    assignment_completion_rate: Optional[float] = None
    lms_login_frequency: Optional[float] = None
    aptitude_score: Optional[float] = None
    coding_score: Optional[float] = None
    mock_interview_score: Optional[float] = None
    soft_skills_score: Optional[float] = None
    placement_training_attended: Optional[bool] = None
    hackathon_count: Optional[int] = None
    certification_count: Optional[int] = None
    club_participation_count: Optional[int] = None
    satisfaction_score: Optional[float] = None
    faculty_feedback: Optional[str] = None

class RiskReasonItem(BaseModel):
    indicator: str
    value: Any
    threshold: Any
    message: str
    severity: str # high, moderate, warning

class StudentResponse(StudentBase):
    id: int
    user_id: Optional[int] = None
    success_score: Optional[float] = None
    academic_score: Optional[float] = None
    attendance_score: Optional[float] = None
    lms_score: Optional[float] = None
    placement_score: Optional[float] = None
    skills_score: Optional[float] = None
    is_provisional: bool = False
    missing_components: Optional[List[str]] = []
    
    academic_risk: str = "Low"
    placement_risk: str = "Low"
    combined_risk: str = "Low"
    risk_reasons: Optional[List[Dict[str, Any]]] = []
    segment: str = "Strong Academics + Strong Placement"
    
    score_last_calculated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Faculty schemas
class FacultyBase(BaseModel):
    faculty_id: str
    full_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    department: str = "Computer Science"
    designation: str = "Assistant Professor"
    assigned_subjects: Optional[str] = None
    assigned_classes: Optional[str] = None
    is_active: bool = True

class FacultyCreate(FacultyBase):
    initial_password: Optional[str] = None

class FacultyUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    assigned_subjects: Optional[str] = None
    assigned_classes: Optional[str] = None
    is_active: Optional[bool] = None

class FacultyResponse(FacultyBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Intervention schemas
class InterventionUpdateCreate(BaseModel):
    notes: str

class InterventionUpdateResponse(BaseModel):
    id: int
    intervention_id: int
    author_name: str
    notes: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class InterventionBase(BaseModel):
    student_id: int
    faculty_id: Optional[int] = None
    category: str
    priority: str = "medium"
    status: str = "pending"
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class InterventionCreate(InterventionBase):
    pass

class InterventionStatusUpdate(BaseModel):
    status: Optional[str] = None
    outcome_notes: Optional[str] = None
    impact_rating: Optional[str] = None
    note: Optional[str] = None

class InterventionResponse(InterventionBase):
    id: int
    student_name: Optional[str] = None
    student_roll: Optional[str] = None
    department: Optional[str] = None
    faculty_name: Optional[str] = None
    outcome_notes: Optional[str] = None
    impact_rating: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    updates: Optional[List[InterventionUpdateResponse]] = []
    
    class Config:
        from_attributes = True

# Configuration & Scoring
class ScoreConfigurationUpdate(BaseModel):
    weight_academic: float = Field(..., ge=0.0, le=1.0)
    weight_attendance: float = Field(..., ge=0.0, le=1.0)
    weight_lms: float = Field(..., ge=0.0, le=1.0)
    weight_placement: float = Field(..., ge=0.0, le=1.0)
    weight_skills: float = Field(..., ge=0.0, le=1.0)
    attendance_threshold: float = Field(..., ge=0.0, le=100.0)
    academic_cgpa_threshold: float = Field(..., ge=0.0, le=10.0)
    academic_internal_threshold: float = Field(..., ge=0.0, le=100.0)
    placement_threshold: float = Field(..., ge=0.0, le=100.0)

class ScoreConfigurationResponse(BaseModel):
    id: int
    version: str
    weight_academic: float
    weight_attendance: float
    weight_lms: float
    weight_placement: float
    weight_skills: float
    attendance_threshold: float
    academic_cgpa_threshold: float
    academic_internal_threshold: float
    placement_threshold: float
    updated_by: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Assistant Schemas
class AssistantQueryRequest(BaseModel):
    query: str

class AssistantQueryResponse(BaseModel):
    query: str
    answer: str
    suggested_actions: List[str] = []
    data_context: Optional[Dict[str, Any]] = None
    chart_hint: Optional[str] = None # 'bar', 'pie', 'table', None

# Import response schemas
class CSVPreviewRow(BaseModel):
    row_num: int
    data: Dict[str, Any]
    warnings: List[str] = []
    errors: List[str] = []

class CSVValidationResponse(BaseModel):
    filename: str
    category: str
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int
    detected_columns: List[str]
    preview_rows: List[Dict[str, Any]]
    validation_errors: List[Dict[str, Any]]
    can_commit: bool

class CSVCommitResponse(BaseModel):
    job_id: int
    total_processed: int
    created_count: int
    updated_count: int
    rejected_count: int
    message: str
