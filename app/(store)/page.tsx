import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryRow from "@/components/home/CategoryRow";
import OfferBanner from "@/components/home/OfferBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Below100Section from "@/components/home/Below100Section";
import TrustBadges from "@/components/home/TrustBadges";
import { serverFetch, extractItems } from "@/lib/server-api";
import { adaptProduct } from "@/lib/adapters";

export const metadata: Metadata = {
  title: "TOKOMORT – India's Multi-Vendor Marketplace",
  description: "Shop from thousands of verified vendors. Best prices on electronics, fashion, groceries & more. Free delivery above ₹499. COD available.",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TOKOMORT",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://tokomort.com",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tokomort.com"}/products?search={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
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
        const payload = res?.data;
        const arr = payload?.products ?? (Array.isArray(payload) ? payload : []);
        return arr.map(adaptProduct);
      },
    }),

    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const res = await serverFetch<any>("/categories");
        const payload = res?.data;
        return Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? []);
      },
    }),

    queryClient.prefetchQuery({
      queryKey: ["products-below-100"],
      queryFn: async () => {
        const res = await serverFetch<any>("/products", { maxPrice: 100, limit: 20 });
        const payload = res?.data;
        return extractItems<Record<string, any>>(payload).map(adaptProduct);
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HeroBanner />
      <div className="container mx-auto px-4 space-y-12 py-8">
        <CategoryRow />
        <OfferBanner />
        <FeaturedProducts />
        <Below100Section />
        <TrustBadges />
      </div>
    </HydrationBoundary>
  );
}
