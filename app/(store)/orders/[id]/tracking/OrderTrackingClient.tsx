"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  MapPin, Phone, Navigation, Package, CheckCircle2,
  Clock, Truck, ArrowLeft, RefreshCw, Wifi, WifiOff,
} from "lucide-react";
import { orderService } from "@/services/order.service";
import { useSocket } from "@/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUS_LABELS } from "@/constants";
import { formatPrice } from "@/lib/utils";

interface Location { lat: number; lng: number; accuracy?: number; updatedAt?: string }

const TRACKING_STEPS = [
  { key: "CONFIRMED",        label: "Order Confirmed",    icon: CheckCircle2 },
  { key: "PROCESSING",       label: "Preparing Order",    icon: Package },
  { key: "PICKED_UP",        label: "Picked Up",          icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery",   icon: Navigation },
  { key: "DELIVERED",        label: "Delivered",          icon: CheckCircle2 },
];

const STATUS_ORDER = [
  "PENDING","CONFIRMED","PROCESSING","PACKED",
  "PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED",
];

function stepIndex(status: string) {
  const map: Record<string, number> = {
    PENDING: 0, CONFIRMED: 0, PROCESSING: 1, PACKED: 1,
    PICKED_UP: 2, IN_TRANSIT: 2, OUT_FOR_DELIVERY: 3, DELIVERED: 4,
  };
  return map[status] ?? -1;
}

function MapEmbed({ location, address }: { location?: Location | null; address?: string }) {
  const query = location
    ? `${location.lat},${location.lng}`
    : encodeURIComponent(address ?? "India");

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border bg-muted">
      <iframe
        title="Delivery Location"
        className="w-full h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`}
      />
      {location && (
        <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-900 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-medium text-green-700 dark:text-green-400">Live Location</span>
          {location.updatedAt && (
            <span className="text-muted-foreground">
              · {new Date(location.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingClient({ id }: { id: string }) {
  const { socket, isConnected } = useSocket();
  const [liveLocation, setLiveLocation] = useState<Location | null>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const joinedRef = useRef(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["order-tracking", id],
    queryFn: async () => {
      const { data } = await orderService.trackOrder(id);
      return data.data as any;
    },
    refetchInterval: 30_000,
  });

  // Join order tracking room & listen for live updates
  useEffect(() => {
    if (!socket || !id) return;

    if (!joinedRef.current) {
      socket.emit("track-order", { orderId: id });
      joinedRef.current = true;
    }

    const onLocation = (data: { lat: number; lng: number; accuracy?: number }) => {
      setLiveLocation({ ...data, updatedAt: new Date().toISOString() });
      setLastPing(new Date());
    };

    const onStatusUpdate = (data: { status: string }) => {
      setLiveStatus(data.status);
      refetch();
    };

    socket.on("location-update", onLocation);
    socket.on("order-status-update", onStatusUpdate);

    return () => {
      socket.off("location-update", onLocation);
      socket.off("order-status-update", onStatusUpdate);
    };
  }, [socket, id, refetch]);

  const currentStatus = liveStatus ?? order?.status ?? "PENDING";
  const currentStep = stepIndex(currentStatus);
  const isOutForDelivery = ["OUT_FOR_DELIVERY", "IN_TRANSIT"].includes(currentStatus);
  const isDelivered = currentStatus === "DELIVERED";
  const isCancelled = currentStatus === "CANCELLED";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">Order not found</p>
        <Button className="mt-4" asChild><Link href="/orders">My Orders</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Track Order</h1>
          <p className="text-xs text-muted-foreground font-mono">#{order.orderNumber ?? id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected
            ? <span className="flex items-center gap-1 text-xs text-green-600"><Wifi className="h-3 w-3" />Live</span>
            : <span className="flex items-center gap-1 text-xs text-muted-foreground"><WifiOff className="h-3 w-3" />Offline</span>}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl p-4 flex items-center justify-between ${
        isDelivered ? "bg-green-50 dark:bg-green-950/20 border border-green-200" :
        isCancelled ? "bg-red-50 dark:bg-red-950/20 border border-red-200" :
        "bg-brand/5 border border-brand/20"
      }`}>
        <div>
          <p className={`font-bold text-base ${isDelivered ? "text-green-700" : isCancelled ? "text-red-700" : "text-brand"}`}>
            {ORDER_STATUS_LABELS[currentStatus] ?? currentStatus}
          </p>
          {order.estimatedDelivery && !isDelivered && !isCancelled && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            </p>
          )}
          {isDelivered && order.deliveredAt && (
            <p className="text-xs text-green-600 mt-0.5">
              Delivered on {new Date(order.deliveredAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
        <Badge className={isDelivered ? "bg-green-500" : isCancelled ? "bg-red-500" : "bg-brand"}>
          {ORDER_STATUS_LABELS[currentStatus] ?? currentStatus}
        </Badge>
      </div>

      {/* Live map — shown when out for delivery */}
      {(isOutForDelivery || isDelivered) && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" />
            {isDelivered ? "Delivery Location" : "Delivery Boy Location"}
            {liveLocation && !isDelivered && (
              <span className="text-xs font-normal text-green-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Updating live
              </span>
            )}
          </h2>
          <MapEmbed
            location={isDelivered ? null : liveLocation}
            address={order.deliveryAddress?.fullAddress ?? order.address}
          />
        </div>
      )}

      {/* Delivery boy card — shown when assigned */}
      {order.deliveryBoy && !isCancelled && (
        <div className="border rounded-2xl p-4 flex items-center gap-4 bg-card">
          <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-lg shrink-0">
            {(order.deliveryBoy.name ?? "D")[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{order.deliveryBoy.name}</p>
            <p className="text-xs text-muted-foreground">Delivery Partner</p>
            {order.deliveryBoy.vehicleNumber && (
              <p className="text-xs text-muted-foreground mt-0.5">🛵 {order.deliveryBoy.vehicleNumber}</p>
            )}
          </div>
          {order.deliveryBoy.mobile && (
            <a
              href={`tel:${order.deliveryBoy.mobile}`}
              className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-green-50 hover:border-green-400 hover:text-green-600 transition-colors shrink-0"
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      {/* Status timeline */}
      {!isCancelled && (
        <div className="border rounded-2xl p-4 space-y-0 bg-card">
          <h2 className="font-semibold text-sm mb-4">Order Progress</h2>
          {TRACKING_STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    done ? "bg-green-500 text-white" :
                    active ? "bg-brand text-white" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {i < TRACKING_STEPS.length - 1 && (
                    <div className={`w-0.5 h-8 mt-0.5 transition-colors ${done ? "bg-green-400" : "bg-border"}`} />
                  )}
                </div>
                <div className="pb-8 pt-1">
                  <p className={`text-sm font-medium leading-none ${active ? "text-brand" : done ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  {active && (
                    <p className="text-xs text-muted-foreground mt-1">In progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order summary */}
      <div className="border rounded-2xl p-4 bg-card space-y-3">
        <h2 className="font-semibold text-sm">Order Summary</h2>
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.product?.thumbnail && (
              <img src={item.product.thumbnail} alt={item.product?.name} className="h-12 w-12 rounded-xl object-cover border" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.product?.name ?? item.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
        <div className="border-t pt-3 flex justify-between text-sm font-bold">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount ?? order.total ?? 0)}</span>
        </div>
      </div>

      {/* Delivery address */}
      {order.deliveryAddress && (
        <div className="border rounded-2xl p-4 bg-card">
          <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" /> Delivery Address
          </h2>
          <p className="text-sm font-medium">{order.deliveryAddress.name}</p>
          <p className="text-sm text-muted-foreground">{order.deliveryAddress.fullAddress ?? [
            order.deliveryAddress.line1,
            order.deliveryAddress.city,
            order.deliveryAddress.state,
            order.deliveryAddress.pincode,
          ].filter(Boolean).join(", ")}</p>
        </div>
      )}
    </div>
  );
}
