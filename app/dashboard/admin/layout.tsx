"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard, Users, Store, Package, ShoppingBag,
  Grid3x3, BarChart3, RefreshCcw, FileText, Bell, Bike,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/admin/analytics" },
  { icon: ShoppingBag, label: "Orders", href: "/dashboard/admin/orders" },
  { icon: Package, label: "Products", href: "/dashboard/admin/products" },
  { icon: BarChart3, label: "Revenue", href: "/dashboard/admin/analytics" },
  { icon: Grid3x3, label: "Categories", href: "/dashboard/admin/categories" },
  { icon: Users, label: "Users", href: "/dashboard/admin/users" },
  { icon: Store, label: "Vendors", href: "/dashboard/admin/vendors" },
  { icon: Bike, label: "Delivery Boys", href: "/dashboard/admin/delivery" },
  { icon: RefreshCcw, label: "Refunds", href: "/dashboard/admin/refunds" },
  { icon: FileText, label: "Reports", href: "/dashboard/admin/reports" },
  { icon: Bell, label: "Notifications", href: "/dashboard/admin/notifications" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Admin Dashboard">
      {children}
    </DashboardLayout>
  );
}
