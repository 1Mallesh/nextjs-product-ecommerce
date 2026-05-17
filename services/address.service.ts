import api from "./axios";
import type { Address, ApiResponse } from "@/types";
import type { AddressFormData } from "@/schemas/address.schema";

export const addressService = {
  getAll: () =>
    api.get<ApiResponse<Address[]>>("/users/addresses"),

  create: (data: AddressFormData) =>
    api.post<ApiResponse<Address>>("/users/addresses", data),

  update: (id: string, data: Partial<AddressFormData>) =>
    api.put<ApiResponse<Address>>(`/users/addresses/${id}`, data),

  setDefault: (id: string) =>
    api.patch<ApiResponse<Address>>(`/users/addresses/${id}/default`),

  delete: (id: string) =>
    api.delete(`/users/addresses/${id}`),
};
