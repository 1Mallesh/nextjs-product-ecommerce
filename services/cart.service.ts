import api from "./axios";
import type { ApiResponse, Cart } from "@/types";

export const cartService = {
  get: () => api.get<ApiResponse<Cart>>("/cart"),

  addItem: (productId: string, quantity: number, variantId?: string) =>
    api.post<ApiResponse<Cart>>("/cart/add", { productId, quantity, variantId }),

  updateItem: (itemId: string, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),

  clear: () => api.delete<ApiResponse<void>>("/cart/clear"),
};
