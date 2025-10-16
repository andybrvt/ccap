# Setup Guide

## Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL 14+

## Backend Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
pip install boto3
```

3. Environment variables (copy `.env.example` to `.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/ccap
SECRET_KEY=your-secret-key-here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-here
AWS_SECRET_ACCESS_KEY=your-aws-secret-key-here
AWS_S3_BUCKET_NAME=ccap-production-files
AWS_S3_REGION=us-west-2
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start server:
```bash
uvicorn app.main:app --reload
```

## Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Environment variables (`.env`):
```
VITE_API_URL=http://localhost:8000
```

3. Start dev server:
```bash
npm run dev
```

## First Time Setup

TODO: Add any seed data or initial admin account creation steps

