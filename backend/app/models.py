import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student") # admin, faculty, student
    is_active = Column(Boolean, default=True)
    requires_password_change = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(150), nullable=False)

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone_number = Column(String(50), nullable=True)
    department = Column(String(100), nullable=False, default="Computer Science")
    degree = Column(String(50), nullable=False, default="B.Tech")
    academic_year = Column(String(20), nullable=False, default="2025-2026")
    current_year = Column(Integer, nullable=False, default=3) # 1, 2, 3, 4
    semester = Column(Integer, nullable=False, default=6) # 1 to 8
    enrollment_status = Column(String(30), nullable=False, default="active") # active, inactive, graduated
    
    # Academic Data
    cgpa = Column(Float, nullable=True) # out of 10.0
    internal_marks = Column(Float, nullable=True) # out of 100.0
    backlog_count = Column(Integer, nullable=False, default=0)
    
    # Attendance Data
    overall_attendance = Column(Float, nullable=True) # percentage 0-100
    
    # LMS Activity
    assignment_completion_rate = Column(Float, nullable=True) # percentage 0-100
    lms_login_frequency = Column(Float, nullable=True) # logins per week
    
    # Placement and Skills
    aptitude_score = Column(Float, nullable=True) # 0-100
    coding_score = Column(Float, nullable=True) # 0-100
    mock_interview_score = Column(Float, nullable=True) # 0-100
    soft_skills_score = Column(Float, nullable=True) # 0-100
    placement_training_attended = Column(Boolean, nullable=True, default=False)
    
    # Engagement
    hackathon_count = Column(Integer, nullable=False, default=0)
    certification_count = Column(Integer, nullable=False, default=0)
    club_participation_count = Column(Integer, nullable=False, default=0)
    
    # Feedback & Notes
    satisfaction_score = Column(Float, nullable=True) # 1-5 or 0-100
    faculty_feedback = Column(Text, nullable=True)
    
    # Success Scoring Engine Results
    success_score = Column(Float, nullable=True) # 0-100
    academic_score = Column(Float, nullable=True)
    attendance_score = Column(Float, nullable=True)
    lms_score = Column(Float, nullable=True)
    placement_score = Column(Float, nullable=True)
    skills_score = Column(Float, nullable=True)
    is_provisional = Column(Boolean, default=False)
    missing_components = Column(JSON, nullable=True, default=list)
    
    # Risk Assessment
    academic_risk = Column(String(30), default="Low") # Low, Moderate, High, Insufficient data
    placement_risk = Column(String(30), default="Low") # Low, Moderate, High, Insufficient data
    combined_risk = Column(String(30), default="Low") # Low, Moderate, High, Insufficient data
    risk_reasons = Column(JSON, nullable=True, default=list) # List of triggers with actual values & thresholds
    
    # Segmentation
    segment = Column(String(100), default="Strong Academics + Strong Placement")
    
    score_last_calculated_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    messages = relationship("StudentMessage", back_populates="student", cascade="all, delete-orphan")

class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    faculty_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone_number = Column(String(50), nullable=True)
    department = Column(String(100), nullable=False, default="Computer Science")
    designation = Column(String(100), nullable=False, default="Assistant Professor")
    assigned_subjects = Column(String(255), nullable=True, default="Data Structures, Algorithms")
    assigned_classes = Column(String(255), nullable=True, default="CSE-3A, CSE-3B")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="faculty_profile")
    interventions = relationship("Intervention", back_populates="faculty")

class Intervention(Base):
    __tablename__ = "interventions"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    
    category = Column(String(50), nullable=False) # attendance_support, academic_mentoring, remedial_teaching, etc.
    priority = Column(String(20), nullable=False, default="medium") # low, medium, high, urgent
    status = Column(String(20), nullable=False, default="pending") # pending, in_progress, completed, cancelled
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    outcome_notes = Column(Text, nullable=True)
    impact_rating = Column(String(30), nullable=True) # improved, unchanged, declined
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="interventions")
    faculty = relationship("Faculty", back_populates="interventions")
    updates = relationship("InterventionUpdate", back_populates="intervention", cascade="all, delete-orphan")

class InterventionUpdate(Base):
    __tablename__ = "intervention_updates"
    
    id = Column(Integer, primary_key=True, index=True)
    intervention_id = Column(Integer, ForeignKey("interventions.id"), nullable=False)
    author_name = Column(String(100), nullable=False)
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    intervention = relationship("Intervention", back_populates="updates")

