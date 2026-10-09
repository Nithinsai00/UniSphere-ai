from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Student, Faculty
from ..schemas import Token, LoginRequest, UserResponse, PasswordChangeRequest
from ..security import verify_password, hash_password, create_access_token, get_current_user
import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    ident = req.identifier.strip()
    
    # Match by username, email, student_id, faculty_id, or phone
    user = db.query(User).filter(
        (User.username == ident.lower()) |
        (User.email == ident.lower()) |
        (User.phone_number == ident)
    ).first()
    
    # If not found directly on User, check Student or Faculty ID
    if not user and req.role == "student":
        student = db.query(Student).filter(Student.student_id == ident.upper()).first()
        if student and student.user_id:
            user = db.query(User).filter(User.id == student.user_id).first()
    elif not user and req.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.faculty_id == ident.upper()).first()
        if faculty and faculty.user_id:
            user = db.query(User).filter(User.id == faculty.user_id).first()
            
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your login details."
        )
        
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your login details."
        )
        
    # Verify role matches requested tab
    if user.role != req.role and user.role != "admin": # Admin can inspect all if needed, but role enforces boundary
        if user.role != req.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This account is registered with role '{user.role}', not '{req.role}'."
            )
            
    # Resolve full name
    full_name = user.username.title()
    if user.role == "student" and user.student_profile:
        full_name = user.student_profile.full_name
    elif user.role == "faculty" and user.faculty_profile:
        full_name = user.faculty_profile.full_name
        
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "username": user.username,
        "full_name": full_name,
        "requires_password_change": user.requires_password_change
    }

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible endpoint for OpenAPI docs."""
    user = db.query(User).filter(User.username == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    full_name = user.username.title()
    if user.role == "student" and user.student_profile:
        full_name = user.student_profile.full_name
    elif user.role == "faculty" and user.faculty_profile:
        full_name = user.faculty_profile.full_name
        
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "username": user.username,
        "full_name": full_name,
        "requires_password_change": user.requires_password_change
    }

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "requires_password_change": current_user.requires_password_change,
        "student_id": None,
        "faculty_id": None,
        "full_name": current_user.username.title(),
        "department": None
    }
    
    if current_user.role == "student" and current_user.student_profile:
        s = current_user.student_profile
        profile_data["student_id"] = s.student_id
        profile_data["full_name"] = s.full_name
        profile_data["department"] = s.department
    elif current_user.role == "faculty" and current_user.faculty_profile:
        f = current_user.faculty_profile
        profile_data["faculty_id"] = f.faculty_id
        profile_data["full_name"] = f.full_name
        profile_data["department"] = f.department
        
    return profile_data

@router.post("/change-password")
def change_password(
    req: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")
        
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
        
    current_user.hashed_password = hash_password(req.new_password)
    current_user.requires_password_change = False
    db.commit()
    return {"status": "success", "message": "Password changed successfully."}
