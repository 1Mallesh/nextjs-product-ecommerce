"use client";

import { useQuery } from "@tanstack/react-query";
import { Tag, Package } from "lucide-react";
import { productService } from "@/services/product.service";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export default function VendorOffersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor-offers"],
    queryFn: async () => {
      const { data } = await productService.getVendorProducts({} as never);
      const raw = data?.data;
      if (Array.isArray(raw)) return raw as Product[];
      if (raw && typeof raw === "object" && "data" in raw) return (raw as { data: Product[] }).data;
      return [] as Product[];
    },
  });

  const products = Array.isArray(data) ? data : [];
  // Products with a discount (mrp > price)
  const onSale = products.filter((p) => p.mrp && p.mrp > p.price);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Offers & Discounts</h2>
      </div>

      <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 text-sm text-muted-foreground">
        <p>Set a selling price lower than the MRP when creating or editing a product to automatically show a discount badge to customers.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !onSale.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No products on sale</p>
          <p className="text-sm mt-1">Edit a product and set price lower than MRP to create an offer</p>
        </div>
      ) : (
        <div className="space-y-2">
          {onSale.map((product) => {
            const discount = product.mrp
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
              : 0;
            return (
              <div key={product.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-brand">{formatPrice(product.price)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp ?? 0)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                    {discount}% OFF
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && products.length > 0 && onSale.length === 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-3 text-muted-foreground">All your products (not on sale):</p>
          <div className="space-y-2">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
                <Package className="h-8 w-8 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
