"use client";

import { useEffect, ReactNode } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loadUser } from "@/store/slices/authSlice";
import { getToken } from "@/services/axios";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = getToken();
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return <>{children}</>;
}
