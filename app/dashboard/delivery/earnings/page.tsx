"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Wallet, Truck, Star, RefreshCw, MapPin, CheckCircle2, Clock } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { useSocket } from "@/providers/SocketProvider";
import { DELIVERY_BOY_SHARE } from "@/hooks/useFinancialAnalytics";

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  PICKED_UP: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-red-100 text-red-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
};

export default function DeliveryEarningsPage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["delivery-profile"] });
    queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
  };

  useEffect(() => {
    if (!socket) return;
    const events = ["order.delivered", "delivery.status.updated", "delivery.payout.credited"];
    events.forEach((ev) => socket.on(ev, invalidate));
    return () => { events.forEach((ev) => socket.off(ev, invalidate)); };
  }, [socket, queryClient]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["delivery-profile"],
    queryFn: async () => {
      const { data } = await deliveryService.getProfile();
      return data.data as any;
    },
    staleTime: 0,
    refetchInterval: 60_000,
  });

  const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
    queryKey: ["delivery-assigned"],
    queryFn: async () => {
      const { data } = await deliveryService.getAssigned();
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : payload?.items ?? payload?.data ?? []) as any[];
    },
    staleTime: 0,
    refetchInterval: 60_000,
  });

  const isLoading = profileLoading || deliveriesLoading;

  const totalEarnings = profile?.earnings ?? profile?.totalEarnings ?? 0;
  const totalDeliveries = profile?.totalDeliveries ?? profile?.deliveryCount ?? 0;
  const avgRating = profile?.rating ?? profile?.averageRating ?? 0;
  const pendingPayout = profile?.pendingPayout ?? profile?.walletBalance ?? 0;

  // Compute per-delivery earnings from orders
  const deliveryRows = (deliveries ?? []).map((d: any) => {
    const deliveryFee = d.deliveryFee ?? d.shippingFee ?? 0;
    const myShare = Math.round(deliveryFee * DELIVERY_BOY_SHARE);
    return {
      id: d.id,
      orderNumber: d.orderNumber,
      createdAt: d.createdAt ?? d.updatedAt,
      status: d.deliveryStatus ?? d.status,
      deliveryFee,
      myShare,
      address: d.address,
    };
  });

  const totalFromDeliveries = deliveryRows
    .filter((r) => r.status === "DELIVERED")
    .reduce((sum: number, r) => sum + r.myShare, 0);

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
          title="Total Earnings"
          value={formatPrice(totalEarnings)}
          icon={Wallet}
          color="green"
        />
        <StatCard
          title="Pending Payout"
          value={formatPrice(pendingPayout)}
          icon={Clock}
          color="brand"
        />
        <StatCard
          title="Total Deliveries"
          value={totalDeliveries}
          icon={Truck}
          color="brand"
        />
        <StatCard
          title="Avg Rating"
          value={avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "–"}
          icon={Star}
          color="purple"
        />
      </div>

      {/* How earnings are calculated */}
      <div className="bg-muted/40 border rounded-xl p-4 text-sm grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Your Share</p>
          <p className="text-2xl font-bold text-brand">60%</p>
          <p className="text-xs text-muted-foreground">of delivery fee</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Delivered Orders</p>
          <p className="text-2xl font-bold">
            {deliveryRows.filter((r) => r.status === "DELIVERED").length}
          </p>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Earned (this view)</p>
          <p className="text-2xl font-bold text-green-600">{formatPrice(totalFromDeliveries)}</p>
          <p className="text-xs text-muted-foreground">from deliveries shown</p>
        </div>
      </div>

      {/* Delivery History Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <p className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery History
          </p>
          <span className="text-xs text-muted-foreground">{deliveryRows.length} deliveries</span>
        </div>

        {deliveryRows.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No deliveries yet</p>
            <p className="text-sm mt-1">Your delivery earnings will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Deliver To</th>
                  <th className="px-4 py-3 text-right">Delivery Fee</th>
                  <th className="px-4 py-3 text-right">Your Share (60%)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {deliveryRows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">#{r.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate">
                      {r.address?.city ?? r.address?.addressLine1 ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">{formatPrice(r.deliveryFee)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${r.status === "DELIVERED" ? "text-green-600" : "text-muted-foreground"}`}>
                      {r.status === "DELIVERED" ? formatPrice(r.myShare) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? "bg-muted text-muted-foreground"}`}>
                        {r.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-muted/30">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-semibold text-sm">Total (Delivered)</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatPrice(totalFromDeliveries)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Payout info */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
        <p className="font-semibold text-green-800 mb-1 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Payout Schedule
        </p>
        <p className="text-green-700">
          You receive 60% of the delivery fee for each completed order. Payouts are processed every
          Monday directly to your registered bank account. Minimum payout threshold: ₹100.
        </p>
      </div>
    </div>
  );
}
