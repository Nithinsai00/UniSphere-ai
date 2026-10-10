# UniSphere: Smart Campus Analytics for Predicting, Optimizing, and Improving Student Success

**Authors:** UniSphere Engineering Team  
**Institution:** Academic Analytics & Student Success Research Group  
**Event:** HacXLerate 2026 | KPMG in India Challenge  
**Publication Format:** Technical Engineering Paper (Single-Column Format)  

---

## Abstract

Higher educational institutions face significant challenges in identifying at-risk students early enough to provide meaningful help. Academic data, daily attendance records, digital Learning Management System (LMS) engagement logs, and career placement metrics are usually scattered across disconnected systems. When faculty or administrators notice that a student is struggling, it is often too late—leading to course failures, backlogs, dropouts, or poor placement outcomes. 

This paper presents **UniSphere**, an end-to-end Smart Campus Analytics and Student Success Intelligence Platform. UniSphere connects fragmented campus data into a centralized, explainable intelligence system. The platform introduces three core innovations: 
1. **The Student Success Score (SSS):** A weighted, multi-dimensional metric (0–100) combining academic performance, attendance records, digital LMS activity, placement readiness tests, and extracurricular engagement with automatic handling for missing data.
2. **An Explainable Multi-Factor Risk Assessment Engine:** A rule-driven diagnostic system that flags students as Low, Moderate, or High Risk across Academic and Placement dimensions, providing transparent reasons for every alert.
3. **Role-Based Portals and Closing-the-Loop Workflows:** Dedicated interfaces for Students, Faculty, and Administrators that enable targeted interventions, student-faculty messaging, study material sharing, and institutional report generation.

UniSphere is implemented using a modern technology stack comprising a React 18 / TypeScript frontend and a high-performance Python FastAPI backend. The entire platform operates as a unified single-port web service capable of local execution, secure tunnel sharing, and zero-configuration cloud deployment on platforms like Render. This paper describes every step of the system's requirements, mathematical formulations, database architecture, user workflows, and deployment procedures.

**Index Terms:** Smart Campus Analytics, Student Success Score, Early Warning System, Learning Analytics, Educational Data Mining, FastAPI, React, Role-Based Access Control, Cloud Deployment.

---

## 1. Introduction and Problem Motivation

### 1.1 Background
Higher education institutions serve diverse student bodies enrolled in multi-year undergraduate and postgraduate programs. Throughout an academic year, students interact with several independent university systems:
* **Academic Evaluation Systems:** Recording Midterm examinations, semester Grade Point Averages (SGPA), Cumulative Grade Point Averages (CGPA), and subject backlogs.
* **Attendance Tracking Systems:** Measuring daily lecture, tutorial, and laboratory attendance.
* **Learning Management Systems (LMS):** Tracking lecture material downloads, assignment submissions, deadlines, and login consistency.
* **Career and Placement Cells:** Evaluating competitive coding scores, quantitative aptitude benchmarks, and mock interview performance.
* **Student Affairs and Mentorship Bodies:** Organizing hackathons, professional certifications, and student clubs.

### 1.2 The Core Problem: Data Silos and Reactive Interventions
In conventional university management, these data sources exist in isolated databases. A student might stop attending lectures in week 3, miss online LMS assignments in week 5, and fail midterms in week 8. Because attendance records and LMS portals are not connected, academic advisors typically learn of the student's distress only after semester results are published. 

This reactive approach has severe consequences:
* **High Failure and Dropout Rates:** Students fall into academic probation before warning signals are seen.
* **Faculty Overhead:** Instructors must manually review multiple spreadsheets to find lagging students.
* **Student Anxiety:** Students lack real-time visibility into how their daily habits impact their placement readiness.
* **Administrative Blind Spots:** Deans and Department Heads lack real-time comparative insights across branches and academic years.

