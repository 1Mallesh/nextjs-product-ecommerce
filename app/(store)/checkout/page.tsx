"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, CreditCard, Truck, Plus, Check, Loader2, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { addressService } from "@/services/address.service";
import { orderService, SLOT_TO_DELIVERY_TYPE } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { addressSchema, type AddressFormData } from "@/schemas/address.schema";
import { formatPrice } from "@/lib/utils";
import { DELIVERY_SLOTS, INDIAN_STATES } from "@/constants";
import type { Address } from "@/types";
import toast from "react-hot-toast";

type PaymentMethod = "RAZORPAY" | "COD";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { items, total, subtotal, deliveryFee } = useAppSelector((s) => s.cart);
  const { openCheckout } = useRazorpay();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY");
  const [selectedSlot, setSelectedSlot] = useState("next_day");
  const [addingAddress, setAddingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login?redirect=/checkout");
    if (items.length === 0) router.push("/cart");
  }, [isAuthenticated, items.length, router]);

  // ─── Addresses ──────────────────────────────────────────────────────────────

  const { data: addresses, refetch } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await addressService.getAll();
      const payload = data.data as unknown;
      if (Array.isArray(payload)) return payload as Address[];
      const p = payload as Record<string, unknown>;
      return (p?.addresses ?? p?.data ?? []) as Address[];
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addresses?.length && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  // ─── Address form ────────────────────────────────────────────────────────────

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const labelValue = watch("label");

  const saveAddress = async (data: AddressFormData) => {
    try {
      const { data: res } = await addressService.create({
        ...data,
        isDefault: !addresses?.length,
      });
      setSelectedAddressId(res.data.id);
      setAddingAddress(false);
      reset();
      await refetch();
      toast.success("Address saved!");
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string | string[] } } };
      const status = e.response?.status;
      const msg = e.response?.data?.message;
      const detail = Array.isArray(msg) ? msg.join(" · ") : msg;
      if (status === 401) toast.error("Session expired — please log in again.");
      else if (status === 400) toast.error(detail || "Please check all address fields.");
      else toast.error(detail || "Failed to save address.");
    }
  };

  // ─── Place order ─────────────────────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    setPlacing(true);

    try {
      // 1 ▸ Map cart → order items
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        ...(item.variant?.id ? { variantId: item.variant.id } : {}),
        quantity: item.quantity,
      }));

      // 2 ▸ Create order
      const { data: orderRes } = await orderService.create({
        addressId: selectedAddressId,
        paymentMethod,
        items: orderItems,
        deliveryType: SLOT_TO_DELIVERY_TYPE[selectedSlot] ?? "STANDARD",
      });

      const order = orderRes.data;

      // 3 ▸ COD → done immediately
      if (paymentMethod === "COD") {
        dispatch(clearCart());
        toast.success("Order placed! You'll pay on delivery.");
        router.push(`/orders/${order.id}/success`);
        return;
      }

      // 4 ▸ Razorpay — create payment intent on backend THEN open checkout
      const { data: payRes } = await paymentService.createOrder(order.id);
      const rzpOrder = payRes.data!;

      await openCheckout({
        razorpayOrderId: rzpOrder.razorpayOrderId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency ?? "INR",
        orderNumber: order.orderNumber,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.mobile,
        },
        onSuccess: async (response) => {
          try {
            await paymentService.verify({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            dispatch(clearCart());
            toast.success("Payment successful! Order confirmed.");
            router.push(`/orders/${order.id}/success`);
          } catch {
            toast.error("Payment received but verification failed. Contact support with your order ID.");
          }
        },
        onDismiss: () => {
          toast("Payment cancelled. Your order is saved — you can pay later from My Orders.");
          setPlacing(false);
        },
        onError: (err) => {
          console.error("Razorpay error:", err);
          toast.error("Payment window failed to open. Please try again.");
          setPlacing(false);
        },
      });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string | string[] } } };
      const status = e.response?.status;
      const msg = e.response?.data?.message;
      const detail = Array.isArray(msg) ? msg.join(" · ") : msg;
      if (status === 401) toast.error("Session expired — please log in again.");
      else if (status === 400) toast.error(detail || "Order validation failed. Check your cart and address.");
      else if (status === 404) toast.error("One or more products are no longer available.");
      else if (!status) toast.error("Network error — check your connection.");
      else toast.error(detail || "Failed to place order. Please try again.");
      setPlacing(false);
    }
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* ── Delivery Address ─────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-brand" /> Delivery Address
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{addr.fullName}</p>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`},{" "}
                        {addr.city}, {addr.state} – {addr.pincode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">📞 +91 {addr.phone}</p>
                    </div>
                    {selectedAddressId === addr.id && <Check className="h-5 w-5 text-brand shrink-0 mt-1" />}
                  </div>
                </div>
              ))}

              {/* Add address form */}
              {addingAddress ? (
                <form onSubmit={handleSubmit(saveAddress)} className="border rounded-xl p-4 space-y-3 bg-muted/30">
                  <h4 className="font-semibold text-sm">Add New Address</h4>

                  {/* Label presets */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Label *</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {["Home", "Work", "Other"].map((l) => (
                        <button
                          key={l} type="button"
                          onClick={() => setValue("label", l, { shouldValidate: true })}
                          className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                            labelValue === l
                              ? "border-brand bg-brand/10 text-brand"
                              : "border-border hover:border-brand/40"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                      <Input
                        {...register("label")}
                        placeholder="Custom label"
                        className="flex-1 min-w-[120px] h-8 text-xs"
                        error={errors.label?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input {...register("fullName")} placeholder="Full name *" error={errors.fullName?.message} />
                    <Input {...register("phone")} placeholder="Mobile number *" maxLength={10} error={errors.phone?.message} />
                  </div>
                  <Input {...register("addressLine1")} placeholder="Flat/House No., Street *" error={errors.addressLine1?.message} />
                  <Input {...register("addressLine2")} placeholder="Area, Landmark (optional)" />
                  <div className="grid grid-cols-3 gap-3">
                    <Input {...register("city")} placeholder="City *" error={errors.city?.message} />
                    <Input {...register("pincode")} placeholder="Pincode *" maxLength={6} error={errors.pincode?.message} />
                    <select {...register("state")} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">State *</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" variant="brand">Save Address</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setAddingAddress(false); reset(); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingAddress(true)}
                  className="w-full py-3 border-2 border-dashed rounded-xl text-sm text-muted-foreground hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </button>
              )}
            </CardContent>
          </Card>

          {/* ── Delivery Slot ────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4 text-brand" /> Delivery Slot
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

          {/* ── Payment Method ───────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-brand" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { id: "RAZORPAY" as PaymentMethod, label: "Pay Online", desc: "UPI · Cards · Net Banking · Wallets", emoji: "💳" },
                { id: "COD" as PaymentMethod, label: "Cash on Delivery", desc: "Pay when you receive your order", emoji: "💵" },
              ] as const).map((method) => (
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
                  {paymentMethod === method.id && <Check className="h-5 w-5 text-brand shrink-0" />}
                </div>
              ))}

              {paymentMethod === "RAZORPAY" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  Secured by Razorpay · 256-bit SSL encryption · PCI DSS compliant
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Order Summary ────────────────────────────────────────────────── */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm gap-2">
                    <span className="text-muted-foreground flex-1 line-clamp-2 leading-tight">
                      {item.product.name}
                      {item.variant && <span className="text-xs ml-1">({item.variant.name})</span>}
                      <span className="ml-1 text-xs">× {item.quantity}</span>
                    </span>
                    <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
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
                disabled={placing || !selectedAddressId || !items.length}
              >
                {placing ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                ) : paymentMethod === "COD" ? (
                  "Place Order (Pay on Delivery)"
                ) : (
                  `Pay ${formatPrice(total)} via Razorpay`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                Secure checkout · Your data is protected
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
