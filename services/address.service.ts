import api from "./axios";
import type { Address, ApiResponse } from "@/types";

export const addressService = {
  getAll: () => api.get<ApiResponse<Address[]>>("/users/addresses"),
  create: (data: Omit<Address, "id">) => api.post<ApiResponse<Address>>("/users/addresses", data),
  update: (id: string, data: Partial<Address>) =>
    api.put<ApiResponse<Address>>(`/users/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/users/addresses/${id}`),
};
