import api from "./axios";
import type { AnalyticsSummary, ApiResponse, PaginatedResponse, Vendor } from "@/types";

export const vendorService = {
  onboard: (data: FormData | Record<string, unknown>) =>
    api.post<ApiResponse<Vendor>>("/vendor/onboard", data),

  getProfile: () => api.get<ApiResponse<Vendor>>("/vendor/profile"),

  updateProfile: (data: Partial<Vendor> | FormData) =>
    api.put<ApiResponse<Vendor>>("/vendor/profile", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  getDashboard: () => api.get<ApiResponse<AnalyticsSummary>>("/vendor/dashboard"),

  // Admin — single endpoint with { approved, reason }
  adminGetAll: (params?: { page?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<Vendor>>>("/admin/vendors", { params }),

  adminApprove: (id: string, reason?: string) =>
    api.patch(`/admin/vendors/${id}/approve`, { approved: true, reason }),

  adminReject: (id: string, reason: string) =>
    api.patch(`/admin/vendors/${id}/approve`, { approved: false, reason }),
};