### 1.3 The UniSphere Solution
UniSphere was designed to replace fragmented spreadsheets with a proactive, transparent, and user-friendly platform. Rather than acting as a black-box machine learning system that outputs unexplained scores, UniSphere prioritizes **explainability**. Every risk flag points directly to its underlying metric (e.g., *"Attendance is 62%, below the required 75% institutional threshold"*). This enables advisors to take immediate, constructive action.

---

## 2. System Architecture and Design Overview

UniSphere uses a decoupled, modern multi-tier architecture. It is packaged to run as a **single unified process** where the backend serves both the RESTful API endpoints and the compiled single-page application (SPA).

```
+-----------------------------------------------------------------------------------+
|                                CLIENT TIER (Browser)                             |
|   - 4-Second Animated Canvas 3D Globe Launch Screen                               |
|   - Custom Circular Role Selector (Student | Faculty | Admin)                     |
|   - Role-Protected Views: Student Portal | Faculty Portal | Admin Portal           |
+-----------------------------------------------------------------------------------+
                                         │
                                  HTTP / JSON (REST)
                                         │
+-----------------------------------------------------------------------------------+
|                        APPLICATION & API TIER (FastAPI)                           |
|   - JWT Authentication & BCrypt Password Hashing                                  |
|   - Static SPA Fallback Router (Serves React Production Bundle / HTML5 PushState) |
|   - API Routers: Auth, Student, Faculty, Admin, Reports, Analytics, Assistant    |
+-----------------------------------------------------------------------------------+
                                         │
+-----------------------------------------------------------------------------------+
|                        BUSINESS LOGIC & ANALYTICS ENGINES                         |
|   - Student Success Scoring Engine (SSS Multi-Component Normalization)            |
|   - Explainable Risk Engine (Academic, Placement, Combined Classifications)      |
|   - Student Segmentation Engine (4-Quadrant Performance Clustering)              |
|   - Recommendation & Next Best Action Generator                                   |
|   - Automated Reports Generator (8 Report Types + CSV/PDF Export)                 |
+-----------------------------------------------------------------------------------+
                                         │
+-----------------------------------------------------------------------------------+
|                       PERSISTENCE & STORAGE TIER                                  |
|   - SQLAlchemy ORM with Connection Pooling & Foreign Key Integrity                |
|   - Relational Database (SQLite for Local / PostgreSQL for Cloud)                |
|   - Local File Storage Engine for Study Materials & Syllabi                       |
+-----------------------------------------------------------------------------------+
```

### 2.1 Major Architectural Components
1. **Client Tier (Frontend):** Built with React 18, Vite, TypeScript, and Tailwind CSS. Provides glassmorphic interfaces, responsive layouts, data visualization charts (via Recharts), and real-time state management.
2. **API & Routing Tier (Backend):** Built with FastAPI and Uvicorn. Exposes REST endpoints, validates input data using Pydantic models, handles role-based authorization tokens, and serves static frontend bundles.
3. **Analytics Engine:** A Python service layer implementing the Student Success Score (SSS), multi-factor risk categorization, and cohort segmentation.
4. **Persistence Tier:** Uses SQLAlchemy 2.0 to support both SQLite (zero-setup development) and PostgreSQL (production deployment on cloud environments) with automatic table creation and data seeding.

---

## 3. Data Modeling and Database Schema

The database schema captures the complete student lifecycle across academics, attendance, digital activity, career readiness, mentorship interventions, and communications.

### 3.1 Primary Database Entities

