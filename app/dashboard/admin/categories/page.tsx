"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Grid3x3, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { categoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Category } from "@/types";

type CategoryWithStatus = Category & { isActive?: boolean; createdAt?: string };

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAllForAdmin();
      const payload = data.data as any;
      return (Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? [])) as CategoryWithStatus[];
    },
    staleTime: 0,
  });

  const categories = data ?? [];
  const pending = categories.filter((c) => c.isActive === false);
  const active = categories.filter((c) => c.isActive !== false);

  const createMutation = useMutation({
    mutationFn: () => categoryService.create({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
      setName(""); setDescription(""); setShowForm(false);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const approveMutation = useMutation({
    mutationFn: categoryService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category approved");
    },
    onError: () => toast.error("Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: categoryService.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category rejected");
    },
    onError: () => toast.error("Failed to reject"),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const CategoryTable = ({ rows, showApproval }: { rows: CategoryWithStatus[]; showApproval?: boolean }) => (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="bg-muted/50">
          <tr>
            {["Name", "Slug", "Products", "Created", showApproval ? "Approval" : "Status", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((cat) => (
            <tr key={cat.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{cat.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
              <td className="px-4 py-3">{cat.productCount ?? 0}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(cat.createdAt ?? "")}</td>
              <td className="px-4 py-3">
                {showApproval ? (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
                    Pending
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-950/20">
                    Active
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 flex items-center gap-1">
                {showApproval && (
                  <>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-green-600 hover:bg-green-50"
                      onClick={() => approveMutation.mutate(cat.id)}
                      disabled={approveMutation.isPending}
                      title="Approve"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => rejectMutation.mutate(cat.id)}
                      disabled={rejectMutation.isPending}
                      title="Reject"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories</h2>
        <Button variant="brand" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name *" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
          <div className="flex gap-2">
            <Button variant="brand" onClick={() => name.trim() && createMutation.mutate()} disabled={createMutation.isPending}>
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-yellow-600 flex items-center gap-2">
                Pending Approval
                <Badge className="bg-yellow-500 text-white">{pending.length}</Badge>
              </h3>
              <CategoryTable rows={pending} showApproval />
            </div>
          )}

          {active.length > 0 ? (
            <div className="space-y-2">
              {pending.length > 0 && <h3 className="text-sm font-semibold text-muted-foreground">Active Categories</h3>}
              <CategoryTable rows={active} />
            </div>
          ) : !pending.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Grid3x3 className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No categories yet</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
