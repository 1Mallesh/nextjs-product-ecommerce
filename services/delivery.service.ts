import api from "./axios";
import type { ApiResponse, DeliveryBoy, Order, PaginatedResponse } from "@/types";

export const deliveryService = {
  onboard: (data: FormData | Record<string, unknown>) =>
    api.post<ApiResponse<DeliveryBoy>>("/delivery/onboard", data),

  getProfile: () => api.get<ApiResponse<DeliveryBoy>>("/delivery/profile"),

  getDashboard: () => api.get("/delivery/dashboard"),

  toggleAvailability: () => api.post("/delivery/toggle-availability"),

  // API expects { latitude, longitude, orderId }
  updateLocation: (latitude: number, longitude: number, orderId?: string) =>
    api.post("/delivery/location", { latitude, longitude, orderId }),

  getAssigned: (params?: { status?: string }) =>
    api.get<ApiResponse<Order[]>>("/delivery/deliveries", { params }),

  // API expects { status, notes }
  updateDeliveryStatus: (id: string, status: string, notes?: string) =>
    api.put(`/delivery/deliveries/${id}/status`, { status, notes }),

  // Admin
  adminGetAll: (params?: { page?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<DeliveryBoy>>>("/admin/delivery-boys", { params }),

  adminApprove: (id: string) =>
    api.patch(`/admin/delivery-boys/${id}/approve`, { approved: true }),

  adminReject: (id: string, reason?: string) =>
    api.patch(`/admin/delivery-boys/${id}/approve`, { approved: false, reason }),
};
