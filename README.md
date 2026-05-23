# ResumeIQ

ResumeIQ is a full-stack applicant tracking system for students, recruiters, and administrators. It supports resume upload, job posting upload, matching, assistant-led guidance, and admin visibility into platform activity.

## What This Project Does

- Accepts resumes and job descriptions from users.
- Extracts text and useful skills from uploaded files.
- Matches candidates to jobs and jobs to candidates.
- Provides a chat assistant for resume and hiring questions.
- Gives admins a consolidated view of users, logins, uploads, and activity.
- Adds a student learning hub with mock interviews, coding practice, aptitude quizzes, and career planning.

## New Student Modules

- Mock Interview module with role selection, chat-style practice, scoring, and feedback.
- Coding Challenge module with a Monaco editor, challenge categories, submissions, and leaderboard tracking.
- Aptitude module with timed quizzes, difficulty levels, and progress history.
- Career Assistant module with roadmap generation, skill-gap analysis, and interview preparation suggestions.
- Dedicated student dashboard that links the learning modules with ATS score and resume tracking.

## Architecture

The application is split into three main layers:

- Frontend: a React + TypeScript single-page app with route-based dashboards.
- Backend: a FastAPI service that handles auth, file handling, matching logic, and admin APIs.
- Data layer: MongoDB for users, documents, jobs, audit events, and matching data.

The frontend talks to the backend through REST APIs. The backend stores and retrieves data from MongoDB, then returns structured responses to the UI.

```mermaid
flowchart LR
	U[User: Student / Recruiter / Admin] --> F[Frontend: React + Vite]
	F --> A[FastAPI Backend]
	A --> M[(MongoDB)]
	A --> S[Resume parsing, matching, auth, assistant, admin services]
	S --> A
	A --> F
	F --> U
```

## Why These Technologies

- React: keeps the UI component-based and easy to extend across multiple dashboards.
- TypeScript: reduces runtime mistakes and makes shared API models safer to maintain.
- Vite: gives fast local development and efficient production builds.
- Tailwind CSS: speeds up consistent styling across the product without large custom CSS files.
- Framer Motion: adds smooth transitions, page movement, and modern dashboard interactions.
- FastAPI: provides a clean, fast Python API layer with strong request/response validation.
- MongoDB: fits flexible ATS data such as users, resumes, jobs, and audit logs.
- JWT auth: keeps login stateless and suitable for separate frontend and backend services.
- spaCy and sentence-transformer style NLP tooling: help with text extraction, skills, and matching workflows.
- Docker and Docker Compose: make local setup and deployment consistent across environments.

## Main Features

- Student dashboard for resume upload, match results, and guidance.
- Recruiter dashboard for jobs, candidate matching, and chat-based help.
- Admin dashboard for user records, login history, uploads, and audit visibility.
- Resume parsing and structured extraction from uploaded files.
- Candidate-to-job and job-to-candidate recommendation flows.
- Chat assistant for resume improvement and hiring questions.

## Backend Structure

```text
backend/app/
├── api/v1/routes/       # REST endpoints
├── core/                # config, logging, security, database, exceptions
├── models/              # persistence models
├── repositories/        # database access helpers
├── schemas/             # Pydantic request/response models
├── services/            # business logic and matching pipelines
├── utils/               # file parsing and NLP helpers
└── main.py              # FastAPI app entry point
```

### Backend Flow

1. The UI sends a request to FastAPI.
2. Routes validate the request using schemas.
3. Services perform the business logic.
4. Repositories read and write MongoDB documents.
5. The API returns a response to the frontend.

### Added Backend Modules

- `POST /api/v1/interviews/sessions` - create a mock interview session
- `POST /api/v1/interviews/sessions/{id}/messages` - send interview responses
- `POST /api/v1/interviews/sessions/{id}/evaluate` - score a completed session
- `GET /api/v1/coding/challenges` - list coding challenges
- `POST /api/v1/coding/run` - execute and grade a solution through Piston
- `GET /api/v1/coding/leaderboard` - view top scores
- `POST /api/v1/aptitude/quiz` - generate a timed quiz
- `POST /api/v1/aptitude/quiz/submit` - grade quiz answers
- `POST /api/v1/career/analyze` - generate a career roadmap and skill-gap report
- `GET /api/v1/career/summary` - fetch the latest career summary

