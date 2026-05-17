import api from "./axios";
import type { ApiResponse, PaginatedResponse, Product, ProductFilter } from "@/types";

export const productService = {
  // Public
  getAll: (filters?: ProductFilter) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/products", { params: filters }),

  getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),

  getFeatured: () => api.get<ApiResponse<Product[]>>("/products/featured"),

  getBelow50: () =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/products", {
      params: { maxPrice: 50, limit: 20 },
    }),

  getRelated: (productId: string) =>
    api.get<ApiResponse<Product[]>>(`/products/${productId}/related`),

  // Vendor product management (correct API paths)
  create: (data: FormData) =>
    api.post<ApiResponse<Product>>("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/products/${id}`),

  addVariant: (productId: string, data: {
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributes?: Record<string, string>;
  }) => api.post(`/products/${productId}/variants`, data),

  getVendorProducts: (params?: ProductFilter) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/products/vendor/my-products", { params }),

  // Admin
  adminGetAll: (params?: ProductFilter) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/admin/products", { params }),

  adminApprove: (id: string) => api.patch(`/admin/products/${id}/approve`),

  adminReject: (id: string, reason: string) =>
    api.patch(`/admin/products/${id}/reject`, { reason }),
};
