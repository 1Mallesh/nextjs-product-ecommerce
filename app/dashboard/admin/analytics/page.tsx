"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingBag, Users, Package, DollarSign, Percent,
  Truck, CreditCard, RefreshCcw, ArrowUpRight, ArrowDownRight,
  Store, Bike, AlertCircle, CheckCircle2, Clock, RefreshCw,
} from "lucide-react";
import { useFinancialAnalytics, COMMISSION_RATE, GST_RATE } from "@/hooks/useFinancialAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import type { DateRange } from "@/types";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

const PIE_COLORS = ["#FF6B00", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

function FinancialCard({
  label, value, sub, icon: Icon, color, trend, trendUp,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-card border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${trendUp ? "text-green-600" : "text-red-500"}`}>
          {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {entry.name === "orders" ? entry.value : formatPrice(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("month");
  const { summary, chart, topVendors, recentBreakdowns, paymentMethodBreakdown,
    gstByMonth, isLoading, isError, lastUpdated, invalidate } = useFinancialAnalytics(range);

  const pieData = summary ? [
    { name: "Vendor Earnings", value: summary.vendorEarnings },
    { name: "Delivery Earnings", value: summary.deliveryEarnings },
    { name: "Platform Profit", value: Math.max(0, summary.netPlatformProfit) },
    { name: "GST", value: summary.totalGST },
    { name: "Razorpay", value: summary.razorpayCharges },
  ].filter((d) => d.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Financial Analytics</h2>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last updated {lastUpdated.toLocaleTimeString("en-IN")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-40 text-destructive" />
          <p className="text-destructive font-medium">Failed to load analytics</p>
        </div>
      ) : (
        <>
          {/* ── Revenue Cards ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Revenue Overview</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FinancialCard
                label="Total Revenue"
                value={formatPrice(summary?.totalRevenue ?? 0)}
                icon={TrendingUp}
                color="bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                trend={summary?.revenueGrowth !== undefined ? `${Math.abs(summary.revenueGrowth)}% vs last period` : undefined}
                trendUp={(summary?.revenueGrowth ?? 0) >= 0}
              />
              <FinancialCard
                label="Product Revenue"
                value={formatPrice(summary?.productRevenue ?? 0)}
                sub={`Excl. delivery charges`}
                icon={Package}
                color="bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
              />
              <FinancialCard
                label="Delivery Revenue"
                value={formatPrice(summary?.deliveryRevenue ?? 0)}
                icon={Truck}
                color="bg-cyan-100 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400"
              />
              <FinancialCard
                label="Net Platform Profit"
                value={formatPrice(summary?.netPlatformProfit ?? 0)}
                sub={`After commissions & fees`}
                icon={DollarSign}
                color="bg-brand/10 text-brand"
                trend={summary?.netPlatformProfit !== undefined
                  ? `${COMMISSION_RATE * 100}% commission model`
                  : undefined}
                trendUp
              />
            </div>
          </div>

          {/* ── Tax & Commission ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tax & Commission</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FinancialCard
                label="Total GST Collected"
                value={formatPrice(summary?.totalGST ?? 0)}
                sub={`${GST_RATE * 100}% GST rate`}
                icon={Percent}
                color="bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
              />
              <FinancialCard
                label="CGST"
                value={formatPrice(summary?.cgst ?? 0)}
                icon={Percent}
                color="bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
              />
              <FinancialCard
                label="SGST"
                value={formatPrice(summary?.sgst ?? 0)}
                icon={Percent}
                color="bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400"
              />
              <FinancialCard
                label="Platform Commission"
                value={formatPrice(summary?.platformCommission ?? 0)}
                sub={`${COMMISSION_RATE * 100}% of product sales`}
                icon={CreditCard}
                color="bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
              />
            </div>
          </div>

          {/* ── Payouts ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Payouts & Settlements</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FinancialCard
                label="Vendor Earnings"
                value={formatPrice(summary?.vendorEarnings ?? 0)}
                sub="After platform commission"
                icon={Store}
                color="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
              />
              <FinancialCard
                label="Vendor Payout Pending"
                value={formatPrice(summary?.vendorPayoutPending ?? 0)}
                icon={Clock}
                color="bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400"
              />
              <FinancialCard
                label="Delivery Earnings"
                value={formatPrice(summary?.deliveryEarnings ?? 0)}
                sub="60% of delivery fees"
                icon={Bike}
                color="bg-teal-100 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400"
              />
              <FinancialCard
                label="Delivery Payout Pending"
                value={formatPrice(summary?.deliveryPayoutPending ?? 0)}
                icon={Clock}
                color="bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400"
              />
            </div>
          </div>

          {/* ── Orders ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Summary</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FinancialCard
                label="Total Orders"
                value={(summary?.totalOrders ?? 0).toLocaleString("en-IN")}
                icon={ShoppingBag}
                color="bg-brand/10 text-brand"
                trend={summary?.ordersGrowth !== undefined ? `${Math.abs(summary.ordersGrowth)}% vs last period` : undefined}
                trendUp={(summary?.ordersGrowth ?? 0) >= 0}
              />
              <FinancialCard
                label="Pending Orders"
                value={(summary?.pendingOrders ?? 0).toLocaleString("en-IN")}
                icon={Clock}
                color="bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400"
              />
              <FinancialCard
                label="Delivered Orders"
                value={(summary?.deliveredOrders ?? 0).toLocaleString("en-IN")}
                icon={CheckCircle2}
                color="bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400"
              />
              <FinancialCard
                label="Refund Amount"
                value={formatPrice(summary?.refundAmount ?? 0)}
                sub={`${summary?.refundCount ?? 0} refunds`}
                icon={RefreshCcw}
                color="bg-pink-100 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400"
              />
            </div>
          </div>

          {/* ── Revenue Chart ── */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-1">Revenue Breakdown Over Time</h3>
            <p className="text-xs text-muted-foreground mb-4">Revenue, commission, GST, and platform profit</p>
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#FF6B00" fill="url(#gRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="commission" name="Commission" stroke="#8B5CF6" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="gst" name="GST" stroke="#F59E0B" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10B981" fill="url(#gProfit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">No data for selected period</div>
            )}
          </div>

          {/* ── Revenue Distribution Pie + Payment Methods ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-1">Revenue Distribution</h3>
              <p className="text-xs text-muted-foreground mb-4">How each rupee is split</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatPrice(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-1">Payment Methods</h3>
              <p className="text-xs text-muted-foreground mb-4">Orders by payment type</p>
              {paymentMethodBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={paymentMethodBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="method" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(v, name) => [name === "amount" ? formatPrice(Number(v)) : v, name]} />
                    <Bar dataKey="count" name="Orders" fill="#FF6B00" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3 mt-4">
                  {[
                    { method: "RAZORPAY", desc: "Online payments", color: "bg-blue-500" },
                    { method: "COD", desc: "Cash on delivery", color: "bg-green-500" },
                    { method: "WALLET", desc: "Wallet balance", color: "bg-purple-500" },
                  ].map((m) => (
                    <div key={m.method} className="flex items-center gap-3 text-sm">
                      <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                      <span className="text-muted-foreground flex-1">{m.desc}</span>
                      <span className="font-medium">{m.method}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2">Data will appear after orders are placed</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Top Vendors ── */}
          {topVendors.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Top Vendors by Revenue</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topVendors.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="shopName" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} />
                  <Bar dataKey="totalRevenue" name="Revenue" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="earnings" name="Net Earnings" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Per-Order Financial Breakdown ── */}
          {recentBreakdowns.length > 0 && (
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Per-Order Financial Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Commission {COMMISSION_RATE * 100}% · GST {GST_RATE * 100}% · Delivery Boy 60% · Razorpay 2%
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {["Order", "Customer", "Product Amt", `GST (${GST_RATE * 100}%)`, "Delivery", `Commission (${COMMISSION_RATE * 100}%)`, "Vendor Gets", "Delivery Boy", "Razorpay", "Platform Profit", "Status"].map((h) => (
                        <th key={h} className="text-left px-3 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentBreakdowns.slice(0, 20).map((row) => (
                      <tr key={row.orderId} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-medium">#{row.orderNumber}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{row.customerName}</td>
                        <td className="px-3 py-2.5">{formatPrice(row.productAmount)}</td>
                        <td className="px-3 py-2.5 text-orange-600">{formatPrice(row.gstAmount)}</td>
                        <td className="px-3 py-2.5">{formatPrice(row.deliveryCharge)}</td>
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

          {/* ── Razorpay / Fees ── */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Fee Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">Razorpay Gateway Charges</p>
                <p className="text-lg font-bold mt-1">{formatPrice(summary?.razorpayCharges ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">~2% of online payment value</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">Vendor Wallet Balance</p>
                <p className="text-lg font-bold mt-1">{formatPrice(summary?.vendorWalletBalance ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Across all vendors</p>
              </div>
              <div className="bg-muted/40 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">Delivery Wallet Balance</p>
                <p className="text-lg font-bold mt-1">{formatPrice(summary?.deliveryWalletBalance ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Across all delivery partners</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
