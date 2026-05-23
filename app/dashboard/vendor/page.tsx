"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Link from "next/link";
import { useSocket } from "@/providers/SocketProvider";
import { TrendingUp, ShoppingBag, Package, Star, ArrowRight, Plus, Clock, XCircle, CheckCircle2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

function VendorPendingBanner({ status }: { status: string }) {
  if (status === "APPROVED") return null;

  const config = {
    PENDING: {
      icon: <Clock className="h-8 w-8 text-yellow-500" />,
      title: "Application Under Review",
      desc: "Your vendor application has been submitted and is being reviewed by our team. This usually takes 24 hours.",
      color: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
      badge: "bg-yellow-100 text-yellow-800",
    },
    REJECTED: {
      icon: <XCircle className="h-8 w-8 text-red-500" />,
      title: "Application Rejected",
      desc: "Unfortunately your application was not approved. Please review the requirements and resubmit.",
      color: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
      badge: "bg-red-100 text-red-800",
    },
    SUSPENDED: {
      icon: <XCircle className="h-8 w-8 text-orange-500" />,
      title: "Account Suspended",
      desc: "Your vendor account has been suspended. Please contact support.",
      color: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
      badge: "bg-orange-100 text-orange-800",
    },
  }[status] ?? {
    icon: <Clock className="h-8 w-8 text-muted-foreground" />,
    title: "Onboarding Incomplete",
    desc: "Please complete your vendor onboarding to start selling.",
    color: "bg-muted border-border",
    badge: "bg-muted text-muted-foreground",
  };

  return (
    <div className={`rounded-2xl border p-8 text-center ${config.color}`}>
      <div className="flex justify-center mb-4">{config.icon}</div>
      <h2 className="text-xl font-bold mb-2">{config.title}</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{config.desc}</p>
      {(status === "PENDING" || status === "REJECTED") && (
        <Button variant="brand" asChild>
          <Link href="/vendor/onboarding">
            {status === "REJECTED" ? "Resubmit Application" : "View Application"}
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function VendorDashboardPage() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    const onProductApproved = (data: { name?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-analytics"] });
      toast.success(`Product approved: "${data?.name ?? "Product"}" is now live!`);
    };
    const onVendorApproved = () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
      toast.success("Your vendor account has been approved! You can now sell.");
    };
    socket.on("product.approved", onProductApproved);
    socket.on("notification", onVendorApproved);
    return () => {
      socket.off("product.approved", onProductApproved);
      socket.off("notification", onVendorApproved);
    };
  }, [socket, queryClient]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: async () => {
      const { data } = await vendorService.getProfile();
      return data.data;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["vendor-analytics"],
    queryFn: async () => {
      const { data } = await vendorService.getDashboard();
      return data.data;
    },
    enabled: profile?.status === "APPROVED",
  });

  const { data: orders } = useQuery({
    queryKey: ["vendor-orders-recent"],
    queryFn: async () => {
      const { data } = await orderService.vendorGetAll({ limit: 5 });
      // Backend: { success, data: { orders: [...], meta: {...} } }
      return data.data as any;
    },
    enabled: profile?.status === "APPROVED",
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show approval status banner for non-approved vendors
  if (!profile || profile.status !== "APPROVED") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome, {profile?.shopName || "Vendor"}
          </p>
        </div>
        <VendorPendingBanner status={profile?.status ?? "PENDING"} />
      </div>
    );
  }

  const chartData = analytics?.revenueChart?.map((p: { date: string; value: number }) => ({
    name: p.date,
    revenue: p.value,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Approved badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.shopName}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Vendor Dashboard</p>
        </div>
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
        </Badge>
      </div>

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
        <StatCard title="Avg Rating" value="4.5 ★" icon={Star} color="purple" />
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
      <div className="flex flex-wrap gap-3">
        <Button variant="brand" asChild className="flex-1 sm:flex-none">
          <Link href="/dashboard/vendor/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1 sm:flex-none">
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
          {!(orders?.orders ?? orders?.data)?.length ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No orders yet</div>
          ) : (
            (orders?.orders ?? orders?.data ?? []).map((order: any) => (
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
