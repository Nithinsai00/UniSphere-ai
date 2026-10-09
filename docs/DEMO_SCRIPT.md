# UniSphere AI — 5-Minute Hackathon Demo Script

**Hackathon**: HacXLerate 2026  
**Challenge**: KPMG in India — Smart Campus Analytics: Predict, Optimize & Improve Student Success  
**Application**: UniSphere AI — Student Success Intelligence Platform  

---

### Step 1: Opening & Problem Statement (0:00 - 0:45)
* **Visual**: Open browser at `http://localhost:5173/` (Splash / Welcome page).
* **Narrative**:
  > *"Colleges today sit on mountains of disconnected data — attendance biometric logs, ERP marks, LMS assignment platforms, and placement mock test portals. When a student falls behind, faculty only discover it after final semester results arrive — when it's too late.*
  > *Welcome to **UniSphere AI — Student Success Intelligence Platform**. Tagline: 'Every Student. A Better Future.'*
  > *UniSphere combines multi-source campus data into a unified 0-100 Student Success Score, detects academic and placement risks early with full explainability, and powers faculty interventions."*

---

### Step 2: Authentication & Role-Based Portals (0:45 - 1:15)
* **Visual**: Click **"Get Started"** or navigate to `http://localhost:5173/login`.
* **Action**: Show the 3 selectable role tabs: **Student**, **Faculty**, and **Admin**.
* **Highlight**:
  > *"Security and role boundaries are enforced on the server. Notice the convenient 'Demo Quick Fill' button on each tab for 1-click evaluation."*
* **Action**: Click "Autofill ADMIN" (logs in with username `admin` and prototype password `Hope@50`).

---

### Step 3: Administrator Command Center (1:15 - 2:30)
* **Visual**: Land on `/admin/dashboard`.
* **Points to Show**:
  1. **Summary Cards**: All 8 metrics (Total Students 360, Average Score 68.4/100, Academic Risk, Placement Risk, Combined Risk) are calculated dynamically from the live database.
  2. **Interactive Filters**: Change department dropdown to *Computer Science & Engineering* — notice charts, distributions, and risk rates update immediately.
  3. **Explainable At-Risk Triage**: Navigate to `/admin/at-risk`. Show how each student card displays the exact triggers:
     * *“Attendance: 62% (below 75% threshold)”*
     * *“Coding Assessment: 38/100 (below 60 cutoff)”*
  4. **Data Integration**: Navigate to `/admin/data-integration`.
     * Show downloadable standardized CSV templates for all 6 data categories.
     * Upload `data/templates/sample_academics.csv`. Click **Inspect & Validate Schema**.
     * Show the staged preview table with column mapping and validation check before commit.
  5. **Scoring Settings**: Navigate to `/admin/settings`.
     * Show the interactive sliders for component weights (Academic 30%, Attendance 20%, LMS 15%, Placement 20%, Skills 15%).
     * Adjust a weight and show validation: must sum to 100%.

---

### Step 4: Faculty Mentoring Portal (2:30 - 3:30)
* **Action**: Log out and switch to Faculty login (`FAC001` / `Faculty@2026`).
* **Visual**: Land on `/faculty/dashboard`.
* **Highlight**:
  > *"Notice that Faculty only see students within their departmental jurisdiction (Computer Science & Engineering). Data privacy is respected."*
* **Action**: Click on a high-risk student profile.
  * Show explainable risk reasons.
  * Click **"Assign Faculty Intervention"** → Select *Coding Practice*, Priority *Urgent*, Title *"Targeted DSA Mentoring"*.
  * Submit and open `/faculty/interventions` to show the newly scheduled mentoring case with timeline tracking.

---

### Step 5: Student Success Hub (3:30 - 4:15)
* **Action**: Log out and switch to Student login (`STU1001` / `Student@2026`).
* **Visual**: Land on `/student/dashboard`.
* **Highlight**:
  > *"Unlike traditional administrative dashboards that shame students with red labels, the Student Hub is designed with an encouraging, supportive growth mindset.*
  > *The student sees their holistic 0-100 score breakdown across Academics, Attendance, LMS, Placement, and Skills.*
  > *Crucially, they receive 'Your Next Steps' — personalized, actionable learning guidance grounded in their actual course trajectory."*

---

### Step 6: "Ask UniSphere" Natural Language Campus Assistant (4:15 - 4:45)
* **Visual**: Click the glowing **"Ask UniSphere AI"** button in the top navbar from any page.
* **Action**: Click a suggested prompt or type:
  * *"Which department has the highest academic risk?"*
  * *"How many students have low placement readiness?"*
* **Highlight**:
  > *"Ask UniSphere answers questions in natural language by executing validated backend analytical functions. It prevents SQL injection while delivering instant institutional intelligence."*

---

### Step 7: Closing & Architecture Summary (4:45 - 5:00)
* **Summary**:
  > *"UniSphere AI is not a static mockup: it is a full-stack, tested, production-ready solution featuring a normalized database, FastAPI backend with Scikit-learn clustering, React 19 frontend with Tailwind CSS, and explainable AI.*
  > *Thank you, KPMG and HacXLerate 2026!"*
