"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";
import { adminService } from "@/services/admin.service";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics-full"],
    queryFn: async () => {
      const { data } = await adminService.getAnalytics();
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const revenueData = analytics?.revenueChart?.map((p) => ({ name: p.date, revenue: p.value })) ?? [];
  const ordersData = analytics?.ordersChart?.map((p) => ({ name: p.date, orders: p.value })) ?? [];

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
          value={(analytics?.totalOrders ?? 0).toLocaleString("en-IN")}
          icon={ShoppingBag}
          change={analytics?.ordersGrowth}
          color="brand"
        />
        <StatCard
          title="Total Users"
          value={(analytics?.totalUsers ?? 0).toLocaleString("en-IN")}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={(analytics?.totalProducts ?? 0).toLocaleString("en-IN")}
          icon={Package}
          color="purple"
        />
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Revenue (Last 30 Days)</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatPrice(Number(v)), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#FF6B00" fill="url(#adminRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
        )}
      </div>

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
          <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
        )}
      </div>
    </div>
  );
}
