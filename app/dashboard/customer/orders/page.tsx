"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Search } from "lucide-react";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function CustomerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-orders", statusFilter, page],
    queryFn: async () => {
      const { data } = await orderService.getAll({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        limit: 10,
      });
      return data.data as any;
    },
    staleTime: 0,
  });

  const orders = data?.orders ?? data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Orders</h2>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
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
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !orders.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No orders found</p>
          <Button variant="brand" className="mt-4" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-xl p-4 hover:border-brand/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">#{order.orderNumber}</p>
                    <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    {order.paymentStatus === "PAID" && (
                      <Badge variant="success" className="text-[10px]">Paid</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""} · Ordered {formatDate(order.createdAt)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {order.items?.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-xs bg-muted px-2 py-0.5 rounded-md line-clamp-1 max-w-[120px]">
                        {item.product?.name ?? "Product"}
                      </span>
                    ))}
                    {(order.items?.length ?? 0) > 3 && (
                      <span className="text-xs text-muted-foreground">+{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold">{formatPrice(order.total)}</p>
                  <div className="flex gap-2 mt-2 justify-end">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/orders/${order.id}/tracking`}>Track</Link>
                    </Button>
                    {!["DELIVERED", "CANCELLED"].includes(order.status) && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" asChild>
                        <Link href={`/orders/${order.id}/tracking`}>Cancel</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
