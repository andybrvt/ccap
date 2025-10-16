# Deployment Guide

## Railway (Backend)

### Initial Setup
1. Connect GitHub repository
2. Select `backend` directory as root
3. Add environment variables:
   - `DATABASE_URL` (provided by Railway PostgreSQL)
   - `SECRET_KEY`
   - `AWS_ACCESS_KEY_ID` (for S3 file uploads)
   - `AWS_SECRET_ACCESS_KEY` (for S3 file uploads)
   - `AWS_S3_BUCKET_NAME` (your S3 bucket name)
   - `AWS_S3_REGION` (your S3 region)

### Deployment
- Automatic deploys on push to `main`
- Uses `Procfile` for startup command

### Database
- PostgreSQL provided by Railway
- Access connection string in environment variables
- Run migrations: TODO

## Vercel (Frontend)

### Initial Setup
1. Connect GitHub repository
2. Select `frontend` directory as root
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Environment Variables
- `VITE_API_URL`: Railway backend URL (e.g., https://your-app.railway.app)

### Deployment
- Automatic deploys on push to `main`
- Preview deployments for PRs

## Post-Deployment Checklist
- [ ] Verify backend health check
- [ ] Test authentication flow
- [ ] Confirm database migrations ran
- [ ] Test file uploads (if using S3)
- [ ] Verify CORS settings

