from typing import Dict, Any, Optional, Tuple, List

def normalize_academic(cgpa: Optional[float], internal_marks: Optional[float], backlogs: int) -> Optional[float]:
    """
    Normalizes academic performance to a 0-100 scale.
    CGPA is 0-10 (weight 50%), internal marks 0-100 (weight 50%).
    Backlogs apply a penalty of -7 points per active backlog.
    """
    if cgpa is None and internal_marks is None:
        return None
        
    scores = []
    weights = []
    
    if cgpa is not None:
        # Scale 0-10 CGPA to 0-100
        cgpa_norm = max(0.0, min(100.0, (cgpa / 10.0) * 100.0))
        scores.append(cgpa_norm)
        weights.append(0.5)
        
    if internal_marks is not None:
        int_norm = max(0.0, min(100.0, float(internal_marks)))
        scores.append(int_norm)
        weights.append(0.5)
        
    total_w = sum(weights)
    if total_w == 0:
        return None
        
    base_score = sum(s * (w / total_w) for s, w in zip(scores, weights))
    penalty = max(0, backlogs) * 7.0
    return max(0.0, min(100.0, round(base_score - penalty, 2)))

def normalize_attendance(overall_attendance: Optional[float]) -> Optional[float]:
    if overall_attendance is None:
        return None
    return max(0.0, min(100.0, round(float(overall_attendance), 2)))

def normalize_lms(completion_rate: Optional[float], login_freq: Optional[float]) -> Optional[float]:
    """
    LMS Score 0-100:
    Assignment completion rate (70% weight)
    Login frequency (30% weight, baseline 5+ logins/wk = 100)
    """
    if completion_rate is None and login_freq is None:
        return None
        
    scores = []
    weights = []
    
    if completion_rate is not None:
        scores.append(max(0.0, min(100.0, float(completion_rate))))
        weights.append(0.7)
        
    if login_freq is not None:
        # 5+ logins per week is 100%
        freq_norm = max(0.0, min(100.0, (float(login_freq) / 5.0) * 100.0))
        scores.append(freq_norm)
        weights.append(0.3)
        
    total_w = sum(weights)
    return max(0.0, min(100.0, round(sum(s * (w / total_w) for s, w in zip(scores, weights)), 2)))

def normalize_placement(aptitude: Optional[float], coding: Optional[float], mock_interview: Optional[float]) -> Optional[float]:
    """
    Placement Readiness 0-100:
    Aptitude (35%), Coding (40%), Mock Interview (25%).
    If not assessed, returns None.
    """
    available = []
    weights = []
    
    if aptitude is not None:
        available.append(float(aptitude))
        weights.append(0.35)
    if coding is not None:
        available.append(float(coding))
        weights.append(0.40)
    if mock_interview is not None:
        available.append(float(mock_interview))
        weights.append(0.25)
        
    if not available:
        return None
        
    total_w = sum(weights)
    return max(0.0, min(100.0, round(sum(s * (w / total_w) for s, w in zip(available, weights)), 2)))

def normalize_skills_engagement(
    hackathons: int,
    certifications: int,
    clubs: int,
    soft_skills: Optional[float]
) -> float:
    """
    Skills & Engagement 0-100:
    Hackathons (20 pts each, max 40), Certifications (15 pts each, max 30),
    Clubs (10 pts each, max 20), Soft skills (max 10).
    """
    h_score = min(40.0, max(0, hackathons) * 20.0)
    c_score = min(30.0, max(0, certifications) * 15.0)
    cl_score = min(20.0, max(0, clubs) * 10.0)
    s_score = 0.0
    if soft_skills is not None:
        s_score = max(0.0, min(10.0, (float(soft_skills) / 100.0) * 10.0))
    else:
        s_score = 5.0 # neutral default
        
    return max(0.0, min(100.0, round(h_score + c_score + cl_score + s_score, 2)))

def calculate_student_success_score(
    student_data: Dict[str, Any],
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Calculates the Student Success Score (0-100) using transparent, configurable weights.
    
    Policy for missing data:
    If a component is missing (e.g. placement assessments not yet taken for junior students),
    it is explicitly marked in missing_components, and the overall score is computed by
    re-normalizing available component weights. The score is flagged as is_provisional=True.
    """
    w = {
        "academic": 0.30,
        "attendance": 0.20,
        "lms": 0.15,
        "placement": 0.20,
        "skills": 0.15,
    }
    if weights:
        w.update(weights)
        
    academic_score = normalize_academic(
        student_data.get("cgpa"),
        student_data.get("internal_marks"),
        student_data.get("backlog_count", 0)
    )
    
    attendance_score = normalize_attendance(
        student_data.get("overall_attendance")
    )
    
    lms_score = normalize_lms(
        student_data.get("assignment_completion_rate"),
        student_data.get("lms_login_frequency")
    )
    
    placement_score = normalize_placement(
        student_data.get("aptitude_score"),
        student_data.get("coding_score"),
        student_data.get("mock_interview_score")
    )
    
    skills_score = normalize_skills_engagement(
        student_data.get("hackathon_count", 0),
        student_data.get("certification_count", 0),
        student_data.get("club_participation_count", 0),
        student_data.get("soft_skills_score")
    )
    
    components = {
        "academic": (academic_score, w["academic"]),
        "attendance": (attendance_score, w["attendance"]),
        "lms": (lms_score, w["lms"]),
        "placement": (placement_score, w["placement"]),
        "skills": (skills_score, w["skills"]),
    }
    
    available_weighted_sum = 0.0
    active_weights = 0.0
    missing_components = []
    
    for name, (score, weight) in components.items():
        if score is not None:
            available_weighted_sum += score * weight
            active_weights += weight
        else:
            missing_components.append(name)
            
    is_provisional = len(missing_components) > 0
    
    if active_weights > 0:
        success_score = round(available_weighted_sum / active_weights, 2)
    else:
        success_score = None
        
    return {
        "success_score": success_score,
        "academic_score": academic_score,
        "attendance_score": attendance_score,
        "lms_score": lms_score,
        "placement_score": placement_score,
        "skills_score": skills_score,
        "is_provisional": is_provisional,
        "missing_components": missing_components,
        "contributions": {
            "academic": round((academic_score or 0) * (w["academic"] / max(active_weights, 0.01)), 2),
            "attendance": round((attendance_score or 0) * (w["attendance"] / max(active_weights, 0.01)), 2),
            "lms": round((lms_score or 0) * (w["lms"] / max(active_weights, 0.01)), 2),
            "placement": round((placement_score or 0) * (w["placement"] / max(active_weights, 0.01)), 2),
            "skills": round((skills_score or 0) * (w["skills"] / max(active_weights, 0.01)), 2),
        }
    }
