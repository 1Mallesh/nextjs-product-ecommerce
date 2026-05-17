"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, CreditCard, Truck, Plus, Check, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { addressService } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { addressSchema, type AddressFormData } from "@/schemas/address.schema";
import { formatPrice } from "@/lib/utils";
import { DELIVERY_SLOTS, INDIAN_STATES } from "@/constants";
import { config } from "@/config";
import type { Address, RazorpayPaymentResponse } from "@/types";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

type PaymentMethod = "RAZORPAY" | "COD";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { items, total, subtotal, deliveryFee } = useAppSelector((s) => s.cart);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");
  const [selectedSlot, setSelectedSlot] = useState("next_day");
  const [addingAddress, setAddingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login?redirect=/checkout");
    if (items.length === 0) router.push("/cart");
  }, [isAuthenticated, items.length, router]);

  const { data: addresses, refetch } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await addressService.getAll();
      return data.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addresses?.length && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) });

  const saveAddress = async (data: AddressFormData) => {
    try {
      const { data: res } = await addressService.create({ ...data, isDefault: false });
      setSelectedAddressId(res.data.id);
      setAddingAddress(false);
      reset();
      refetch();
      toast.success("Address saved");
    } catch {
      toast.error("Failed to save address");
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    setPlacing(true);

    try {
      const { data } = await orderService.create({
        addressId: selectedAddressId,
        paymentMethod,
        deliverySlot: selectedSlot,
      });

      const order = data.data;

      if (paymentMethod === "COD") {
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        router.push(`/orders/${order.id}/success`);
        return;
      }

      // Razorpay payment — create Razorpay order via payments API
      const { data: payData } = await paymentService.createOrder(order.id, order.total);
      const razorpayOrder = payData.data!;
      await loadRazorpay();

      const rzp = new window.Razorpay({
        key: config.razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "TOKOMORT",
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.mobile,
        },
        theme: { color: "#FF6B00" },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            await paymentService.verify(response);
            dispatch(clearCart());
            toast.success("Payment successful! Order placed.");
            router.push(`/orders/${order.id}/success`);
          } catch {
            toast.error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => toast("Payment cancelled"),
        },
      });

      rzp.open();
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-brand" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {addresses?.map((addr: Address) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? "border-brand bg-brand/5"
                      : "border-border hover:border-brand/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{addr.name}</p>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{addr.type}</span>
                        {addr.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} – {addr.pincode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">+91 {addr.mobile}</p>
                    </div>
                    {selectedAddressId === addr.id && (
                      <Check className="h-5 w-5 text-brand shrink-0" />
                    )}
                  </div>
                </div>
              ))}

              {addingAddress ? (
                <form onSubmit={handleSubmit(saveAddress)} className="border rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-sm">Add New Address</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Input {...register("name")} placeholder="Full name" error={errors.name?.message} />
                    <Input {...register("mobile")} placeholder="Mobile number" error={errors.mobile?.message} />
                  </div>
                  <Input {...register("line1")} placeholder="Address line 1" error={errors.line1?.message} />
                  <Input {...register("line2")} placeholder="Address line 2 (optional)" />
                  <div className="grid grid-cols-3 gap-3">
                    <Input {...register("city")} placeholder="City" error={errors.city?.message} />
                    <Input {...register("pincode")} placeholder="Pincode" error={errors.pincode?.message} />
                    <select
                      {...register("state")}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">State</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" variant="brand">Save Address</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setAddingAddress(false)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingAddress(true)}
                  className="w-full py-3 border-2 border-dashed rounded-xl text-sm text-muted-foreground hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Address
                </button>
              )}
            </CardContent>
          </Card>

          {/* Delivery Slot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-brand" />
                Delivery Slot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {DELIVERY_SLOTS.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedSlot === slot.id ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"
                    }`}
                  >
                    <p className="font-semibold text-sm">{slot.label}</p>
                    <p className="text-xs text-muted-foreground">{slot.time}</p>
                    <p className="text-xs font-medium mt-1 text-green-600">
                      {slot.price === 0 ? "FREE" : `+${formatPrice(slot.price)}`}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-brand" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  id: "RAZORPAY" as PaymentMethod,
                  label: "Online Payment",
                  desc: "UPI, Cards, Net Banking, Wallets",
                  emoji: "💳",
                },
                {
                  id: "COD" as PaymentMethod,
                  label: "Cash on Delivery",
                  desc: "Pay when you receive your order",
                  emoji: "💵",
                },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === method.id ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"
                  }`}
                >
                  <span className="text-2xl">{method.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                  {paymentMethod === method.id && <Check className="h-5 w-5 text-brand" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex-1 line-clamp-1 pr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-brand">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                variant="brand"
                className="w-full"
                size="lg"
                disabled={placing || !selectedAddressId}
              >
                {placing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</>
                ) : (
                  paymentMethod === "COD" ? "Place Order (COD)" : `Pay ${formatPrice(total)}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                🔒 Secure checkout. Your info is safe.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
