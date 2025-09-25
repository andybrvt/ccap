// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: 'auth/login',
  AUTH_ME: 'auth/me',

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