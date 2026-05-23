"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Grid3x3, Plus, Clock, CheckCircle } from "lucide-react";
import { categoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import type { Category } from "@/types";

type CategoryWithStatus = Category & { isActive?: boolean };

export default function VendorCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  // Fetch only active/public categories so vendor can see what's already approved
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? [])) as CategoryWithStatus[];
    },
  });

  const categories = data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      categoryService.create({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category submitted for approval! Admin will review it shortly.");
      setName(""); setDescription(""); setShowForm(false);
    },
    onError: () => toast.error("Failed to submit category"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Categories</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submit a new category — it will go live after admin approval.
          </p>
        </div>
        <Button variant="brand" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Request Category
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <Clock className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">How it works</p>
          <p className="text-blue-600 dark:text-blue-400 mt-0.5">
            New categories you submit are sent to admin for approval. Once approved they appear in the public category list and you can assign products to them.
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm">Request New Category</h3>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name *"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <div className="flex gap-2">
            <Button
              variant="brand"
              onClick={() => name.trim() && createMutation.mutate()}
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? "Submitting..." : "Submit for Approval"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Active categories list */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Active Categories ({categories.length})
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border rounded-xl">
            <Grid3x3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No active categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-card border rounded-xl p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{cat.name}</p>
                  <Badge variant="outline" className="text-green-600 border-green-300 text-[10px] shrink-0">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                {cat.productCount !== undefined && (
                  <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
