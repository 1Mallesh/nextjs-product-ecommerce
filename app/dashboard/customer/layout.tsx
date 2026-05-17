"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  LayoutDashboard, ShoppingBag, Heart, MapPin, Bell, User,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/customer" },
  { icon: ShoppingBag, label: "My Orders", href: "/dashboard/customer/orders" },
  { icon: Heart, label: "Wishlist", href: "/dashboard/customer/wishlist" },
  { icon: MapPin, label: "Addresses", href: "/dashboard/customer/addresses" },
  { icon: Bell, label: "Notifications", href: "/dashboard/customer/notifications" },
  { icon: User, label: "Profile", href: "/dashboard/customer/profile" },
];

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="My Account">
      {children}
    </DashboardLayout>
  );
}
