"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import ProductGrid from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, ProductFilter, PaginatedResponse } from "@/types";
import { ITEMS_PER_PAGE } from "@/constants";

const PRICE_RANGES = [
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

/**
 * Normalize paginated API response. Backend may return either:
 *   { data: [], meta: { total, totalPages, ... } }          ← typed shape
 *   { data: [], total, page, limit }                         ← flat shape
 * This ensures both produce a consistent PaginatedResponse.
 */
function normalizePaginated<T>(raw: unknown): PaginatedResponse<T> {
  const r = raw as Record<string, unknown>;

  if (r.meta && typeof r.meta === "object") {
    return raw as PaginatedResponse<T>;
  }

  const total = Number(r.total ?? 0);
  const limit = Number(r.limit ?? ITEMS_PER_PAGE);
  const page = Number(r.page ?? 1);
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

  return {
    data: (r.data as T[]) ?? [],
    meta: {
      total,
      limit,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export default function ProductsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
  );
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [inStock, setInStock] = useState(false);

  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const sortBy = (searchParams.get("sortBy") as ProductFilter["sortBy"]) || "newest";

  const filters: ProductFilter = {
    search, categoryId, sortBy, page, limit: ITEMS_PER_PAGE,
    minPrice, maxPrice, rating: selectedRating, inStock: inStock || undefined,
  };

  const { data, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await productService.getAll(filters);
      return normalizePaginated<Product>(data.data);
    },
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      return data.data;
    },
  });

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedRating(undefined);
    setInStock(false);
    setPage(1);
    router.push("/products");
  };

  const activeFilters: string[] = [
    ...(search ? [`"${search}"`] : []),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? [`₹${minPrice ?? 0}–${maxPrice !== undefined ? `₹${maxPrice}` : "∞"}`]
      : []),
    ...(selectedRating ? [`${selectedRating}★+`] : []),
    ...(inStock ? ["In Stock"] : []),
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Price Range</h4>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); setPage(1); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                minPrice === range.min && maxPrice === range.max
                  ? "bg-brand/10 text-brand font-medium"
                  : "hover:bg-muted"
              }`}
            >
              {range.label}
            </button>
          ))}
          <button
            onClick={() => { setMinPrice(undefined); setMaxPrice(undefined); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
          >
            Clear price filter
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
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
              {SORT_OPTIONS.map((opt) => (
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
