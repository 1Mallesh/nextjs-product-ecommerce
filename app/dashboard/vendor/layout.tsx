"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  Wallet, Bell, Store, Layers, Tag,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/vendor" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/vendor/analytics" },
  { icon: ShoppingBag, label: "Orders", href: "/dashboard/vendor/orders" },
  { icon: Package, label: "Products", href: "/dashboard/vendor/products" },
  { icon: Layers, label: "Stock", href: "/dashboard/vendor/stock" },
  { icon: Tag, label: "Offers", href: "/dashboard/vendor/offers" },
  { icon: Wallet, label: "Earnings", href: "/dashboard/vendor/earnings" },
  { icon: Bell, label: "Notifications", href: "/dashboard/vendor/notifications" },
  { icon: Store, label: "My Store", href: "/dashboard/vendor/store" },
];

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["VENDOR"]}>
      <DashboardLayout navItems={NAV_ITEMS} title="Vendor Dashboard">
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
