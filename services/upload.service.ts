import api from "./axios";
import type { ApiResponse } from "@/types";

export const uploadService = {
  single: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<{ url: string }>>("/upload/single", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  multiple: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return api.post<ApiResponse<{ urls: string[] }>>("/upload/multiple", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
