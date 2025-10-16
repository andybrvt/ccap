# Development Guide

## Getting Started

See [setup.md](setup.md) for initial installation.

## Coding Standards

### Backend (Python)
- Follow PEP 8 style guide
- Use type hints where possible
- Use Pydantic schemas for validation
- Repository pattern for database queries
- Keep routes thin, business logic in services/repositories

### Frontend (TypeScript)
- Use TypeScript for all new code
- Functional components with hooks
- Use shadcn/ui components for UI
- API calls through `apiService.ts`
- Types defined in component files or separate types file

## Project Patterns

### Adding a New Model
1. Create model in `backend/app/models/`
2. Create schema in `backend/app/schemas/`
3. Create migration: `alembic revision --autogenerate -m "description"`
4. Add repository methods if needed
5. Create route handlers
6. Update frontend types and API calls

### Adding a Protected Route
1. Use `get_current_user` dependency in route
2. Frontend: Wrap in ProtectedRoute or check in AuthProvider

### Form Handling
- Use controlled components
- Validate on submit
- Show user feedback with toast notifications
- Handle loading states

## Common Tasks

### Create a Database Migration
```bash
cd backend
alembic revision --autogenerate -m "Add new field to user"
alembic upgrade head
```

### Add a New API Endpoint
1. Define schema in `schemas/`
2. Create route in `routes/`
3. Register router in `main.py`
4. Add endpoint constant to `frontend/src/lib/endpoints.ts`
5. Create API call wrapper if needed

### Add a New Page
1. Create component in `pages/`
2. Add route in `App.tsx`
3. Add to navigation if needed

## Troubleshooting

TODO: Add common issues and solutions as they come up

