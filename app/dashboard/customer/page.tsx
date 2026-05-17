"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "@/providers/SocketProvider";
import toast from "react-hot-toast";
import { ShoppingBag, Heart, MapPin, Package, TrendingUp, ArrowRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";

export default function CustomerDashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const wishlistCount = useAppSelector((s) => s.wishlist.productIds.length);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { orderNumber?: string; status?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      toast(`Order #${data?.orderNumber ?? ""} status: ${data?.status ?? "updated"}`, { icon: "📦" });
    };
    socket.on("order-status-update", handler);
    return () => { socket.off("order-status-update", handler); };
  }, [socket, queryClient]);

  const { data: orders } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      const { data } = await orderService.getAll({ limit: 5 });
      return data.data;
    },
  });

  const totalSpent = orders?.data?.reduce((sum, o) => sum + o.total, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand to-orange-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome back, {user?.name?.split(" ")[0]}! 👋</h2>
        <p className="text-white/80 text-sm mt-1">
          Track your orders, manage your wishlist, and more.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={orders?.meta?.total || 0} icon={ShoppingBag} color="brand" />
        <StatCard title="Total Spent" value={formatPrice(totalSpent)} icon={TrendingUp} color="green" />
        <StatCard title="Wishlist" value={wishlistCount} icon={Heart} color="purple" />
        <StatCard title="Active Orders" value={orders?.data?.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length || 0} icon={Package} color="blue" />
      </div>

      {/* Recent orders */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Recent Orders</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/customer/orders">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="divide-y">
          {!orders?.data?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No orders yet</p>
              <Button variant="brand" size="sm" className="mt-3" asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            orders.data.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                  <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/orders/${order.id}/tracking`}>Track</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: ShoppingBag, label: "My Orders", href: "/dashboard/customer/orders", color: "brand" },
          { icon: Heart, label: "Wishlist", href: "/dashboard/customer/wishlist", color: "purple" },
          { icon: MapPin, label: "Addresses", href: "/dashboard/customer/addresses", color: "blue" },
          { icon: Package, label: "Track Order", href: "/orders", color: "green" },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="bg-card border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand/50 hover:bg-brand/5 transition-all group">
            <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
              <link.icon className="h-5 w-5 text-brand group-hover:text-white" />
            </div>
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
