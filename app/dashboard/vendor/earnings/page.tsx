"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Wallet, TrendingUp, ArrowDownCircle, Package, RefreshCw, BadgePercent, Clock } from "lucide-react";
import { vendorService } from "@/services/vendor.service";
import { orderService } from "@/services/order.service";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { useSocket } from "@/providers/SocketProvider";
import { COMMISSION_RATE, computeOrderBreakdown } from "@/hooks/useFinancialAnalytics";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

export default function VendorEarningsPage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["vendor-earnings"] });
    queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
  };

  useEffect(() => {
    if (!socket) return;
    const events = ["order.created", "payment.success", "order.delivered", "vendor.payout.updated"];
    events.forEach((ev) => socket.on(ev, invalidate));
    return () => { events.forEach((ev) => socket.off(ev, invalidate)); };
  }, [socket, queryClient]);

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["vendor-earnings"],
    queryFn: async () => {
      const { data } = await vendorService.getDashboard();
      return data.data as any;
    },
    staleTime: 0,
    refetchInterval: 60_000,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: async () => {
      const { data } = await orderService.vendorGetAll({ limit: 50 });
      const payload = data.data as any;
      return (payload?.items ?? payload?.orders ?? payload?.data ?? []) as any[];
    },
    staleTime: 0,
    refetchInterval: 60_000,
  });

  const isLoading = dashLoading || ordersLoading;

  const totalRevenue = dashboard?.totalRevenue ?? 0;
  const commissionDeducted = Math.round(totalRevenue * COMMISSION_RATE);
  const netEarnings = totalRevenue - commissionDeducted;
  const totalOrders = dashboard?.totalOrders ?? 0;
  const pendingPayout = dashboard?.vendorPayoutPending ?? dashboard?.pendingPayout ?? 0;

  const breakdowns = (ordersData ?? []).map((o: any) => computeOrderBreakdown(o));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Earnings & Payouts</h2>
        <button
          onClick={invalidate}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={formatPrice(totalRevenue)}
          icon={TrendingUp}
          color="green"
          change={dashboard?.revenueGrowth}
        />
        <StatCard
          title="Net Earnings"
          value={formatPrice(netEarnings)}
          icon={Wallet}
          color="brand"
        />
        <StatCard
          title="Platform Fee (10%)"
          value={formatPrice(commissionDeducted)}
          icon={BadgePercent}
          color="brand"
        />
        <StatCard
          title="Pending Payout"
          value={formatPrice(pendingPayout)}
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <p className="font-semibold flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Earnings Breakdown
          </p>
          <span className="text-xs text-muted-foreground">{breakdowns.length} orders</span>
        </div>

        {breakdowns.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Earnings will appear here once orders are placed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Order Total</th>
                  <th className="px-4 py-3 text-right">Commission (10%)</th>
                  <th className="px-4 py-3 text-right">Your Earnings</th>
                  <th className="px-4 py-3 text-center">Payment</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {breakdowns.map((b) => (
                  <tr key={b.orderId} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">#{b.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(b.productAmount)}</td>
                    <td className="px-4 py-3 text-right text-red-600">−{formatPrice(b.platformCommission)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatPrice(b.vendorEarnings)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS[b.paymentStatus] ?? "bg-muted text-muted-foreground"}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className="text-xs">{b.orderStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-muted/30">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-semibold text-sm">Total</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(totalRevenue)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">−{formatPrice(commissionDeducted)}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatPrice(netEarnings)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Payout Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <p className="font-semibold text-blue-800 mb-1">Payout Schedule</p>
        <p className="text-blue-700">Payouts are processed weekly every Monday. Platform deducts 10% commission on all delivered orders. GST is calculated at 18% on the commission amount.</p>
      </div>
    </div>
  );
}
