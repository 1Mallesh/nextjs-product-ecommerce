"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { adaptProduct } from "@/lib/adapters";
import ProductGrid from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, PaginatedResponse } from "@/types";
import { ITEMS_PER_PAGE } from "@/constants";

function normalizePaginated<T>(raw: unknown): PaginatedResponse<T> {
  const r = raw as Record<string, unknown>;
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

  const { data: sortOptions } = useQuery({
    queryKey: ["product-filter-options"],
    queryFn: async () => {
      try {
        const { data } = await productService.getFilterOptions();
        return data.data?.sortOptions ?? [];
      } catch {
        return [
          { value: "newest", label: "Newest First" },
          { value: "popular", label: "Most Popular" },
          { value: "price_asc", label: "Price: Low to High" },
          { value: "price_desc", label: "Price: High to Low" },
          { value: "rating", label: "Best Rating" },
        ];
      }
    },
    staleTime: Infinity,
  });

  const { data: category, isLoading: catLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data } = await categoryService.getBySlug(slug);
      return data.data;
    },
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["category-products", slug, page, sortBy],
    queryFn: async () => {
      const { data } = await productService.getAll({
        categoryId: category?.id,
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: sortBy as any,
      });
      const normalized = normalizePaginated<Product>(data.data);
      return { ...normalized, data: normalized.data.map(adaptProduct) };
    },
    enabled: !!category?.id,
  });

  const total = productsData?.meta?.total ?? 0;
  const totalPages = productsData?.meta?.totalPages ?? 1;
  const hasNextPage = productsData?.meta?.hasNextPage ?? false;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-foreground">Categories</Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {catLoading ? <Skeleton className="h-4 w-20 inline-block" /> : category?.name}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          {catLoading ? (
            <Skeleton className="h-8 w-48 mb-2" />
          ) : (
            <h1 className="text-2xl font-bold">{category?.name}</h1>
          )}
          {category?.description && (
            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          )}
          {!productsLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {total.toLocaleString("en-IN")} products
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(sortOptions ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sub-categories from backend */}
      {category?.children && category.children.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="px-3 py-1.5 rounded-full border text-sm hover:border-brand hover:text-brand transition-colors"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products fetched from backend by categoryId */}
      <ProductGrid products={productsData?.data} loading={catLoading || productsLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
