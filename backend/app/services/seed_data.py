import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models import (
    User, Department, Student, Faculty, Intervention,
    InterventionUpdate, ScoreConfiguration
)
from ..security import hash_password
from ..config import settings
from .scoring_engine import calculate_student_success_score
from .risk_engine import assess_student_risks
from .segmentation import classify_student_segment

DEPARTMENTS = [
    {"code": "CSE", "name": "Computer Science & Engineering"},
    {"code": "IT", "name": "Information Technology"},
    {"code": "ECE", "name": "Electronics & Communication Engineering"},
    {"code": "DSAI", "name": "Data Science & Artificial Intelligence"},
    {"code": "MECH", "name": "Mechanical Engineering"}
]

FACULTY_MEMBERS = [
    {
        "faculty_id": "FAC001",
        "username": "fac001",
        "full_name": "Dr. Aris Thorne",
        "email": "thorne@unisphere.edu",
        "phone_number": "+91 98765 43210",
        "department": "Computer Science & Engineering",
        "designation": "Professor & HOD",
        "assigned_subjects": "Algorithms, Distributed Systems",
        "assigned_classes": "CSE-3A, CSE-4A"
    },
    {
        "faculty_id": "FAC002",
        "username": "fac002",
        "full_name": "Dr. Priya Sharma",
        "email": "priya@unisphere.edu",
        "phone_number": "+91 98765 43211",
        "department": "Information Technology",
        "designation": "Associate Professor",
        "assigned_subjects": "Web Architectures, Cloud Computing",
        "assigned_classes": "IT-3A, IT-3B"
    },
    {
        "faculty_id": "FAC003",
        "username": "fac003",
        "full_name": "Prof. Rajesh Raman",
        "email": "raman@unisphere.edu",
        "phone_number": "+91 98765 43212",
        "department": "Electronics & Communication Engineering",
        "designation": "Assistant Professor",
        "assigned_subjects": "VLSI Design, Embedded Systems",
        "assigned_classes": "ECE-3A"
    },
    {
        "faculty_id": "FAC004",
        "username": "fac004",
        "full_name": "Dr. Elena Rostova",
        "email": "elena@unisphere.edu",
        "phone_number": "+91 98765 43213",
        "department": "Data Science & Artificial Intelligence",
        "designation": "Associate Professor",
        "assigned_subjects": "Machine Learning, Deep Learning",
        "assigned_classes": "DSAI-3A, DSAI-4A"
    },
    {
        "faculty_id": "FAC005",
        "username": "fac005",
        "full_name": "Dr. Vikram Seth",
        "email": "seth@unisphere.edu",
        "phone_number": "+91 98765 43214",
        "department": "Mechanical Engineering",
        "designation": "Professor",
        "assigned_subjects": "Thermodynamics, Robotics",
        "assigned_classes": "MECH-3A"
    }
]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharv", "Dhruv", "Kabir", "Rudra", "Ananya", "Diya", "Aadhya", "Pari", "Saanvi",
    "Kiara", "Myra", "Riya", "Ira", "Avani", "Prisha", "Anvi", "Aanya", "Sara", "Vanya",
    "Tanvi", "Neha", "Pooja", "Rahul", "Rohit", "Sameer", "Karan", "Kunal", "Meera", "Siddharth",
    "Nikhil", "Gaurav", "Suresh", "Divya", "Swati", "Deepak", "Sneha", "Kavya", "Akash", "Vikram"
]

LAST_NAMES = [
    "Patel", "Sharma", "Verma", "Rao", "Reddy", "Nair", "Iyer", "Kulkarni", "Deshmukh", "Joshi",
    "Gupta", "Malhotra", "Mehta", "Bhat", "Chopra", "Choudhury", "Bose", "Banerjee", "Chatterjee", "Mishra",
    "Saxena", "Kapoor", "Khan", "Ahmed", "Syed", "Pillai", "Menon", "Shenoy", "Hegde", "Fernandes"
]

