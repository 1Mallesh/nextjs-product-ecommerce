import api from "./axios";
import type { ApiResponse, PaginatedResponse, Review } from "@/types";

export const reviewService = {
  getForProduct: (productId: string, params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Review>>>(`/reviews/product/${productId}`, { params }),

  create: (productId: string, data: { rating: number; comment: string }) =>
    api.post<ApiResponse<Review>>("/reviews", { productId, ...data }),

  delete: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
};
