# Admin Management API Requirements

## Overview
Simple admin management system that allows admins to create other admin accounts and reset passwords. No email verification or 2FA needed - uses temporary passwords shown once.

## Frontend Implementation
✅ AdminNavigation updated with "Admin Management" link
✅ Admin Management page created at `/admin/admin-management`
✅ Create admin modal with password display
✅ Reset password functionality

## Backend APIs Needed

### 1. Get All Admins
**Endpoint:** `GET /admin/admins`
**Access:** Admin only (or Super Admin only - your choice)

**Response:**
```json
[
  {
    "id": "uuid-here",
    "email": "admin@example.com",
    "full_name": "John Doe",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

---

### 2. Create New Admin
**Endpoint:** `POST /admin/admins`
**Access:** Admin only (or Super Admin only)

**Request Body:**
```json
{
  "email": "newadmin@example.com"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "email": "newadmin@example.com",
  "username": "newadmin",  // Auto-generated from email
  "temporary_password": "aB3$kL9mPq2#",  // Random generated password (show once!)
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Backend Logic:**
1. Auto-generate username from email (part before @)
2. Ensure username is unique (append number if needed)
3. Generate random secure password (12+ chars, mixed case, numbers, symbols)
4. Hash the password and store in database
5. Return the plain password ONCE in response
6. Frontend will display it once and never show again

---

### 3. Reset Admin Password
**Endpoint:** `POST /admin/admins/{admin_id}/reset-password`
**Access:** Admin only (or Super Admin only)

**Request Body:** None (or optionally include confirmation)

**Response:**
```json
{
  "id": "uuid-here",
  "email": "admin@example.com",
  "temporary_password": "xY7$nM4qRt6#",  // New random password (show once!)
  "reset_at": "2025-01-15T11:45:00Z"
}
```

**Backend Logic:**
1. Generate new random secure password
2. Hash and update in database
3. Return plain password ONCE in response
4. Optionally: invalidate any existing sessions for that admin

---

## Password Generation Recommendation

Use a secure random password generator. Example in Python:

```python
import secrets
import string

def generate_temporary_password(length=12):
    """Generate a secure random password with mixed characters"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    
    # Ensure it has at least one of each type
    while not (any(c.islower() for c in password) and 
               any(c.isupper() for c in password) and
               any(c.isdigit() for c in password) and
               any(c in "!@#$%^&*" for c in password)):
        password = ''.join(secrets.choice(alphabet) for i in range(length))
    
    return password
```

---

## Security Considerations

### ✅ What We Have (Good for this project level):
- Random secure passwords
- Passwords shown once only
- Admin must manually share password with new admin
- Password reset capability
- Hashed passwords in database

### 🚫 What We're Skipping (Would need for production):
- Email verification
- 2FA authentication
- Password reset via email
- Password expiration policies
- Login attempt limiting
- Session management

---

## User Flow

### Creating an Admin:
1. Admin clicks "Add Admin" button
2. Enters email address only (username auto-generated)
3. Submits form
4. **Password Modal Appears** with generated password
5. Admin copies password
6. Admin manually shares password with new admin (email, Slack, etc.)
7. New admin logs in with email and temporary password
8. (Optional: Force password change on first login - not implemented yet)

### Resetting Password:
1. Admin clicks "Reset Password" on admin row
2. Confirms the action
3. **Password Modal Appears** with new password
4. Admin copies and shares new password
5. Target admin logs in with new password

---

## Database Schema Needed

Your `users` table should support:
```sql
users:
  - id (UUID, primary key)
  - email (string, unique)
  - full_name (string)
  - password_hash (string) -- bcrypt or similar
  - role (string) -- 'admin' or 'student'
  - created_at (timestamp)
  - updated_at (timestamp)
```

---

## Testing the Feature

1. Login as an admin
2. Click profile dropdown → "Admin Management"
3. Click "Add Admin" button
4. Enter email and name
5. See generated password in modal
6. Copy password
7. Try logging out and logging in with new admin credentials
8. Test password reset feature
9. Verify old password doesn't work, new one does

---

## Next Steps for Backend

1. **Create Admin Model** (if not exists) - extend users table with role
2. **Add Password Generation** - use secure random generator
3. **Add Three API Endpoints** - GET admins, POST create, POST reset
4. **Add Admin Permission Check** - ensure only admins can access these endpoints
5. **Test API with Postman/curl** before connecting frontend

---

## Frontend Route Setup

You'll need to add this route to your router (usually in `App.tsx` or similar):

```tsx
<Route path="/admin/admin-management" component={AdminManagement} />
```

The page is already created at:
`/Users/andyle/Projects/ccap/frontend/src/pages/admin/adminManagement.tsx`

