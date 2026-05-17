import api from "./axios";
import type { ApiResponse, AuthTokens, LoginPayload, RegisterPayload, User } from "@/types";

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/register", payload),

  logout: () => api.post("/auth/logout"),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>("/auth/verify-otp", data),
};
