# Announcements Feature Implementation

## Overview
This document describes the implementation of the announcements feature for the C-CAP platform. Announcements can be created by admins and are filtered based on user role and location/bucket.

## Features
- **Admin-only creation**: Only admins can create, update, and delete announcements
- **Smart filtering**: Students see announcements based on:
  - Global announcements (visible to all)
  - Location-specific announcements (matching their city/state)
  - Bucket-specific announcements (matching their current program bucket)
- **Rich metadata**: Each announcement includes title, content, priority, category, icon, and targeting information

## Files Created/Modified

### Backend Files

#### 1. Model Updated
- **File**: `backend/app/models/announcement.py`
- **Changes**: Added `priority`, `category`, and `icon` fields

#### 2. Schema Updated
- **File**: `backend/app/schemas/announcement.py`
- **Changes**: Added new fields to all schemas (Base, Create, Update, Response)

#### 3. Repository Created
- **File**: `backend/app/repositories/announcement.py`
- **Features**:
  - `get_all_announcements()` - Admin-only method to see all announcements
  - `get_announcements_for_student()` - Filtered announcements based on user profile
  - `create_announcement()` - Admin-only creation
  - `update_announcement()` - Admin-only updates
  - `delete_announcement()` - Admin-only deletion
  - `get_announcement_by_id()` - Get single announcement with permission check

#### 4. Routes Created
- **File**: `backend/app/routes/announcements.py`
- **Endpoints**:
  - `GET /api/announcements/` - Get all announcements (filtered by role)
  - `GET /api/announcements/{id}` - Get specific announcement
  - `POST /api/announcements/` - Create announcement (admin only)
  - `PUT /api/announcements/{id}` - Update announcement (admin only)
  - `DELETE /api/announcements/{id}` - Delete announcement (admin only)

#### 5. Router Setup Updated
- **File**: `backend/app/core/routers.py`
- **Changes**: Added announcements router to the main app

#### 6. Migration Created
- **File**: `backend/alembic/versions/add_priority_category_icon_to_announcements.py`
- **Changes**: Adds `priority`, `category`, and `icon` columns to announcements table

### Frontend Files

#### 7. Endpoints Updated
- **File**: `frontend/src/lib/endpoints.ts`
- **Changes**: Added announcement API endpoints

## Database Schema

### Announcement Model Fields
- `id` (UUID) - Primary key
- `created_by` (UUID) - Foreign key to users table
- `title` (String) - Announcement title
- `content` (Text) - Announcement content
- `priority` (String) - "low", "medium", or "high"
- `category` (String) - "general", "feature", "maintenance", etc.
- `icon` (String) - Icon identifier for frontend display
- `target_audience` (String) - "all", "bucket", or "location"
- `target_bucket` (String) - Specific bucket if targeting by bucket
- `target_city` (String) - Specific city if targeting by location
- `target_state` (String) - Specific state if targeting by location
- `created_at` (DateTime) - Creation timestamp
- `updated_at` (DateTime) - Last update timestamp

## Filtering Logic

### For Students
When a student requests announcements, they receive:
1. **All global announcements** (`target_audience = "all"`)
2. **Bucket-specific announcements** where `target_bucket` matches their `current_bucket`
3. **Location-specific announcements** where:
   - `target_city` and `target_state` match their profile, OR
   - `target_state` matches (if city is not specified in announcement)

### For Admins
Admins always see ALL announcements regardless of targeting.

## Permission Model
- **Create**: Admin only
- **Update**: Admin only
- **Delete**: Admin only
- **Read (All)**: Admin sees all, students see filtered
- **Read (Single)**: Admin sees any, students only see those they have access to

## Next Steps

### To Deploy:
1. Run the database migration:
   ```bash
   cd backend
   alembic upgrade head
   ```

2. Restart the backend server to load new routes

### Frontend Integration:
Update the frontend announcements page (`frontend/src/pages/admin/anouncements.tsx`) to:
1. Fetch announcements from the API instead of using dummy data
2. Implement create functionality
3. Add update/delete functionality
4. Add target audience selection (global, bucket-specific, location-specific)

## API Usage Examples

### Get All Announcements (Filtered by Role)
```typescript
// Frontend
const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS_GET_ALL);
// Admins get all, students get filtered
```

### Create Announcement (Admin Only)
```typescript
const newAnnouncement = {
  title: "Welcome New Students!",
  content: "We're excited to have you join our program...",
  priority: "high",
  category: "general",
  icon: "megaphone",
  target_audience: "all"  // or "bucket" or "location"
};

const response = await api.post(
  API_ENDPOINTS.ANNOUNCEMENTS_CREATE, 
  newAnnouncement
);
```

### Create Location-Specific Announcement
```typescript
const announcement = {
  title: "Chicago Event",
  content: "Special event for Chicago students...",
  priority: "medium",
  category: "team",
  icon: "globe",
  target_audience: "location",
  target_city: "Chicago",
  target_state: "IL"
};
```

### Create Bucket-Specific Announcement
```typescript
const announcement = {
  title: "Apprentice Program Update",
  content: "Important update for apprentices...",
  priority: "high",
  category: "policy",
  icon: "alert",
  target_audience: "bucket",
  target_bucket: "Apprentice"
};
```

## Testing Checklist
- [ ] Admin can create announcements
- [ ] Admin can update announcements
- [ ] Admin can delete announcements
- [ ] Admin sees all announcements
- [ ] Students see global announcements
- [ ] Students see location-specific announcements matching their profile
- [ ] Students see bucket-specific announcements matching their bucket
- [ ] Students cannot create/update/delete announcements
- [ ] Students cannot see announcements they don't have access to
- [ ] Validation works (e.g., bucket required when target_audience is "bucket")