def seed_database(db: Session, force: bool = False):
    """
    Seeds initial departments, admin, faculty, score configurations,
    and a realistic synthetic cohort of 350+ students with varied risk profiles.
    """
    # Check if already seeded
    existing_users = db.query(User).count()
    if existing_users > 0 and not force:
        return {"status": "already_seeded", "message": "Database already contains records."}
        
    random.seed(42) # Reproducible realistic seed
    
    # 1. Departments
    for d in DEPARTMENTS:
        if not db.query(Department).filter(Department.code == d["code"]).first():
            db.add(Department(code=d["code"], name=d["name"]))
    db.commit()
    
    # 2. Score Configuration
    if not db.query(ScoreConfiguration).first():
        config = ScoreConfiguration(
            version="v1.0-default",
            weight_academic=settings.DEFAULT_WEIGHT_ACADEMIC,
            weight_attendance=settings.DEFAULT_WEIGHT_ATTENDANCE,
            weight_lms=settings.DEFAULT_WEIGHT_LMS,
            weight_placement=settings.DEFAULT_WEIGHT_PLACEMENT,
            weight_skills=settings.DEFAULT_WEIGHT_SKILLS,
            attendance_threshold=settings.ATTENDANCE_THRESHOLD,
            academic_cgpa_threshold=settings.ACADEMIC_CGPA_THRESHOLD,
            academic_internal_threshold=settings.ACADEMIC_INTERNAL_THRESHOLD,
            placement_threshold=settings.PLACEMENT_THRESHOLD,
            is_active=True,
            updated_by="bootstrap"
        )
        db.add(config)
        db.commit()
        
    # 3. Bootstrap Admin User
    admin_user = db.query(User).filter(User.username == settings.BOOTSTRAP_ADMIN_USERNAME).first()
    if not admin_user:
        admin_user = User(
            username=settings.BOOTSTRAP_ADMIN_USERNAME,
            email=settings.BOOTSTRAP_ADMIN_EMAIL,
            phone_number="+91 90000 00000",
            hashed_password=hash_password(settings.BOOTSTRAP_ADMIN_PASSWORD),
            role="admin",
            is_active=True,
            requires_password_change=False
        )
        db.add(admin_user)
        db.commit()
        
    # 4. Faculty Users and Profiles
    faculty_db_objs = []
    for f in FACULTY_MEMBERS:
        f_user = db.query(User).filter(User.username == f["username"]).first()
        if not f_user:
            f_user = User(
                username=f["username"],
                email=f["email"],
                phone_number=f["phone_number"],
                hashed_password=hash_password("Faculty@2026"),
                role="faculty",
                is_active=True
            )
            db.add(f_user)
            db.commit()
            
        f_profile = db.query(Faculty).filter(Faculty.faculty_id == f["faculty_id"]).first()
        if not f_profile:
            f_profile = Faculty(
                user_id=f_user.id,
                faculty_id=f["faculty_id"],
                full_name=f["full_name"],
                email=f["email"],
                phone_number=f["phone_number"],
                department=f["department"],
                designation=f["designation"],
                assigned_subjects=f["assigned_subjects"],
                assigned_classes=f["assigned_classes"],
                is_active=True
            )
            db.add(f_profile)
            db.commit()
        faculty_db_objs.append(f_profile)
        
    # 5. Synthetic Student Generation (~360 students)
    # Distinct archetypes for realistic analytics
    student_records = []
    
    total_students_to_generate = 360
    dept_names = [d["name"] for d in DEPARTMENTS]
    
    for i in range(1, total_students_to_generate + 1):
        sid = f"STU{1000 + i}"
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        email = f"{sid.lower()}@unisphere.edu"
        phone = f"+91 {random.randint(70000, 99999)} {random.randint(10000, 99999)}"
        dept = dept_names[(i - 1) % len(dept_names)]
        
        # Distribute across study years: 1 (15%), 2 (20%), 3 (40%), 4 (25%)
        rand_val = random.random()
        if rand_val < 0.15:
            current_year = 1
            semester = random.choice([1, 2])
        elif rand_val < 0.35:
            current_year = 2
            semester = random.choice([3, 4])
        elif rand_val < 0.75:
            current_year = 3
            semester = random.choice([5, 6])
        else:
            current_year = 4
            semester = random.choice([7, 8])
            
        # Archetype distribution
        archetype = random.choices(
            ["balanced_high", "strong_acad_weak_placement", "weak_acad_strong_coding", "critical_risk", "average_steady", "junior_unassessed"],
            weights=[0.30, 0.20, 0.15, 0.15, 0.15, 0.05] if current_year >= 3 else [0.25, 0.05, 0.05, 0.15, 0.20, 0.30]
        )[0]
        
        if archetype == "balanced_high":
            cgpa = round(random.uniform(8.4, 9.8), 2)
            internal = round(random.uniform(82.0, 98.0), 1)
            backlogs = 0
            attendance = round(random.uniform(84.0, 98.0), 1)
            lms_rate = round(random.uniform(85.0, 99.0), 1)
            lms_freq = round(random.uniform(4.5, 7.0), 1)
            aptitude = round(random.uniform(80.0, 98.0), 1)
            coding = round(random.uniform(82.0, 99.0), 1)
            mock_interview = round(random.uniform(80.0, 96.0), 1)
            soft_skills = round(random.uniform(85.0, 98.0), 1)
            hackathons = random.randint(1, 4)
            certifications = random.randint(2, 5)
            clubs = random.randint(1, 3)
            
        elif archetype == "strong_acad_weak_placement":
            cgpa = round(random.uniform(7.8, 9.2), 2)
            internal = round(random.uniform(78.0, 92.0), 1)
            backlogs = 0
            attendance = round(random.uniform(82.0, 94.0), 1)
            lms_rate = round(random.uniform(80.0, 95.0), 1)
            lms_freq = round(random.uniform(3.5, 5.5), 1)
            aptitude = round(random.uniform(42.0, 58.0), 1) # Low aptitude
            coding = round(random.uniform(34.0, 52.0), 1)   # Low coding
            mock_interview = round(random.uniform(45.0, 58.0), 1)
            soft_skills = round(random.uniform(50.0, 68.0), 1)
            hackathons = random.randint(0, 1)
            certifications = random.randint(0, 2)
            clubs = random.randint(0, 1)
            
        elif archetype == "weak_acad_strong_coding":
            cgpa = round(random.uniform(5.2, 6.4), 2)       # Low CGPA
            internal = round(random.uniform(50.0, 62.0), 1) # Low internals
            backlogs = random.choice([1, 2])
            attendance = round(random.uniform(62.0, 74.0), 1) # Low attendance
            lms_rate = round(random.uniform(55.0, 72.0), 1)
            lms_freq = round(random.uniform(2.5, 4.0), 1)
            aptitude = round(random.uniform(75.0, 90.0), 1)
            coding = round(random.uniform(84.0, 98.0), 1)   # Outstanding coder
            mock_interview = round(random.uniform(70.0, 85.0), 1)
            soft_skills = round(random.uniform(75.0, 88.0), 1)
            hackathons = random.randint(2, 5)
            certifications = random.randint(1, 4)
            clubs = random.randint(1, 2)
            
        elif archetype == "critical_risk":
            cgpa = round(random.uniform(4.2, 5.6), 2)       # Critical CGPA
            internal = round(random.uniform(38.0, 52.0), 1) # Critical internals
            backlogs = random.choice([2, 3, 4])
            attendance = round(random.uniform(48.0, 64.0), 1) # Critical attendance shortage
            lms_rate = round(random.uniform(30.0, 50.0), 1)
            lms_freq = round(random.uniform(0.5, 2.0), 1)
            aptitude = round(random.uniform(25.0, 48.0), 1)
            coding = round(random.uniform(20.0, 42.0), 1)
            mock_interview = round(random.uniform(30.0, 50.0), 1)
            soft_skills = round(random.uniform(35.0, 55.0), 1)
            hackathons = 0
            certifications = 0
            clubs = 0
            
        elif archetype == "junior_unassessed":
            cgpa = round(random.uniform(6.5, 8.5), 2)
            internal = round(random.uniform(65.0, 85.0), 1)
            backlogs = 0
            attendance = round(random.uniform(76.0, 92.0), 1)
            lms_rate = round(random.uniform(70.0, 88.0), 1)
            lms_freq = round(random.uniform(3.0, 5.0), 1)
            aptitude = None       # Not yet assessed!
            coding = None         # Not yet assessed!
            mock_interview = None # Not yet assessed!
            soft_skills = None
            hackathons = random.randint(0, 1)
            certifications = random.randint(0, 2)
            clubs = random.randint(1, 2)
            
        else: # average_steady
            cgpa = round(random.uniform(6.8, 7.8), 2)
            internal = round(random.uniform(66.0, 76.0), 1)
            backlogs = 0
            attendance = round(random.uniform(76.0, 88.0), 1)
            lms_rate = round(random.uniform(72.0, 84.0), 1)
            lms_freq = round(random.uniform(3.0, 4.5), 1)
            aptitude = round(random.uniform(62.0, 75.0), 1)
            coding = round(random.uniform(60.0, 74.0), 1)
            mock_interview = round(random.uniform(62.0, 75.0), 1)
            soft_skills = round(random.uniform(65.0, 78.0), 1)
            hackathons = random.randint(0, 2)
            certifications = random.randint(1, 3)
            clubs = random.randint(1, 2)
            
        # Success Score
        s_data = {
            "cgpa": cgpa,
            "internal_marks": internal,
            "backlog_count": backlogs,
            "overall_attendance": attendance,
            "assignment_completion_rate": lms_rate,
            "lms_login_frequency": lms_freq,
            "aptitude_score": aptitude,
            "coding_score": coding,
            "mock_interview_score": mock_interview,
            "soft_skills_score": soft_skills,
            "hackathon_count": hackathons,
            "certification_count": certifications,
            "club_participation_count": clubs,
            "current_year": current_year
        }
        
        score_res = calculate_student_success_score(s_data)
        s_data["placement_score"] = score_res["placement_score"]
        
        risk_res = assess_student_risks(s_data)
        segment = classify_student_segment(score_res["academic_score"], score_res["placement_score"])
        
        # Dedicated auth account for specific demo students (e.g. STU1001, STU1002, STU1003)
        user_id = None
        if sid in ["STU1001", "STU1002", "STU1003"]:
            demo_user = db.query(User).filter(User.username == sid.lower()).first()
            if not demo_user:
                demo_user = User(
                    username=sid.lower(),
                    email=email,
                    phone_number=phone,
                    hashed_password=hash_password("Student@2026"),
                    role="student",
                    is_active=True
                )
                db.add(demo_user)
                db.commit()
            user_id = demo_user.id
            
        student_obj = Student(
            user_id=user_id,
            student_id=sid,
            full_name=full_name,
            email=email,
            phone_number=phone,
            department=dept,
            degree="B.Tech",
            academic_year="2025-2026",
            current_year=current_year,
            semester=semester,
            enrollment_status="active",
            cgpa=cgpa,
            internal_marks=internal,
            backlog_count=backlogs,
            overall_attendance=attendance,
            assignment_completion_rate=lms_rate,
            lms_login_frequency=lms_freq,
            aptitude_score=aptitude,
            coding_score=coding,
            mock_interview_score=mock_interview,
            soft_skills_score=soft_skills,
            placement_training_attended=archetype in ["balanced_high", "average_steady"],
            hackathon_count=hackathons,
            certification_count=certifications,
            club_participation_count=clubs,
            satisfaction_score=round(random.uniform(3.5, 4.8), 1),
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
        db.add(student_obj)
        student_records.append(student_obj)
        
    db.commit()
    
    # 6. Seed Sample Interventions for At-Risk Students
    high_risk_students = [s for s in student_records if s.combined_risk == "High"][:18]
    for idx, student in enumerate(high_risk_students):
        faculty = faculty_db_objs[idx % len(faculty_db_objs)]
        is_completed = idx % 3 == 0
        is_in_progress = idx % 3 == 1
        
        status = "completed" if is_completed else ("in_progress" if is_in_progress else "pending")
        
        category = "attendance_support" if (student.overall_attendance or 100) < 65 else (
            "remedial_teaching" if student.backlog_count > 0 else (
                "coding_practice" if (student.coding_score or 100) < 50 else "academic_mentoring"
            )
        )
        
        intervention = Intervention(
            student_id=student.id,
            faculty_id=faculty.id,
            category=category,
            priority="urgent" if status != "completed" else "high",
            status=status,
            title=f"{category.replace('_', ' ').title()} Plan for {student.full_name}",
            description=f"Automated risk detection identified critical thresholds breached: {', '.join([r['indicator'] for r in (student.risk_reasons or [])])}.",
            due_date=datetime.utcnow() + timedelta(days=7 if status != "completed" else -5),
            outcome_notes="Attendance and quiz marks recovered by +12% following structured review sessions." if status == "completed" else None,
            impact_rating="improved" if status == "completed" else None
        )
        db.add(intervention)
        db.commit()
        
        # Add historical update
        update = InterventionUpdate(
            intervention_id=intervention.id,
            author_name=faculty.full_name,
            notes=f"Initial counseling conducted with student. Action plan signed and shared with department head.",
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.add(update)
        
    db.commit()
    
    return {
        "status": "success",
        "students_seeded": len(student_records),
        "faculty_seeded": len(faculty_db_objs),
        "admin_created": admin_user.username
    }
