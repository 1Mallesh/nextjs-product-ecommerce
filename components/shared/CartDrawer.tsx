"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartOpen } from "@/store/slices/uiSlice";
import { removeFromCart as removeItem, updateQuantity as updateQty } from "@/store/slices/cartSlice";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { openLoginModal } from "@/store/slices/uiSlice";

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartOpen = useAppSelector((s) => s.ui.cartOpen);
  const { items, subtotal, discount, deliveryFee, total } = useAppSelector((s) => s.cart);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const handleCheckout = () => {
    dispatch(setCartOpen(false));
    if (!isAuthenticated) {
      dispatch(openLoginModal("/checkout"));
      return;
    }
    router.push("/checkout");
  };

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => dispatch(setCartOpen(open))}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand" />
            My Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Your cart is empty</p>
              <p className="text-muted-foreground text-sm mt-1">Add items to get started</p>
            </div>
            <Button
              variant="brand"
              onClick={() => {
                dispatch(setCartOpen(false));
                router.push("/products");
              }}
            >
              Shop Now
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border shrink-0">
                    <Image
                      src={item.product.thumbnail || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm text-brand">
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dispatch(updateQty({ id: item.id, quantity: item.quantity - 1 }))}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQty({ id: item.id, quantity: item.quantity + 1 }))}
                          className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => dispatch(removeItem(item.id))}
                          className="h-6 w-6 rounded border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t px-4 py-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryFee === 0 ? <span className="text-green-600">FREE</span> : formatPrice(deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-brand">{formatPrice(total)}</span>
                </div>
              </div>

              <Button onClick={handleCheckout} variant="brand" className="w-full" size="lg">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>

              <button
                onClick={() => dispatch(setCartOpen(false))}
                className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
