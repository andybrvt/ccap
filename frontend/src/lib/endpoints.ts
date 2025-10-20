// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints (done)
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_REGISTER_STUDENT: '/auth/register/student',

  // Student endpoints
  STUDENT_GET_PROFILE: '/students/me/profile',    // GET full profile
  STUDENT_UPDATE_PROFILE: '/students/me/profile', // PUT update profile

  // Admin student management endpoints
  ADMIN_GET_ALL_STUDENTS: '/students/',          // GET all students (admin only)
  ADMIN_SEARCH_STUDENTS: '/students/search',     // GET search students (admin only, requires ?q=query)
  ADMIN_GET_STUDENT: '/students/',               // GET single student by ID (admin only)
  ADMIN_BULK_UPDATE_PROGRAM_STATUS: '/students/bulk-update-program-status', // POST bulk update program status (admin only)

  // Student file uploads
  STUDENT_UPLOAD_PROFILE_PICTURE: '/students/profile/picture', // POST upload profile picture
  STUDENT_UPLOAD_RESUME: '/students/profile/resume',          // POST upload resume
  STUDENT_UPLOAD_CREDENTIAL: '/students/profile/credential',  // POST upload food handlers card
  STUDENT_UPLOAD_SERVSAFE: '/students/profile/servsafe',      // POST upload servsafe certificate
  STUDENT_GET_RESUME_URL: '/students/profile/resume',         // GET signed resume URL
  STUDENT_GET_CREDENTIAL_URL: '/students/profile/credential', // GET signed food handlers URL
  STUDENT_GET_SERVSAFE_URL: '/students/profile/servsafe',     // GET signed servsafe URL
  STUDENT_DELETE_PROFILE_PICTURE: '/students/profile/picture', // DELETE profile picture
  STUDENT_DELETE_RESUME: '/students/profile/resume',          // DELETE resume
  STUDENT_DELETE_CREDENTIAL: '/students/profile/credential',  // DELETE food handlers card
  STUDENT_DELETE_SERVSAFE: '/students/profile/servsafe',      // DELETE servsafe certificate

  // Calendar
  CALENDAR_EVENTS: '/calendar/events',
  CALENDAR_EVENTS_PUBLIC: '/calendar/events/public',
  SHARE_TOKEN: '/user/calendar/getShareToken',
  CHECK_SHARE_TOKEN: '/calendar/public',

  // Timezone
  TIMEZONE: '/timezone',

  // Unavailability
  UNAVAILABILITY: '/user/unavailability',
  DELETE_UNAVAILABILITY: '/user/unavailability/delete',

  // BOOK EVENT
  BOOK_EVENT: '/event/public',

  // RESTAURANT DETAILS
  RESTAURANT_DETAILS: '/restaurant/search',

  // Announcement endpoints
  ANNOUNCEMENTS_GET_ALL: '/announcements/',              // GET all announcements (filtered by role)
  ANNOUNCEMENTS_GET_BY_ID: '/announcements/',            // GET single announcement by ID
  ANNOUNCEMENTS_CREATE: '/announcements/',               // POST create announcement (admin only)
  ANNOUNCEMENTS_UPDATE: '/announcements/',               // PUT update announcement (admin only)
  ANNOUNCEMENTS_DELETE: '/announcements/',               // DELETE announcement (admin only)

  // Post endpoints
  POSTS_GET_DISHES: '/posts/dishes',                     // GET featured dishes list
  POSTS_GET_ALL: '/posts/',                              // GET all posts (community feed)
  POSTS_GET_BY_USER: '/posts/user/',                     // GET posts by specific user
  POSTS_GET_BY_ID: '/posts/',                            // GET single post
  POSTS_CREATE: '/posts/',                               // POST create post with image (students only)
  POSTS_UPDATE: '/posts/',                               // PUT update post (owner only)
  POSTS_DELETE: '/posts/',                               // DELETE post (owner only)
  POSTS_LIKE: '/posts/',                                 // POST like a post (append {id}/like)
  POSTS_UNLIKE: '/posts/',                               // DELETE unlike a post (append {id}/like)
  POSTS_CHECK_LIKED: '/posts/',                          // GET check if liked (append {id}/liked)
  POSTS_GET_COMMENTS: '/posts/',                         // GET comments (append {id}/comments)
  POSTS_ADD_COMMENT: '/posts/',                          // POST add comment (append {id}/comments)
  POSTS_DELETE_COMMENT: '/posts/comments/',              // DELETE comment by ID

  // Admin management endpoints
  ADMIN_GET_ALL_ADMINS: '/admin/admins',                 // GET all admins (super admin only)
  ADMIN_CREATE_ADMIN: '/admin/admins',                   // POST create new admin (super admin only)
  ADMIN_RESET_PASSWORD: '/admin/admins/',                // POST reset admin password (append {id}/reset-password)

  // Email notification endpoints
  EMAIL_NOTIFICATIONS_GET_ALL: '/admin/email-notifications/',     // GET all email notifications (admin only)
  EMAIL_NOTIFICATIONS_CREATE: '/admin/email-notifications/',      // POST create email notification (admin only)
  EMAIL_NOTIFICATIONS_UPDATE: '/admin/email-notifications/',       // PUT update email notification (admin only)
  EMAIL_NOTIFICATIONS_DELETE: '/admin/email-notifications/',       // DELETE email notification (admin only)
  EMAIL_NOTIFICATIONS_TOGGLE: '/admin/email-notifications/',      // PATCH toggle active status (admin only)
  EMAIL_NOTIFICATIONS_GET_ACTIVE: '/admin/email-notifications/active', // GET active emails (admin only)

  // Email logs endpoints
  EMAIL_LOGS_GET_ALL: '/admin/email-logs',                        // GET email logs with pagination (admin only)
  EMAIL_LOGS_GET_STATS: '/admin/email-logs/stats',               // GET email statistics (admin only)

  // Test email endpoint
  EMAIL_TEST_SEND: '/admin/test-email',                           // POST send test email (admin only)
};