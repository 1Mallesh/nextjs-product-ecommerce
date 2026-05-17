"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

/**
 * Redirects logged-in non-customer users away from the customer store root.
 * Used in the store layout so that if a VENDOR/ADMIN visits "/", they get
 * bounced to their dashboard automatically.
 */
export function useRoleRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Only redirect from the store root, not deep store pages
    if (pathname !== "/") return;

    const destMap: Record<string, string> = {
      ADMIN: "/dashboard/admin",
      VENDOR: "/dashboard/vendor",
      DELIVERY_BOY: "/dashboard/delivery",
    };

    const dest = destMap[user.role];
    if (dest) router.replace(dest);
  }, [isAuthenticated, user, pathname, router]);
}
