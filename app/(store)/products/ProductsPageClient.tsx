"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { adaptProduct } from "@/lib/adapters";
import ProductGrid from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSocket } from "@/providers/SocketProvider";
import type { Product, ProductFilter, PaginatedResponse } from "@/types";
import { ITEMS_PER_PAGE } from "@/constants";

const DEFAULT_SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
];

const DEFAULT_RATINGS = [4, 3, 2, 1];

/**
 * Normalize any paginated API response into PaginatedResponse<T>.
 *
 * Backend can return items under: "products", "data" (array), "items", "results"
 * Meta can be a nested "meta" object OR flat fields "total"/"page"/"limit".
 *
 * IMPORTANT: do NOT early-return on r.meta — the key holding the items
 * may be "products", not "data", so we always extract items first.
 */
function normalizePaginated<T>(raw: unknown): PaginatedResponse<T> {
  const r = raw as Record<string, unknown>;

  // Always extract items first, regardless of whether meta is present
  const items: T[] =
    (r.products as T[] | undefined) ??
    (Array.isArray(r.data) ? (r.data as T[]) : undefined) ??
    (r.items as T[] | undefined) ??
    (r.results as T[] | undefined) ??
    [];

  // Use backend-provided meta if present, otherwise derive from flat fields
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

export default function ProductsPageClient({
  initialProducts,
}: {
  initialProducts?: PaginatedResponse<Product>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [inStock, setInStock] = useState(false);

  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const sortBy = (searchParams.get("sortBy") as ProductFilter["sortBy"]) || "newest";

  const filters: ProductFilter = {
    search, categoryId, sortBy, page, limit: ITEMS_PER_PAGE,
    rating: selectedRating, inStock: inStock || undefined,
  };

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featured-products"] });
    };
    socket.on("product.approved", handler);
    return () => {
      socket.off("product.approved", handler);
    };
  }, [socket, queryClient]);

  // Use server-prefetched data as initialData only for the default unfiltered view
  const isDefaultView =
    !search && !categoryId && sortBy === "newest" && page === 1 &&
    !selectedRating && !inStock;

  const { data, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await productService.getAll(filters);
      const normalized = normalizePaginated<Product>(data.data);
      return { ...normalized, data: normalized.data.map(adaptProduct) };
    },
    initialData: isDefaultView ? initialProducts : undefined,
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      const payload = data.data as any;
      return Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? []) as import("@/types").Category[];
    },
  });

  const { data: filterOptions } = useQuery({
    queryKey: ["product-filter-options"],
    queryFn: async () => {
      try {
        const { data } = await productService.getFilterOptions();
        return data.data;
      } catch {
        return { sortOptions: DEFAULT_SORT_OPTIONS, ratings: DEFAULT_RATINGS };
      }
    },
    staleTime: Infinity,
  });

  const sortOptions = filterOptions?.sortOptions ?? DEFAULT_SORT_OPTIONS;
  const ratingOptions = filterOptions?.ratings ?? DEFAULT_RATINGS;

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedRating(undefined);
    setInStock(false);
    setPage(1);
    router.push("/products");
  };

  const activeFilters: string[] = [
    ...(search ? [`"${search}"`] : []),
    ...(selectedRating ? [`${selectedRating}★+`] : []),
    ...(inStock ? ["In Stock"] : []),
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Rating</h4>
        <div className="space-y-1">
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRating(selectedRating === r ? undefined : r)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedRating === r ? "bg-brand/10 text-brand font-medium" : "hover:bg-muted"
              }`}
            >
              <span>{"★".repeat(r)}{"☆".repeat(5 - r)}</span>
              <span>{r}+ stars</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="rounded border-input"
          />
          <span className="text-sm font-medium">In Stock Only</span>
        </label>
      </div>

      {categories && categories.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Category</h4>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/products?categoryId=${cat.id}`)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  categoryId === cat.id ? "bg-brand/10 text-brand font-medium" : "hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const hasNextPage = data?.meta?.hasNextPage ?? false;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">
            {search ? `Results for "${search}"` : "All Products"}
          </h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {total.toLocaleString("en-IN")} products found
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={updateSort}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mobile filter button */}
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                Filters
                {activeFilters.length > 0 && (
                  <Badge className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-brand">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((f) => (
            <Badge key={f} variant="secondary" className="flex items-center gap-1">
              {f}
              <X className="h-3 w-3 cursor-pointer" onClick={clearFilters} />
            </Badge>
          ))}
          <button onClick={clearFilters} className="text-xs text-brand hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h3>
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="text-xs text-brand hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <ProductGrid products={data?.data} loading={isLoading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline" size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                disabled={!hasNextPage}
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