## Frontend Structure

```text
frontend/src/
├── api/                 # API client wrappers
├── components/          # shared UI pieces
├── context/             # auth and theme state
├── layouts/             # route shells
├── pages/               # dashboard and feature screens
└── main.tsx             # app bootstrap
```

### Frontend Flow

1. Users open the app in the browser.
2. React routes send them to the correct dashboard.
3. Pages call backend APIs through the shared client layer.
4. Results are rendered in cards, tables, charts, and chat panels.
5. Theme and auth state stay available across the app through context.

### Added Frontend Pages

- `/student/interviews` - mock interview workspace
- `/student/coding` - split coding playground with editor and output console
- `/student/aptitude` - timed aptitude quiz dashboard
- `/student/career` - career roadmap and learning assistant
- `/student` - updated student hub with links to the new practice modules

## Core Modules

- Authentication and registration
- Resume upload and parsing
- Job upload and listing
- Candidate recommendations
- Job recommendations
- Chat assistant
- Admin dashboard and audit views
- Student practice hub and progress tracking

## MongoDB Collections

Existing collections are preserved. New collections are added independently:

- `interviews`
- `coding_challenges`
- `coding_submissions`
- `aptitude_questions`
- `aptitude_results`
- `career_analysis`
- `learning_paths`

## API Overview

Common endpoints include:

- `GET /api/v1/health` - health check
- `POST /api/v1/auth/login` - sign in
- `POST /api/v1/auth/register` - create account
- `GET /api/v1/auth/me` - current user profile
- `POST /api/v1/resumes/upload` - upload resume file
- `POST /api/v1/resumes/parse` - extract resume content
- `POST /api/v1/jobs/upload` - upload job description
- `GET /api/v1/recommendations/candidates` - find matching candidates
- `GET /api/v1/recommendations/jobs` - find matching jobs
- `POST /api/v1/chatbot/chat` - assistant conversation endpoint
- `GET /api/v1/admin/dashboard` - admin summary

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB running locally or in Docker

### Run With Docker

```bash
docker compose up --build
```

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### Run Backend Locally

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Environment Variables

Copy the root `.env` template used by Docker Compose and set values for:

- `MONGO_URI`
- `MONGO_DB`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `BACKEND_CORS_ORIGINS`
- `FRONTEND_API_BASE_URL`
- `OPENAI_API_KEY`
- `PISTON_API_URL`
- `SPACY_MODEL`
- `SENTENCE_TRANSFORMER_MODEL`

## Project Layout

```text
ATS_GENAI/
├── backend/
├── frontend/
├── storage/
├── docker-compose.yml
└── README.md
```


## overall architecture

```mermaid
flowchart LR

    subgraph Frontend
        F["React + Vite UI"]
    end

    subgraph Backend["FastAPI Backend"]
        API["API Router"]
        AuthService["Auth Service"]
        ResumeService["Resume Parser Service"]
        EmbeddingSvc["Embedding Service"]
        ChatbotSvc["Chatbot Engine"]
        RecoSvc["Recommendation Service"]
        VectorMgr["Vector Index Manager"]
    end

    subgraph Data["Persistence & External Services"]
        Mongo[("MongoDB")]
        OpenAI[("OpenAI / LLM")]
        Piston[("Piston API Optional")]
    end

    F -->|"HTTP API Calls"| API

    API --> AuthService
    API --> ResumeService
    API --> ChatbotSvc
    API --> RecoSvc

    ResumeService --> EmbeddingSvc

    EmbeddingSvc --> Mongo
    EmbeddingSvc --> VectorMgr

    VectorMgr --> Mongo

    RecoSvc --> VectorMgr

    ChatbotSvc --> EmbeddingSvc
    ChatbotSvc --> OpenAI
    ChatbotSvc --> Mongo

    AuthService --> Mongo

    API -->|"Startup Tasks"| VectorMgr
    API -->|"Seed Data"| Mongo

    ChatbotSvc --> Piston

    style Backend fill:#f8fafc,stroke:#cbd5e1
    style Data fill:#fff7ed,stroke:#f59e0b
```