| Table Name | Primary Purpose | Key Fields |
| :--- | :--- | :--- |
| **`users`** | Authentication and credentials | `id`, `username`, `email`, `hashed_password`, `role`, `is_active` |
| **`departments`** | Academic branch definitions | `id`, `code`, `name` |
| **`students`** | Core student profiles & computed metrics | `id`, `student_id`, `full_name`, `cgpa`, `internal_marks`, `backlog_count`, `overall_attendance`, `assignment_completion_rate`, `lms_login_frequency`, `aptitude_score`, `coding_score`, `mock_interview_score`, `success_score`, `academic_risk`, `placement_risk`, `combined_risk`, `segment` |
| **`faculty`** | Faculty instructor profiles | `id`, `faculty_id`, `full_name`, `department`, `designation`, `assigned_subjects`, `assigned_classes` |
| **`interventions`** | Mentorship and remedial workflows | `id`, `student_id`, `faculty_id`, `category`, `priority`, `status`, `title`, `description`, `due_date`, `outcome_notes` |
| **`intervention_updates`**| Audit timeline for interventions | `id`, `intervention_id`, `author_name`, `notes`, `created_at` |
| **`student_messages`** | Two-way student-faculty messaging | `id`, `student_id`, `sender_name`, `sender_role`, `subject`, `content`, `category`, `is_read`, `replies` |
| **`assignments`** | Subject assignment tracking | `id`, `faculty_id`, `title`, `subject`, `target_class`, `due_date`, `is_published` |
| **`student_improvement_tasks`**| Individual tasks assigned to lagging students | `id`, `student_id`, `faculty_id`, `title`, `subject`, `reason`, `status`, `due_date` |
| **`study_materials`** | Course files and notes repository | `id`, `faculty_id`, `title`, `subject`, `target_class`, `filename`, `file_path`, `file_size_formatted`, `download_count` |
| **`score_configurations`**| Configurable weights and risk thresholds | `id`, `version`, `weight_academic`, `weight_attendance`, `weight_lms`, `weight_placement`, `weight_skills`, `attendance_threshold`, `academic_cgpa_threshold` |
| **`generated_reports`** | Archived administrative reports | `id`, `report_name`, `report_type`, `category`, `department`, `filters_applied`, `summary_metrics`, `status` |

---

## 4. The Student Success Score (SSS) Engine

The **Student Success Score (SSS)** is the central metric of UniSphere. It combines multiple areas of student achievement into a single score from 0 to 100. Rather than treating all components equally, UniSphere uses transparent, configurable weights.

### 4.1 Step-by-Step Scoring Algorithm

#### Step 1: Normalizing Academic Performance ($S_{academic}$)
Academic performance is calculated using Cumulative Grade Point Average (CGPA, measured on a 10.0 scale) and internal assessment marks (measured out of 100). If active backlogs exist, an institutional penalty is deducted:

$$\text{CGPA}_{\text{norm}} = \min\left(100, \frac{\text{CGPA}}{10.0} \times 100\right)$$

$$\text{Internal}_{\text{norm}} = \min(100, \max(0, \text{Internal Marks}))$$

$$\text{Base Academic Score} = (0.50 \times \text{CGPA}_{\text{norm}}) + (0.50 \times \text{Internal}_{\text{norm}})$$

$$\text{Backlog Penalty} = \text{Active Backlogs} \times 7.0$$

$$S_{academic} = \max\left(0.0, \min(100.0, \text{Base Academic Score} - \text{Backlog Penalty})\right)$$

*Example:* A student with a CGPA of 7.0, internal marks of 75, and 1 active backlog:
* $\text{CGPA}_{\text{norm}} = 70.0$
* $\text{Internal}_{\text{norm}} = 75.0$
* $\text{Base Score} = (0.5 \times 70) + (0.5 \times 75) = 72.5$
* $\text{Backlog Penalty} = 1 \times 7.0 = 7.0$
* $S_{academic} = 72.5 - 7.0 = 65.5 / 100$

#### Step 2: Normalizing Attendance ($S_{attendance}$)
Attendance is already recorded as a percentage (0–100%):

$$S_{attendance} = \max(0.0, \min(100.0, \text{Overall Attendance \%}))$$

#### Step 3: Normalizing LMS Digital Engagement ($S_{lms}$)
LMS activity measures digital coursework engagement. It combines assignment completion percentage (70% weight) with weekly login frequency (30% weight, where 5 or more logins per week equals full marks):

$$\text{Login}_{\text{norm}} = \min\left(100.0, \frac{\text{Logins per Week}}{5.0} \times 100.0\right)$$

