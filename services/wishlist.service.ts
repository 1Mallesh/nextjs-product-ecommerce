import api from "./axios";
import type { ApiResponse, Product } from "@/types";

export const wishlistService = {
  get: () => api.get<ApiResponse<{ items: { product: Product }[] }>>("/wishlist"),

  toggle: (productId: string) =>
    api.post<ApiResponse<{ wishlisted: boolean }>>(`/wishlist/${productId}/toggle`),

  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};