## working flow

```mermaid
flowchart TD

    A[User Registers/Login] --> B{User Type}

    B -->|Student| C[Student Dashboard]
    B -->|Recruiter| D[Recruiter Dashboard]
    B -->|Admin| E[Admin Panel]

    %% STUDENT FLOW

    C --> F[Upload Resume]

    F --> G[Resume Parsing]
    G --> H[Skill Extraction]
    H --> I[Generate Embeddings]
    I --> J[Store in Vector DB]

    J --> K[AI Resume Analysis]
    K --> L[ATS Resume Score]

    L --> M[Job Recommendation Engine]
    M --> N[Recommended Jobs]


    %% APTITUDE FLOW

    C --> Z[Aptitude Test]
    Z --> A1[Quiz Evaluation]
    A1 --> A2[Performance Analytics]

    %% CAREER AI FLOW

    C --> A3[Ask AI Career Assistant]
    A3 --> A4[RAG + LLM Processing]
    A4 --> A5[Career Roadmap]

    %% RECRUITER FLOW

    D --> B1[Create Job Posting]
    B1 --> B2[Generate Job Embeddings]

    B2 --> B3[Candidate Recommendation Engine]
    B3 --> B4[Top Matching Candidates]

    B4 --> B5[Recruiter Analytics]

    %% FINAL

    S --> C
    Y --> C
    A2 --> C
    A5 --> C
```

---

# AI Recommendation Engine Flow

```mermaid
flowchart LR

    A[Resume Text] --> B[Embedding Generation]
    C[Job Description] --> D[Embedding Generation]

    B --> E[Vector Database]
    D --> E

    E --> F[Cosine Similarity]

    F --> G[Rank Candidates]
    F --> H[Recommend Jobs]

    G --> I[Recruiter Dashboard]
    H --> J[Student Dashboard]
```

---

# AI Mock Interview Flow

```mermaid
flowchart TD

    A[Select Interview Role]
    --> B[LLM Generates Questions]

    B --> C[Student Answers]

    C --> D[AI Evaluation Engine]

    D --> E[Communication Analysis]
    D --> F[Technical Analysis]
    D --> G[Confidence Analysis]

    E --> H[Final Interview Score]
    F --> H
    G --> H

    H --> I[AI Feedback Report]
```

---

# Coding Platform Flow

```mermaid
flowchart TD

    A[Open Coding Problem]
    --> B[Write Code in Monaco Editor]

    B --> C[Run Code]

    C --> D[Backend API]

    D --> E[Judge0 API]

    E --> F[Compile & Execute]

    F --> G[Return Output]

    G --> H[Test Case Validation]

    H --> I[Accepted / Failed]

    I --> J[Store Submission]
```

---

# RAG Career Assistant Flow

```mermaid
flowchart TD

    A[User Query]
    --> B[Convert to Embeddings]

    B --> C[Search Vector Database]

    C --> D[Retrieve Relevant Context]

    D --> E[LLM Prompt Builder]

    E --> F[GPT/Gemini Response]

    F --> G[Career Guidance Output]
```

---


## Future Goals

- Add stronger matching logic and ranking controls.
- Improve resume parsing for more file types and edge cases.
- Add background jobs for heavier parsing and indexing work.
- Add unit and integration test coverage for key flows.
- Add export and reporting features for recruiters and admins.
- Improve deployment support with environment-specific configs.
- Reduce frontend bundle size with code splitting and lazy loading.
- Expand voice interview support and transcript capture.
- Add richer quiz analytics, streaks, and gamification for students.
- Add more granular Piston sandbox controls and language coverage.

## Notes

This project is modular by design so it can grow into a production-ready ATS without changing the core architecture.
