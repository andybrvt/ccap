import { authApi } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/endpoints";

// Call auth_login API
export async function login(email: string, password: string) {
  return authApi.post(API_ENDPOINTS.AUTH_LOGIN, {
    email,
    password,
    platform_id: 2,
  });
}

// Call auth_me API
export async function getMe() {
  return authApi.get(API_ENDPOINTS.AUTH_ME);
} 