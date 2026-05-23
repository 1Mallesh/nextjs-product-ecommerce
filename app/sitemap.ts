import type { MetadataRoute } from "next";
import { serverFetch } from "@/lib/server-api";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tokomort.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/offers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      serverFetch<any>("/products", { limit: 500, sortBy: "newest" }),
      serverFetch<any>("/categories"),
    ]);

    const products: MetadataRoute.Sitemap =
      productsRes.status === "fulfilled"
        ? (productsRes.value?.data?.products ?? []).map((p: any) => ({
            url: `${BASE_URL}/products/${p.slug}`,
            lastModified: new Date(p.updatedAt ?? p.createdAt ?? Date.now()),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))
        : [];

    const categories: MetadataRoute.Sitemap =
      categoriesRes.status === "fulfilled"
        ? (Array.isArray(categoriesRes.value?.data) ? categoriesRes.value.data : []).map((c: any) => ({
            url: `${BASE_URL}/categories/${c.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))
        : [];

    return [...staticPages, ...products, ...categories];
  } catch {
    return staticPages;
  }
}
