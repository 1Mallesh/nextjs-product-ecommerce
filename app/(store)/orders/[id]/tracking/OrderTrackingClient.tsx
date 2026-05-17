"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Package, Truck, MapPin, Clock } from "lucide-react";
import { orderService } from "@/services/order.service";
import { useSocket } from "@/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate, formatRelativeTime } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import type { OrderStatus } from "@/types";

const STATUS_STEPS: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "PACKED",
  "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED",
];

export default function OrderTrackingClient({ id }: { id: string }) {
  const { socket } = useSocket();

  const { data: order, refetch } = useQuery({
    queryKey: ["order-track", id],
    queryFn: async () => {
      const { data } = await orderService.trackOrder(id);
      return data.data;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!socket) return;
    socket.emit("join-order", id);
    socket.on("order-status-updated", (data: { orderId: string; status: OrderStatus }) => {
      if (data.orderId === id) refetch();
    });
    return () => {
      socket.emit("leave-order", id);
      socket.off("order-status-updated");
    };
  }, [socket, id, refetch]);

  if (!order) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
    </div>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Track Order</h1>
          <p className="text-muted-foreground text-sm">#{order.orderNumber}</p>
        </div>
        <Badge className={ORDER_STATUS_COLORS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {!isCancelled && (
        <div className="bg-card border rounded-2xl p-6 mb-6">
          <div className="relative">
            {STATUS_STEPS.map((status, i) => {
              const done = i < currentStepIndex;
              const active = i === currentStepIndex;
              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 mb-4 last:mb-0"
                >
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                      done ? "bg-green-500" : active ? "bg-brand" : "bg-muted border-2 border-border"
                    }`}>
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : active ? (
                        <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${done ? "bg-green-500" : "bg-border"}`} />
                    )}
                  </div>
                  <div className={`pt-0.5 ${!done && !active ? "opacity-50" : ""}`}>
                    <p className={`text-sm font-medium ${active ? "text-brand" : done ? "text-green-600" : ""}`}>
                      {ORDER_STATUS_LABELS[status]}
                    </p>
                    {active && order.tracking?.timeline?.find((e) => e.status === status) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(
                          order.tracking.timeline.find((e) => e.status === status)!.timestamp
                        )}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Package className="h-3.5 w-3.5" /> Order Date
          </p>
          <p className="font-semibold text-sm">{formatDate(order.createdAt)}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5" /> Est. Delivery
          </p>
          <p className="font-semibold text-sm">
            {order.tracking?.estimatedDelivery
              ? formatDate(order.tracking.estimatedDelivery)
              : "2-5 days"}
          </p>
        </div>
      </div>

      {order.tracking?.trackingId && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            Tracking ID: <span className="text-blue-600 font-mono">{order.tracking.trackingId}</span>
          </p>
          {order.tracking.carrier && (
            <p className="text-xs text-muted-foreground mt-1">via {order.tracking.carrier}</p>
          )}
        </div>
      )}

      {order.address && (
        <div className="bg-card border rounded-xl p-4 mb-6">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
            <MapPin className="h-3.5 w-3.5" /> Delivering to
          </p>
          <p className="font-medium text-sm">{order.address.name}</p>
          <p className="text-sm text-muted-foreground">
            {order.address.line1}, {order.address.city}, {order.address.state} – {order.address.pincode}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/orders">All Orders</Link>
        </Button>
        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
          <Button variant="outline" asChild className="flex-1">
            <Link href="/contact">Get Help</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
