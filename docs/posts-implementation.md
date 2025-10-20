# Posts Feature Implementation

## Overview
This document describes the implementation of the posts feature for the C-CAP platform. Students can create posts with images, captions, and featured dishes. All users can view, like, and comment on posts.

## Features
- **Student-only creation**: Only students can create posts (for themselves)
- **Image upload**: Posts include one image uploaded to S3
- **Community feed**: Everyone can view all posts
- **User posts**: Filter posts by specific user (for portfolio view)
- **Engagement**: Like and unlike posts, add and delete comments
- **Permissions**: Users can only edit/delete their own posts and comments

## Files Created/Modified

### Backend Files

#### 1. Model (Already Exists)
- **File**: `backend/app/models/post.py`
- **Fields**: id, user_id, image_url, caption, featured_dish, likes_count, comments_count, created_at, updated_at
- **Relationships**: author (User), comments, likes

#### 2. Schemas Updated
- **File**: `backend/app/schemas/post.py`
- **Changes**: Added `PostAuthor` for including user info in responses
- **File**: `backend/app/schemas/comment.py`
- **Changes**: Added `CommentAuthor` for including user info in comment responses

#### 3. Repository Created
- **File**: `backend/app/repositories/post.py`
- **Methods**:
  - `get_all_posts()` - Get community feed (everyone)
  - `get_posts_by_user()` - Get posts by specific user (everyone)
  - `create_post()` - Create post (students only, auto-sets user_id)
  - `update_post()` - Update post (owner only)
  - `delete_post()` - Delete post (owner only)
  - `like_post()` - Add like (everyone, once per post)
  - `unlike_post()` - Remove like (everyone)
  - `check_if_liked()` - Check if user liked post
  - `add_comment()` - Add comment (everyone)
  - `get_comments_for_post()` - Get all comments
  - `delete_comment()` - Delete comment (owner only)

#### 4. Routes Created
- **File**: `backend/app/routes/posts.py`
- **Endpoints**:
  - `GET /api/posts/dishes` - Get featured dishes list (public)
  - `GET /api/posts/` - Get all posts (community feed)
  - `GET /api/posts/user/{user_id}` - Get posts by user
  - `GET /api/posts/{post_id}` - Get single post
  - `POST /api/posts/` - Create post with image upload (students only)
  - `PUT /api/posts/{post_id}` - Update post (owner only)
  - `DELETE /api/posts/{post_id}` - Delete post (owner only)
  - `POST /api/posts/{post_id}/like` - Like a post
  - `DELETE /api/posts/{post_id}/like` - Unlike a post
  - `GET /api/posts/{post_id}/liked` - Check if user liked post
  - `GET /api/posts/{post_id}/comments` - Get comments for post
  - `POST /api/posts/{post_id}/comments` - Add comment to post
  - `DELETE /api/posts/comments/{comment_id}` - Delete comment

#### 5. S3 Service Updated
- **File**: `backend/app/utils/s3.py`
- **Added**: `upload_post_image()` method for uploading post images to S3 public folder

#### 6. Router Setup Updated
- **File**: `backend/app/core/routers.py`
- **Changes**: Added posts router to main app

## Permission Model

### Posts
- **Create**: Students only (auto-sets to current user)
- **View All**: Everyone (community feed)
- **View User Posts**: Everyone (for profile viewing)
- **Update**: Owner only (can't edit others' posts)
- **Delete**: Owner only (can't delete others' posts)

### Likes
- **Like**: Everyone (once per post)
- **Unlike**: Everyone (only if they liked it)
- **View**: Reflected in `likes_count` on post

### Comments
- **Create**: Everyone (can comment on any post)
- **View**: Everyone (can see all comments)
- **Delete**: Owner only (can only delete own comments)

## Featured Dishes

### Current Implementation (Hardcoded)
- List of dishes is hardcoded in `backend/app/routes/posts.py`
- Endpoint: `GET /api/posts/dishes` returns the list
- Easy to update when program curriculum changes

### Dishes List:
```python
FEATURED_DISHES = [
    "Beef Wellington",
    "Coq au Vin",
    "Risotto Milanese",
    "Bouillabaisse",
    "Beef Bourguignon",
    "Ratatouille",
    "Paella",
    "Osso Buco",
    "Cassoulet",
    "Soufflé",
    "Croissants",
    "Macarons",
    "Crème Brûlée",
    "Tarte Tatin",
    "Chicken Cordon Bleu",
]
```

### Future Enhancement
Can be upgraded to admin-managed list with CRUD operations if needed.

