import api from "./axios";
import type { ApiResponse, Category } from "@/types";

export const categoryService = {
  getAll: () => api.get<ApiResponse<Category[]>>("/categories"),
  getTree: () => api.get<ApiResponse<Category[]>>("/categories/tree"),
  getById: (id: string) => api.get<ApiResponse<Category>>(`/categories/${id}`),
  getBySlug: (slug: string) => api.get<ApiResponse<Category>>(`/categories/slug/${slug}`),

  // Admin
  create: (data: Partial<Category>) => api.post<ApiResponse<Category>>("/admin/categories", data),
  update: (id: string, data: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data),
  delete: (id: string) => api.delete(`/admin/categories/${id}`),
};
