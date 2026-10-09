from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def classify_student_segment(
    academic_score: Optional[float],
    placement_score: Optional[float],
    academic_benchmark: float = 65.0,
    placement_benchmark: float = 60.0
) -> str:
    """
    Rule-based 2x2 matrix segmentation:
    1. Strong Academics + Strong Placement
    2. Strong Academics + Weak Placement
    3. Weak Academics + Strong Placement
    4. Weak Academics + Weak Placement
    5. Insufficient Data
    """
    if academic_score is None:
        return "Insufficient Data"
        
    if placement_score is None:
        # Placement unassessed
        if academic_score >= academic_benchmark:
            return "Strong Academics + Unassessed Placement"
        else:
            return "Weak Academics + Unassessed Placement"
            
    is_strong_acad = academic_score >= academic_benchmark
    is_strong_place = placement_score >= placement_benchmark
    
    if is_strong_acad and is_strong_place:
        return "Strong Academics + Strong Placement"
    elif is_strong_acad and not is_strong_place:
        return "Strong Academics + Weak Placement"
    elif not is_strong_acad and is_strong_place:
        return "Weak Academics + Strong Placement"
    else:
        return "Weak Academics + Weak Placement"

def run_ml_clustering(students: List[Dict[str, Any]], n_clusters: int = 4) -> Dict[str, Any]:
    """
    Performs K-Means clustering on normalized student features:
    academic_score, attendance_score, lms_score, placement_score, skills_score.
    
    Returns cluster summaries, centroid means, and statistical insights.
    """
    if len(students) < 10:
        return {
            "status": "skipped",
            "message": "Need at least 10 student records for meaningful ML clustering.",
            "clusters": []
        }
        
    features = []
    valid_students = []
    
    for s in students:
        # Impute missing placement or LMS with median/mean of student's available scores
        acad = s.get("academic_score") or 60.0
        att = s.get("attendance_score") or 75.0
        lms = s.get("lms_score") or 65.0
        place = s.get("placement_score") or 55.0
        skills = s.get("skills_score") or 40.0
        
        features.append([acad, att, lms, place, skills])
        valid_students.append(s)
        
    X = np.array(features)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    k = min(n_clusters, len(valid_students) // 2)
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    
    # Calculate cluster statistics
    cluster_summaries = []
    for c_id in range(k):
        c_mask = (labels == c_id)
        count = int(np.sum(c_mask))
        if count == 0:
            continue
            
        c_data = X[c_mask]
        means = np.mean(c_data, axis=0)
        
        # Name cluster based on centroid signature
        if means[0] >= 70 and means[3] >= 65:
            cluster_name = "High Performers & Placement Ready"
            recommendation = "Provide advanced leadership tracks, company hackathons, and research mentorship."
        elif means[0] >= 65 and means[3] < 60:
            cluster_name = "Academic High Achievers Needing Placement Polish"
            recommendation = "Intensive coding drills, mock interview labs, and resume crafting."
        elif means[0] < 60 and means[3] >= 60:
            cluster_name = "Technically Practical Students with Academic Friction"
            recommendation = "Targeted remedial coursework and attendance stabilization to ensure degree eligibility."
        else:
            cluster_name = "Comprehensive Support Cohort"
            recommendation = "Coordinated academic tutoring, counselor check-ins, and foundational skills training."
            
        cluster_summaries.append({
            "cluster_id": c_id,
            "name": cluster_name,
            "count": count,
            "percentage": round((count / len(valid_students)) * 100.0, 1),
            "centroids": {
                "academic": round(float(means[0]), 1),
                "attendance": round(float(means[1]), 1),
                "lms": round(float(means[2]), 1),
                "placement": round(float(means[3]), 1),
                "skills": round(float(means[4]), 1),
            },
            "recommendation": recommendation
        })
        
    return {
        "status": "success",
        "total_analyzed": len(valid_students),
        "k_clusters": k,
        "clusters": cluster_summaries
    }
