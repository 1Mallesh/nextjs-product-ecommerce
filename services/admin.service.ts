import api from "./axios";
import type { AnalyticsSummary, ApiResponse, DateRange, FinancialAnalyticsResponse } from "@/types";

export const adminService = {
  getAnalytics: () => api.get<ApiResponse<AnalyticsSummary>>("/admin/analytics"),

  getFinancialAnalytics: (params?: { range?: DateRange; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<FinancialAnalyticsResponse>>("/admin/analytics/financial", { params }),

  getReports: (params?: Record<string, string>) => api.get("/admin/reports", { params }),

  getFinancialReport: (params?: { range?: DateRange; page?: number; limit?: number }) =>
    api.get("/admin/reports/financial", { params }),

  getVendorPayouts: (params?: { status?: string; page?: number }) =>
    api.get("/admin/payouts/vendors", { params }),

  getDeliveryPayouts: (params?: { status?: string; page?: number }) =>
    api.get("/admin/payouts/delivery", { params }),

  getUsers: (params?: { page?: number; role?: string; search?: string }) =>
    api.get("/admin/users", { params }),

  getUserById: (id: string) => api.get(`/admin/users/${id}`),

  updateUser: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/users/${id}`, data),

  toggleBlockUser: (id: string) => api.patch(`/admin/users/${id}/toggle-block`),

  assignDelivery: (orderId: string, deliveryBoyId: string) =>
    api.post(`/admin/orders/${orderId}/assign-delivery`, { deliveryBoyId }),

  settleVendorPayout: (vendorId: string, amount: number) =>
    api.post(`/admin/payouts/vendors/${vendorId}/settle`, { amount }),

  settleDeliveryPayout: (deliveryBoyId: string, amount: number) =>
    api.post(`/admin/payouts/delivery/${deliveryBoyId}/settle`, { amount }),
};