$$S_{lms} = (0.70 \times \text{Assignment Completion Rate}) + (0.30 \times \text{Login}_{\text{norm}})$$

#### Step 4: Normalizing Placement Readiness ($S_{placement}$)
Placement readiness evaluates technical aptitude, coding assessments, and communication skills:

$$S_{placement} = (0.35 \times \text{Aptitude}) + (0.40 \times \text{Coding}) + (0.25 \times \text{Mock Interview})$$

If placement tests have not yet been conducted (common for first- and second-year students), this component returns `None`, triggering the provisional scoring mechanism described below.

#### Step 5: Normalizing Holistic Skills and Engagement ($S_{skills}$)
UniSphere rewards co-curricular learning, such as hackathons, verified technical certifications, club memberships, and soft skills:

* Hackathons: 20 points each (capped at 40 points)
* Certifications: 15 points each (capped at 30 points)
* Student Clubs: 10 points each (capped at 20 points)
* Soft Skills Assessment: Scaled to 10 points

$$S_{skills} = \min(100.0, \text{Points}_{\text{hack}} + \text{Points}_{\text{cert}} + \text{Points}_{\text{club}} + \text{Points}_{\text{soft}})$$

#### Step 6: Dynamic Weight Aggregation and Handling Missing Data
Under standard conditions, the Student Success Score is calculated using these baseline weights:
* Academic Performance ($w_{academic}$): **30% (0.30)**
* Attendance Record ($w_{attendance}$): **20% (0.20)**
* LMS Activity ($w_{lms}$): **15% (0.15)**
* Placement Readiness ($w_{placement}$): **20% (0.20)**
* Holistic Engagement ($w_{skills}$): **15% (0.15)**

$$\sum w_i = 0.30 + 0.20 + 0.15 + 0.20 + 0.15 = 1.00$$

When certain components are missing (for instance, junior students who have not yet taken placement assessments), UniSphere does **not** assume a score of zero, which would unfairly drag down their average. Instead, the engine dynamically **re-normalizes** the weights across the available components:

$$SSS = \frac{\sum_{i \in \text{Available}} (w_i \times S_i)}{\sum_{i \in \text{Available}} w_i}$$

The record is then flagged as `is_provisional = True`, and the list of missing categories is saved so advisors understand the context of the score.

---

## 5. Explainable Multi-Factor Risk Assessment Engine

Rather than relying on complex, unexplainable artificial intelligence models, UniSphere uses an **Explainable Risk Engine**. When a student is flagged, the system stores the exact parameter, the recorded value, the institutional threshold, and a clear explanatory message.

```
+---------------------------------------------------------------------------+
|                          STUDENT RISK DIAGNOSTIC                          |
+---------------------------------------------------------------------------+
| Indicator: Attendance Shortage                                            |
| Actual Value: 61.5%               Threshold: 75.0%                        |
| Severity: High Risk (Critical)                                            |
| Reason: Attendance is well below the mandatory 75% university policy.     |
+---------------------------------------------------------------------------+
| Indicator: Active Backlogs                                                |
| Actual Value: 2                   Threshold: 0                            |
| Severity: High Risk                                                       |
| Reason: Multiple uncleared backlogs detected. Remedial support required. |
+---------------------------------------------------------------------------+
```

### 5.1 Risk Dimensions and Rules

#### 1. Academic Risk Classification
* **Critical Indicators:**
  * Attendance $< 65.0\%$ (+2 risk flags, Critical)
  * Active Backlogs $\ge 2$ (+2 risk flags, Critical)
  * CGPA $< 5.5$ (+2 risk flags, Critical)
  * Internal Marks $< 50.0$ (+2 risk flags, Critical)
* **Moderate Indicators:**
  * Attendance between $65.0\%$ and $74.9\%$ (+1 flag)
  * Active Backlogs $= 1$ (+1 flag)
  * CGPA between $5.5$ and $6.49$ (+1 flag)
  * Internal Marks between $50.0$ and $59.9$ (+1 flag)
  * LMS Assignment Completion $< 50.0\%$ (+1 flag)
