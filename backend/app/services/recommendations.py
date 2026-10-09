from typing import Dict, Any, List, Optional
import httpx
from ..config import settings

def generate_student_recommendations(
    student_data: Dict[str, Any],
    academic_risk: str,
    placement_risk: str
) -> List[Dict[str, Any]]:
    """
    Generates actionable, grounded recommendations based on actual student metrics.
    Works standalone with deterministic rule-based logic.
    """
    recommendations: List[Dict[str, Any]] = []
    
    attendance = student_data.get("overall_attendance")
    backlogs = student_data.get("backlog_count", 0) or 0
    cgpa = student_data.get("cgpa")
    internal = student_data.get("internal_marks")
    lms_rate = student_data.get("assignment_completion_rate")
    coding = student_data.get("coding_score")
    aptitude = student_data.get("aptitude_score")
    mock_int = student_data.get("mock_interview_score")
    
    # 1. Attendance checks
    if attendance is not None and attendance < 75.0:
        recommendations.append({
            "category": "attendance_support",
            "priority": "urgent" if attendance < 65.0 else "high",
            "title": "Mandatory Attendance Counseling",
            "reason": f"Current attendance is {attendance}%, below institutional minimum (75%).",
            "action": "Schedule 1-on-1 counselor check-in, analyze absence patterns, and formulate an attendance recovery agreement.",
            "target_days": 5
        })
        
    # 2. Backlogs / Remedial Teaching
    if backlogs > 0:
        recommendations.append({
            "category": "remedial_teaching",
            "priority": "high",
            "title": "Backlog Remedial Coaching Sessions",
            "reason": f"Student has {backlogs} active backlog subject(s) pending clearance.",
            "action": "Assign departmental tutor for remedial problem-solving modules and mock test reviews before semester finals.",
            "target_days": 7
        })
        
    # 3. Internal marks / Academic Mentoring
    if internal is not None and internal < 60.0:
        recommendations.append({
            "category": "academic_mentoring",
            "priority": "high",
            "title": "Subject-Wise Academic Mentoring",
            "reason": f"Internal assessment marks ({internal}/100) are below benchmark standard.",
            "action": "Faculty mentor to review unit test answer scripts and arrange guided study hours.",
            "target_days": 10
        })
        
    # 4. Coursework / LMS Completion
    if lms_rate is not None and lms_rate < 70.0:
        recommendations.append({
            "category": "assignment_followup",
            "priority": "medium",
            "title": "LMS Assignment & Lab Submission Audit",
            "reason": f"Coursework completion is at {lms_rate}%, showing missing assignment submissions.",
            "action": "Issue submission reminder, grant guided lab hours to clear pending LMS assignments.",
            "target_days": 7
        })
        
    # 5. Coding skills
    if coding is not None and coding < 60.0:
        recommendations.append({
            "category": "coding_practice",
            "priority": "high" if coding < 45.0 else "medium",
            "title": "Targeted Data Structures & Coding Bootcamp",
            "reason": f"Coding assessment score ({coding}/100) indicates gaps in algorithmic problem solving.",
            "action": "Enroll student into guided LeetCode/HackerRank curated problem track with 3 problems/week target.",
            "target_days": 14
        })
        
    # 6. Aptitude preparation
    if aptitude is not None and aptitude < 60.0:
        recommendations.append({
            "category": "aptitude_preparation",
            "priority": "medium",
            "title": "Quantitative & Logical Aptitude Prep",
            "reason": f"Aptitude assessment score ({aptitude}/100) is below campus recruitment cutoffs.",
            "action": "Provide diagnostic test series and access to campus aptitude mastery modules.",
            "target_days": 14
        })
        
    # 7. Mock Interview
    if mock_int is not None and mock_int < 60.0:
        recommendations.append({
            "category": "mock_interview",
            "priority": "medium",
            "title": "HR & Technical Mock Interview Drill",
            "reason": f"Mock interview evaluation was {mock_int}/100.",
            "action": "Schedule 30-minute practice interview session with placement faculty coordinator focusing on communication and resume walkthrough.",
            "target_days": 10
        })
        
    # 8. High Academic + Weak Placement combination
    if (cgpa or 0) >= 7.5 and placement_risk == "High" and not any(r["category"] == "coding_practice" for r in recommendations):
        recommendations.append({
            "category": "coding_practice",
            "priority": "high",
            "title": "Accelerated Placement Conversion Track",
            "reason": "Strong academic foundation (CGPA >= 7.5) but placement testing requires intensive alignment.",
            "action": "Direct student to technical campus interview readiness tracks to bridge academic-to-placement gap.",
            "target_days": 10
        })
        
    # Default positive guidance if doing great
    if not recommendations:
        recommendations.append({
            "category": "general_support",
            "priority": "low",
            "title": "Honors / Leadership Development",
            "reason": "Student is performing strongly across both academic and placement readiness benchmarks.",
            "action": "Encourage peer tutoring participation, research project submission, and competitive hackathon leadership.",
            "target_days": 30
        })
        
    return recommendations
