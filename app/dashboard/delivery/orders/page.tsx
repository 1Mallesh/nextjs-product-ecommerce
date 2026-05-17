"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, MapPin } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import { useSocket } from "@/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import type { Order } from "@/types";
import toast from "react-hot-toast";

const STATUS_TABS = ["ALL", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function DeliveryOrdersPage() {
  const [filter, setFilter] = useState("ALL");
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const refresh = (data: { orderNumber?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      if (data?.orderNumber) toast.success(`Order #${data.orderNumber} updated`);
    };
    socket.on("order-status-update", refresh);
    socket.on("delivery.assigned", refresh);
    socket.on("notification", refresh);
    return () => {
      socket.off("order-status-update", refresh);
      socket.off("delivery.assigned", refresh);
      socket.off("notification", refresh);
    };
  }, [socket, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ["delivery-all-orders", filter],
    queryFn: async () => {
      const { data } = await deliveryService.getAssigned(
        filter !== "ALL" ? { status: filter } : undefined
      );
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : (payload?.orders ?? payload?.data ?? [])) as Order[];
    },
    staleTime: 0,
    refetchInterval: 30_000,
  });

  const orders = data ?? [];

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await deliveryService.updateDeliveryStatus(orderId, status);
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const NEXT_STATUS: Record<string, string> = {
    PICKED_UP: "IN_TRANSIT",
    IN_TRANSIT: "OUT_FOR_DELIVERY",
    OUT_FOR_DELIVERY: "DELIVERED",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Orders</h2>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              filter === s ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "ALL" ? "All" : ORDER_STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !orders.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                  <Badge className={ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800"} variant="outline">
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </div>
              </div>

              {order.address && (
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand mt-0.5 shrink-0" />
                  {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.pincode}
                </p>
              )}

              {NEXT_STATUS[order.status] && (
                <div className="flex gap-2">
                  <Button size="sm" variant="brand" className="h-7 text-xs"
                    onClick={() => handleStatusUpdate(order.id, NEXT_STATUS[order.status])}>
                    Mark as {ORDER_STATUS_LABELS[NEXT_STATUS[order.status]] ?? NEXT_STATUS[order.status]}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs"
                    onClick={() => {
                      if (order.address?.lat && order.address?.lng) {
                        window.open(`https://maps.google.com/?q=${order.address.lat},${order.address.lng}`, "_blank");
                      }
                    }}>
                    Navigate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
