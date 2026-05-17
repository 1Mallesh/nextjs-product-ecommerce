import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse thousands of products from top vendors",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    }>
      <ProductsPageClient />
    </Suspense>
  );
}
