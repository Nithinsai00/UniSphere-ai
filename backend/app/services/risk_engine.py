from typing import Dict, Any, List, Optional

def assess_student_risks(
    student_data: Dict[str, Any],
    thresholds: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Evaluates explainable student risk flags: Academic, Placement, and Combined.
    
    Provides crystal-clear, transparent reasons why a student was flagged,
    including the exact indicator, current value, threshold used, and severity.
    """
    th = {
        "attendance": 75.0,
        "academic_cgpa": 6.5,
        "academic_internal": 60.0,
        "placement": 60.0,
    }
    if thresholds:
        th.update(thresholds)
        
    cgpa = student_data.get("cgpa")
    internal = student_data.get("internal_marks")
    backlogs = student_data.get("backlog_count", 0) or 0
    attendance = student_data.get("overall_attendance")
    lms_rate = student_data.get("assignment_completion_rate")
    
    aptitude = student_data.get("aptitude_score")
    coding = student_data.get("coding_score")
    mock_interview = student_data.get("mock_interview_score")
    placement_score = student_data.get("placement_score")
    
    reasons: List[Dict[str, Any]] = []
    
    # ------------------ ACADEMIC RISK ASSESSMENT ------------------
    academic_flags = 0
    academic_critical = 0
    
    if cgpa is None and internal is None and attendance is None:
        academic_risk = "Insufficient data"
        reasons.append({
            "indicator": "Academic Records",
            "value": "No data",
            "threshold": "Baseline records",
            "message": "Student does not have sufficient academic or attendance records.",
            "severity": "warning"
        })
    else:
        # Check Attendance
        if attendance is not None:
            if attendance < 65.0:
                academic_flags += 2
                academic_critical += 1
                reasons.append({
                    "indicator": "Attendance",
                    "value": f"{attendance}%",
                    "threshold": f"{th['attendance']}%",
                    "message": f"Critical attendance shortage ({attendance}%). Well below the {th['attendance']}% institutional threshold.",
                    "severity": "high"
                })
            elif attendance < th["attendance"]:
                academic_flags += 1
                reasons.append({
                    "indicator": "Attendance",
                    "value": f"{attendance}%",
                    "threshold": f"{th['attendance']}%",
                    "message": f"Attendance is {attendance}%, below the required {th['attendance']}% mark.",
                    "severity": "moderate"
                })
                
        # Check Backlogs
        if backlogs >= 2:
            academic_flags += 2
            academic_critical += 1
            reasons.append({
                "indicator": "Active Backlogs",
                "value": backlogs,
                "threshold": "0 backlogs",
                "message": f"Student has {backlogs} active backlogs requiring immediate remedial intervention.",
                "severity": "high"
            })
        elif backlogs == 1:
            academic_flags += 1
            reasons.append({
                "indicator": "Active Backlogs",
                "value": 1,
                "threshold": "0 backlogs",
                "message": "Student has 1 active backlog.",
                "severity": "moderate"
            })
            
        # Check CGPA
        if cgpa is not None:
            if cgpa < 5.5:
                academic_flags += 2
                academic_critical += 1
                reasons.append({
                    "indicator": "CGPA",
                    "value": f"{cgpa}/10.0",
                    "threshold": f"{th['academic_cgpa']}/10.0",
                    "message": f"Critically low CGPA ({cgpa} / 10.0), significantly below benchmark.",
                    "severity": "high"
                })
            elif cgpa < th["academic_cgpa"]:
                academic_flags += 1
                reasons.append({
                    "indicator": "CGPA",
                    "value": f"{cgpa}/10.0",
                    "threshold": f"{th['academic_cgpa']}/10.0",
                    "message": f"CGPA is {cgpa}, below the target benchmark of {th['academic_cgpa']}.",
                    "severity": "moderate"
                })
                
        # Check Internal Marks
        if internal is not None:
            if internal < 50.0:
                academic_flags += 2
                academic_critical += 1
                reasons.append({
                    "indicator": "Internal Assessment",
                    "value": f"{internal}/100",
                    "threshold": f"{th['academic_internal']}/100",
                    "message": f"Internal assessment score is severely low ({internal}/100).",
                    "severity": "high"
                })
            elif internal < th["academic_internal"]:
                academic_flags += 1
                reasons.append({
                    "indicator": "Internal Assessment",
                    "value": f"{internal}/100",
                    "threshold": f"{th['academic_internal']}/100",
                    "message": f"Internal assessment is {internal}/100, lagging behind class standards.",
                    "severity": "moderate"
                })
                
        # Check LMS Assignments
        if lms_rate is not None and lms_rate < 50.0:
            academic_flags += 1
            reasons.append({
                "indicator": "LMS Assignment Completion",
                "value": f"{lms_rate}%",
                "threshold": "75.0%",
                "message": f"Low coursework submission rate ({lms_rate}% assignments completed).",
                "severity": "warning"
            })
            
        if academic_critical >= 1 or academic_flags >= 3:
            academic_risk = "High"
        elif academic_flags >= 1:
            academic_risk = "Moderate"
        else:
            academic_risk = "Low"
            
    # ------------------ PLACEMENT RISK ASSESSMENT ------------------
    placement_flags = 0
    placement_critical = 0
    
    # If no placement tests conducted yet
    if aptitude is None and coding is None and mock_interview is None and placement_score is None:
        placement_risk = "Insufficient data"
        # Only add note if senior year (year 3 or 4)
        current_year = student_data.get("current_year", 3)
        if current_year >= 3:
            reasons.append({
                "indicator": "Placement Assessment",
                "value": "Unassessed",
                "threshold": "Year 3/4 baseline",
                "message": "Senior student has not yet completed placement readiness assessments.",
                "severity": "warning"
            })
    else:
        # Check Coding Score
        if coding is not None:
            if coding < 45.0:
                placement_flags += 2
                placement_critical += 1
                reasons.append({
                    "indicator": "Coding Assessment",
                    "value": f"{coding}/100",
                    "threshold": f"{th['placement']}/100",
                    "message": f"Coding assessment score ({coding}/100) indicates significant technical gap.",
                    "severity": "high"
                })
            elif coding < th["placement"]:
                placement_flags += 1
                reasons.append({
                    "indicator": "Coding Assessment",
                    "value": f"{coding}/100",
                    "threshold": f"{th['placement']}/100",
                    "message": f"Coding assessment is {coding}/100, needing skill refinement.",
                    "severity": "moderate"
                })
                
        # Check Aptitude Score
        if aptitude is not None:
            if aptitude < 45.0:
                placement_flags += 2
                placement_critical += 1
                reasons.append({
                    "indicator": "Aptitude Assessment",
                    "value": f"{aptitude}/100",
                    "threshold": f"{th['placement']}/100",
                    "message": f"Aptitude test score ({aptitude}/100) is well below recruiting threshold.",
                    "severity": "high"
                })
            elif aptitude < th["placement"]:
                placement_flags += 1
                reasons.append({
                    "indicator": "Aptitude Assessment",
                    "value": f"{aptitude}/100",
                    "threshold": f"{th['placement']}/100",
                    "message": f"Aptitude score is {aptitude}/100, below campus hiring benchmark.",
                    "severity": "moderate"
                })
                
        # Check Mock Interview
        if mock_interview is not None and mock_interview < 50.0:
            placement_flags += 1
            reasons.append({
                "indicator": "Mock Interview",
                "value": f"{mock_interview}/100",
                "threshold": "60.0/100",
                "message": f"Mock interview score ({mock_interview}/100) shows communication or technical interview deficit.",
                "severity": "warning"
            })
            
        if placement_critical >= 1 or placement_flags >= 3:
            placement_risk = "High"
        elif placement_flags >= 1:
            placement_risk = "Moderate"
        else:
            placement_risk = "Low"
            
    # ------------------ COMBINED RISK ASSESSMENT ------------------
    if academic_risk == "High" and placement_risk == "High":
        combined_risk = "High"
    elif academic_risk == "High" or placement_risk == "High":
        combined_risk = "High"
    elif academic_risk == "Moderate" and placement_risk == "Moderate":
        combined_risk = "Moderate"
    elif academic_risk == "Moderate" or placement_risk == "Moderate":
        combined_risk = "Moderate"
    elif academic_risk == "Insufficient data" and placement_risk == "Insufficient data":
        combined_risk = "Insufficient data"
    else:
        combined_risk = "Low"
        
    return {
        "academic_risk": academic_risk,
        "placement_risk": placement_risk,
        "combined_risk": combined_risk,
        "risk_reasons": reasons
    }
