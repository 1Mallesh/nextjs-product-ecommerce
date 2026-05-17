"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LayoutDashboard, Package, History, Wallet, MapPin } from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/delivery" },
  { icon: Package, label: "Assigned Orders", href: "/dashboard/delivery/orders" },
  { icon: History, label: "Delivery History", href: "/dashboard/delivery/history" },
  { icon: Wallet, label: "Earnings", href: "/dashboard/delivery/earnings" },
  { icon: MapPin, label: "Live Tracking", href: "/dashboard/delivery/tracking" },
];

export default function DeliveryDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Delivery Dashboard">
      {children}
    </DashboardLayout>
  );
}
