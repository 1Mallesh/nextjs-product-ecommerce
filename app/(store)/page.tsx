import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryRow from "@/components/home/CategoryRow";
import OfferBanner from "@/components/home/OfferBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Below50Section from "@/components/home/Below50Section";
import TrustBadges from "@/components/home/TrustBadges";
import { serverFetch, extractItems } from "@/lib/server-api";
import { adaptProduct } from "@/lib/adapters";

export const metadata: Metadata = {
  title: "TOKOMORT – India's Multi-Vendor Marketplace",
  description: "Shop the best products from top vendors. Free delivery above ₹499.",
};

export default async function HomePage() {
  const queryClient = new QueryClient();

  // Prefetch all home-page data server-side in parallel.
  // Promise.allSettled means a single failed endpoint never breaks the page.
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ["featured-products"],
      queryFn: async () => {
        const res = await serverFetch<any>("/products/featured");
        const payload = res.data;
        const arr =
          payload?.products ??
          (Array.isArray(payload) ? payload : []);
        return arr.map(adaptProduct);
      },
    }),

    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const res = await serverFetch<any>("/categories");
        // res.data can be Category[] directly or { categories: [] }
        const payload = res.data;
        return Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? []);
      },
    }),

    queryClient.prefetchQuery({
      queryKey: ["products-below-50"],
      queryFn: async () => {
        const res = await serverFetch<any>("/products", { maxPrice: 50, limit: 20 });
        const payload = res.data;
        return extractItems<Record<string, any>>(payload).map(adaptProduct);
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HeroBanner />
      <div className="container mx-auto px-4 space-y-12 py-8">
        <CategoryRow />
        <OfferBanner />
        <FeaturedProducts />
        <Below50Section />
        <TrustBadges />
      </div>
    </HydrationBoundary>
  );
}
