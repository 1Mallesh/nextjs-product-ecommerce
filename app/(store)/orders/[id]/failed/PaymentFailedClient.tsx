"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ShoppingCart, HelpCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useAppSelector } from "@/store/hooks";
import { toast } from "react-hot-toast";
import api from "@/services/axios";

const FAILURE_REASONS: Record<string, string> = {
  BAD_REQUEST_ERROR: "The payment request was malformed. Please try again.",
  GATEWAY_ERROR: "Payment gateway encountered an error. Please retry.",
  BAD_REQUEST_ERROR_PAYMENT_CANCELLED: "You cancelled the payment.",
  PAYMENT_FAILED: "Your payment could not be processed.",
};

export default function PaymentFailedClient({ id }: { id: string }) {
  const router = useRouter();
  const { openCheckout } = useRazorpay();
  const { user } = useAppSelector((s) => s.auth);
  const [retrying, setRetrying] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await orderService.getById(id);
      return data.data;
    },
  });

  // Get failure reason from URL params if present
  const [failureReason, setFailureReason] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code") ?? "";
      setFailureReason(FAILURE_REASONS[code] ?? "Your payment was not completed.");
    }
  }, []);

  const handleRetryPayment = async () => {
    if (!order) return;
    setRetrying(true);
    try {
      // Create a new Razorpay order for retry
      const { data } = await api.post<{ data: { razorpayOrderId: string; amount: number } }>(
        `/orders/${id}/retry-payment`
      );
      const { razorpayOrderId, amount } = data.data;

      await openCheckout({
        razorpayOrderId,
        amount,
        orderNumber: order.orderNumber,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.mobile,
        },
        onSuccess: async (response) => {
          try {
            await api.post(`/orders/${id}/verify-payment`, response);
            toast.success("Payment successful!");
            router.replace(`/orders/${id}/success`);
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        onDismiss: () => {
          setRetrying(false);
          toast("Payment cancelled.");
        },
        onError: (err) => {
          setRetrying(false);
          toast.error(err instanceof Error ? err.message : "Payment failed.");
        },
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Unable to initiate retry. Please contact support.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="text-center"
      >
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        <p className="text-muted-foreground mt-2">{failureReason || "Your payment was not completed."}</p>
        {order && (
          <p className="text-sm font-medium text-muted-foreground mt-1">Order #{order.orderNumber}</p>
        )}
      </motion.div>

      {order && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-4"
        >
          {/* Order Summary */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="p-4 bg-muted/30 border-b">
              <p className="font-semibold">Order Summary</p>
            </div>
            <div className="p-4 space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Failure info */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-700">What happened?</p>
              <p className="text-red-600 mt-1">
                No money has been deducted from your account. Your order is saved and you can
                retry the payment below.
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Attempted on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="brand"
              className="w-full"
              onClick={handleRetryPayment}
              disabled={retrying}
            >
              {retrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Opening Payment...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment — {formatPrice(order.total)}
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild>
                <Link href="/orders">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  My Orders
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">
                  Continue Shopping <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/support">
                <HelpCircle className="h-4 w-4 mr-2" />
                Need help? Contact support
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
