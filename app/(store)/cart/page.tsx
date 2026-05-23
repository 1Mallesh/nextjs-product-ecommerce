"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import { openLoginModal } from "@/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice, getDeliveryMessage } from "@/lib/utils";
import { useState } from "react";
import api from "@/services/axios";
import toast from "react-hot-toast";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, subtotal, discount, deliveryFee, total } = useAppSelector((s) => s.cart);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal("/checkout"));
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything yet</p>
        <Button variant="brand" asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>

      {/* Free delivery progress */}
      {subtotal < 499 && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
            🚚 {getDeliveryMessage(subtotal)}
          </p>
          <div className="mt-2 bg-orange-200/50 rounded-full h-2">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((subtotal / 499) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, height: 0 }}
                className="flex gap-4 bg-card border rounded-xl p-4"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={item.product.thumbnail || "/placeholder.jpg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={item.product.slug ? `/products/${item.product.slug}` : "/products"} className="font-medium text-sm hover:text-brand transition-colors line-clamp-2">
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sold by: {item.product.vendor?.shopName}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-brand">{formatPrice(item.price)}</span>
                      {item.product.mrp > item.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.product.mrp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                          className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="h-7 w-8 flex items-center justify-center text-sm border-x">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                          className="h-7 w-7 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          dispatch(removeFromCart(item.id));
                          toast.success("Removed from cart");
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-card border rounded-xl p-4">
            <p className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-brand" />
              Apply Coupon
            </p>
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="text-sm uppercase"
              />
              <Button
                size="sm"
                variant="outline"
                loading={couponLoading}
                disabled={!couponCode.trim()}
                onClick={async () => {
                  if (!couponCode.trim()) return;
                  setCouponLoading(true);
                  try {
                    const { data } = await api.post("/coupons/validate", {
                      code: couponCode,
                      orderValue: subtotal,
                    });
                    const disc = data?.data?.discountAmount ?? 0;
                    setAppliedCoupon({ code: couponCode, discount: disc });
                    toast.success(`Coupon applied! You save ₹${disc}`);
                  } catch (err: unknown) {
                    const e = err as { response?: { data?: { message?: string } } };
                    toast.error(e?.response?.data?.message ?? "Invalid or expired coupon");
                    setAppliedCoupon(null);
                  } finally {
                    setCouponLoading(false);
                  }
                }}
              >
                Apply
              </Button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-green-600 mt-2 font-medium">
                ✓ {appliedCoupon.code} applied — saving ₹{appliedCoupon.discount}
              </p>
            )}
          </div>

          {/* Price summary */}
          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-bold mb-4">Price Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Charges</span>
                <span>
                  {deliveryFee === 0
                    ? <span className="text-green-600 font-medium">FREE</span>
                    : formatPrice(deliveryFee)
                  }
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className="text-brand">{formatPrice(total)}</span>
              </div>
              {discount > 0 && (
                <p className="text-green-600 text-xs text-center bg-green-50 dark:bg-green-950/30 py-2 rounded-lg">
                  🎉 You&apos;re saving {formatPrice(discount)} on this order!
                </p>
              )}
            </div>

            <Button onClick={handleCheckout} variant="brand" className="w-full mt-4" size="lg">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
