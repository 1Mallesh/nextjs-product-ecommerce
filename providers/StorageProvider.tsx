"use client";

import { useEffect, ReactNode } from "react";
import { useAppDispatch } from "@/store/hooks";
import { hydrateCart } from "@/store/slices/cartSlice";
import { hydrateWishlist } from "@/store/slices/wishlistSlice";

/**
 * Runs once on the client after hydration to restore cart + wishlist
 * from localStorage. Keeping this separate prevents SSR/client mismatch.
 */
export default function StorageProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateCart());
    dispatch(hydrateWishlist());
  }, [dispatch]);

  return <>{children}</>;
}
