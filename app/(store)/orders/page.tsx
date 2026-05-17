"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, ChevronRight, Package } from "lucide-react";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

export default function OrdersPage() {
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", status],
    queryFn: async () => {
      const { data } = await orderService.getAll({ status: status || undefined, limit: 20 });
      return data.data;
    },
  });

  const STATUS_TABS = ["", "PENDING", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              status === s ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-xl font-semibold">No orders found</p>
          <Button variant="brand" className="mt-6" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((order) => (
            <div key={order.id} className="bg-card border rounded-xl overflow-hidden hover:border-brand/30 transition-colors">
              <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Order #{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>

              <div className="p-4 space-y-3">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground line-clamp-1 flex-1 pr-4">
                      {item.product.name} × {item.quantity}
                    </p>
                    <p className="font-medium shrink-0">{formatPrice(item.total)}</p>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-muted-foreground">+{order.items.length - 2} more items</p>
                )}
              </div>

              <div className="px-4 pb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-brand">{formatPrice(order.total)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${order.id}/tracking`}>Track Order</Link>
                  </Button>
                  {order.status === "DELIVERED" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/products/${order.items[0]?.product?.slug}#reviews`}>Review</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
