# UniSphere AI — System Architecture & Database Design

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + TypeScript + Vite + Tailwind CSS)"]
        UI_Welcome["Splash & Welcome Page"]
        UI_Auth["Role-Tabbed Login (Admin, Faculty, Student)"]
        UI_Admin["Administrator Portal (Dashboard, Ingestion, Triage, Settings)"]
        UI_Faculty["Faculty Portal (Departmental Mentoring & At-Risk Triage)"]
        UI_Student["Student Success Hub (Score Breakdown & Next Steps)"]
        UI_Assistant["Ask UniSphere (Natural Language AI Assistant)"]
    end

    subgraph API_Gateway["FastAPI Application Server (Python 3.14)"]
        Security["JWT Authentication & RBAC Middleware"]
        Router_Auth["/api/auth"]
        Router_Admin["/api/admin"]
        Router_Faculty["/api/faculty"]
        Router_Student["/api/student"]
        Router_Analytics["/api/analytics"]
        Router_Interventions["/api/interventions"]
        Router_DataImport["/api/data-import"]
        Router_Reports["/api/reports"]
        Router_Assistant["/api/assistant"]
    end

    subgraph Engines["Core Analytical & Predictive Engines"]
        ScoreEngine["Student Success Score Engine (0-100 Normalization)"]
        RiskEngine["Explainable Dual-Vector Risk Engine"]
        RecEngine["Data-Grounded Recommendation Engine"]
        SegmentEngine["Rule Matrix & Scikit-learn K-Means Clustering"]
        ImportEngine["Schema Validation & Atomic Staging Pipeline"]
        NLEngine["Natural Language Query Dispatcher"]
    end

    subgraph Storage["Database Layer"]
        DB[(PostgreSQL / SQLite via SQLAlchemy ORM)]
    end

    Client -->|REST API over JSON / JWT Bearer| API_Gateway
    API_Gateway --> Security
    Security --> Router_Auth
    Security --> Router_Admin
    Security --> Router_Faculty
    Security --> Router_Student
    Security --> Router_Analytics
    Security --> Router_Interventions
    Security --> Router_DataImport
    Security --> Router_Reports
    Security --> Router_Assistant

    Router_Admin --> Engines
    Router_Faculty --> Engines
    Router_Student --> Engines
    Router_Analytics --> Engines
    Router_Interventions --> Engines
    Router_DataImport --> Engines
    Router_Assistant --> Engines

    Engines --> Storage
```

---

## 2. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "has profile"
    USERS ||--o| FACULTY : "has profile"
    USERS ||--o{ AUDIT_LOGS : "performed by"
    DEPARTMENTS ||--o{ STUDENTS : "enrolls"
    DEPARTMENTS ||--o{ FACULTY : "belongs to"
    STUDENTS ||--o{ INTERVENTIONS : "receives"
    FACULTY ||--o{ INTERVENTIONS : "mentors"
    INTERVENTIONS ||--o{ INTERVENTION_UPDATES : "logs"

    USERS {
        int id PK
        string username UK
        string email UK
        string phone_number
        string hashed_password
        string role "admin | faculty | student"
        boolean is_active
        boolean requires_password_change
        datetime created_at
    }

    STUDENTS {
        int id PK
        int user_id FK
        string student_id UK
        string full_name
        string email
        string phone_number
        string department
        string degree
        int current_year
        int semester
        float cgpa
        float internal_marks
        int backlog_count
        float overall_attendance
        float assignment_completion_rate
        float lms_login_frequency
        float coding_score
        float aptitude_score
        float mock_interview_score
        int hackathon_count
        int certification_count
        float success_score
        float academic_score
        float attendance_score
        float lms_score
        float placement_score
        float skills_score
        boolean is_provisional
        string academic_risk "Low | Moderate | High | Insufficient"
        string placement_risk "Low | Moderate | High | Insufficient"
        string combined_risk "Low | Moderate | High"
        string segment
        json risk_reasons
        datetime score_last_calculated_at
    }

    FACULTY {
        int id PK
        int user_id FK
        string faculty_id UK
        string full_name
        string email
        string phone_number
        string department
        string designation
        string assigned_subjects
        string assigned_classes
        boolean is_active
    }

    INTERVENTIONS {
        int id PK
        int student_id FK
        int faculty_id FK
        string category
        string priority "low | medium | high | urgent"
        string status "pending | in_progress | completed | cancelled"
        string title
        text description
        datetime due_date
        text outcome_notes
        string impact_rating "improved | unchanged | declined"
        datetime created_at
    }

    INTERVENTION_UPDATES {
        int id PK
        int intervention_id FK
        string author_name
        text notes
        datetime created_at
    }

    SCORE_CONFIGURATIONS {
        int id PK
        string version
        float weight_academic
        float weight_attendance
        float weight_lms
        float weight_placement
        float weight_skills
        float attendance_threshold
        float academic_cgpa_threshold
        float academic_internal_threshold
        float placement_threshold
        boolean is_active
        string updated_by
        datetime updated_at
    }

    DATA_IMPORT_JOBS {
        int id PK
        string filename
        string category
        string status
        int total_rows
        int imported_rows
        int updated_rows
        int rejected_rows
        json errors_json
        datetime created_at
    }
```

---

## 3. Data Integration & Staging Pipeline

```mermaid
flowchart LR
    CSV[Upload CSV File] --> Stage[Stage & Parse Stream]
    Stage --> Mapping[Dynamic Column Mapping]
    Mapping --> Validation{Strict Validation}
    Validation -->|Errors/Duplicates| Report[Generate Error Report]
    Validation -->|Valid Schema| Preview[Render Interactive Preview]
    Preview --> Confirm{Admin Confirms}
    Confirm -->|Commit| Transaction[Atomic Database Transaction]
    Transaction --> Recalc[Recalculate Success Scores & Risk Flags]
    Recalc --> Audit[Record Ingestion Audit Job]
```
