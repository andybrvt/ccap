// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints (done)
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_REGISTER_STUDENT: '/auth/register/student',

  // Student endpoints
  STUDENT_GET_PROFILE: '/students/me/profile',    // GET full profile
  STUDENT_UPDATE_PROFILE: '/students/me/profile', // PUT update profile

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
};