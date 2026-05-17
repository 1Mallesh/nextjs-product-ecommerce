"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

export default function Below50Section() {
  const { data, isLoading } = useQuery({
    queryKey: ["products-below-50"],
    queryFn: async () => {
      const { data } = await productService.getBelow50();
      return data.data?.data ?? data.data ?? [];
    },
  });

  if (!isLoading && !data?.length) return null;

  return (
    <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Tag className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-green-800 dark:text-green-300">
              Under ₹50 Deals
            </h2>
            <p className="text-xs text-green-600 dark:text-green-400">
              Amazing products at pocket-friendly prices
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100" asChild>
          <Link href="/products?maxPrice=50">View all</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
      </div>
    </section>
  );
}
