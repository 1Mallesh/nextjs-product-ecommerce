"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Wallet, Truck, MapPin, ToggleLeft, ToggleRight, Navigation, Clock, XCircle, ShieldCheck } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
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
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [enteredOtp, setEnteredOtp] = useState("");

  useEffect(() => {
    if (!socket) return;
    const onAssigned = (data: { orderNumber?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
      toast.success(`New order assigned: #${data?.orderNumber ?? "Order"}`);
    };
    socket.on("notification", onAssigned);
    socket.on("order-status-update", onAssigned);
    socket.on("delivery.assigned", onAssigned);
    return () => {
      socket.off("notification", onAssigned);
      socket.off("order-status-update", onAssigned);
      socket.off("delivery.assigned", onAssigned);
    };
  }, [socket, queryClient]);

  const { data: profile } = useQuery({
    queryKey: ["delivery-profile"],
    queryFn: async () => {
      const { data } = await deliveryService.getProfile();
      return data.data;
    },
  });

  const { data: assignedDeliveries } = useQuery({
    queryKey: ["delivery-assigned"],
    queryFn: async () => {
      const { data } = await deliveryService.getAssigned();
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : (payload?.deliveries ?? [])) as any[];
    },
    staleTime: 0,
    refetchInterval: 15_000,
  });

  const toggleMutation = useMutation({
    mutationFn: () => deliveryService.toggleAvailability(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-profile"] });
      toast.success(profile?.isAvailable ? "You are now offline" : "You are now online");
    },
  });

  // GPS location tracking & emitter
  useEffect(() => {
    if (!locationTracking || !socket) return;

    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          deliveryService.updateLocation(pos.coords.latitude, pos.coords.longitude);
          socket.emit("location-update", {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => toast.error("Location access denied"),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [locationTracking, socket]);

  const handleStatusUpdate = async (deliveryId: string, action: "PICKED_UP" | "DELIVERED") => {
    try {
      await deliveryService.updateDeliveryStatus(deliveryId, action);
      queryClient.invalidateQueries({ queryKey: ["delivery-assigned"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-profile"] });
      toast.success(`Delivery status updated to ${action}`);
    } catch {
      toast.error("Failed to update delivery status");
    }
  };

  const handleDeliverClick = (delivery: any) => {
    setSelectedDelivery(delivery);
    setEnteredOtp("");
    setOtpModalOpen(true);
  };

  const handleVerifyOtp = () => {
    if (!selectedDelivery?.order) return;
    const expectedOtp = selectedDelivery.order.orderNumber ? selectedDelivery.order.orderNumber.slice(-4) : "1234";

    if (enteredOtp === expectedOtp) {
      setOtpModalOpen(false);
      handleStatusUpdate(selectedDelivery.id, "DELIVERED");
    } else {
      toast.error("Invalid Delivery Verification OTP! Try again.");
    }
  };

  const approvalStatus = (profile as any)?.approvalStatus ?? (profile as any)?.status;

  if (approvalStatus && approvalStatus !== "APPROVED") {
    const isPending = approvalStatus === "PENDING" || approvalStatus === "UNDER_REVIEW";
    const isRejected = approvalStatus === "REJECTED" || approvalStatus === "SUSPENDED";

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center space-y-4">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto ${
            isPending ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-red-100 dark:bg-red-900/30"
          }`}>
            {isPending ? <Clock className="h-10 w-10 text-yellow-600" /> : <XCircle className="h-10 w-10 text-destructive" />}
          </div>
          <h2 className="text-xl font-bold">
            {isPending ? "Application Under Review" : "Application Rejected"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isPending
              ? "Our team is verifying your documents and KYC details. This usually takes 1–2 business days. You'll receive an email once approved."
              : `Your application was not approved. Reason: ${(profile as any)?.rejectionReason ?? "Does not meet requirements"}. Please contact support.`
            }
          </p>
        </div>
      </div>
    );
  }

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
            {profile?.isAvailable ? "You are active and ready for delivery requests" : "Toggle to start accepting deliveries"}
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
      <div className="bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Navigation className={`h-5 w-5 ${locationTracking ? "text-brand animate-pulse" : "text-muted-foreground"}`} />
          <div>
            <p className="text-sm font-medium">GPS Location Tracking</p>
            <p className="text-xs text-muted-foreground">Share real-time coordinates with buyers</p>
          </div>
        </div>
        <Button
          size="sm"
          variant={locationTracking ? "destructive" : "brand"}
          onClick={() => {
            if (!locationTracking) {
              navigator.geolocation.getCurrentPosition(
                () => { setLocationTracking(true); toast.success("Real-time GPS tracking active"); },
                () => toast.error("Please grant location permission")
              );
            } else {
              setLocationTracking(false);
              toast.success("Location tracking paused");
            }
          }}
        >
          {locationTracking ? "Stop Sharing" : "Share GPS"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Earnings"
          value={formatPrice(profile?.totalEarnings || 0)}
          icon={Wallet}
          color="green"
        />
        <StatCard
          title="Deliveries Completed"
          value={profile?.totalDeliveries || 0}
          icon={Truck}
          color="brand"
        />
        <StatCard
          title="Assigned Orders"
          value={assignedDeliveries?.filter(d => !d.deliveredAt).length ?? 0}
          icon={Package}
          color="blue"
        />
      </div>

      {/* Assigned deliveries */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Assigned Shipments</h3>
        </div>
        <div className="divide-y">
          {!assignedDeliveries?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No assigned shipments currently</p>
            </div>
          ) : (
            assignedDeliveries.map((delivery: any) => {
              const order = delivery.order;
              if (!order) return null;

              return (
                <div key={delivery.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Assigned {formatDate(delivery.assignedAt || delivery.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-extrabold text-sm">{formatPrice(order.totalAmount)}</span>
                      <Badge className="text-[10px]" variant="outline">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  </div>

                  {order.address && (
                    <div className="bg-muted/40 rounded-lg p-2.5 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Destination</p>
                      <p className="text-xs font-medium text-foreground">{order.address.fullName} ({order.address.phone})</p>
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand mt-0.5" />
                        <span>{order.address.addressLine1}, {order.address.city}, {order.address.pincode}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!delivery.pickedUpAt && (
                      <Button size="sm" variant="brand" className="h-8" onClick={() => handleStatusUpdate(delivery.id, "PICKED_UP")}>
                        Mark Picked Up
                      </Button>
                    )}
                    {delivery.pickedUpAt && !delivery.deliveredAt && (
                      <Button size="sm" variant="brand" className="h-8" onClick={() => handleDeliverClick(delivery)}>
                        Verify & Deliver
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8" onClick={() => {
                      if (order.address?.latitude && order.address?.longitude) {
                        window.open(`https://maps.google.com/?q=${order.address.latitude},${order.address.longitude}`, "_blank");
                      } else {
                        window.open(`https://maps.google.com/?q=${order.address.addressLine1}, ${order.address.city}`, "_blank");
                      }
                    }}>
                      Navigate Address
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Premium Verification OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <ShieldCheck className="h-12 w-12 text-brand mx-auto animate-bounce" />
              <h3 className="text-lg font-bold">Delivery Verification</h3>
              <p className="text-xs text-muted-foreground">Ask the customer for their 4-digit Delivery OTP shown on their order tracking page.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                maxLength={4}
                placeholder="Enter 4-Digit OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-widest text-2xl font-extrabold py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-muted/50"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setOtpModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="brand" className="flex-1" onClick={handleVerifyOtp} disabled={enteredOtp.length !== 4}>
                  Verify & Complete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