## Image Upload Flow

### Post Creation:
1. Student selects image from device
2. Frontend sends multipart/form-data with:
   - `image` (file)
   - `caption` (text, optional)
   - `featured_dish` (text, optional)
3. Backend uploads to S3: `public/post-images/{user_id}_{uuid}.jpg`
4. Returns post with public image URL
5. Image is publicly accessible (no signed URLs needed)

### Image Storage:
- **Location**: S3 bucket at `public/post-images/`
- **Format**: `{user_id}_{uuid}.{extension}`
- **Access**: Public (anyone can view)
- **Content Types**: image/jpeg, image/png, image/gif, etc.

## API Usage Examples

### Get Community Feed
```typescript
const response = await api.get('/posts/', {
  params: { limit: 50, offset: 0 }
});
```

### Get User's Posts (Portfolio)
```typescript
const response = await api.get(`/posts/user/${userId}`);
```

### Create Post
```typescript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('caption', 'My amazing dish!');
formData.append('featured_dish', 'Beef Wellington');

const response = await api.post('/posts/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Like a Post
```typescript
await api.post(`/posts/${postId}/like`);
```

### Unlike a Post
```typescript
await api.delete(`/posts/${postId}/like`);
```

### Add Comment
```typescript
await api.post(`/posts/${postId}/comments`, {
  content: 'Great job!'
});
```

### Delete Comment
```typescript
await api.delete(`/posts/comments/${commentId}`);
```

## Response Examples

### Post Response:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "image_url": "https://bucket.s3.amazonaws.com/public/post-images/...",
  "caption": "My first culinary creation!",
  "featured_dish": "Beef Wellington",
  "likes_count": 15,
  "comments_count": 3,
  "created_at": "2025-10-11T12:00:00Z",
  "updated_at": null,
  "author": {
    "id": "uuid",
    "username": "student123",
    "email": "student@test.com"
  }
}
```

### Comment Response:
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "content": "Amazing work!",
  "created_at": "2025-10-11T12:00:00Z",
  "updated_at": null,
  "user": {
    "id": "uuid",
    "username": "student456",
    "email": "another@test.com"
  }
}
```

## Next Steps

### Backend:
1. ✅ Repository created
2. ✅ Routes created
3. ✅ S3 upload method added
4. ✅ Schemas updated with author info
5. ✅ Router registered

### To Deploy:
1. Restart backend server to load new routes
2. Models/migrations already exist (posts, likes, comments tables)

### Frontend Integration:
Update frontend pages to:
1. **Community Feed** (Homepage):
   - Fetch from `GET /api/posts/`
   - Display with like/comment counts
   - Click to view full post with comments

2. **User Portfolio**:
   - Fetch from `GET /api/posts/user/{userId}`
   - Display user's posts in grid
   - Create new post with image upload

3. **Post Details**:
   - Show full image, caption, dish
   - Display comments with usernames
   - Like/unlike button
   - Add comment form
   - Edit/delete for owner

4. **Create Post**:
   - Image upload (required)
   - Caption textarea (optional)
   - Featured dish dropdown (optional)
   - Submit as multipart/form-data

## Testing Checklist
- [ ] Students can create posts with images
- [ ] Post images upload to S3 successfully
- [ ] Community feed shows all posts
- [ ] User portfolio shows only their posts
- [ ] Students can edit their own posts
- [ ] Students can delete their own posts
- [ ] Students cannot edit/delete others' posts
- [ ] Everyone can like/unlike posts
- [ ] Like count updates correctly
- [ ] Cannot like same post twice
- [ ] Everyone can add comments
- [ ] Comments display with author names
- [ ] Users can delete their own comments
- [ ] Users cannot delete others' comments
- [ ] Featured dishes list loads correctly

## Database Schema

### Post Model
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `image_url` (String) - Public S3 URL
- `caption` (Text) - Optional post caption
- `featured_dish` (String) - Optional dish name
- `likes_count` (Integer) - Denormalized count
- `comments_count` (Integer) - Denormalized count
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Like Model
- `id` (UUID) - Primary key
- `post_id` (UUID) - Foreign key to posts
- `user_id` (UUID) - Foreign key to users
- `created_at` (DateTime)
- **Unique constraint**: (post_id, user_id) - One like per user per post

### Comment Model
- `id` (UUID) - Primary key
- `post_id` (UUID) - Foreign key to posts
- `user_id` (UUID) - Foreign key to users
- `content` (Text) - Comment text
- `created_at` (DateTime)
- `updated_at` (DateTime)

