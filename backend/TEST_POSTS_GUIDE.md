# Test Posts Guide

## Overview
This guide helps you create test posts with images to test the community feed, likes, pagination, and portfolio features.

## Scripts Available

### 1. `create_test_posts.py`
Creates test posts for students with placeholder images uploaded to S3.

**What it creates:**
- **5 posts per student** (configurable)
- **Random images** from picsum.photos
- **Random captions** from predefined list
- **Random featured dishes** from your curriculum

**Default students:**
- First 5 students from `create_test_students.py` script
- Plus any manual test students (student1@test.com, student@test.com)

### 2. `cleanup_test_posts.py`
Deletes all posts for test students.

## How to Use

### Prerequisites
Make sure you have:
1. ✅ Backend running (`uvicorn app.main:app --reload --port 8001`)
2. ✅ Test students created (run `create_test_students.py` first if needed)
3. ✅ S3 configured (AWS credentials in environment)

### Step 1: Create Test Students (if not done)
```bash
cd backend
python create_test_students.py
```

This creates 25 test students with pattern:
- Email: `firstname.lastname.testN@ccap.edu`
- Password: `TestPass123!`

### Step 2: Create Test Posts
```bash
cd backend
python create_test_posts.py
```

**What happens:**
- Logs in as each test student
- Downloads random placeholder images
- Uploads images to S3
- Creates 5 posts per student
- Total: ~25-50 posts depending on students

**Expected output:**
```
============================================================
C•CAP Test Posts Generator
============================================================

Found 7 test student(s)

Processing: emma.smith.test1@ccap.edu
------------------------------------------------------------
  ✓ Logged in successfully
  Creating post 1/5... ✓ (Beef Wellington)
  Creating post 2/5... ✓ (Risotto Milanese)
  Creating post 3/5... ✓ (Macarons)
  Creating post 4/5... ✓ (Paella)
  Creating post 5/5... ✓ (Soufflé)

...

SUMMARY
============================================================
Total posts created: 35
Total failed: 0

Created 5 posts for each of 7 student(s)
```

### Step 3: Test the Features

#### Test Portfolio View:
1. Login as a test student
2. Go to their portfolio page
3. Should see their 5 posts in grid
4. Click to view with likes

#### Test Community Feed:
1. Go to student homepage
2. Should see posts from all students
3. Click "Load More" to load next batch
4. Like/unlike posts

#### Test Admin View:
1. Login as admin
2. Homepage shows recent posts
3. View-only (no like button for admins)

### Step 4: Clean Up When Done
```bash
cd backend
python cleanup_test_posts.py
```

Type `yes` when prompted.

## Configuration

### Adjust Number of Posts
In `create_test_posts.py`, change:
```python
NUM_POSTS_PER_STUDENT = 5  # Change to 10, 15, etc.
```

### Add More Test Students
In both scripts, update the student list:
```python
test_students.extend([
    ("your.student@test.com", "password"),
])
```

## How Images Work

### Image Source:
- Uses **picsum.photos** for random placeholder images
- 600x600 pixels (square format, perfect for Instagram-style grid)
- Images are downloaded temporarily in memory
- Never saved to disk locally

### Upload Flow:
1. Script downloads image → Memory (bytes)
2. Uploads via multipart/form-data → Backend
3. Backend uploads to S3 → `public/post-images/`
4. Returns public URL
5. URL saved in database

### S3 Storage:
- **Location**: `public/post-images/{user_id}_{uuid}.jpg`
- **Access**: Public URLs (no signed URLs needed)
- **Cleanup**: Deleting posts via API automatically cleans S3 (if implemented)

## Testing Scenarios

### Scenario 1: Basic Posts
- Create 5 posts per student
- Verify they appear on portfolio
- Verify they appear in community feed

### Scenario 2: Pagination
- Create 25+ total posts
- Student homepage should show 10 initially
- Click "Load More" to see next 10
- Button disappears when no more posts

### Scenario 3: Likes
- Like a post → count increases
- Unlike a post → count decreases
- Heart fills red when liked
- Like persists across page refreshes

### Scenario 4: Permissions
- Student can delete their own posts
- Student cannot delete others' posts
- Student can like any post
- Admin can view all posts

## Troubleshooting

### Error: "Connection refused"
**Solution**: Make sure backend is running on port 8001

### Error: "Failed to download placeholder image"
**Solution**: 
- Check internet connection (needs to access picsum.photos)
- Or replace with local images

### Error: "Student login failed"
**Solution**: 
- Verify test student credentials
- Make sure students exist in database
- Update script with correct emails/passwords

### Error: "Failed to upload image to S3"
**Solution**:
- Check AWS credentials are set in environment
- Verify S3 bucket exists
- Check bucket permissions

### Posts not showing in feed
**Solution**:
- Check browser console for errors
- Verify API endpoints are correct
- Refresh the page

## Performance Notes

- Creating 5 posts per student with image downloads takes ~30 seconds
- Downloading images is the slowest part
- S3 upload is usually fast
- The script shows progress for each post

## Future Enhancements

### Use Local Images:
Instead of downloading from picsum, you could:
1. Save sample images in `backend/test_images/`
2. Upload from local directory
3. Faster and no internet required

### Batch Processing:
Could optimize by:
1. Downloading all images first
2. Uploading in parallel
3. Progress bar for better UX

### More Realistic Data:
- Use actual culinary images
- More varied captions
- Different image sizes
- Add hashtags to captions

