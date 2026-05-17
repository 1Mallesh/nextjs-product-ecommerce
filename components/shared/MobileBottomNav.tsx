"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, ShoppingCart, Heart, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCart } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Grid3x3, label: "Categories", href: "/categories" },
  { icon: ShoppingCart, label: "Cart", href: null, action: "cart" },
  { icon: Heart, label: "Wishlist", href: "/wishlist" },
  { icon: User, label: "Account", href: "/auth/login" },
];

export default function MobileBottomNav() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const cartItems = useAppSelector((s) => s.cart.items);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const getHref = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.href === "/auth/login" && isAuthenticated) return "/dashboard/customer";
    return item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-background border-t bottom-nav-safe">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          if (item.action === "cart") {
            return (
              <button
                key="cart"
                onClick={() => dispatch(toggleCart())}
                className="flex flex-col items-center gap-1 p-2 relative"
              >
                <div className="relative">
                  <item.icon className={cn("h-5 w-5", cartItems.length > 0 ? "text-brand" : "text-muted-foreground")} />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
                      {cartItems.length > 9 ? "9+" : cartItems.length}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px]", cartItems.length > 0 ? "text-brand" : "text-muted-foreground")}>
                  Cart
                </span>
              </button>
            );
          }

          const href = getHref(item);
          return (
            <Link
              key={item.label}
              href={href!}
              className="flex flex-col items-center gap-1 p-2"
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-brand" : "text-muted-foreground")} />
              <span className={cn("text-[10px]", isActive ? "text-brand font-medium" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
