import api from "./axios";
import type { ApiResponse, Notification } from "@/types";

export const notificationService = {
  getAll: () => api.get<ApiResponse<Notification[]>>("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
