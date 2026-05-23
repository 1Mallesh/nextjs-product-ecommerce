"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Order } from "@/types";

export default function AdminRefundsPage() {
  const queryClient = useQueryClient();
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-refund-orders"],
    queryFn: async () => {
      const { data } = await orderService.adminGetAll({ status: "DELIVERED", limit: 50 });
      // Backend: { success, data: { orders: [...], meta: {...} } }
      const payload = data?.data as any;
      return (payload?.orders ?? payload?.data ?? (Array.isArray(payload) ? payload : [])) as Order[];
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ orderId, amount }: { orderId: string; amount: number }) =>
      paymentService.refund(orderId, amount, "Admin initiated refund"),
    onSuccess: () => {
      toast.success("Refund initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-refund-orders"] });
      setRefundingId(null);
    },
    onError: () => {
      toast.error("Failed to initiate refund");
      setRefundingId(null);
    },
  });

  const orders: Order[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Refund Requests</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !orders.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <RefreshCcw className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No refund requests</p>
          <p className="text-sm mt-1">Delivered orders eligible for refund will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm">Order #{order.orderNumber ?? order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.customer?.name ?? "Customer"} · {formatDate(order.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">{order.items?.length ?? 0} items</p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                <p className="font-bold text-brand">{formatPrice(order.total)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs h-7"
                  loading={refundingId === order.id && refundMutation.isPending}
                  onClick={() => {
                    setRefundingId(order.id);
                    refundMutation.mutate({ orderId: order.id, amount: order.total });
                  }}
                >
                  <RefreshCcw className="h-3 w-3 mr-1" /> Refund
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
