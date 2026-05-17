"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SlidersHorizontal, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { adaptProduct } from "@/lib/adapters";
import ProductGrid from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ITEMS_PER_PAGE } from "@/constants";
import type { Product, PaginatedResponse } from "@/types";

const PRICE_RANGES = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₹100", min: 0, max: 100 },
  { label: "₹100 – ₹500", min: 100, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: undefined },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
];

function normalizePaginated<T>(raw: unknown): PaginatedResponse<T> {
  const r = raw as Record<string, unknown>;
  // Always extract items first — backend uses "products" key, not "data"
  const items: T[] =
    (r.products as T[] | undefined) ??
    (Array.isArray(r.data) ? (r.data as T[]) : undefined) ??
    (r.items as T[] | undefined) ??
    (r.results as T[] | undefined) ??
    [];
  if (r.meta && typeof r.meta === "object") {
    return { data: items, meta: r.meta as PaginatedResponse<T>["meta"] };
  }
  const total = Number(r.total ?? items.length);
  const limit = Number(r.limit ?? ITEMS_PER_PAGE);
  const page = Number(r.page ?? 1);
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
  return {
    data: items,
    meta: { total, limit, page, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  };
}

export default function CategoryPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [priceIdx, setPriceIdx] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>();

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data } = await categoryService.getBySlug(slug);
      // Backend may return the category directly or nested under a key
      const payload = data.data as any;
      return (payload?.id ? payload : payload?.category ?? payload) as import("@/types").Category;
    },
    staleTime: 60_000,
  });

  const selectedPrice = PRICE_RANGES[priceIdx];

  const { data, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["category-products", slug, category?.id, page, sortBy, priceIdx, ratingFilter],
    queryFn: async () => {
      const { data } = await productService.getAll({
        // Use categoryId if resolved; otherwise pass categorySlug so backend can filter
        ...(category?.id ? { categoryId: category.id } : { categorySlug: slug } as any),
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: sortBy as never,
        minPrice: selectedPrice.min,
        maxPrice: selectedPrice.max,
        rating: ratingFilter,
      });
      const normalized = normalizePaginated<Product>(data.data);
      return { ...normalized, data: normalized.data.map(adaptProduct) };
    },
    // Fire once we have the category ID OR immediately with slug fallback
    enabled: true,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-brand flex items-center gap-1">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/categories" className="hover:text-brand">Categories</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{category?.name ?? slug}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{category?.name ?? slug}</h1>
          {category?.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
          )}
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              {total.toLocaleString("en-IN")} products
            </p>
          )}
        </div>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 bg-card border rounded-xl p-4 space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h4>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Price Range</h4>
              <div className="space-y-1">
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={range.label}
                    onClick={() => { setPriceIdx(i); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      priceIdx === i ? "bg-brand/10 text-brand font-medium" : "hover:bg-muted"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Rating</h4>
              <div className="space-y-1">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRatingFilter(ratingFilter === r ? undefined : r)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      ratingFilter === r ? "bg-brand/10 text-brand font-medium" : "hover:bg-muted"
                    }`}
                  >
                    <span>{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
                    <span>{r}+ stars</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          <ProductGrid products={data?.data} loading={isLoading} />

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!data?.meta?.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
