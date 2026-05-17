import api from "./axios";
import type { ApiResponse, User } from "@/types";

export const userService = {
  getProfile: () => api.get<ApiResponse<User>>("/users/profile"),
  updateProfile: (data: Partial<User>) => api.put<ApiResponse<User>>("/users/profile", data),
};
