"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Grid3x3, Plus, Edit, Trash2 } from "lucide-react";
import { categoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => categoryService.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created");
      setName("");
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const rawData = data as unknown as { data?: import("@/types").Category[] };
  const categories: import("@/types").Category[] = Array.isArray(data) ? data as import("@/types").Category[] : rawData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories</h2>
        <Button variant="brand" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 flex gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="flex-1"
          />
          <Button
            variant="brand"
            onClick={() => name.trim() && createMutation.mutate(name.trim())}
            disabled={createMutation.isPending}
          >
            Create
          </Button>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : !categories.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Grid3x3 className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>No categories yet</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Name", "Slug", "Products", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {(categories as import("@/types").Category[]).map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.productCount ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate((cat as { createdAt?: string }).createdAt ?? "")}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(`Delete "${cat.name}"?`)) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
