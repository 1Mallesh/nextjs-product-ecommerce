import api from "./axios";
import type { ApiResponse, Category } from "@/types";

export const categoryService = {
  // Public — only active categories
  getAll: () => api.get<ApiResponse<Category[]>>("/categories"),
  getTree: () => api.get<ApiResponse<Category[]>>("/categories/tree"),
  getById: (id: string) => api.get<ApiResponse<Category>>(`/categories/${id}`),
  getBySlug: (slug: string) => api.get<ApiResponse<Category>>(`/categories/slug/${slug}`),

  // Admin — all categories (active + pending)
  getAllForAdmin: () => api.get<ApiResponse<Category[]>>("/categories/all"),

  // Admin & Vendor — create (vendor → pending, admin → active immediately)
  create: (data: { name: string; description?: string; image?: string; parentId?: string }) =>
    api.post<ApiResponse<Category>>("/categories", data),

  // Admin only
  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),

  // Admin — approve or reject a vendor-submitted category
  approve: (id: string) =>
    api.patch(`/admin/categories/${id}/approve`, { isActive: true }),
  reject: (id: string) =>
    api.patch(`/admin/categories/${id}/approve`, { isActive: false }),
};
