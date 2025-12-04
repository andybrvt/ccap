# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

C-CAP Platform - A career and alumni platform for C-CAP (Careers through Culinary Arts Program) connecting culinary students with employers. Students create portfolios and track their career development while admins review profiles, manage announcements, and oversee program status.

## Common Commands

### Backend (FastAPI)

```bash
# Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Database migrations
alembic upgrade head                    # Run all pending migrations
alembic revision --autogenerate -m "message"  # Create new migration

# Development
uvicorn app.main:app --reload          # Start dev server (port 8000)
uvicorn app.main:app --reload --port 8001  # Alternative port

# Code quality
black .                                # Format code
ruff check .                           # Lint code
```

### Frontend (React + TypeScript + Vite)

```bash
# Setup and run
cd frontend
npm install
npm run dev                            # Start dev server (port 5173)

# Build and preview
npm run build                          # Type-check and build for production
npm run preview                        # Preview production build

# Code quality
npm run lint                           # Run ESLint
```

## Architecture

### Backend Structure (FastAPI + SQLAlchemy)

**Layered Architecture:**
- `app/routes/` - API endpoints, route handlers
- `app/repositories/` - Database queries and data access (extends BaseRepository)
- `app/services/` - Business logic (e.g., email_service.py)
- `app/models/` - SQLAlchemy ORM models (database tables)
- `app/schemas/` - Pydantic schemas (request/response validation)
- `app/core/` - Config (database.py, security.py, routers.py)
- `app/deps/` - FastAPI dependencies (auth.py for JWT validation)
- `app/utils/` - Utilities (s3.py for file uploads, password_generator.py)

**Key patterns:**
- All routes are registered in `app/core/routers.py` via `setup_routers(app)`
- Database sessions are injected via `get_db()` dependency
- Authentication uses JWT tokens validated by `get_current_user()` dependency in `app/deps/auth.py`
- Repository pattern: inherit from `BaseRepository[T]` for CRUD operations
- File uploads: profile pictures (public S3), resumes/credentials (private S3 with signed URLs)

**Database:**
- PostgreSQL in production (Railway), SQLite fallback for local dev
- Alembic handles migrations (`alembic/versions/`)
- Environment: `.env.local` for local dev (test DB), `.env` as fallback
- Models use UUID primary keys, relationships with cascade delete

### Frontend Structure (React + TypeScript)

**Key directories:**
- `src/pages/` - Route pages organized by role (admin/, student/)
- `src/components/` - UI components (layout/, ui/ from shadcn)
- `src/hooks/` - React hooks (AuthProvider.tsx, useAuth.tsx)
- `src/lib/` - API service (apiService.ts), utilities, constants

**Key patterns:**
- Routing: Wouter (lightweight routing library)
- State: Context API for auth (AuthProvider), local state for forms
- API calls: Axios instance in `apiService.ts` with auth interceptor that adds JWT token from localStorage
- UI: shadcn/ui components (Radix UI + Tailwind CSS v4)
- Styling: Tailwind CSS v4 with `@tailwindcss/vite` plugin

### Authentication Flow

1. Login: POST `/api/auth/login` → returns JWT access token
2. Token stored in localStorage (`authToken`)
3. User data fetched from `/api/auth/me` and stored in localStorage (`auth_user`)
4. `AuthProvider` manages auth state, validates token on app load
5. Protected routes use `ProtectedRoute` component with role-based access
6. API requests auto-inject Bearer token via axios interceptor

**Roles:**
- `student` - Must complete onboarding before accessing platform (onboarding_step === 0)
- `admin` - Full access to admin dashboard, student portfolios

### Student Profile & Onboarding

- Students have required onboarding flow (6 steps)
- `student_profile.onboarding_step`: 0 = complete, 1-6 = current step
- Profile forms support draft saving (saves without validation)
- Final submission requires validation
- Key fields indexed for filtering: state, graduation_year, ccap_connection, current_bucket, has_resume, onboarding_step

### Pagination Implementation

**Backend:**
- Routes return paginated data with `items`, `total`, `page`, `per_page`, `total_pages`
- Example: `GET /api/students/profiles?page=1&per_page=25`

**Frontend:**
- Frontend handles pagination state and UI
- Data table components manage page state and fetch data

## Environment Variables

**Backend (.env or .env.local):**
```
DATABASE_URL=postgresql://...          # PostgreSQL connection string
SECRET_KEY=...                         # JWT signing key
ACCESS_TOKEN_EXPIRE_MINUTES=30
AWS_ACCESS_KEY_ID=...                  # S3 file uploads
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=...
AWS_S3_REGION=...
SENDGRID_API_KEY=...                   # Email notifications
MAIL_FROM=...
MAIL_FROM_NAME=...
```

**Frontend (.env or .env.local):**
```
VITE_BACKEND_URL=http://localhost:8000  # Backend API URL
```

## Key Models & Relationships

**User** (`users` table)
- Has one `StudentProfile` (students only)
- Has many `Post`, `Comment`, `Like`, `Announcement`, `ProgramStatus`, `PasswordResetToken`

**StudentProfile** (`student_profiles` table)
- Belongs to `User` (one-to-one)
- Has many `Certification`, `ProgramStatus` (history)
- Stores profile data, onboarding state, documents, interests (ARRAY fields)

**API Endpoint Patterns:**
- `/api/auth/*` - Authentication, password reset
- `/api/students/*` - Student profile management
- `/api/admin/*` - Admin operations (user management, program status)
- `/api/announcements/*` - Announcements CRUD
- `/api/posts/*` - Posts with comments and likes
- `/api/admin/email-notifications/*` - Email notification management

## Deployment

- **Backend**: Railway (auto-deploys from main branch)
- **Frontend**: Vercel (auto-deploys from main branch)
- **Database**: Railway PostgreSQL
- **File Storage**: AWS S3

CORS configured for: localhost:5173, localhost:3000, localhost:5174, ccap-gold.vercel.app
