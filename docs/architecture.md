# Architecture Overview

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy ORM
- Alembic (migrations)
- JWT authentication
- AWS S3 (file storage)
- boto3 (AWS SDK)

**Frontend:**
- React + TypeScript
- Vite
- shadcn/ui components
- Wouter (routing)
- Axios (API calls)

**Deployment:**
- Backend: Railway
- Frontend: Vercel
- Database: Railway PostgreSQL
- File Storage: AWS S3

## Project Structure

```
/ccap/
├── backend/
│   ├── alembic/          # Database migrations
│   ├── app/
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routes/       # API endpoints
│   │   ├── repositories/ # Database queries
│   │   └── deps/         # Dependencies (auth)
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/   # UI components
        ├── pages/        # Route pages
        ├── hooks/        # React hooks (auth)
        └── lib/          # API service, utils
```

## Key Design Decisions

### Authentication Flow
- JWT-based authentication
- Access tokens stored in localStorage
- Protected routes using AuthProvider context
- Role-based access (admin/student)

### Student Profile System
- Students must complete profile before accessing platform
- Profile form supports draft saving
- Form validation on submit, but drafts save without validation
- File uploads: profile pictures (public), resumes & credentials (private with signed URLs)

### Database Design
TODO: Add entity relationship details as models stabilize

## API Structure
TODO: Document key endpoints and patterns