* **Classification Logic:**
  * **High Risk:** 1 or more Critical flags OR 3 or more total risk flags.
  * **Moderate Risk:** 1 or 2 total risk flags.
  * **Low Risk:** 0 risk flags.

#### 2. Placement Risk Classification
* **Critical Indicators:**
  * Coding Assessment $< 45.0\%$ (+2 flags, Critical)
  * Overall Placement Score $< 50.0\%$ (+2 flags, Critical)
* **Moderate Indicators:**
  * Coding Assessment between $45.0\%$ and $59.9\%$ (+1 flag)
  * Aptitude Score $< 55.0\%$ (+1 flag)
  * Mock Interview Score $< 55.0\%$ (+1 flag)
* **Classification Logic:**
  * **High Risk:** 1 or more Critical placement flags OR 3 or more flags.
  * **Moderate Risk:** 1 or 2 placement flags.
  * **Low Risk:** 0 placement flags.
  * **Insufficient Data:** Student has not yet taken placement assessments.

#### 3. Combined Institutional Risk
The combined risk summarizes the student's overall standing:
* **High Combined Risk:** If *either* Academic Risk is High OR Placement Risk is High.
* **Moderate Combined Risk:** If Academic or Placement Risk is Moderate and neither is High.
* **Low Combined Risk:** If all available dimensions reflect Low Risk.

### 5.2 Student Cohort Segmentation
To help department heads understand their student population, the system groups students into four performance quadrants:
1. **Strong Academics + Strong Placement:** High achievers on track for academic honors and top-tier placements.
2. **High Placement Potential, Academic Lag:** Technically skilled students who need help with attendance or internal exam scores.
3. **Academic Strong, Placement Deficit:** Good test-takers who need practical training in competitive coding or interview confidence.
4. **Critical Intervention Required:** Students with multiple flags across both academics and placements who require immediate faculty mentoring.

---

## 6. Role-Based Portals and User Workflows

UniSphere includes three role-specific portals: Student, Faculty, and Administrator.

```
                                    [ UniSphere Launch Page ]
                                               │
                                 [ 3-Role Circular Selector ]
                                 ┌─────────────┼─────────────┐
                                 │             │             │
                             [ Student ]   [ Faculty ]   [ Admin ]
                                 │             │             │
                                 ▼             ▼             ▼
                           Student Portal  Faculty Portal  Admin Portal
```

### 6.1 The Launch Experience and Animated Visuals
1. **Interactive Animated 3D Globe:** Built using an HTML5 Canvas component that smoothly rotates over a 4-second initial cycle. Dual orbital rings gently pulse with glowing green connection nodes, symbolizing global campus connectivity.
2. **Branding and Layout:** Clean typography featuring the title *"UniSphere – Smart Campus Analytics for a Brighter Tomorrow"* over a light-green and beige background.
3. **Circular Role Selector Wheel:** A 3-quadrant role selector:
   * **Student Role:** Centered in the top segment.
   * **Faculty Role:** Centered in the bottom-left segment.
   * **Admin Role:** Centered in the bottom-right segment.

---

### 6.2 Student Portal Workflows
The Student Portal provides students with full visibility into their academic health.

```
+-----------------------------------------------------------------------------------+
|                              STUDENT PORTAL DASHBOARD                             |
+-----------------------------------------------------------------------------------+
| [Success Score: 84/100]  [Attendance: 88%]  [CGPA: 8.4]  [LMS Completion: 92%]    |
+-----------------------------------------------------------------------------------+
| [Inbox & Faculty Chat]    - Messages from professors, remedial advice, reminders  |
| [AI Recommendations]     - Actionable steps: practice mock tests, upload labs    |
| [Study Materials Hub]    - Download lecture notes, review syllabus PDFs           |
| [Attendance & LMS Log]   - Track daily lecture attendance and assignment records  |
| [Career Readiness]       - Monitor aptitude, technical coding, and mock scores    |
+-----------------------------------------------------------------------------------+
```

