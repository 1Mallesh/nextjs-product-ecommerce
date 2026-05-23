import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch } from "@/lib/server-api";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await serverFetch<any>(`/products/slug/${slug}`);
    const product = (res as any)?.data ?? res;
    if (!product) return { title: "Product Not Found" };

    const price = product.price ?? product.sellingPrice;
    const image = product.thumbnail ?? product.images?.[0];

    return {
      title: product.name,
      description: product.shortDescription ?? product.description?.substring(0, 155),
      keywords: [product.name, product.category?.name, "buy online", "India", "TOKOMORT"].filter(Boolean),
      openGraph: {
        title: product.name,
        description: product.shortDescription ?? product.description?.substring(0, 155),
        images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.shortDescription ?? product.description?.substring(0, 155),
        images: image ? [image] : [],
      },
    };
  } catch {
    return { title: "Product Details" };
  }
}

async function ProductJsonLd({ slug }: { slug: string }) {
  try {
    const res = await serverFetch<any>(`/products/slug/${slug}`);
    const p = res?.data;
    if (!p) return null;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.description,
      image: p.images ?? (p.thumbnail ? [p.thumbnail] : []),
      sku: p.sku,
      brand: { "@type": "Brand", name: p.vendor?.shopName ?? "TOKOMORT" },
      offers: {
        "@type": "Offer",
        url: `https://tokomort.com/products/${slug}`,
        priceCurrency: "INR",
        price: p.price ?? p.sellingPrice,
        priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        availability: (p.stock ?? p.totalStock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: "TOKOMORT" },
      },
      aggregateRating: p.rating
        ? { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount ?? 1 }
        : undefined,
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <>
      <ProductJsonLd slug={slug} />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      }>
        <ProductDetailClient slug={slug} />
      </Suspense>
    </>
  );
}
