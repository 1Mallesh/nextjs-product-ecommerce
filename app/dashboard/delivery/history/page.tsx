"use client";

import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";
import type { Order } from "@/types";

export default function DeliveryHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-history"],
    queryFn: async () => {
      const { data } = await deliveryService.getAssigned();
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : (payload?.orders ?? payload?.data ?? [])) as Order[];
    },
    staleTime: 0,
  });

  const delivered = (data as Order[] | undefined)?.filter((o) => o.status === "DELIVERED") ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Delivery History</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !delivered.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>No completed deliveries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {delivered.map((order) => (
            <div key={order.id} className="bg-card border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">#{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                <Badge variant="success" className="text-[10px]">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
