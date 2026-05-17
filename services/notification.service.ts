import api from "./axios";
import type { ApiResponse, Notification } from "@/types";

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export const notificationService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<NotificationListResponse>>("/notifications", { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
