import api from "./axios";
import type { ApiResponse, AuthTokens, LoginPayload, User } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ userId: string; email: string }>>("/auth/register", payload),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/verify-otp", data),

  logout: () => api.post("/auth/logout"),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post("/auth/reset-password", { email, otp, newPassword }),
};
