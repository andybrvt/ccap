# Portfolio Lookup Setup

## Overview
The Portfolio Lookup feature allows admins to search for students by name, email, or school and view their portfolios.

## Backend Implementation

### 1. **Student Repository** (`backend/app/repositories/student.py`)
Added a new search method:
```python
def search_students(self, query: str, requesting_user: User) -> List[User]:
    """
    Search students by name, email, or school
    Admin only - returns students matching the search query
    """
```

**Search Fields:**
- `User.full_name` (student's full name)
- `User.email` (student email)
- `User.username` (username)
- `StudentProfile.high_school` (school name)

**Features:**
- Case-insensitive search using SQL `ILIKE`
- Requires minimum 2 characters
- Admin-only permission check
- Joins User and StudentProfile tables
- Returns distinct results

### 2. **Student Routes** (`backend/app/routes/students.py`)
Added a new search endpoint:
```python
@router.get("/search", response_model=List[UserWithFullProfile])
def search_students(q: str, ...)
```

**Endpoint:** `GET /api/students/search?q=<search_term>`
- **Query Parameter:** `q` (search term, minimum 2 characters)
- **Auth:** Admin only
- **Response:** List of students with full profile data

## Frontend Implementation

### 1. **API Endpoints** (`frontend/src/lib/endpoints.ts`)
Added new endpoint constant:
```typescript
ADMIN_SEARCH_STUDENTS: '/students/search',
```

### 2. **Portfolio Lookup Page** (`frontend/src/pages/admin/portfolioLookup.tsx`)

**Features:**
- **Real-time Search:** Debounced search (500ms delay) for better performance
- **Loading States:** Spinner while searching
- **Empty States:** 
  - Before search: "Type at least 2 characters..."
  - No results: "No students found..."
- **Student Cards:** Display name, email, school, interests, and current bucket
- **Navigation:** Click "View Portfolio" to see full student portfolio

**Search Behavior:**
- Automatically searches after typing (500ms debounce)
- Minimum 2 characters required
- Clears results when search is cleared
- Shows error toasts if search fails

**Display Information:**
- Student initials avatar
- Full name or username
- Email address
- High school and graduation year
- Interested options (badges)
- Current program bucket (badge)

## Usage

### For Admins:
1. Navigate to **Portfolio Lookup** from the admin navigation
2. Type at least 2 characters in the search box
3. Wait 500ms for automatic search (or keep typing)
4. Browse search results
5. Click "View Portfolio" to see full student details

### Search Examples:
- **By Name:** "John Doe" → finds all Johns, Does, or John Does
- **By Email:** "student@test.com" → finds exact or partial email matches
- **By School:** "Paradise Valley" → finds all students from that school
- **By Username:** "john_chef" → finds users with matching usernames

## API Flow

```
User types in search box
  ↓
500ms debounce wait
  ↓
Frontend: GET /api/students/search?q=query
  ↓
Backend: Check admin permission
  ↓
Backend: Query database (ILIKE search)
  ↓
Backend: Return List[UserWithFullProfile]
  ↓
Frontend: Display results in cards
  ↓
User clicks "View Portfolio"
  ↓
Navigate to /admin/portfolio/{student_id}
```

## Security
- **Admin Only:** All search endpoints require admin authentication
- **Permission Check:** Backend validates user role before searching
- **No Data Leakage:** Students cannot search for other students
- **SQL Injection Safe:** Uses SQLAlchemy ORM with parameterized queries

## Performance Considerations
- **Debounced Search:** 500ms delay reduces unnecessary API calls
- **Minimum Characters:** 2-character minimum prevents overly broad searches
- **Database Indexes:** Ensure indexes on frequently searched fields:
  - `User.full_name`
  - `User.email`
  - `StudentProfile.high_school`

## Future Enhancements
- Advanced filters (by state, bucket, graduation year)
- Sort options (by name, date added, bucket)
- Export search results to CSV
- Save/bookmark favorite searches
- Recent searches history

