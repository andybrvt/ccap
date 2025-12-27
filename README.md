# C•CAP Platform

A career and alumni platform for C•CAP (Careers through Culinary Arts Program) connecting students with opportunities.

## Overview

This platform allows culinary students to create portfolios, connect with employers, and manage their career development. Administrators can review student profiles, post announcements, and manage program status.

## Tech Stack

- **Backend:** FastAPI, PostgreSQL, SQLAlchemy
- **Frontend:** React, TypeScript, Vite, shadcn/ui
- **Deployment:** Railway (backend), Vercel (frontend)

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` for frontend, `http://localhost:8000` for backend.

## Documentation

📚 Full documentation available in the `/docs` directory:

- [Setup Guide](docs/setup.md) - Detailed installation instructions
- [Architecture](docs/architecture.md) - System design and structure
- [API Documentation](docs/api.md) - API endpoints and examples
- [Deployment](docs/deployment.md) - Railway & Vercel deployment
- [Development Guide](docs/development.md) - Contributing and coding standards

## Features

### For Students
- ✅ Create and edit portfolio/profile
- ✅ Save drafts while completing profile
- ✅ View announcements
- 🚧 Browse job opportunities (in progress)
- 🚧 Track application status (in progress)

### For Admins
- ✅ View student portfolios
- ✅ Post announcements
- 🚧 Manage program status (in progress)
- 🚧 Review submissions (in progress)

## Project Structure

```
/ccap/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
└── docs/            # Documentation
```

## Environment Variables

See [Setup Guide](docs/setup.md) for required environment variables.

## License

TODO: Add license information

