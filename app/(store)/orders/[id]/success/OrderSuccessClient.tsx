"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Package, MapPin, CreditCard, ChevronRight } from "lucide-react";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";
import confetti from "canvas-confetti";

export default function OrderSuccessClient({ id }: { id: string }) {
  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await orderService.getById(id);
      return data.data;
    },
  });

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FF6B00", "#00A67E", "#3B82F6"],
    });
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="text-center"
      >
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mt-2">Thank you for shopping with TOKOMORT</p>
        {order && (
          <p className="text-sm font-medium text-brand mt-1">Order #{order.orderNumber}</p>
        )}
      </motion.div>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-4"
        >
          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="p-4 bg-muted/30 border-b">
              <p className="font-semibold">Order Details</p>
            </div>
            <div className="p-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total Paid</span>
                <span className="text-brand">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                <CreditCard className="h-3.5 w-3.5" /> Payment
              </p>
              <p className="font-semibold text-sm">{order.paymentMethod}</p>
              <p className={`text-xs mt-0.5 ${order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
                {order.paymentStatus}
              </p>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                <Package className="h-3.5 w-3.5" /> Status
              </p>
              <p className="font-semibold text-sm">{ORDER_STATUS_LABELS[order.status]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {order.address && (
            <div className="bg-card border rounded-xl p-4">
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
            <Button variant="brand" className="flex-1" asChild>
              <Link href={`/orders/${id}/tracking`}>
                Track Order <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
