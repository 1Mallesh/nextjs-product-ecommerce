import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const hasRole = (role: UserRole) => user?.role === role;
  const isAdmin = user?.role === "ADMIN";
  const isVendor = user?.role === "VENDOR";
  const isCustomer = user?.role === "CUSTOMER";
  const isDelivery = user?.role === "DELIVERY_BOY";

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogout,
    hasRole,
    isAdmin,
    isVendor,
    isCustomer,
    isDelivery,
  };
}
