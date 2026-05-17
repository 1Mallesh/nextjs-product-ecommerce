"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowRight, CheckCircle2, XCircle, Clock,
  DollarSign, Percent, Store, Bike, RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useSocket } from "@/providers/SocketProvider";
import toast from "react-hot-toast";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { adminService } from "@/services/admin.service";
import { useFinancialAnalytics, COMMISSION_RATE, GST_RATE } from "@/hooks/useFinancialAnalytics";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

export default function AdminDashboardPage() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    const refresh = (event: string) => (data: { name?: string; shopName?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["admin-financial"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (event === "product.pending") {
        toast(`New product pending approval: ${data?.name ?? "Product"}`, { icon: "📦" });
      } else if (event === "payment.success") {
        toast("Payment received — analytics updated", { icon: "💰" });
      } else if (event === "order.created") {
        toast("New order placed!", { icon: "🛍️" });
      } else if (event === "notification") {
        toast(`${data?.shopName ?? data?.name ?? "New activity"}`, { icon: "🔔" });
      }
    };

    const events = ["product.pending", "order.created", "payment.success",
      "order.delivered", "refund.created", "order-status-update", "notification"];
    events.forEach((ev) => socket.on(ev, refresh(ev)));
    return () => { events.forEach((ev) => socket.off(ev)); };
  }, [socket, queryClient]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await adminService.getAnalytics();
      return data.data;
    },
    staleTime: 0,
  });

  const { summary, chart: financialChart } = useFinancialAnalytics("month");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const chartData = (financialChart.length > 0 ? financialChart : []).map((p) => ({
    name: p.date,
    revenue: p.revenue,
    profit: p.profit,
    commission: p.commission,
  }));

  const fallbackChartData = analytics?.revenueChart?.map((p) => ({
    name: p.date,
    revenue: p.value,
    profit: Math.round(p.value * COMMISSION_RATE * 0.5),
    commission: Math.round(p.value * COMMISSION_RATE),
  })) ?? [];

  const displayChart = chartData.length > 0 ? chartData : fallbackChartData;

  return (
    <div className="space-y-6">
      {/* ── Core Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(summary?.totalRevenue ?? analytics?.totalRevenue ?? 0)}
          icon={TrendingUp}
          change={summary?.revenueGrowth ?? analytics?.revenueGrowth}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={(summary?.totalOrders ?? analytics?.totalOrders ?? 0).toLocaleString("en-IN")}
          icon={ShoppingBag}
          change={summary?.ordersGrowth ?? analytics?.ordersGrowth}
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

      {/* ── Financial Summary ── */}
      {summary && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financial Summary (This Month)</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-brand" />
                <p className="text-xs text-muted-foreground">Net Platform Profit</p>
              </div>
              <p className="text-xl font-bold text-brand">{formatPrice(summary.netPlatformProfit)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{COMMISSION_RATE * 100}% commission model</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-muted-foreground">GST Collected</p>
              </div>
              <p className="text-xl font-bold">{formatPrice(summary.totalGST)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">CGST {formatPrice(summary.cgst)} + SGST {formatPrice(summary.sgst)}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="h-4 w-4 text-indigo-600" />
                <p className="text-xs text-muted-foreground">Vendor Earnings</p>
              </div>
              <p className="text-xl font-bold">{formatPrice(summary.vendorEarnings)}</p>
              <p className="text-xs text-red-500 mt-0.5">Pending: {formatPrice(summary.vendorPayoutPending)}</p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bike className="h-4 w-4 text-teal-600" />
                <p className="text-xs text-muted-foreground">Delivery Earnings</p>
              </div>
              <p className="text-xl font-bold">{formatPrice(summary.deliveryEarnings)}</p>
              <p className="text-xs text-red-500 mt-0.5">Pending: {formatPrice(summary.deliveryPayoutPending)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Revenue chart ── */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Revenue & Profit (Last 30 Days)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Total revenue vs net platform profit</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/analytics">Full Analytics</Link>
          </Button>
        </div>
        {displayChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={displayChart}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, name) => [formatPrice(Number(v)), name]} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#FF6B00" fill="url(#colorRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10B981" fill="url(#colorProfit)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            No data available yet
          </div>
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/orders">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Order", "Customer", "Total", "Commission", "Vendor Gets", "Payment", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics?.recentOrders?.map((order) => {
                const commission = Math.round((order.subtotal ?? order.total) * COMMISSION_RATE);
                const vendorGets = (order.subtotal ?? order.total) - commission;
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.customer?.name}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-purple-600 text-xs">{formatPrice(commission)}</td>
                    <td className="px-4 py-3 text-blue-600 text-xs">{formatPrice(vendorGets)}</td>
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
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!analytics?.recentOrders?.length && (
            <div className="text-center py-12 text-muted-foreground text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: CheckCircle2, label: "Pending Vendor Approvals", href: "/dashboard/admin/vendors", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
          { icon: Package, label: "Pending Product Approvals", href: "/dashboard/admin/products", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { icon: RefreshCcw, label: "Refund Requests", href: "/dashboard/admin/refunds", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
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
