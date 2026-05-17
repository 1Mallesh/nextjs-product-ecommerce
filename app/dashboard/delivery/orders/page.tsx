"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, MapPin, KeyRound, Camera, CheckCircle2, XCircle, Phone, Navigation } from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import { useSocket } from "@/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import api from "@/services/axios";
import toast from "react-hot-toast";

const STATUS_TABS = ["ALL", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

const NEXT_STATUS: Record<string, { label: string; status: string }> = {
  ASSIGNED: { label: "Accept & Pick Up", status: "PICKED_UP" },
  PICKED_UP: { label: "Mark In Transit", status: "IN_TRANSIT" },
  IN_TRANSIT: { label: "Out for Delivery", status: "OUT_FOR_DELIVERY" },
};

export default function DeliveryOrdersPage() {
  const [filter, setFilter] = useState("ALL");
  const [otpModal, setOtpModal] = useState<{ deliveryId: string; orderId: string; orderNumber: string } | null>(null);
  const [proofModal, setProofModal] = useState<{ deliveryId: string; orderNumber: string } | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const refresh = (data: { orderNumber?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      if (data?.orderNumber) toast.success(`Order #${data.orderNumber} updated`);
    };
    socket.on("order-status-update", refresh);
    socket.on("delivery.assigned", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      toast(`New delivery assigned: #${data?.orderNumber ?? ""}`, { icon: "🚴" });
    });
    return () => {
      socket.off("order-status-update", refresh);
      socket.off("delivery.assigned", refresh);
    };
  }, [socket, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ["delivery-all-orders", filter],
    queryFn: async () => {
      const { data } = await deliveryService.getAssigned(filter !== "ALL" ? { status: filter } : undefined);
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : payload?.deliveries ?? []) as any[];
    },
    staleTime: 0,
    refetchInterval: 30_000,
  });

  const deliveries = data ?? [];

  const handleStatusUpdate = async (deliveryId: string, status: string) => {
    try {
      await deliveryService.updateDeliveryStatus(deliveryId, status);
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleReject = async (deliveryId: string) => {
    try {
      await api.post(`/delivery/deliveries/${deliveryId}/reject`);
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      toast.success("Delivery rejected");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const handleOtpVerify = async () => {
    if (!otpModal || !otpInput.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/delivery/deliveries/${otpModal.deliveryId}/verify-otp`, { otp: otpInput });
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      toast.success("OTP verified — order marked delivered!");
      setOtpModal(null);
      setOtpInput("");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofUpload = async () => {
    if (!proofModal || !proofFile) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("proof", proofFile);
      await api.post(`/delivery/deliveries/${proofModal.deliveryId}/proof`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      toast.success("Proof uploaded successfully");
      setProofModal(null);
      setProofFile(null);
      setProofPreview(null);
    } catch {
      toast.error("Failed to upload proof");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Deliveries</h2>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              filter === s ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "ALL" ? "All" : ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS] ?? s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !deliveries.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No deliveries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery: any) => {
            const order = delivery.order;
            if (!order) return null;
            const isAssigned = delivery.status === "ASSIGNED" || order.status === "ASSIGNED";
            const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";
            const isDelivered = order.status === "DELIVERED";
            const next = NEXT_STATUS[order.status];

            return (
              <div key={delivery.id} className={`bg-card border rounded-xl p-4 space-y-3 ${isAssigned ? "border-brand/40 bg-brand/5" : ""}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{formatPrice(order.total)}</span>
                    <Badge className={ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-800"} variant="outline">
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
                    </Badge>
                  </div>
                </div>

                {order.address && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-brand mt-0.5 shrink-0" />
                    <span>
                      {order.address.fullName} · {order.address.addressLine1}
                      {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}, {order.address.city} – {order.address.pincode}
                    </span>
                  </div>
                )}

                {order.customer && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {order.customer.name} · {order.customer.phone ?? order.customer.mobile ?? "–"}
                  </div>
                )}

                {/* Delivery OTP display — show when out for delivery */}
                {isOutForDelivery && delivery.deliveryOtp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-amber-800">Customer Delivery OTP</p>
                      <p className="text-xs text-amber-700 mt-0.5">Ask customer for this OTP to confirm delivery</p>
                    </div>
                    <p className="text-2xl font-black text-amber-700 tracking-widest">{delivery.deliveryOtp}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {/* Accept/Reject for new assignments */}
                  {isAssigned && (
                    <>
                      <Button size="sm" variant="brand" className="h-7 text-xs gap-1"
                        onClick={() => handleStatusUpdate(delivery.id, "PICKED_UP")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accept & Pick Up
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(delivery.id)}>
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}

                  {/* Progress status (PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY) */}
                  {next && !isAssigned && (
                    <Button size="sm" variant="brand" className="h-7 text-xs"
                      onClick={() => handleStatusUpdate(delivery.id, next.status)}>
                      {next.label}
                    </Button>
                  )}

                  {/* OTP Verify for "OUT_FOR_DELIVERY" */}
                  {isOutForDelivery && (
                    <Button size="sm" variant="brand" className="h-7 text-xs gap-1"
                      onClick={() => setOtpModal({ deliveryId: delivery.id, orderId: order.id, orderNumber: order.orderNumber })}>
                      <KeyRound className="h-3.5 w-3.5" /> Verify OTP & Deliver
                    </Button>
                  )}

                  {/* Upload proof (for delivered orders without proof) */}
                  {isDelivered && !delivery.proofImageUrl && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => setProofModal({ deliveryId: delivery.id, orderNumber: order.orderNumber })}>
                      <Camera className="h-3.5 w-3.5" /> Upload Proof
                    </Button>
                  )}

                  {/* Navigate */}
                  {!isDelivered && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => {
                        const addr = order.address;
                        const query = addr?.lat && addr?.lng
                          ? `${addr.lat},${addr.lng}`
                          : `${addr?.addressLine1 ?? ""}, ${addr?.city ?? ""}`;
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(query)}`, "_blank");
                      }}>
                      <Navigation className="h-3.5 w-3.5" /> Navigate
                    </Button>
                  )}
                </div>

                {/* Proof image thumbnail if uploaded */}
                {delivery.proofImageUrl && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Proof uploaded
                    <a href={delivery.proofImageUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* OTP Verification Modal */}
      {otpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="h-7 w-7 text-brand" />
              </div>
              <h3 className="font-bold text-lg">Verify Delivery OTP</h3>
              <p className="text-sm text-muted-foreground mt-1">Order #{otpModal.orderNumber}</p>
              <p className="text-xs text-muted-foreground">Ask the customer for their 4-digit OTP</p>
            </div>

            <input
              type="number"
              placeholder="Enter 4-digit OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.slice(0, 4))}
              className="w-full text-center text-2xl font-bold tracking-widest border rounded-xl p-3 bg-background focus:outline-none focus:ring-2 focus:ring-brand"
              maxLength={4}
            />

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setOtpModal(null); setOtpInput(""); }}>
                Cancel
              </Button>
              <Button variant="brand" className="flex-1" onClick={handleOtpVerify} disabled={otpInput.length !== 4 || submitting}>
                {submitting ? "Verifying..." : "Confirm Delivery"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Upload Modal */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <Camera className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg">Upload Delivery Proof</h3>
              <p className="text-sm text-muted-foreground mt-1">Order #{proofModal.orderNumber}</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setProofFile(file);
                setProofPreview(URL.createObjectURL(file));
              }}
            />

            {proofPreview ? (
              <div className="relative">
                <img src={proofPreview} alt="Proof preview" className="w-full h-48 object-cover rounded-xl" />
                <button className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                  onClick={() => { setProofFile(null); setProofPreview(null); }}>
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-brand hover:text-brand transition-colors"
              >
                <Camera className="h-8 w-8" />
                <span className="text-sm font-medium">Tap to take photo</span>
                <span className="text-xs">or choose from gallery</span>
              </button>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setProofModal(null); setProofFile(null); setProofPreview(null); }}>
                Cancel
              </Button>
              <Button variant="brand" className="flex-1" onClick={handleProofUpload} disabled={!proofFile || submitting}>
                {submitting ? "Uploading..." : "Upload Proof"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