class ScoreConfiguration(Base):
    __tablename__ = "score_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), nullable=False, default="v1.0")
    
    # Weights (Sum must be 1.0)
    weight_academic = Column(Float, nullable=False, default=0.30)
    weight_attendance = Column(Float, nullable=False, default=0.20)
    weight_lms = Column(Float, nullable=False, default=0.15)
    weight_placement = Column(Float, nullable=False, default=0.20)
    weight_skills = Column(Float, nullable=False, default=0.15)
    
    # Thresholds
    attendance_threshold = Column(Float, nullable=False, default=75.0)
    academic_cgpa_threshold = Column(Float, nullable=False, default=6.5)
    academic_internal_threshold = Column(Float, nullable=False, default=60.0)
    placement_threshold = Column(Float, nullable=False, default=60.0)
    
    is_active = Column(Boolean, default=True)
    updated_by = Column(String(100), default="system")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    username = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class DataImportJob(Base):
    __tablename__ = "data_import_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False) # students, academics, attendance, lms, placement, skills
    status = Column(String(30), nullable=False, default="completed") # previewed, completed, failed
    total_rows = Column(Integer, default=0)
    imported_rows = Column(Integer, default=0)
    updated_rows = Column(Integer, default=0)
    rejected_rows = Column(Integer, default=0)
    warnings_count = Column(Integer, default=0)
    errors_json = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class StudentMessage(Base):
    __tablename__ = "student_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    sender_name = Column(String(150), nullable=False)
    sender_designation = Column(String(100), nullable=True)
    sender_department = Column(String(100), nullable=True)
    sender_role = Column(String(50), nullable=True, default="faculty") # faculty, admin, placement, system
    subject = Column(String(255), nullable=False)
    preview = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="Academics") # Mentoring, Placement, Academics
    is_read = Column(Boolean, default=False, nullable=False)
    replies = Column(JSON, default=list, nullable=False) # list of reply objects
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationship
    student = relationship("Student", back_populates="messages")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    faculty_name = Column(String(150), nullable=False, default="Prof. Priya Sharma")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(150), nullable=False, default="Operating Systems")
    target_class = Column(String(100), nullable=False, default="CSE - 3rd Year")
    academic_year = Column(String(50), nullable=False, default="2025-2026")
    semester = Column(Integer, nullable=False, default=6)
    due_date = Column(String(100), nullable=False)
    attachment_name = Column(String(255), nullable=True)
    attachment_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)
    submissions_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class StudentImprovementTask(Base):
    __tablename__ = "student_improvement_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    faculty_name = Column(String(150), nullable=False, default="Prof. Priya Sharma")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    subject = Column(String(150), nullable=False, default="Operating Systems")
    reason = Column(String(255), nullable=True)
    due_date = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="pending") # pending, completed
    reference_doc = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class StudyMaterial(Base):
    __tablename__ = "study_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    faculty_name = Column(String(150), nullable=False, default="Prof. Priya Sharma")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(150), nullable=False)
    topic_unit = Column(String(150), nullable=True)
    target_class = Column(String(100), nullable=False, default="CSE - 3rd Year")
    department = Column(String(100), nullable=False, default="Computer Science")
    academic_year = Column(String(50), nullable=False, default="2025-2026")
    semester = Column(Integer, nullable=False, default=6)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False, default="PDF")
    file_size_formatted = Column(String(50), nullable=False, default="2.4 MB")
    file_size_bytes = Column(Integer, default=0)
    is_published = Column(Boolean, default=True, nullable=False)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GeneratedReport(Base):
    __tablename__ = "generated_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_name = Column(String(255), nullable=False) # e.g. "At-Risk Students Report"
    report_type = Column(String(100), nullable=False) # e.g. "at_risk", "success_score", "attendance", ...
    category = Column(String(100), nullable=False) # e.g. "Risk Analysis", "Academic", "Attendance", "Placement", "Institutional"
    department = Column(String(100), nullable=True, default="all")
    academic_year = Column(String(50), nullable=True, default="all")
    risk_level = Column(String(50), nullable=True, default="all")
    date_range = Column(String(100), nullable=True, default="Current Semester")
    filters_applied = Column(JSON, default=dict)
    summary_metrics = Column(JSON, default=dict)
    status = Column(String(50), default="Ready")
    file_format = Column(String(20), default="CSV")
    generated_by = Column(String(150), default="Administrator")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


