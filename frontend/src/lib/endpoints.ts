// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints (done)
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_REGISTER_STUDENT: '/auth/register/student',

  // Student endpoints
  STUDENT_GET_PROFILE: '/students/me/profile',    // GET full profile
  STUDENT_UPDATE_PROFILE: '/students/me/profile', // PUT update profile

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