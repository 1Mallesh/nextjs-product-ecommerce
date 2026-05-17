import api from "./axios";
import type { ApiResponse, PaginatedResponse, Product, ProductFilter } from "@/types";

export const productService = {
  // Public
  getAll: (filters?: ProductFilter) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/products", { params: filters }),

  getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),

  getFeatured: () => api.get<ApiResponse<any>>("/products/featured"),

  getBelow50: () =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/products", {
      params: { maxPrice: 50, limit: 20 },
    }),

  getRelated: (productId: string) =>
    api.get<ApiResponse<Product[]>>(`/products/${productId}/related`),

  // Vendor product management
  create: (data: any) =>
    api.post<ApiResponse<Product>>("/products", data),

  update: (id: string, data: any) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),

  addVariant: (productId: string, data: {
    name: string;
    value: string;
    price: number;
    stock: number;
    sku: string;
  }) => api.post(`/products/${productId}/variants`, data),

  getVendorProducts: (params?: ProductFilter) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/products/vendor/my-products", { params }),

  // Admin — single approve endpoint with { approved: true/false, reason }
  adminGetAll: (params?: ProductFilter) =>
    api.get<ApiResponse<PaginatedResponse<Product>>>("/admin/products", { params }),

  adminApprove: (id: string) =>
    api.patch(`/admin/products/${id}/approve`, { approvalStatus: 'APPROVED' }),

  adminReject: (id: string, reason: string) =>
    api.patch(`/admin/products/${id}/approve`, { approvalStatus: 'REJECTED', rejectionReason: reason }),
};
