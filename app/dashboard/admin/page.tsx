"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  TrendingUp, ShoppingBag, Users, Store, Package,
  ArrowRight, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/providers/SocketProvider";
import toast from "react-hot-toast";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { adminService } from "@/services/admin.service";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const refresh = (event: string) => (data: { name?: string; shopName?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (event === "product:pending") {
        toast(`New product pending approval: ${data?.name ?? "Product"}`, { icon: "📦" });
      } else if (event === "vendor:new") {
        toast(`New vendor application: ${data?.shopName ?? "Vendor"}`, { icon: "🏪" });
      } else if (event === "order:new") {
        toast("New order received!", { icon: "🛒" });
      }
    };

    socket.on("product:pending", refresh("product:pending"));
    socket.on("vendor:new", refresh("vendor:new"));
    socket.on("order:new", refresh("order:new"));
    socket.on("notification", () => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    });

    return () => {
      socket.off("product:pending");
      socket.off("vendor:new");
      socket.off("order:new");
      socket.off("notification");
    };
  }, [socket, queryClient]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await adminService.getAnalytics();
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const chartData = analytics?.revenueChart?.map((p) => ({
    name: p.date,
    revenue: p.value,
    orders: analytics?.ordersChart?.find((o) => o.date === p.date)?.value || 0,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(analytics?.totalRevenue || 0)}
          icon={TrendingUp}
          change={analytics?.revenueGrowth}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={(analytics?.totalOrders || 0).toLocaleString("en-IN")}
          icon={ShoppingBag}
          change={analytics?.ordersGrowth}
          color="brand"
        />
        <StatCard
          title="Total Users"
          value={(analytics?.totalUsers || 0).toLocaleString("en-IN")}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={(analytics?.totalProducts || 0).toLocaleString("en-IN")}
          icon={Package}
          color="purple"
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Revenue Overview (Last 30 Days)</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatPrice(Number(v)), "Revenue"]} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#FF6B00"
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            No data available yet
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/orders">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics?.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.customer?.name}</td>
                  <td className="px-4 py-3">{order.items?.length}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} className="text-[10px]">
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!analytics?.recentOrders?.length && (
            <div className="text-center py-12 text-muted-foreground text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CheckCircle2, label: "Pending Vendor Approvals", href: "/dashboard/admin/vendors", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
          { icon: Package, label: "Pending Product Approvals", href: "/dashboard/admin/products", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { icon: XCircle, label: "Refund Requests", href: "/dashboard/admin/refunds", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
        ].map((action) => (
          <Link key={action.href} href={action.href}
            className={`${action.bg} rounded-xl p-4 flex items-center gap-3 hover:opacity-80 transition-opacity border`}>
            <action.icon className={`h-5 w-5 ${action.color}`} />
            <span className="text-sm font-medium">{action.label}</span>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
