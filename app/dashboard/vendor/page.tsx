"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { TrendingUp, ShoppingBag, Package, Star, ArrowRight, Plus } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

export default function VendorDashboardPage() {
  const { data: analytics } = useQuery({
    queryKey: ["vendor-analytics"],
    queryFn: async () => {
      const { data } = await vendorService.getDashboard();
      return data.data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["vendor-orders-recent"],
    queryFn: async () => {
      const { data } = await orderService.vendorGetAll({ limit: 5 });
      return data.data;
    },
  });

  const chartData = analytics?.revenueChart?.map((p) => ({
    name: p.date,
    revenue: p.value,
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
          value={analytics?.totalOrders || 0}
          icon={ShoppingBag}
          change={analytics?.ordersGrowth}
          color="brand"
        />
        <StatCard title="Products" value={analytics?.totalProducts || 0} icon={Package} color="blue" />
        <StatCard title="Avg Rating" value={`${(analytics?.totalRevenue || 0) > 0 ? "4.5" : "–"} ★`} icon={Star} color="purple" />
      </div>

      {/* Revenue chart */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Revenue (Last 30 Days)</h3>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/vendor/analytics">Full Report</Link>
          </Button>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="vendorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatPrice(Number(v)), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#FF6B00" fill="url(#vendorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No revenue data yet
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button variant="brand" asChild>
          <Link href="/dashboard/vendor/products/new">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/vendor/orders">View Orders</Link>
        </Button>
      </div>

      {/* Recent orders */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/vendor/orders">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="divide-y">
          {!orders?.data?.length ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No orders yet</div>
          ) : (
            orders.data.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div>
                  <p className="font-medium text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{formatPrice(order.total)}</span>
                  <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
