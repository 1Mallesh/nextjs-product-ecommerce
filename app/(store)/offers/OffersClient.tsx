"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import ProductGrid from "@/components/product/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, Zap, Gift } from "lucide-react";
import Link from "next/link";

const OFFER_BANNERS = [
  { label: "Under ₹499", icon: Tag, color: "bg-orange-50 border-orange-200 text-orange-700", href: "/products?maxPrice=499" },
  { label: "Flash Deals", icon: Zap, color: "bg-yellow-50 border-yellow-200 text-yellow-700", href: "/products?sort=discount" },
  { label: "New Arrivals", icon: Gift, color: "bg-green-50 border-green-200 text-green-700", href: "/products?sort=newest" },
];

export default function OffersClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["offers-products"],
    queryFn: async () => {
      const { data } = await productService.getAll({ limit: 40, maxPrice: 999 } as never);
      const raw = data?.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object" && "data" in raw) return (raw as unknown as { data: import("@/types").Product[] }).data;
      return [] as import("@/types").Product[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today&apos;s Best Deals</h1>
        <p className="text-muted-foreground">Handpicked offers just for you — updated daily</p>
      </div>

      {/* Offer category chips */}
      <div className="flex flex-wrap gap-3 mb-8">
        {OFFER_BANNERS.map(({ label, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-transform hover:scale-105 ${color}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>

      {/* Promo banner */}
      <div className="bg-gradient-to-r from-brand to-orange-400 rounded-2xl p-6 mb-8 text-white flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">Limited Time Offer</p>
          <h2 className="text-2xl font-bold mt-1">Use code <span className="bg-white/20 px-2 py-0.5 rounded">WELCOME50</span></h2>
          <p className="text-sm opacity-80 mt-1">Get 50% off on your first order</p>
        </div>
        <Gift className="h-16 w-16 opacity-20" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <ProductGrid products={data ?? []} />
      )}
    </div>
  );
}
