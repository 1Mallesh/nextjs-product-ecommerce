"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "@/providers/SocketProvider";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, Package, Star, DollarSign } from "lucide-react";
import { vendorService } from "@/services/vendor.service";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function VendorAnalyticsPage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-analytics-full"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-analytics"] });
    };
    socket.on("product.approved", refresh);
    socket.on("order-status-update", refresh);
    socket.on("notification", refresh);
    return () => {
      socket.off("product.approved", refresh);
      socket.off("order-status-update", refresh);
      socket.off("notification", refresh);
    };
  }, [socket, queryClient]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["vendor-analytics-full"],
    queryFn: async () => {
      const { data } = await vendorService.getDashboard();
      return data.data as any;
    },
    staleTime: 0,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const revenueData = analytics?.revenueChart?.map((p: { date: string; value: number }) => ({
    name: p.date,
    revenue: p.value,
  })) ?? [];

  const ordersData = analytics?.ordersChart?.map((p: { date: string; value: number }) => ({
    name: p.date,
    orders: p.value,
  })) ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(analytics?.totalRevenue ?? 0)}
          icon={TrendingUp}
          change={analytics?.revenueGrowth}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={analytics?.totalOrders ?? 0}
          icon={ShoppingBag}
          change={analytics?.ordersGrowth}
          color="brand"
        />
        <StatCard title="Total Products" value={analytics?.totalProducts ?? 0} icon={Package} color="blue" />
        <StatCard title="Avg Rating" value={analytics?.avgRating ? `${analytics.avgRating.toFixed(1)} ★` : "–"} icon={Star} color="purple" />
      </div>

      {/* Revenue chart */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Revenue (Last 30 Days)</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatPrice(Number(v)), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#FF6B00" fill="url(#revenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
            No revenue data yet
          </div>
        )}
      </div>

      {/* Orders chart */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Orders (Last 30 Days)</h3>
        {ordersData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#FF6B00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
            No orders data yet
          </div>
        )}
      </div>

      {/* Top products */}
      {analytics?.topProducts && analytics.topProducts.length > 0 && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Top Products</h3>
          </div>
          <div className="divide-y">
            {analytics.topProducts.map((product: any) => (
              <div key={product.id} className="p-4 flex items-center justify-between">
                <p className="font-medium text-sm">{product.name}</p>
                <p className="font-bold text-sm">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