#### Detailed Student Steps:
1. **Reviewing the Success Score:** The dashboard displays the overall SSS alongside individual contributions (Academics, Attendance, LMS, Placement, Skills).
2. **Checking the Student Inbox:** Students can review communications from faculty advisors, read meeting invites, and send direct replies.
3. **Viewing AI Recommendations:** The system generates personalized recommendations based on active risk flags (e.g., *"Your coding score is 48/100. Practice dynamic programming modules before next week's drive"*).
4. **Accessing Study Materials:** Students can filter course notes and syllabi by subject, semester, and unit, and download them with one click.

---

### 6.3 Faculty Portal Workflows
The Faculty Portal gives instructors the tools they need to monitor classes, spot lagging students, and run timely interventions.

```
+-----------------------------------------------------------------------------------+
|                              FACULTY PORTAL DASHBOARD                             |
+-----------------------------------------------------------------------------------+
| Assigned Classes: CSE-3A, CSE-3B | Subjects: Operating Systems, Algorithms        |
+-----------------------------------------------------------------------------------+
| [Class Performance Overview]  - Class average SSS, attendance distribution        |
| [At-Risk Student Alerts]      - Instant filter for students needing attention     |
| [Issue Interventions]         - Schedule mentoring, assign improvement tasks      |
| [Study Materials Manager]     - Upload lecture notes with tags and class targets  |
| [Direct Messaging]            - Send notices directly to student inboxes          |
+-----------------------------------------------------------------------------------+
```

#### Detailed Faculty Steps:
1. **Reviewing Class Health:** Instructors view average SSS scores, attendance percentages, and risk breakdowns for their assigned subjects.
2. **Filtering At-Risk Rosters:** With one click, instructors can isolate students with critical attendance shortages or low internal marks.
3. **Initiating an Intervention:**
   * The faculty member selects a student and clicks **"Create Intervention"**.
   * They specify the category (*Remedial Teaching*, *Attendance Support*, or *Academic Mentoring*), set a priority level, add notes, and choose a due date.
   * The intervention is recorded with an audit trail that tracks progress until resolved.
4. **Uploading Study Materials:** Instructors upload PDFs or lecture notes, tag them with the subject, semester, and unit, and publish them instantly to the Student Hub.

---

### 6.4 Administrator Portal Workflows
The Administrator Portal provides campus-wide oversight for Deans, Principals, and Department Heads.

```
+-----------------------------------------------------------------------------------+
|                               ADMIN PORTAL DASHBOARD                              |
+-----------------------------------------------------------------------------------+
| Total Students: 1,250 | Campus Avg SSS: 76.4 | Attendance: 82.1% | At-Risk: 142   |
+-----------------------------------------------------------------------------------+
| [Department Analytics]  - Compare CSE, ECE, MECH, CIVIL on SSS and attendance    |
| [Intervention Oversight]- Monitor resolution rates across departments             |
| [Reports & Analytics]   - Generate, preview, and export 8 institutional reports   |
| [Data Integration]      - Import CSV/LMS records or trigger sample datasets       |
+-----------------------------------------------------------------------------------+
```

#### Detailed Administrator Steps:
1. **Department Benchmarking:** Administrators can compare departments side-by-side on average SSS, attendance rates, and placement figures.
2. **Generating Institutional Reports:** UniSphere includes a dedicated reporting engine supporting eight report types:
   * *Student Success Score Report*
   * *At-Risk Students Report*
   * *Attendance Deficiency Report*
   * *Academic Performance & Backlogs Report*
   * *LMS Engagement Report*
   * *Placement Readiness Report*
   * *Department Performance Report*
   * *Comprehensive Campus Analytics Report*
3. **Filtering and Exporting:** Administrators can filter by academic year, department, and risk level. The system calculates aggregate metrics on the fly, provides an interactive preview, and exports clean CSV files for accreditation reviews (such as NAAC or NBA).

---

## 7. Security, Authentication, and Data Privacy

