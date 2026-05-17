"use client";

import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, ArrowDownCircle } from "lucide-react";
import { vendorService } from "@/services/vendor.service";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";

export default function VendorEarningsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["vendor-earnings"],
    queryFn: async () => {
      const { data } = await vendorService.getDashboard();
      return data.data as any;
    },
    staleTime: 0,
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Earnings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          icon={Wallet}
          color="brand"
        />
        <StatCard
          title="Total Products"
          value={analytics?.totalProducts ?? 0}
          icon={ArrowDownCircle}
          color="blue"
        />
      </div>

      <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
        <Wallet className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="font-medium">Payout history coming soon</p>
        <p className="text-sm mt-1">Track your withdrawals and payouts here</p>
      </div>
    </div>
  );
}
