# UniSphere AI — Scoring & Risk Engine Methodology

## 1. Student Success Score Engine

The Student Success Score is a transparent, multi-dimensional index between **0 and 100** designed to measure holistic student potential, engagement, and career readiness.

### Scoring Formula

$$
\text{Success Score} = w_{\text{acad}} \cdot S_{\text{acad}} + w_{\text{att}} \cdot S_{\text{att}} + w_{\text{lms}} \cdot S_{\text{lms}} + w_{\text{place}} \cdot S_{\text{place}} + w_{\text{skills}} \cdot S_{\text{skills}}
$$

Default prototype weights:
* **Academic Performance ($w_{\text{acad}}$)**: 30% (0.30)
* **Attendance Rate ($w_{\text{att}}$)**: 20% (0.20)
* **LMS Coursework ($w_{\text{lms}}$)**: 15% (0.15)
* **Placement Readiness ($w_{\text{place}}$)**: 20% (0.20)
* **Skills & Co-Curricular ($w_{\text{skills}}$)**: 15% (0.15)

All weights are fully configurable by administrators in `/admin/settings`, with validation enforcing $\sum w_i = 1.00$.

---

## 2. Component Normalization Rules (0–100 Scale)

### A. Academic Performance ($S_{\text{acad}}$)
Combines normalized CGPA and internal assessment marks (50/50 balance) minus penalties for pending backlogs:
$$
S_{\text{acad}} = \max\left(0, \min\left(100, \left[0.5 \cdot \left(\frac{\text{CGPA}}{10.0} \times 100\right) + 0.5 \cdot \text{CIE}\right] - (7 \times \text{Backlogs})\right)\right)
$$

### B. Attendance Score ($S_{\text{att}}$)
Direct clamped percentage:
$$
S_{\text{att}} = \max(0, \min(100, \text{Attendance \%}))
$$

### C. LMS Activity ($S_{\text{lms}}$)
Weighted assignment completion rate (70%) and login frequency (30%, where 5+ weekly logins achieves 100%):
$$
S_{\text{lms}} = 0.70 \cdot \text{Completion \%} + 0.30 \cdot \min\left(100, \frac{\text{Logins/Week}}{5} \times 100\right)
$$

### D. Placement Readiness ($S_{\text{place}}$)
Combines technical coding assessments (40%), quantitative/logical aptitude (35%), and mock interviews (25%):
$$
S_{\text{place}} = 0.40 \cdot \text{Coding} + 0.35 \cdot \text{Aptitude} + 0.25 \cdot \text{Mock Interview}
$$

### E. Skills & Engagement ($S_{\text{skills}}$)
Rewards co-curricular initiative:
* Hackathons: 20 pts each (max 40)
* Professional Certifications: 15 pts each (max 30)
* Campus Chapters & Clubs: 10 pts each (max 20)
* Soft Skills Evaluation: max 10 pts

---

## 3. Policy for Missing & Unassessed Data

> [!IMPORTANT]
> **No Punitive Zero Policy:** If a student has not yet taken a diagnostic assessment (for example, Year 1 or Year 2 junior students where placement training has not yet commenced), UniSphere does **NOT** treat missing fields as zero.

Instead, the system:
1. Re-normalizes the active component weights over available dimensions:
   $$
   \text{Success Score} = \frac{\sum_{i \in \text{Available}} w_i \cdot S_i}{\sum_{i \in \text{Available}} w_i}
   $$
2. Sets `is_provisional = True`.
3. Documents missing dimensions in `missing_components` so faculty and students have complete transparency.

---

## 4. Explainable At-Risk Student Identification

UniSphere separates risk flags into independent vectors:
1. **Academic Risk**: Attendance shortage (< 75%), active backlogs, low CGPA (< 6.5), or low internal continuous evaluation (< 60/100).
2. **Placement Risk**: Coding deficit (< 60/100), aptitude deficit (< 60/100), or mock interview deficit (< 60/100). Junior unassessed students are classified as *Insufficient Data* rather than High Risk.
3. **Combined Risk**: Concurrence of both academic and placement vulnerability.

### Explainable Trigger Output Format
Every flagged record includes an auditable JSON breakdown:
```json
{
  "indicator": "Attendance",
  "value": "62.0%",
  "threshold": "75.0%",
  "message": "Critical attendance shortage (62.0%). Well below the 75.0% institutional threshold.",
  "severity": "high"
}
```

---

## 5. Student Segmentation (2x2 Matrix & K-Means)

### A. Deterministic 2x2 Matrix
* **Strong Academics + Strong Placement**: Academic $\ge 65$, Placement $\ge 60$
* **Strong Academics + Weak Placement**: Academic $\ge 65$, Placement $< 60$
* **Weak Academics + Strong Placement**: Academic $< 65$, Placement $\ge 60$
* **Weak Academics + Weak Placement**: Academic $< 65$, Placement $< 60$

### B. Unsupervised K-Means Machine Learning
Uses `scikit-learn` `StandardScaler` and `KMeans(k=4)` across normalized student feature vectors to discover empirical behavior clusters and generate institutional policy guidance.
