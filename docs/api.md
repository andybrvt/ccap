# API Documentation

Base URL: `http://localhost:8000` (dev) or `https://your-app.railway.app` (prod)

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securepassword",
  "role": "student"
}
```

### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=student@example.com&password=securepassword
```

Response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

## Student Profiles

### Get Student Profile
```http
GET /students/me/profile
Authorization: Bearer {token}
```

### Update Student Profile
```http
PUT /students/me/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  ...
}
```

## File Uploads

### Upload Profile Picture
```http
POST /students/profile/picture
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [image file]
```

Response:
```json
{
  "url": "https://ccap-production-files.s3.amazonaws.com/public/profile-pictures/...",
  "message": "Profile picture uploaded successfully"
}
```

### Upload Resume
```http
POST /students/profile/resume
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [PDF or Word document]
```

Response:
```json
{
  "message": "Resume uploaded successfully"
}
```

### Upload Credential (Food Handlers Card)
```http
POST /students/profile/credential
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [PDF or image file]
```

Response:
```json
{
  "message": "Credential uploaded successfully"
}
```

### Download Resume
```http
GET /students/profile/resume
Authorization: Bearer {token}
```

Response:
```json
{
  "download_url": "https://s3.amazonaws.com/ccap-production-files/private/resumes/...?AWSAccessKeyId=..."
}
```

### Download Credential
```http
GET /students/profile/credential
Authorization: Bearer {token}
```

Response:
```json
{
  "download_url": "https://s3.amazonaws.com/ccap-production-files/private/credentials/...?AWSAccessKeyId=..."
}
```

## Admin Endpoints

TODO: Document admin-specific endpoints as they're built

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message here"
}
```

Common status codes:
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `422`: Validation error
- `500`: Server error

