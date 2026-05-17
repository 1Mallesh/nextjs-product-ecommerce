"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import ProductGrid from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";

export default function CustomerWishlistPage() {
  const { products } = useAppSelector((s) => s.wishlist);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        <h2 className="text-xl font-bold">My Wishlist ({products.length})</h2>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">Your wishlist is empty</p>
          <p className="text-sm mt-1">Save products you love to buy later</p>
          <Button variant="brand" className="mt-4" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
