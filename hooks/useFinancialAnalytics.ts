"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { adminService } from "@/services/admin.service";
import type { DateRange, FinancialAnalyticsResponse, FinancialSummary, OrderFinancialBreakdown } from "@/types";

// Commission / tax constants (must match backend config)
export const COMMISSION_RATE = 0.10;   // 10%
export const GST_RATE = 0.18;          // 18%
export const DELIVERY_BOY_SHARE = 0.60; // 60% of delivery fee
export const RAZORPAY_RATE = 0.02;     // 2% of order total

/** Derive a FinancialSummary from raw analytics payload when backend doesn't provide it */
export function deriveFinancialSummary(payload: any): FinancialSummary {
  const totalRevenue = payload?.totalRevenue ?? 0;
  const totalOrders = payload?.totalOrders ?? 0;
  const deliveryRevenue = payload?.deliveryRevenue ?? 0;
  const productRevenue = totalRevenue - deliveryRevenue;

  const totalGST = payload?.totalGST ?? Math.round(productRevenue * GST_RATE);
  const platformCommission = payload?.platformCommission ?? Math.round(productRevenue * COMMISSION_RATE);
  const vendorEarnings = payload?.vendorEarnings ?? Math.round(productRevenue - platformCommission);
  const deliveryEarnings = payload?.deliveryEarnings ?? Math.round(deliveryRevenue * DELIVERY_BOY_SHARE);
  const razorpayCharges = payload?.razorpayCharges ?? Math.round(totalRevenue * RAZORPAY_RATE);
  const netPlatformProfit = payload?.netPlatformProfit ??
    Math.round(platformCommission - deliveryEarnings - razorpayCharges);

  return {
    totalRevenue,
    productRevenue,
    deliveryRevenue,
    totalGST,
    cgst: Math.round(totalGST / 2),
    sgst: Math.round(totalGST / 2),
    platformCommission,
    razorpayCharges,
    netPlatformProfit,
    vendorEarnings,
    deliveryEarnings,
    vendorPayoutPending: payload?.vendorPayoutPending ?? 0,
    deliveryPayoutPending: payload?.deliveryPayoutPending ?? 0,
    totalOrders,
    pendingOrders: payload?.pendingOrders ?? 0,
    deliveredOrders: payload?.deliveredOrders ?? 0,
    cancelledOrders: payload?.cancelledOrders ?? 0,
    refundAmount: payload?.refundAmount ?? 0,
    refundCount: payload?.refundCount ?? 0,
    vendorWalletBalance: payload?.vendorWalletBalance ?? vendorEarnings,
    deliveryWalletBalance: payload?.deliveryWalletBalance ?? deliveryEarnings,
    revenueGrowth: payload?.revenueGrowth,
    ordersGrowth: payload?.ordersGrowth,
  };
}

/** Compute per-order financial breakdown from an order object */
export function computeOrderBreakdown(order: any): OrderFinancialBreakdown {
  const productAmount = order.subtotal ?? order.total ?? 0;
  const gstAmount = Math.round(productAmount * GST_RATE);
  const deliveryCharge = order.deliveryFee ?? 0;
  const platformCommission = Math.round(productAmount * COMMISSION_RATE);
  const vendorEarnings = productAmount - platformCommission;
  const deliveryBoyEarnings = Math.round(deliveryCharge * DELIVERY_BOY_SHARE);
  const razorpayFee = order.paymentMethod === "RAZORPAY"
    ? Math.round((productAmount + deliveryCharge) * RAZORPAY_RATE)
    : 0;
  const netPlatformProfit = platformCommission - deliveryBoyEarnings - razorpayFee;

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: order.customer?.name ?? "—",
    productAmount,
    gstAmount,
    gstRate: GST_RATE * 100,
    deliveryCharge,
    platformCommission,
    commissionRate: COMMISSION_RATE * 100,
    vendorEarnings,
    deliveryBoyEarnings,
    razorpayFee,
    netPlatformProfit,
    paymentMethod: order.paymentMethod ?? "—",
    paymentStatus: order.paymentStatus ?? "—",
    orderStatus: order.status ?? "—",
  };
}

export function useFinancialAnalytics(range: DateRange = "month") {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-financial"] });
    queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  };

  useEffect(() => {
    if (!socket) return;
    const events = ["order.created", "payment.success", "order.delivered", "refund.created",
      "vendor.payout.updated", "order-status-update", "notification"];
    events.forEach((ev) => socket.on(ev, invalidate));
    return () => { events.forEach((ev) => socket.off(ev, invalidate)); };
  }, [socket, queryClient]);

  const { data: raw, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["admin-financial", range],
    queryFn: async () => {
      try {
        const { data } = await adminService.getFinancialAnalytics({ range });
        const payload = (data?.data as any) ?? {};
        // Backend may return summary nested or flat
        const summaryRaw = payload?.summary ?? payload;
        return {
          summary: deriveFinancialSummary(summaryRaw),
          chart: (payload?.chart ?? payload?.revenueChart?.map((p: any) => ({
            date: p.date,
            revenue: p.value,
            commission: Math.round(p.value * COMMISSION_RATE),
            gst: Math.round(p.value * GST_RATE),
            profit: Math.round(p.value * COMMISSION_RATE * 0.5),
            orders: 0,
          })) ?? []) as FinancialAnalyticsResponse["chart"],
          topVendors: payload?.topVendors ?? [],
          recentBreakdowns: (payload?.recentOrders ?? payload?.recentBreakdowns ?? [])
            .map((o: any) => o.orderId ? o : computeOrderBreakdown(o)),
          gstByMonth: payload?.gstByMonth ?? [],
          paymentMethodBreakdown: payload?.paymentMethodBreakdown ?? [],
        } as FinancialAnalyticsResponse;
      } catch {
        // Fallback: derive from base analytics
        const { data } = await adminService.getAnalytics();
        const payload = data?.data as any;
        return {
          summary: deriveFinancialSummary(payload),
          chart: (payload?.revenueChart ?? []).map((p: any) => ({
            date: p.date,
            revenue: p.value,
            commission: Math.round(p.value * COMMISSION_RATE),
            gst: Math.round(p.value * GST_RATE),
            profit: Math.round(p.value * COMMISSION_RATE * 0.5),
            orders: payload?.ordersChart?.find((o: any) => o.date === p.date)?.value ?? 0,
          })),
          topVendors: [],
          recentBreakdowns: (payload?.recentOrders ?? []).map(computeOrderBreakdown),
          gstByMonth: [],
          paymentMethodBreakdown: [],
        } as FinancialAnalyticsResponse;
      }
    },
    staleTime: 0,
    refetchInterval: 30_000, // auto-refresh every 30s
  });

  return {
    summary: raw?.summary,
    chart: raw?.chart ?? [],
    topVendors: raw?.topVendors ?? [],
    recentBreakdowns: raw?.recentBreakdowns ?? [],
    gstByMonth: raw?.gstByMonth ?? [],
    paymentMethodBreakdown: raw?.paymentMethodBreakdown ?? [],
    isLoading,
    isError,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    invalidate,
  };
}
