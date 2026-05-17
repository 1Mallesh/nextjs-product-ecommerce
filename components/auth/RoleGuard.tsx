"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side role guard — second layer after Next.js middleware.
 * Middleware covers SSR/navigation, this covers hydrated client state.
 */
export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }
    if (!allowedRoles.includes(user.role as UserRole)) {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, user, isLoading, router, allowedRoles]);

  if (isLoading || !isAuthenticated || !user) {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
