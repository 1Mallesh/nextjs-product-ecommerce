"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, AlertTriangle, Search } from "lucide-react";
import { productService } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import api from "@/services/axios";
import toast from "react-hot-toast";
import type { Product } from "@/types";

export default function VendorStockPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-stock", search],
    queryFn: async () => {
      const { data } = await productService.getVendorProducts({ search } as never);
      const raw = data?.data;
      if (Array.isArray(raw)) return raw as Product[];
      if (raw && typeof raw === "object" && "data" in raw) return (raw as { data: Product[] }).data;
      return [] as Product[];
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => {
      const form = new FormData();
      form.append("stock", String(stock));
      return api.patch(`/products/${id}/stock`, { stock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-stock"] });
      toast.success("Stock updated");
      setEditingId(null);
    },
    onError: () => toast.error("Failed to update stock"),
  });

  const products = Array.isArray(data) ? data : [];
  const lowStockProducts = products.filter((p) => (p.stock ?? 0) <= 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Stock Management</h2>
        {lowStockProducts.length > 0 && (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {lowStockProducts.length} low stock
          </Badge>
        )}
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {lowStockProducts.length} product(s) are running low on stock
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStockProducts.map((p) => (
              <span key={p.id} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                {p.name} ({p.stock ?? 0} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !products.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No products found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const stock = product.stock ?? 0;
            const isLow = stock <= 5;
            const isEditing = editingId === product.id;

            return (
              <div key={product.id} className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${isLow ? "border-red-200" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {product.sku ?? "—"}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(Number(e.target.value))}
                        className="w-20 h-8 text-sm"
                        min={0}
                      />
                      <Button
                        size="sm"
                        variant="brand"
                        className="h-8"
                        loading={updateStockMutation.isPending}
                        onClick={() => updateStockMutation.mutate({ id: product.id, stock: newStock })}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className={`text-sm font-bold ${isLow ? "text-red-600" : "text-foreground"}`}>
                        {stock} units
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => { setEditingId(product.id); setNewStock(stock); }}
                      >
                        Update
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
