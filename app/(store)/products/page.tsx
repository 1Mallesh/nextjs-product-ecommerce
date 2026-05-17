import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsPageClient from "./ProductsPageClient";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch, extractItems } from "@/lib/server-api";
import { adaptProduct } from "@/lib/adapters";
import { ITEMS_PER_PAGE } from "@/constants";
import type { PaginatedResponse, Product } from "@/types";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse thousands of products from top vendors",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Only prefetch for the default landing view (page 1, no filters).
  // When the user applies filters the client-side query takes over with its own fetch.
  let initialProducts: PaginatedResponse<Product> | undefined;

  const hasFilters = sp.search || sp.categoryId || sp.sortBy || sp.maxPrice || sp.minPrice;

  if (!hasFilters) {
    try {
      const res = await serverFetch<any>("/products", {
        page: 1,
        limit: ITEMS_PER_PAGE,
        sortBy: "newest",
      });

      const payload = res.data as Record<string, any>;
      const rawItems = extractItems<Record<string, any>>(payload);
      const items: Product[] = rawItems.map(adaptProduct);
      const total = payload?.total ?? items.length;
      const limit = payload?.limit ?? ITEMS_PER_PAGE;
      const page = payload?.page ?? 1;
      const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

      initialProducts = {
        data: items,
        meta: {
          total,
          limit,
          page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch {
      // Server fetch failed — client will fetch normally with its own loading state
    }
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <ProductsPageClient initialProducts={initialProducts} />
    </Suspense>
  );
}