UniSphere is designed to protect sensitive student academic and personal information.

### 7.1 Authentication Pipeline
1. **Credential Transmission:** User credentials (username/email and password) are submitted over HTTPS to the `/api/auth/token` endpoint.
2. **Cryptographic Verification:** Passwords are never stored in plain text. They are hashed using **BCrypt** with an automatic cryptographic salt.
3. **Stateless JWT Issuance:** Upon successful verification, the server issues a JSON Web Token (JWT) signed with HMAC-SHA256 containing the user ID, role, and expiration timestamp.
4. **Token Storage and Interception:** The client application stores the JWT in memory and attaches it as a `Bearer` token to the `Authorization` HTTP header for all subsequent API requests.

### 7.2 Role-Based Access Control (RBAC)
FastAPI dependency injection enforces strict role checks on every request:
* **Student Endpoints (`/api/student/*`):** Restricted to users with the `student` role. Students can only view their own records; attempting to query another student's ID returns `403 Forbidden`.
* **Faculty Endpoints (`/api/faculty/*`):** Restricted to `faculty` and `admin` roles. Faculty can view data for their assigned classes and subjects.
* **Administrator Endpoints (`/api/admin/*`):** Restricted exclusively to the `admin` role.

---

## 8. Technology Stack and Implementation Details

UniSphere combines high-performance Python backend services with a responsive, modern TypeScript frontend.

```
+-----------------------------------------------------------------------------------+
|                                  TECHNOLOGY STACK                                 |
+-------------------------+---------------------------------------------------------+
| Frontend Framework      | React 18 with TypeScript                                |
| Build Tool              | Vite 8.3 (Fast compilation and asset bundling)          |
| Styling & UI System     | Tailwind CSS with glassmorphic cards and color tokens   |
| Charts & Visualizations | Recharts (Responsive bar, line, radar, and area charts) |
| Icons                   | Lucide React                                            |
| Backend API Framework   | FastAPI (Python 3.11, asynchronous ASGI)                |
| ASGI Server             | Uvicorn                                                 |
| ORM & Database Access   | SQLAlchemy 2.0                                          |
| Relational Databases    | SQLite (Development) / PostgreSQL (Production)          |
| Validation & Parsing    | Pydantic v2 & Email-Validator                           |
| Data Analysis & Math    | Pandas, NumPy, Scikit-Learn                             |
| Deployment Architecture | Single-port static SPA hosting, Docker, Render, Cloudflare|
+-------------------------+---------------------------------------------------------+
```

### 8.1 Single-Port Deployment Architecture
A common challenge in deploying full-stack web applications is managing separate hosting environments for the frontend and backend. UniSphere solves this with a **single-port architecture**:
* During the frontend build (`npm run build`), Vite compiles the entire React application into static HTML, JavaScript, and CSS bundles stored in `frontend/dist/`.
* FastAPI mounts `frontend/dist/assets` under `/assets` and `frontend/dist/photos` under `/photos`.
* A catch-all route in FastAPI (`@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])`) handles all incoming traffic:
  1. Requests starting with `/api`, `/docs`, or `/openapi.json` are routed to FastAPI endpoints.
  2. Requests matching physical static files (e.g., images, icons) are served directly.
  3. All other routes return `frontend/dist/index.html`, allowing React Router to handle client-side navigation without 404 errors.

---

## 9. Deployment and Cloud Architecture

UniSphere supports three flexible deployment models: local background execution, secure public tunneling, and zero-configuration cloud hosting.

### 9.1 Local Background Execution
To run UniSphere on a local workstation without keeping terminal windows open, the platform includes automated startup scripts:
* **`run.py`:** A single launch script that checks for the compiled frontend, reads the `$PORT` and `$HOST` environment variables, and starts Uvicorn.
* **`start_silent.bat` and `run_silent_background.vbs`:** Windows background scripts that start the application via `pythonw.exe` in the background, allowing terminals to be closed safely.

