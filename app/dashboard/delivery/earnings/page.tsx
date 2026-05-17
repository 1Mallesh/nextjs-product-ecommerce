"use client";

import { useQuery } from "@tanstack/react-query";
import { Wallet, Truck, Star } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

export default function DeliveryEarningsPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["delivery-profile"],
    queryFn: async () => {
      const { data } = await deliveryService.getProfile();
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Earnings</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Total Earnings" value={formatPrice(profile?.earnings ?? 0)} icon={Wallet} color="green" />
        <StatCard title="Total Deliveries" value={profile?.totalDeliveries ?? 0} icon={Truck} color="brand" />
        <StatCard title="Avg Rating" value={`${profile?.rating?.toFixed(1) ?? "–"} ★`} icon={Star} color="purple" />
      </div>

      <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
        <Wallet className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="font-medium">Payout history coming soon</p>
        <p className="text-sm mt-1">Track your daily and weekly earnings</p>
      </div>
    </div>
  );
}
