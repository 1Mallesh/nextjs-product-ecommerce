"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Bell, PackageCheck } from "lucide-react";
import { orderService } from "@/services/order.service";
import { useSocket } from "@/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import toast from "react-hot-toast";

const VENDOR_STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

const NEXT_STATUS: Record<string, string> = {
  CONFIRMED: "PROCESSING",
  PROCESSING: "PACKED",
  PACKED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default function VendorOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Real-time alerts for new vendor orders
  useEffect(() => {
    if (!socket) return;
    
    const onNewOrder = (data: { orderNumber?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      
      toast.success(
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-brand animate-bounce" />
          <div>
            <p className="font-bold text-xs">New Order Received!</p>
            <p className="text-[10px] text-muted-foreground">Order #${data?.orderNumber ?? "Placed"}</p>
          </div>
        </div>,
        { duration: 8000, position: "top-right" }
      );
      
      // Dynamic chiptune coin notification audio
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav");
      audio.play().catch(() => {});
    };

    socket.on("notification", onNewOrder);
    socket.on("order.created", onNewOrder);
    
    return () => {
      socket.off("notification", onNewOrder);
      socket.off("order.created", onNewOrder);
    };
  }, [socket, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-orders", statusFilter, page],
    queryFn: async () => {
      const { data } = await orderService.vendorGetAll({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        limit: 15,
      });
      return data.data as any;
    },
    staleTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: string }) =>
      orderService.vendorUpdateStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      toast.success("Order status updated successfully");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const orders = data?.orders ?? data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Orders</h2>
        <Badge variant="outline" className="h-6 gap-1 border-brand/20 text-brand">
          <PackageCheck className="h-3.5 w-3.5" /> Real-time active
        </Badge>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {VENDOR_STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              statusFilter === s ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "ALL" ? "All Orders" : ORDER_STATUS_LABELS[s] ?? s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !orders.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-sm font-medium">No orders found in this category</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Order #", "Customer", "Items", "Total Amount", "Payment Status", "Order Status", "Order Date", "Action Progression"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {(orders as any[]).map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-sm">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{order.customer?.name ?? "–"}</td>
                    <td className="px-4 py-3 text-xs">{order.items?.length ?? 0} item(s)</td>
                    <td className="px-4 py-3 font-semibold text-sm">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} className="text-[10px]">
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      {NEXT_STATUS[order.status] && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-brand/20 hover:border-brand/40 text-brand"
                          disabled={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ itemId: order.id, status: NEXT_STATUS[order.status] })}
                        >
                          → {ORDER_STATUS_LABELS[NEXT_STATUS[order.status]] ?? NEXT_STATUS[order.status]}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
