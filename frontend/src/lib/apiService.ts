import axios from "axios";

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: "https://x0n1-tbv3-v8eo.n7.xano.io/api:vuTJHZjG",
  // baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authApi = axios.create({
  baseURL: "https://x0n1-tbv3-v8eo.n7.xano.io/api:e3J7B3uK",
  // baseURL: import.meta.env.VITE_AUTH_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const calendarApi = axios.create({
  baseURL:
    "https://x0n1-tbv3-v8eo.n7.xano.io/api:vuTJHZjG",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor for authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

calendarApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api, authApi, calendarApi };
