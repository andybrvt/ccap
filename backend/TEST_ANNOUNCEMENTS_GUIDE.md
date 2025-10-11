# Test Announcements Guide

## Overview
This guide will help you test the announcements feature with sample data to verify:
- ✅ Pagination works correctly
- ✅ Admin sees all announcements
- ✅ Students only see relevant announcements (global + their location + their bucket)
- ✅ Filtering and search functionality

## Scripts Available

### 1. `create_test_announcements.py`
Creates test announcements with various targeting options.

**What it creates:**
- **15 Global announcements** - Visible to all students
- **50 Program Stage announcements** - 10 for each stage (Pre-Apprentice, Apprentice, etc.)
- **15 Location-specific announcements** - For various states and cities

**Total: ~80 announcements** - Perfect for testing pagination!

### 2. `cleanup_test_announcements.py`
Deletes ALL announcements from the database. Use when you're done testing.

## How to Use

### Step 1: Make sure your backend is running
```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

### Step 2: Run the database migration (if not done yet)
```bash
cd backend
alembic upgrade head
```

### Step 3: Create test announcements
```bash
cd backend
python create_test_announcements.py
```

You should see output like:
```
============================================================
CCAP Test Announcements Generator
============================================================

Step 1: Admin Authentication
------------------------------------------------------------
✓ Admin login successful

Step 2: Creating Global Announcements
------------------------------------------------------------
✓ Created global announcement: Welcome to CCAP Culinary Program! - 1
✓ Created global announcement: Important Program Update - 2
...

SUMMARY
============================================================
Total announcements created: 80
Total failed: 0

Distribution:
  - Global announcements: 15
  - Program stage announcements: 50
  - Location announcements: 15
============================================================
```

### Step 4: Test as Admin
1. Login to frontend as admin: `andybrvt@gmail.com` / `AdminPass123!`
2. Navigate to Announcements page
3. **You should see ALL 80 announcements**
4. Test:
   - Pagination controls
   - Search functionality
   - Priority filtering
   - Edit/Delete functionality

### Step 5: Test as Student
1. Login as a test student (e.g., `student1@test.com` / `password!`)
2. Navigate to Announcements page (when you build the student view)
3. **You should only see:**
   - All global announcements (15)
   - Announcements for your program stage
   - Announcements for your location (if applicable)

#### Testing Different Scenarios

**Example 1: Pre-Apprentice student in California**
- Should see: Global + Pre-Apprentice + California announcements
- Should NOT see: Other program stage or other state announcements

**Example 2: Apprentice student in New York**
- Should see: Global + Apprentice + New York announcements
- Should NOT see: Pre-Apprentice or California announcements

### Step 6: Clean up when done
```bash
cd backend
python cleanup_test_announcements.py
```

Type `yes` when prompted to confirm deletion.

## Testing Checklist

### Admin Tests
- [ ] Can see all announcements (80 total)
- [ ] Pagination works correctly
- [ ] Can search announcements
- [ ] Can filter by priority (high/medium/low)
- [ ] Can create new announcements
- [ ] Can edit existing announcements
- [ ] Can delete announcements
- [ ] Can target different audiences (global/bucket/location)

### Student Tests (Per Student)
- [ ] Only sees global announcements
- [ ] Only sees announcements for their program stage
- [ ] Only sees announcements for their location
- [ ] Cannot see announcements for other stages
- [ ] Cannot see announcements for other locations
- [ ] Cannot create/edit/delete announcements

## Announcement Distribution

### By Target Audience
- **Global (15)**: All students see these
- **Program Stage (50)**: 
  - Pre-Apprentice: 10
  - Apprentice: 10
  - Completed Pre-Apprentice: 10
  - Completed Apprentice: 10
  - Not Active: 10
- **Location (15)**: Various states (CA, NY, TX, IL, FL, PA, OH, GA, NC, AZ)

### By Priority
- Randomly distributed across low/medium/high

### By Category
- Randomly distributed: general, feature, maintenance, policy, hours, team, urgent, scholarship, safety

## Common Issues

### Issue: "Admin login failed"
**Solution**: Check that admin credentials in script match your `login.txt`

### Issue: "Connection refused"
**Solution**: Make sure backend is running on port 8001

### Issue: "Failed to create announcement"
**Solution**: Check that migration was run and database is up to date

### Issue: Student sees too many/too few announcements
**Solution**: Verify student profile has correct `current_bucket` and location (`city`, `state`)

## Pro Tips

1. **Test pagination threshold**: The script creates 80 announcements. If your page shows 10 per page, you should have 8 pages.

2. **Test edge cases**: 
   - Student with no bucket assigned (should only see global)
   - Student with no location (should only see global + bucket)
   - Student in location with no city (should see state-level announcements)

3. **Mix and match**: After running the script, manually create a few more announcements to test specific scenarios.

4. **Performance**: With 80 announcements, test how fast the page loads and filters.

## Next Steps

After testing, you might want to:
1. Add pagination to the announcements list (if needed)
2. Build the student-facing announcements view
3. Add announcement categories filter
4. Add date range filtering
5. Add "mark as read" functionality for students

