"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function DeliveryLiveTrackingPage() {
  const [tracking, setTracking] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!tracking) return;

    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          toast.error("Location access denied");
          setTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Live Tracking</h2>

      <div className={`rounded-2xl border p-6 ${tracking ? "bg-green-50 dark:bg-green-950/30 border-green-200" : "bg-card"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className={`h-6 w-6 ${tracking ? "text-green-600 animate-pulse" : "text-muted-foreground"}`} />
            <div>
              <p className="font-semibold">{tracking ? "Tracking Active" : "Tracking Inactive"}</p>
              <p className="text-sm text-muted-foreground">
                {tracking ? "Your location is being shared" : "Start tracking to share your location with customers"}
              </p>
            </div>
          </div>
          <Button
            variant={tracking ? "destructive" : "brand"}
            onClick={() => {
              if (!tracking) {
                navigator.geolocation.getCurrentPosition(
                  () => { setTracking(true); toast.success("Location tracking started"); },
                  () => toast.error("Allow location access to enable tracking")
                );
              } else {
                setTracking(false);
                setCoords(null);
                toast.success("Location tracking stopped");
              }
            }}
          >
            {tracking ? "Stop" : "Start Tracking"}
          </Button>
        </div>

        {coords && (
          <div className="mt-4 p-3 bg-background/60 rounded-lg text-xs font-mono text-muted-foreground">
            Lat: {coords.lat.toFixed(6)} · Lng: {coords.lng.toFixed(6)}
          </div>
        )}
      </div>

      <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-40" />
        <p className="font-medium">Map view coming soon</p>
        <p className="text-sm mt-1">Interactive map with real-time delivery routes</p>
      </div>
    </div>
  );
}
