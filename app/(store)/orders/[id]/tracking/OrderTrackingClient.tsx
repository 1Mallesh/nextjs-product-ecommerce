"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Package, Truck, MapPin, Clock, Phone, User as UserIcon } from "lucide-react";
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data: order, refetch } = useQuery({
    queryKey: ["order-track", id],
    queryFn: async () => {
      const { data } = await orderService.trackOrder(id);
      return data.data;
    },
    refetchInterval: 15000,
  });

  // Dynamic Leaflet Loading
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet css
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet js
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Map updates
  useEffect(() => {
    if (!mapLoaded || !order || typeof window === "undefined" || !(window as any).L) return;

    const L = (window as any).L;
    const mapContainer = document.getElementById("tracking-map");
    if (!mapContainer) return;

    // Clean up existing map instance if any
    const existingMap = (mapContainer as any)._leaflet_map;
    if (existingMap) {
      existingMap.remove();
    }

    const customerLat = order.address?.latitude || 12.9716; // default Bangalore
    const customerLng = order.address?.longitude || 77.5946;

    const driverLat = driverLocation?.latitude || order.delivery?.deliveryBoy?.currentLatitude || customerLat + 0.005;
    const driverLng = driverLocation?.longitude || order.delivery?.deliveryBoy?.currentLongitude || customerLng + 0.005;

    const map = L.map("tracking-map").setView([customerLat, customerLng], 14);
    (mapContainer as any)._leaflet_map = map;

    // Beautiful CartoDB light map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Customer marker
    const customerIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div class="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker([customerLat, customerLng], { icon: customerIcon }).addTo(map)
      .bindPopup("Your Delivery Address")
      .openPopup();

    // Driver marker
    const showDriver = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(order.status);
    if (showDriver) {
      const driverIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white border-2 border-white shadow-lg animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map)
        .bindPopup("Delivery Executive is on the way");

      // Draw route connection line
      L.polyline([[driverLat, driverLng], [customerLat, customerLng]], { color: "#ff6c37", weight: 3, dashArray: "5, 10" }).addTo(map);

      const bounds = L.latLngBounds([[driverLat, driverLng], [customerLat, customerLng]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if ((mapContainer as any)._leaflet_map) {
        (mapContainer as any)._leaflet_map.remove();
        delete (mapContainer as any)._leaflet_map;
      }
    };
  }, [mapLoaded, order, driverLocation]);

  // Real-time Gateway Room integration
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-order-room", { orderId: id });

    socket.on("order-status-update", (data: { orderId: string; status: OrderStatus }) => {
      if (data.orderId === id) {
        refetch();
      }
    });

    socket.on("location-update", (data: { latitude: number; longitude: number; deliveryBoyId: string }) => {
      setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
    });

    return () => {
      socket.emit("leave-order-room", { orderId: id });
      socket.off("order-status-update");
      socket.off("location-update");
    };
  }, [socket, id, refetch]);

  if (!order) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
    </div>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  const deliveryBoy = order.delivery?.deliveryBoy;
  const deliveryOtp = order.orderNumber ? order.orderNumber.slice(-4) : "1234";

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

      {/* Real-time Logistics Map Tracking */}
      {["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(order.status) && (
        <div className="bg-card border rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Delivery Map</p>
            </div>
            {deliveryBoy?.user && (
              <p className="text-xs text-muted-foreground">Driver: {deliveryBoy.user.name}</p>
            )}
          </div>
          <div id="tracking-map" className="h-[260px] w-full bg-muted z-10" />
        </div>
      )}

      {/* Delivery Boy Details Card */}
      {deliveryBoy && (
        <div className="bg-card border rounded-2xl p-5 mb-6 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center shrink-0 border">
              <UserIcon className="h-6 w-6 text-brand" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Delivery Executive</p>
              <p className="font-bold text-sm mt-0.5">{deliveryBoy.user?.name ?? "Rider"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {deliveryBoy.vehicleType} ({deliveryBoy.vehicleNumber})
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {deliveryBoy.user?.phone && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5" asChild>
                <a href={`tel:${deliveryBoy.user.phone}`}><Phone className="h-3.5 w-3.5" /> Call Rider</a>
              </Button>
            )}
            {order.status === "OUT_FOR_DELIVERY" && (
              <div className="bg-brand/5 border border-brand/20 rounded-lg px-2.5 py-1 text-center mt-1">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Delivery OTP</span>
                <span className="text-sm font-extrabold text-brand tracking-wider">{deliveryOtp}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                    {active && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Active Status
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
            {order.status === "DELIVERED" ? "Delivered successfully" : "2-5 days"}
          </p>
        </div>
      </div>

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
          <Link href="/dashboard/customer/orders">All Orders</Link>
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
