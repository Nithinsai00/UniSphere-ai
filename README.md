# UniSphere AI — Student Success Intelligence Platform

[![HacXLerate 2026](https://img.shields.io/badge/Hackathon-HacXLerate%202026-blue.svg)](https://kpmg.com)
[![KPMG in India Challenge](https://img.shields.io/badge/Challenge-KPMG%20in%20India-orange.svg)](https://kpmg.com)
[![Full-Stack Production Ready](https://img.shields.io/badge/Status-Complete%20MVP-success.svg)]()
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.14-009688.svg)](https://fastapi.tiangolo.com)
[![React 19 Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript%20%2B%20Vite-61dafb.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com)

> **“Every Student. A Better Future.”**  
> *Supporting Tagline: “Predict Risk. Discover Potential. Improve Success.”*

Built for the **HacXLerate 2026** hackathon under the **KPMG in India** challenge:  
**“AI-Powered Student Analytics and Success Platform — Smart Campus Analytics: Predict, Optimize & Improve Student Success.”**

---

## 1. Executive Summary & Problem Statement

Colleges and universities generate vast amounts of student data across disparate silos:
* **Academic ERPs**: CGPA, mid-term CIE assessments, active backlogs.
* **Biometric Systems**: Daily attendance logs, condonation shortage risks.
* **Learning Management Systems (LMS)**: Weekly assignment submissions, login frequency.
* **Placement Cell Portals**: Algorithmic coding assessments, quantitative aptitude tests, mock technical interviews.
* **Campus Life**: Hackathon participations, certifications, student chapters.

When student distress or placement underpreparedness occurs, it is frequently discovered **after semester results arrive**, when remedial options are limited.

**UniSphere AI** solves this challenge by unifying multi-stream campus data into a transparent, normalized **Student Success Score (0–100)**, identifying at-risk students through **explainable dual-vector risk models** (Academic vs. Placement), providing **data-grounded actionable recommendations**, and enabling faculty to manage structured mentoring interventions with verified outcomes.

---

## 2. Brand Identity & Design System

* **Brand Colors**:
  * Primary Navy: `#102B57` (Navigation, deep branding, authority)
  * Primary Blue: `#245BB5` (Headings, primary buttons, analytics charts)
  * Bright Blue: `#3B82F6` (Interactive links, active states)
  * Accent Orange: `#F58B35` (Calls to action, highlights, AI indicators)
  * Light Orange: `#FFF0E1` (Badges, warm container highlights)
  * Main Canvas: `#F3F7FF` (Soft professional background)
  * Card Surfaces: `#FFFFFF` (Rounded cards with subtle borders `#DCE5F3`)
* **Logo Mark**: An original combination of a **graduation cap**, **spherical orbital rings**, and **connected intelligence network nodes** symbolizing data-driven student success.

---

## 3. Technology Stack

### Frontend
* **React 19** with **TypeScript** and **Vite**
* **Tailwind CSS** with custom UniSphere theme variables
* **Lucide React** for consistent semantic iconography
* **Recharts** for charts (Bar distributions, Grouped comparisons, Donut breakdowns, and Quadrant scatter charts)
* **Responsive SaaS Design**: Fully responsive for Desktop, Tablet, and Mobile

### Backend
* **Python 3.14** with **FastAPI**
* **SQLAlchemy ORM** supporting both SQLite (local zero-dependency mode) and PostgreSQL / Supabase
* **Pydantic v2** for strict request/response data validation
* **Pandas & NumPy** for data normalization and statistical aggregations
* **Scikit-learn** for unsupervised K-Means student segmentation clustering
* **PyJWT & Bcrypt** for secure password hashing and stateless JWT bearer authentication

### Database & Deployment
* **PostgreSQL / SQLite**: Normalized relational schema with foreign key integrity and audit logs
* **Frontend Host**: Vercel / Netlify / Render Static
* **Backend Host**: Render / Railway / AWS / Docker

---

## 4. Key Platform Features

### A. Role-Based Access Control (3 Distinct Portals)
* **Student Portal** (`/student/*`):
  * Personal Success Hub with 0-100 score breakdown across 5 dimensions.
  * *“Your Next Steps”* personalized learning recommendations using growth-oriented, non-shaming guidance.
  * Direct attendance monitor with shortage warnings and exam eligibility status.
  * Self-scoped security preventing exposure of other students' data or private faculty notes.
* **Faculty Portal** (`/faculty/*`):
  * Scoped to faculty member's department jurisdiction (e.g. Computer Science).
  * Priority triage queue for students needing urgent academic or placement follow-up.
  * Explainable risk reasons explaining *why* a student was flagged with exact indicator values vs. benchmarks.
  * Full intervention lifecycle: create mentoring plan, assign follow-up tasks, log timeline progress, and verify outcomes.
* **Administrator Portal** (`/admin/*`):
  * Institutional command center with real-time calculated summary cards.
  * Student CRUD management with automatic user provisioning and deactivation protection.
  * Faculty roster management with designation and class assignments.
  * Staged CSV Data Integration pipeline with preview, column mapping, and atomic commit transactions.
  * Student Segmentation (2x2 Matrix & Scikit-learn K-Means clustering).
  * Configurable scoring engine weights ($\sum w_i = 100\%$) and risk threshold benchmark settings.
  * Executive reports summary with CSV exports.

### B. "Ask UniSphere" AI Campus Assistant
* Interactive natural language analytics assistant available in all portals.
* Queries actual application data via validated backend analytics pipelines.
* Never executes arbitrary dynamic user SQL, preventing injection vulnerabilities.
* Answers institutional questions:
  * *"Which department has the highest academic risk?"*
  * *"How many students have low placement readiness?"*
  * *"Why was student STU1001 flagged?"*
  * *"Which student segment needs more placement training?"*

---

## 5. Scoring & Risk Engine Methodology

### A. The Student Success Score Formula (0–100)
$$
\text{Success Score} = 0.30 \times S_{\text{acad}} + 0.20 \times S_{\text{att}} + 0.15 \times S_{\text{lms}} + 0.20 \times S_{\text{place}} + 0.15 \times S_{\text{skills}}
$$

1. **Academic Performance ($S_{\text{acad}}$)**: Normalized CGPA (50%) + Internal CIE marks (50%) - (7 pts per active backlog penalty).
2. **Attendance Score ($S_{\text{att}}$)**: Normalized percentage clamped 0–100.
3. **LMS Coursework ($S_{\text{lms}}$)**: Assignment completion rate (70%) + login frequency score (30%, where 5+ logins/week = 100%).
4. **Placement Readiness ($S_{\text{place}}$)**: Algorithmic coding assessment (40%) + quantitative/logical aptitude (35%) + mock interview (25%).
5. **Skills & Engagement ($S_{\text{skills}}$)**: Hackathons (20 pts each, max 40) + Certifications (15 pts each, max 30) + Chapters/Clubs (10 pts each, max 20) + Soft skills.

### B. Missing Data Policy (Provisional Scoring)
> **No Punitive Zero**: If junior students (Years 1 & 2) have not yet completed placement diagnostic tests, UniSphere **does not** treat missing scores as zero. The score is computed by re-normalizing weights across available dimensions, flagged as `is_provisional = True`, and documented in `missing_components`.

### C. Explainable Risk Triggers
Every flagged student contains auditable, explainable trigger logs:
* **Academic Risk**: Attendance < 75%, active backlogs $\ge 1$, CGPA < 6.5, internal marks < 60/100.
* **Placement Risk**: Coding score < 60/100, aptitude score < 60/100, mock interview < 60/100. Unassessed junior students are marked as *Insufficient Data*.
* **Combined Risk**: Concurrence of both critical academic and placement warnings.

---

## 6. Repository Structure

```
kmpg/
├── backend/
│   ├── app/
│   │   ├── config.py             # Settings, JWT secret, bootstrap credentials, weights
│   │   ├── database.py           # SQLAlchemy engine supporting SQLite and PostgreSQL
│   │   ├── models.py             # Relational schema (Students, Faculty, Users, Interventions...)
│   │   ├── schemas.py            # Pydantic v2 schemas for requests & responses
│   │   ├── security.py           # Bcrypt hashing, PyJWT tokens, and RBAC guards
│   │   ├── services/
│   │   │   ├── scoring_engine.py # Success Score calculation & provisional handling
│   │   │   ├── risk_engine.py    # Dual-vector explainable risk detection
│   │   │   ├── recommendations.py# Data-grounded recommendation engine
│   │   │   ├── segmentation.py   # 2x2 Matrix & Scikit-learn K-Means clustering
│   │   │   ├── data_importer.py  # Staged CSV parser, column mapping & atomic commit
│   │   │   ├── campus_assistant.py# Ask UniSphere natural language query engine
│   │   │   └── seed_data.py      # Realistic synthetic cohort generator (360 students)
│   │   ├── routers/
│   │   │   ├── auth.py           # Role-tabbed login, profile, password change
│   │   │   ├── admin.py          # Dashboard metrics, Students CRUD, Faculty, Settings
│   │   │   ├── faculty.py        # Department-scoped dashboard, student reviews
│   │   │   ├── student.py        # Personal success hub, self-records, next steps
│   │   │   ├── analytics.py      # Distributions, department risk, quadrant scatter
│   │   │   ├── interventions.py  # Intervention case lifecycle & updates
│   │   │   ├── data_import.py    # CSV preview, validation & commit endpoints
│   │   │   ├── reports.py        # Executive summaries & CSV download endpoints
│   │   │   └── assistant.py      # Ask UniSphere natural language assistant
│   │   └── main.py               # FastAPI entry point with CORS & auto-seed lifespan
│   ├── tests/
│   │   ├── test_scoring.py       # Unit tests for scoring & provisional logic
│   │   ├── test_risk.py          # Unit tests for explainable risk indicators
│   │   ├── test_auth.py          # Unit tests for password hashing & JWT
│   │   └── test_api.py           # Integration API tests for endpoints & CSV parser
│   ├── requirements.txt          # Python dependencies manifest
│   └── run.py                    # Server runner script
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # React Auth Context with role guards
│   │   ├── services/
│   │   │   └── api.ts            # Typed API client for all backend endpoints
│   │   ├── components/
│   │   │   ├── common/           # Logo, Badge, MetricCard, Modal
│   │   │   ├── layout/           # Navbar, Sidebar, DashboardLayout
│   │   │   └── assistant/        # AskUniSphereDrawer floating AI drawer
│   │   ├── pages/
│   │   │   ├── SplashWelcome.tsx # Loading screen & branded Welcome page
│   │   │   ├── Login.tsx         # 3-role login with 1-click demo filler
│   │   │   ├── Unauthorized.tsx  # RBAC access barrier
│   │   │   ├── admin/            # 10 Admin management pages
│   │   │   ├── faculty/          # 5 Faculty departmental pages
│   │   │   └── student/          # 6 Student portal pages
│   │   ├── App.tsx               # Top-level router with ProtectedRoute guards
│   │   ├── main.tsx              # React DOM root
│   │   └── index.css             # Tailwind CSS & custom design tokens
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── data/
│   └── templates/                # Sample CSV templates for all 6 data categories
├── docs/
│   ├── ARCHITECTURE.md           # Mermaid architecture & ERD diagrams
│   ├── SCORING_METHODOLOGY.md    # Detailed mathematical formulas & risk rules
│   └── DEMO_SCRIPT.md            # 5-minute hackathon presentation script
├── .env.example                  # Environment variable template
├── .gitignore
└── README.md
```

---

## 7. Local Setup & Quickstart Guide

### Prerequisites
* **Python 3.11+** (tested on Python 3.14)
* **Node.js v18+** (tested on Node v24)
* **Git**

### Step 1: Clone and Set Up Backend
```bash
# Clone the repository
git clone https://github.com/your-username/unisphere-ai.git
cd unisphere-ai

# Create and activate Python virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run the backend server (automatically initializes & seeds 360 demo students)
python backend/run.py
```
> The backend server starts at **`http://127.0.0.1:8000`**  
> Interactive API Swagger Documentation is available at **`http://127.0.0.1:8000/docs`**

### Step 2: Set Up and Start Frontend
In a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
> The frontend application is live at **`http://127.0.0.1:5173`**

---

## 8. Development Demo Credentials

For hackathon evaluators and local testing, convenient **"Demo Quick Fill"** buttons are provided directly on the Login page tabs:

| Role | Username / Identifier | Password | Default Portal Route |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` (or `admin@unisphere.edu`) | `Hope@50` | `/admin/dashboard` |
| **Faculty Member** | `FAC001` (or `thorne@unisphere.edu`) | `Faculty@2026` | `/faculty/dashboard` |
| **Student** | `STU1001` (or `stu1001@unisphere.edu`) | `Student@2026` | `/student/dashboard` |

> *Note: In production, passwords are never stored in plaintext and initial bootstrap admin credentials must be changed via environment variables.*

---

## 9. Automated Testing & Verification

UniSphere AI includes an automated test suite verifying scoring formulas, explainable risk triggers, password cryptography, RBAC guards, and API endpoints.

To run the complete test suite:
```bash
# Set PYTHONPATH to project root and run pytest
pytest backend/tests -v
```

### Test Results Summary:
* `backend/tests/test_scoring.py`: **6 passed** (Normalization, backlog penalties, provisional scoring)
* `backend/tests/test_risk.py`: **4 passed** (Explainable triggers, attendance breach, coding gap)
* `backend/tests/test_auth.py`: **2 passed** (Bcrypt password hashing, JWT creation & claims)
* `backend/tests/test_api.py`: **8 passed** (Health, role-tabbed logins, dashboard metrics, CSV validation, Ask UniSphere query)
* **Total: 20 Passed (100% Pass Rate)**

---

## 10. Production Deployment Instructions

### Database Deployment (Supabase PostgreSQL)
1. Create a project at [supabase.com](https://supabase.com).
2. Retrieve the PostgreSQL connection string from **Project Settings → Database → Connection String (URI)**.
3. Set the environment variable `DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`.
4. SQLAlchemy automatically handles table creation and index synchronization.

### Backend Deployment (Render / Railway)
1. Connect the GitHub repository to [render.com](https://render.com).
2. Choose **Web Service** with runtime **Python 3**.
3. **Build Command**: `pip install -r backend/requirements.txt`
4. **Start Command**: `python backend/run.py`
5. Configure environment variables from `.env.example`:
   * `DATABASE_URL`, `SECRET_KEY`, `ADMIN_PASSWORD`.

### Frontend Deployment (Vercel / Netlify)
1. Connect the GitHub repository to [vercel.com](https://vercel.com).
2. Set Root Directory to `frontend`.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Set Environment Variable: `VITE_API_URL` pointing to your deployed backend URL.

---

## 11. Security & Privacy Highlights

* **Server-Side Authentication**: Bcrypt password hashing and HMAC-SHA256 JWT tokens with role claims.
* **Strict Role-Based Access Control**: Server-side route dependencies prevent URL tampering.
* **Student Privacy**: Students can only inspect their own records; private faculty notes and administrative risk labels are withheld from the student portal.
* **Safe AI Integration**: "Ask UniSphere" executes validated analytical aggregate functions; arbitrary dynamic SQL execution is strictly forbidden.
* **Data Boundary Compliance**: Faculty accounts are restricted to student cohorts enrolled in their respective departments.

---

## 12. License & Acknowledgments

Developed for the **HacXLerate 2026 Hackathon** under the **KPMG in India** challenge.  
Special thanks to KPMG in India for designing this challenge focused on student success intelligence and smart campus analytics.
