"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Wallet, Star, Truck, MapPin, ToggleLeft, ToggleRight, Navigation } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import type { Order } from "@/types";
import { useSocket } from "@/providers/SocketProvider";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";
import toast from "react-hot-toast";

export default function DeliveryDashboardPage() {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [locationTracking, setLocationTracking] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onAssigned = (data: { orderNumber?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
      toast.success(`New order assigned: #${data?.orderNumber ?? "Order"}`);
    };
    socket.on("delivery:assigned", onAssigned);
    socket.on("order:assigned", onAssigned);
    return () => {
      socket.off("delivery:assigned", onAssigned);
      socket.off("order:assigned", onAssigned);
    };
  }, [socket, queryClient]);

  const { data: profile } = useQuery({
    queryKey: ["delivery-profile"],
    queryFn: async () => {
      const { data } = await deliveryService.getProfile();
      return data.data;
    },
  });

  const { data: assignedOrders } = useQuery({
    queryKey: ["delivery-assigned"],
    queryFn: async () => {
      const { data } = await deliveryService.getAssigned();
      return data.data;
    },
    refetchInterval: 30000,
  });

  const toggleMutation = useMutation({
    mutationFn: () => deliveryService.toggleAvailability(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-profile"] });
      toast.success(profile?.isAvailable ? "You are now offline" : "You are now online");
    },
  });

  // GPS location tracking
  useEffect(() => {
    if (!locationTracking || !socket) return;

    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          deliveryService.updateLocation(pos.coords.latitude, pos.coords.longitude);
          socket.emit("location-update", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => toast.error("Location access denied"),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [locationTracking, socket]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await deliveryService.updateDeliveryStatus(orderId, status);
      queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Availability toggle */}
      <div className={`rounded-2xl p-6 flex items-center justify-between ${
        profile?.isAvailable
          ? "bg-green-50 dark:bg-green-950/30 border border-green-200"
          : "bg-gray-50 dark:bg-gray-900/30 border"
      }`}>
        <div>
          <h2 className="text-lg font-bold">
            {profile?.isAvailable ? "🟢 You are Online" : "⚫ You are Offline"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profile?.isAvailable
              ? "You are receiving delivery requests"
              : "Toggle to start accepting deliveries"}
          </p>
        </div>
        <button
          onClick={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
          className="flex items-center gap-2 transition-opacity"
        >
          {profile?.isAvailable ? (
            <ToggleRight className="h-10 w-10 text-green-600" />
          ) : (
            <ToggleLeft className="h-10 w-10 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* GPS tracking */}
      <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className={`h-5 w-5 ${locationTracking ? "text-brand animate-pulse" : "text-muted-foreground"}`} />
          <div>
            <p className="text-sm font-medium">GPS Location Tracking</p>
            <p className="text-xs text-muted-foreground">Share live location with customers</p>
          </div>
        </div>
        <Button
          size="sm"
          variant={locationTracking ? "destructive" : "brand"}
          onClick={() => {
            if (!locationTracking) {
              navigator.geolocation.getCurrentPosition(
                () => { setLocationTracking(true); toast.success("Location tracking started"); },
                () => toast.error("Allow location access first")
              );
            } else {
              setLocationTracking(false);
              toast.success("Location tracking stopped");
            }
          }}
        >
          {locationTracking ? "Stop Tracking" : "Start Tracking"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Earnings"
          value={formatPrice(profile?.earnings || 0)}
          icon={Wallet}
          color="green"
        />
        <StatCard
          title="Total Deliveries"
          value={profile?.totalDeliveries || 0}
          icon={Truck}
          color="brand"
        />
        <StatCard
          title="Pending"
          value={assignedOrders?.length || 0}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Rating"
          value={`${profile?.rating?.toFixed(1) || "–"} ★`}
          icon={Star}
          color="purple"
        />
      </div>

      {/* Assigned orders */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Assigned Orders</h3>
        </div>
        <div className="divide-y">
          {!assignedOrders?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No assigned orders</p>
            </div>
          ) : (
            assignedOrders.map((order: Order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                    <Badge variant="info" className="text-[10px]">
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                </div>

                {order.address && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand" />
                    {order.address.line1}, {order.address.city}
                  </p>
                )}

                <div className="flex gap-2">
                  {order.status === "PICKED_UP" && (
                    <Button size="sm" variant="brand" onClick={() => handleStatusUpdate(order.id, "IN_TRANSIT")}>
                      Start Delivery
                    </Button>
                  )}
                  {order.status === "IN_TRANSIT" && (
                    <Button size="sm" variant="brand" onClick={() => handleStatusUpdate(order.id, "OUT_FOR_DELIVERY")}>
                      Out for Delivery
                    </Button>
                  )}
                  {order.status === "OUT_FOR_DELIVERY" && (
                    <Button size="sm" variant="brand" onClick={() => handleStatusUpdate(order.id, "DELIVERED")}>
                      Mark Delivered
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => {
                    if (order.address?.lat && order.address?.lng) {
                      window.open(`https://maps.google.com/?q=${order.address.lat},${order.address.lng}`, "_blank");
                    }
                  }}>
                    Navigate
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
