"use client";

import { useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { FileText, Download, TrendingUp, ShoppingBag, Users, Package, RefreshCw, AlertCircle } from "lucide-react";
import { useFinancialAnalytics, COMMISSION_RATE, GST_RATE } from "@/hooks/useFinancialAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import type { DateRange } from "@/types";

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "Today", value: "today" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

function exportCSV(breakdowns: any[]) {
  const headers = [
    "Order #", "Customer", "Date", "Product Amount", "GST", "Delivery Charge",
    "Platform Commission", "Vendor Earnings", "Delivery Boy Earnings",
    "Razorpay Fee", "Net Platform Profit", "Payment", "Status",
  ];
  const rows = breakdowns.map((r) => [
    `#${r.orderNumber}`, r.customerName, formatDate(r.createdAt),
    r.productAmount, r.gstAmount, r.deliveryCharge, r.platformCommission,
    r.vendorEarnings, r.deliveryBoyEarnings, r.razorpayFee,
    r.netPlatformProfit, r.paymentMethod, r.orderStatus,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(String).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tokomort-financial-report-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tokomort-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminReportsPage() {
  const [range, setRange] = useState<DateRange>("month");
  const {
    summary, chart, recentBreakdowns, topVendors, gstByMonth,
    isLoading, isError, lastUpdated, invalidate,
  } = useFinancialAnalytics(range);

  const handleCSV = useCallback(() => exportCSV(recentBreakdowns), [recentBreakdowns]);
  const handleJSON = useCallback(() => exportJSON({ summary, chart, topVendors, recentBreakdowns }), [summary, chart, topVendors, recentBreakdowns]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Reports</h2>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-0.5">Updated {lastUpdated.toLocaleTimeString("en-IN")}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  range === r.value ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={invalidate} className="h-8">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCSV} className="h-8 gap-1.5">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleJSON} className="h-8 gap-1.5">
            <Download className="h-3.5 w-3.5" /> JSON
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-40 text-destructive" />
          <p className="text-destructive font-medium">Failed to load reports</p>
        </div>
      ) : !summary ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No report data available</p>
          <p className="text-sm mt-1">Reports will appear once there is order activity</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: formatPrice(summary.totalRevenue), icon: TrendingUp, color: "text-green-600" },
              { label: "Platform Profit", value: formatPrice(summary.netPlatformProfit), icon: TrendingUp, color: "text-brand" },
              { label: "Total GST", value: formatPrice(summary.totalGST), icon: Package, color: "text-orange-600" },
              { label: "Total Commission", value: formatPrice(summary.platformCommission), icon: Package, color: "text-purple-600" },
              { label: "Total Orders", value: summary.totalOrders.toLocaleString("en-IN"), icon: ShoppingBag, color: "text-blue-600" },
              { label: "Delivered Orders", value: summary.deliveredOrders.toLocaleString("en-IN"), icon: ShoppingBag, color: "text-green-600" },
              { label: "Refund Amount", value: formatPrice(summary.refundAmount), icon: Package, color: "text-red-600" },
              { label: "Pending Payouts", value: formatPrice((summary.vendorPayoutPending ?? 0) + (summary.deliveryPayoutPending ?? 0)), icon: Users, color: "text-yellow-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Profit formula card */}
          <div className="bg-gradient-to-r from-brand/5 to-orange-50 dark:from-brand/10 dark:to-orange-950/20 border border-brand/20 rounded-xl p-5">
            <h3 className="font-semibold mb-3">Commission Formula</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Vendor Receives</p>
                <p className="font-mono text-xs bg-muted rounded p-2">
                  Product Price − {COMMISSION_RATE * 100}% commission = Vendor Earnings
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Platform Profit</p>
                <p className="font-mono text-xs bg-muted rounded p-2">
                  Commission − Delivery Boy Share − Razorpay Fee = Net Profit
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">GST</p>
                <p className="font-mono text-xs bg-muted rounded p-2">
                  {GST_RATE * 100}% of product value = CGST {GST_RATE * 50}% + SGST {GST_RATE * 50}%
                </p>
              </div>
            </div>
          </div>

          {/* Revenue chart */}
          {chart.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Daily Revenue vs Commission vs GST</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} />
                  <Bar dataKey="revenue" name="Revenue" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" name="Commission" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gst" name="GST" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* GST by month */}
          {gstByMonth.length > 0 && (
            <div className="bg-card border rounded-xl p-5">
              <h3 className="font-semibold mb-4">GST Collected by Month</h3>
              <div className="space-y-2">
                {gstByMonth.map((row) => (
                  <div key={row.month} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.month}</span>
                    <div className="flex gap-6">
                      <span>CGST: <span className="font-medium">{formatPrice(row.cgst)}</span></span>
                      <span>SGST: <span className="font-medium">{formatPrice(row.sgst)}</span></span>
                      <span className="text-orange-600 font-semibold">Total: {formatPrice(row.gst)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top vendors table */}
          {topVendors.length > 0 && (
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Vendor Financial Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Shop", "Total Revenue", "Orders", "Commission Paid", "Net Earnings", "Pending Payout"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topVendors.map((v) => (
                      <tr key={v.vendorId} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{v.shopName}</td>
                        <td className="px-4 py-3">{formatPrice(v.totalRevenue)}</td>
                        <td className="px-4 py-3">{v.totalOrders}</td>
                        <td className="px-4 py-3 text-purple-600">{formatPrice(v.commissionPaid)}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{formatPrice(v.earnings)}</td>
                        <td className="px-4 py-3">
                          {v.pendingPayout > 0 ? (
                            <span className="text-red-600 font-medium">{formatPrice(v.pendingPayout)}</span>
                          ) : (
                            <Badge variant="success" className="text-[10px]">Settled</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order breakdown table */}
          {recentBreakdowns.length > 0 && (
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Order Financial Breakdown</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{recentBreakdowns.length} orders</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleCSV} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Order", "Date", "Product Amt", "GST", "Commission", "Vendor Gets", "Delivery Boy", "Razorpay", "Net Profit", "Status"].map((h) => (
                        <th key={h} className="text-left px-3 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentBreakdowns.map((row) => (
                      <tr key={row.orderId} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-medium">#{row.orderNumber}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(row.createdAt)}</td>
                        <td className="px-3 py-2.5">{formatPrice(row.productAmount)}</td>
                        <td className="px-3 py-2.5 text-orange-600">{formatPrice(row.gstAmount)}</td>
                        <td className="px-3 py-2.5 text-purple-600">{formatPrice(row.platformCommission)}</td>
                        <td className="px-3 py-2.5 text-blue-600">{formatPrice(row.vendorEarnings)}</td>
                        <td className="px-3 py-2.5 text-teal-600">{formatPrice(row.deliveryBoyEarnings)}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{formatPrice(row.razorpayFee)}</td>
                        <td className={`px-3 py-2.5 font-semibold ${row.netPlatformProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {formatPrice(row.netPlatformProfit)}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge className={`${ORDER_STATUS_COLORS[row.orderStatus] ?? "bg-gray-100 text-gray-800"} text-[10px]`} variant="outline">
                            {ORDER_STATUS_LABELS[row.orderStatus] ?? row.orderStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
