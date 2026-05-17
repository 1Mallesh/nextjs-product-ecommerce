import api from "./axios";
import type { AnalyticsSummary, ApiResponse } from "@/types";

export const adminService = {
  getAnalytics: () => api.get<ApiResponse<AnalyticsSummary>>("/admin/analytics"),

  getUsers: (params?: { page?: number; role?: string; search?: string }) =>
    api.get("/admin/users", { params }),

  getUserById: (id: string) => api.get(`/admin/users/${id}`),

  updateUser: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/users/${id}`, data),

  // Single toggle-block endpoint
  toggleBlockUser: (id: string) => api.patch(`/admin/users/${id}/toggle-block`),

  getReports: (params?: Record<string, string>) => api.get("/admin/reports", { params }),

  assignDelivery: (orderId: string, deliveryBoyId: string) =>
    api.post(`/admin/orders/${orderId}/assign-delivery`, { deliveryBoyId }),
};
