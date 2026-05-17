import api from "./axios";
import type { ApiResponse, Order, PaginatedResponse } from "@/types";

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: "RAZORPAY" | "COD";
  items: OrderItem[];           // required — backend creates order_items from this
  deliveryType?: string;        // "STANDARD" | "EXPRESS" | "SAME_DAY" | "NEXT_DAY"
  couponCode?: string;
  notes?: string;
}

export const orderService = {
  // Customer
  create: (payload: CreateOrderPayload) =>
    api.post<ApiResponse<Order>>("/orders", payload),

  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<Order>>>("/orders", { params }),

  getById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),

  cancel: (id: string, reason?: string) =>
    api.post(`/orders/${id}/cancel`, { reason }),

  trackOrder: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}/tracking`),

  // Vendor
  vendorGetAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<Order>>>("/vendor/orders", { params }),

  vendorUpdateStatus: (itemId: string, status: string) =>
    api.put(`/vendor/orders/${itemId}/status`, { status }),

  // Admin
  adminGetAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PaginatedResponse<Order>>>("/admin/orders", { params }),

  adminUpdateStatus: (id: string, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
};

// Maps frontend delivery slot IDs → backend deliveryType enum values
export const SLOT_TO_DELIVERY_TYPE: Record<string, string> = {
  express:   "EXPRESS",
  same_day:  "SAME_DAY",
  next_day:  "NEXT_DAY",
  standard:  "STANDARD",
};