### 9.2 Public Tunneling via Cloudflare
For demonstrations and instant external access without complex port forwarding, UniSphere integrates with Cloudflare Tunnels:
* The lightweight `cloudflared` binary establishes an encrypted, outbound tunnel over QUIC/HTTP2 to Cloudflare's nearest edge data center.
* Traffic sent to the resulting public URL (e.g., `https://*.trycloudflare.com`) is forwarded securely to `http://127.0.0.1:8000`.

### 9.3 Production Cloud Deployment on Render
UniSphere is configured for zero-setup cloud deployment on Render using an Infrastructure-as-Code Blueprint (`render.yaml`):

```yaml
services:
  - type: web
    name: unisphere-ai
    runtime: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
    healthCheckPath: /api/health
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.9
    plan: free
```

#### Step-by-Step Deployment Flow:
1. **Tracking Production Assets:** By committing the compiled `frontend/dist` directory to Git, Render's Python runtime can serve the application without needing Node.js or `npm` installed.
2. **Automatic Build:** Render runs `pip install -r requirements.txt`, installing FastAPI, SQLAlchemy, and `psycopg2-binary` in approximately 15 seconds.
3. **Port Binding:** Uvicorn binds to `0.0.0.0` using Render's dynamically injected `$PORT`.
4. **Health Check Probing:** Render polls `/api/health`. Once a `200 OK` response is received, the deployment is marked live with a free SSL certificate.

---

## 10. System Verification, Testing, and Evaluation

The UniSphere platform was evaluated across multiple dimensions: scoring accuracy, database performance, and API responsiveness.

### 10.1 Scoring Engine Verification
The Student Success Score was tested across distinct synthetic student profiles to verify that risk flags triggered accurately:

| Test Profile | CGPA | Attendance | LMS Comp. | Backlogs | Coding | Computed SSS | Assigned Risk | Primary Explanation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **High Achiever** | 9.4 | 96% | 98% | 0 | 92 | **93.8 / 100** | **Low Risk** | Excellent standing across all areas. |
| **Attendance Shortage**| 8.1 | 58% | 85% | 0 | 75 | **70.2 / 100** | **High Risk** | Critical attendance shortfall (58% vs 75% threshold). |
| **Academic Struggler**| 5.1 | 68% | 42% | 2 | 40 | **46.8 / 100** | **High Risk** | Multiple backlogs (2) and low CGPA (5.1/10.0). |
| **Junior (Provisional)**| 8.6 | 91% | 88% | 0 | *None* | **87.4 / 100** | **Low Risk** | Placement unassessed; score re-normalized. |

### 10.2 API Latency and Endpoint Benchmarks
Key API endpoints were tested under local and cloud environments:
* **`/api/health`:** Responded in $< 5 \text{ ms}$, confirming fast ASGI health monitoring.
* **`/api/admin/overview`:** Aggregated metrics across all registered students in $\approx 28 \text{ ms}$.
* **`/api/reports/generate`:** Filtered cohorts, computed statistics, and rendered CSV previews in $\approx 45 \text{ ms}$.

---

## 11. Conclusion and Future Directions

### 11.1 Summary
UniSphere delivers a comprehensive, explainable, and accessible smart campus analytics platform for higher education institutions. By combining academic metrics, attendance tracking, LMS logs, and placement indicators into the Student Success Score (SSS), the platform eliminates data silos and enables early academic interventions. The three role-specific portals (Student, Faculty, and Admin) provide the right information to the right users at the right time, while the single-port architecture ensures simple deployment across local and cloud environments.

### 11.2 Future Directions
1. **Large Language Model (LLM) Integration:** Enhancing the AI Campus Assistant with Retrieval-Augmented Generation (RAG) to answer questions directly from institutional handbooks and syllabi.
2. **Mobile Push Notifications:** Adding Progressive Web App (PWA) push notifications to alert students to sudden attendance drops or new faculty messages.
3. **Automated Remedial Learning Paths:** Dynamically generating personalized study modules based on the specific exam questions or topics where a student lost marks.
