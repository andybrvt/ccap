# Development Notes

Quick notes and decisions made during development. Keep this updated as you go!

## Recent Changes

### 2025-10-10
- ✅ Fixed Select component rendering issues (state, transportation) by adding key prop
- ✅ Fixed NaN errors on numeric inputs by handling empty values properly
- ✅ Fixed MultiSelect nested button hydration errors
- ✅ Implemented student profile edit with draft saving
- ✅ Added onboarding flow for new students
- ✅ Set up AWS S3 integration for file uploads
- ✅ Created file upload API endpoints (profile picture, resume, credentials)
- ✅ Implemented public/private file access patterns
- ✅ Added signed URL generation for private documents

### Earlier
- ✅ Set up authentication system (JWT-based)
- ✅ Created student profile model
- ✅ Built initial frontend with React + TypeScript
- ✅ Deployed to Railway (backend) and Vercel (frontend)

## TODO / In Progress

### High Priority
- 🚧 Admin dashboard features
- 🚧 Announcements system
- 🚧 Job postings/opportunities

### Medium Priority
- ⏸️ File upload system (S3 integration)
- ⏸️ Email notifications
- ⏸️ Search/filter for student portfolios

### Low Priority / Future
- 💡 Analytics dashboard
- 💡 Messaging system
- 💡 Mobile responsive improvements

## Known Issues

Document any bugs or issues here as you find them.

## Design Decisions

### Why JWT in localStorage?
- Simple implementation for now
- Can migrate to httpOnly cookies later if needed

### Why shadcn/ui?
- Copy-paste components, full customization
- Type-safe with TypeScript
- No bundle bloat

### Why SQLAlchemy instead of raw SQL?
- Type safety
- Easier migrations with Alembic
- Better abstraction for complex queries

---

*Keep this updated! It helps when writing final documentation.*

