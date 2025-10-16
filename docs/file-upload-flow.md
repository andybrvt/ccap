# File Upload Flow Documentation

## Overview

The file upload system is now integrated into the student portfolio edit page. Files are uploaded **immediately when selected** (not during form submission) for better UX and reliability.

## Architecture

### Separation of Concerns
- **Text/Profile Data**: Updated via PUT `/students/me/profile` 
- **File Uploads**: Handled separately via dedicated endpoints
  - Profile Picture: POST `/students/profile/picture` (public)
  - Resume: POST `/students/profile/resume` (private)
  - Credentials: POST `/students/profile/credential` (private)

### File Types

1. **Profile Picture**
   - Stored in: S3 public bucket
   - Returns: Public URL
   - Displayed: Directly via URL
   - Formats: image/*

2. **Resume**
   - Stored in: S3 private bucket (folder: `resumes/`)
   - Returns: Success message (S3 key saved to DB)
   - Viewed: Via signed URL (GET `/students/profile/resume`)
   - Formats: .pdf, .doc, .docx

3. **Credentials (Food Handlers Card)**
   - Stored in: S3 private bucket (folder: `credentials/`)
   - Returns: Success message (S3 key saved to DB)
   - Viewed: Via signed URL (GET `/students/profile/credential`)
   - Formats: .pdf, .jpg, .jpeg, .png

## Frontend Implementation

### File Upload Flow

1. **User selects a file** → Input onChange fires
2. **Immediately upload to S3** via API endpoint
3. **Show upload progress** (loading spinner)
4. **On success**:
   - For profile picture: Store returned public URL
   - For resume/credential: Store file object in state (DB already updated)
   - Show success toast
5. **On error**: 
   - Clear file from state
   - Show error toast

### State Management

```typescript
// Upload states
const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
const [isUploadingResume, setIsUploadingResume] = useState(false);
const [isUploadingCredential, setIsUploadingCredential] = useState(false);

// Form data
formData: {
  // Profile picture URL (public, can display directly)
  existingProfilePicture: string,
  
  // Resume (private, need signed URL to view)
  resumeUpload: File | null,  // Set after successful upload
  existingResumeUrl: string,   // S3 key from profile fetch
  
  // Credential (private, need signed URL to view)
  foodHandlersCardUpload: File | null,  // Set after successful upload
  existingFoodHandlersUrl: string,      // S3 key from profile fetch
}
```

### Upload Handlers

```typescript
// Upload immediately when file is selected
handleProfilePictureUpload(file) → POST /students/profile/picture
handleResumeUpload(file) → POST /students/profile/resume  
handleCredentialUpload(file) → POST /students/profile/credential

// View with signed URLs
handleViewResume() → GET /students/profile/resume → Opens signed URL
handleViewCredential() → GET /students/profile/credential → Opens signed URL
```

### Validation

Form validation checks if files exist before submission:

```typescript
// Check for NEW upload OR existing file from DB
if (hasResume === "Yes" && !resumeUpload && !existingResumeUrl) {
  errors.push("Resume upload required");
}

if (hasFoodHandlersCard === "Yes" && !foodHandlersCardUpload && !existingFoodHandlersUrl) {
  errors.push("Credential upload required");
}
```

This allows:
- **New users**: Must upload files (resumeUpload/foodHandlersCardUpload will be set)
- **Editing users**: Already have files (existingResumeUrl/existingFoodHandlersUrl from DB)

## Backend Endpoints

### Upload Endpoints

```python
POST /students/profile/picture
- Accepts: image/* (multipart/form-data)
- Returns: {"url": "https://...", "message": "..."}
- Access: Students only
- Storage: Public S3 bucket

POST /students/profile/resume
- Accepts: .pdf, .doc, .docx (multipart/form-data)
- Returns: {"message": "Resume uploaded successfully"}
- Access: Students only
- Storage: Private S3 bucket (resumes/ folder)
- Updates: student_profile.resume_url with S3 key

POST /students/profile/credential
- Accepts: .pdf, .jpg, .jpeg, .png (multipart/form-data)
- Returns: {"message": "Credential uploaded successfully"}
- Access: Students only
- Storage: Private S3 bucket (credentials/ folder)
- Updates: student_profile.food_handlers_card_url with S3 key
```

### View/Download Endpoints

```python
GET /students/profile/resume
- Returns: {"download_url": "https://signed-url..."}
- Access: Students only (their own)
- Expires: 1 hour

GET /students/profile/credential
- Returns: {"download_url": "https://signed-url..."}
- Access: Students only (their own)
- Expires: 1 hour
```

## User Experience

### Upload Process

1. **Profile Picture**:
   - Click on circular avatar
   - Select image file
   - See loading spinner in avatar
   - Avatar updates with new image
   - Green badge shows "Profile picture uploaded"

2. **Resume**:
   - Click upload area
   - Select document
   - See loading spinner
   - Green success badge with filename
   - Can click "View" on existing resume to open in new tab

3. **Food Handlers Card**:
   - Same as resume flow
   - Separate upload area
   - Independent of resume

### Form Submission

Since files are already uploaded:
1. User fills out text fields
2. Can "Save Draft" anytime (partial save, no validation)
3. When ready, clicks "Submit" (validates all required fields)
4. Only text data is sent to `/students/me/profile`
5. Files are already in S3 and DB

## Benefits of This Approach

1. **Better UX**: Immediate feedback on upload success/failure
2. **Progress Saving**: Files persist even if user closes browser
3. **Validation**: Can validate file existence before final submission
4. **Less Data**: Form submission only sends text, not binary files
5. **Reliability**: Files uploaded once, not re-sent on form errors
6. **Security**: Private documents use signed URLs with expiration

## Error Handling

- **File too large**: Backend validation, error toast shown
- **Wrong file type**: Frontend + backend validation
- **Upload failure**: File removed from state, user can retry
- **Network issues**: Standard error toast with retry option
- **Viewing failure**: Toast error if signed URL generation fails

## Testing Checklist

- [ ] Upload profile picture → See avatar update immediately
- [ ] Upload resume → See success indicator
- [ ] Upload credential → See success indicator
- [ ] View existing resume → Opens in new tab
- [ ] View existing credential → Opens in new tab
- [ ] Submit form without files → See validation errors
- [ ] Submit form with files → Success
- [ ] Edit profile with existing files → Can view and replace
- [ ] Remove uploaded file → Can upload again
- [ ] Upload wrong file type → See error
- [ ] Network failure during upload → See error, can retry

## Future Enhancements

- [ ] Progress bars for large file uploads
- [ ] Image preview before upload
- [ ] Drag-and-drop file upload
- [ ] Multiple document uploads (e.g., multiple certifications)
- [ ] Admin ability to view student documents
- [ ] Document expiration tracking (e.g., expired food handler cards)

