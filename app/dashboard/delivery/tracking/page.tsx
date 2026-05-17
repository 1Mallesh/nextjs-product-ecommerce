"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Wifi, WifiOff, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/providers/SocketProvider";
import { deliveryService } from "@/services/delivery.service";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const EMIT_INTERVAL_MS = 5000; // emit GPS every 5s

export default function DeliveryLiveTrackingPage() {
  const { socket, isConnected } = useSocket();
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [emitCount, setEmitCount] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const emitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Get current active delivery to attach orderId to location updates
  const { data: activeDeliveries } = useQuery({
    queryKey: ["delivery-active"],
    queryFn: async () => {
      const { data } = await deliveryService.getAssigned({ status: "OUT_FOR_DELIVERY" });
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : payload?.deliveries ?? []) as any[];
    },
    refetchInterval: 30_000,
  });

  const activeOrderId = activeDeliveries?.[0]?.order?.id ?? null;

  const emitLocation = useCallback(
    (lat: number, lng: number) => {
      if (!socket || !isConnected) return;
      socket.emit("location-update", { latitude: lat, longitude: lng, orderId: activeOrderId });
      // Also persist to backend for non-realtime consumers
      deliveryService.updateLocation(lat, lng, activeOrderId ?? undefined).catch(() => {});
      setEmitCount((c) => c + 1);
    },
    [socket, isConnected, activeOrderId]
  );

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTracking(true);
        toast.success("Location tracking started");

        // Watch position for continuous updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => {
            const { latitude: lat, longitude: lng, accuracy: acc } = p.coords;
            setCoords({ lat, lng });
            setAccuracy(acc);
            latestCoordsRef.current = { lat, lng };
          },
          () => {
            toast.error("Location signal lost");
          },
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
        );

        // Emit at fixed interval — avoids flooding socket on every GPS update
        emitIntervalRef.current = setInterval(() => {
          if (latestCoordsRef.current) {
            emitLocation(latestCoordsRef.current.lat, latestCoordsRef.current.lng);
          }
        }, EMIT_INTERVAL_MS);

        // Emit immediately on start
        emitLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => toast.error("Allow location access to enable tracking")
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (emitIntervalRef.current) {
      clearInterval(emitIntervalRef.current);
      emitIntervalRef.current = null;
    }
    setTracking(false);
    setCoords(null);
    setAccuracy(null);
    setEmitCount(0);
    latestCoordsRef.current = null;
    toast.success("Location tracking stopped");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (emitIntervalRef.current) clearInterval(emitIntervalRef.current);
    };
  }, []);

  // Re-bind emitLocation when socket/orderId changes without resetting tracking
  useEffect(() => {
    if (!tracking) return;
    if (emitIntervalRef.current) clearInterval(emitIntervalRef.current);
    emitIntervalRef.current = setInterval(() => {
      if (latestCoordsRef.current) {
        emitLocation(latestCoordsRef.current.lat, latestCoordsRef.current.lng);
      }
    }, EMIT_INTERVAL_MS);
    return () => {
      if (emitIntervalRef.current) clearInterval(emitIntervalRef.current);
    };
  }, [emitLocation, tracking]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Live GPS Tracking</h2>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isConnected ? "Socket connected" : "Disconnected"}
        </div>
      </div>

      {/* Main Tracking Card */}
      <div className={`rounded-2xl border p-6 transition-all ${tracking ? "bg-green-50 dark:bg-green-950/30 border-green-300" : "bg-card"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tracking ? "bg-green-500" : "bg-muted"}`}>
              <Navigation className={`h-6 w-6 ${tracking ? "text-white animate-pulse" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="font-semibold">{tracking ? "Tracking Active" : "Tracking Inactive"}</p>
              <p className="text-sm text-muted-foreground">
                {tracking
                  ? `Broadcasting every ${EMIT_INTERVAL_MS / 1000}s · ${emitCount} updates sent`
                  : "Start to share your location with customers in real-time"}
              </p>
            </div>
          </div>
          <Button
            variant={tracking ? "destructive" : "brand"}
            onClick={tracking ? stopTracking : startTracking}
          >
            {tracking ? "Stop" : "Start Tracking"}
          </Button>
        </div>

        {coords && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-background/70 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Latitude</p>
              <p className="font-mono font-bold text-sm">{coords.lat.toFixed(6)}</p>
            </div>
            <div className="bg-background/70 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Longitude</p>
              <p className="font-mono font-bold text-sm">{coords.lng.toFixed(6)}</p>
            </div>
            {accuracy !== null && (
              <div className="col-span-2 bg-background/70 rounded-xl p-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">GPS Accuracy</p>
                <p className={`text-xs font-semibold ${accuracy < 20 ? "text-green-600" : accuracy < 50 ? "text-yellow-600" : "text-red-600"}`}>
                  ±{Math.round(accuracy)}m {accuracy < 20 ? "(High)" : accuracy < 50 ? "(Medium)" : "(Low)"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Delivery Context */}
      {activeDeliveries && activeDeliveries.length > 0 ? (
        <div className="bg-card border rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-brand" />
            Active Delivery — GPS auto-attached
          </p>
          {activeDeliveries.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span className="font-medium">#{d.order?.orderNumber}</span>
              <span className="text-muted-foreground text-xs">{d.order?.address?.city}</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Out for delivery</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 border border-dashed rounded-xl p-4 text-sm text-muted-foreground text-center">
          No active deliveries. GPS will still broadcast when tracking is on.
        </div>
      )}

      {/* How it works */}
      <div className="bg-card border rounded-xl p-5 space-y-3">
        <p className="font-semibold text-sm">How live tracking works</p>
        <div className="space-y-2.5 text-sm text-muted-foreground">
          {[
            "Your GPS coordinates are emitted to the server via Socket.IO every 5 seconds",
            "Customers tracking their order see your position update live on the map",
            "Coordinates are saved to the backend for non-realtime consumers",
            "Tracking stops automatically when you close this page",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
