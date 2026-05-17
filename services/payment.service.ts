import api from "./axios";
import type { ApiResponse, RazorpayOrder, RazorpayPaymentResponse } from "@/types";

export const paymentService = {
  // API only needs orderId — amount is derived server-side
  createOrder: (orderId: string) =>
    api.post<ApiResponse<RazorpayOrder>>("/payments/create-order", { orderId }),

  verify: (payload: RazorpayPaymentResponse) =>
    api.post<ApiResponse<{ success: boolean }>>("/payments/verify", payload),

  getStatus: (orderId: string) =>
    api.get<ApiResponse<{ status: string; method: string }>>(`/payments/${orderId}/status`),

  refund: (orderId: string, amount?: number, reason?: string) =>
    api.post("/payments/refund", { orderId, amount, reason }),
};
