"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import ProductGrid from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { products } = useAppSelector((s) => s.wishlist);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold">My Wishlist ({products.length})</h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-xl font-semibold">Your wishlist is empty</p>
          <p className="text-muted-foreground mt-2">Save products you love for later</p>
          <Button variant="brand" className="mt-6" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
