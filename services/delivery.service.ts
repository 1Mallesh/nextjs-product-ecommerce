import api from "./axios";
import type { ApiResponse, DeliveryBoy, Order, PaginatedResponse } from "@/types";

export const deliveryService = {
  onboard: (data: FormData) =>
    api.post<ApiResponse<DeliveryBoy>>("/delivery/onboard", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getProfile: () => api.get<ApiResponse<DeliveryBoy>>("/delivery/profile"),

  getDashboard: () => api.get("/delivery/dashboard"),

  toggleAvailability: () => api.post("/delivery/toggle-availability"),

  updateLocation: (lat: number, lng: number) =>
    api.post("/delivery/location", { lat, lng }),

  getAssigned: () => api.get<ApiResponse<Order[]>>("/delivery/deliveries"),

  updateDeliveryStatus: (id: string, status: string, location?: { lat: number; lng: number }) =>
    api.put(`/delivery/deliveries/${id}/status`, { status, location }),

  // Admin
  adminGetAll: (params?: { page?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<DeliveryBoy>>>("/admin/delivery-boys", { params }),

  adminApprove: (id: string) => api.patch(`/admin/delivery-boys/${id}/approve`),
  adminReject: (id: string, reason: string) =>
    api.patch(`/admin/delivery-boys/${id}/reject`, { reason }),
};
