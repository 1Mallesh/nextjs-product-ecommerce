"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store } from "lucide-react";
import { vendorService } from "@/services/vendor.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const storeSchema = z.object({
  shopName: z.string().min(2, "Shop name required"),
  description: z.string().optional(),
});
type StoreFormData = z.infer<typeof storeSchema>;

export default function VendorStorePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: async () => {
      const { data } = await vendorService.getProfile();
      return data.data;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    values: {
      shopName: profile?.shopName ?? "",
      description: profile?.description ?? "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: StoreFormData) => vendorService.updateProfile(data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
      toast.success("Store updated");
    },
    onError: () => toast.error("Failed to update store"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Store className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-bold">My Store</h2>
      </div>

      {/* Read-only info from vendor profile */}
      {profile && (
        <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-32">GST Number</span>
            <span className="font-mono">{profile.gstNumber ?? "–"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-32">Account Holder</span>
            <span>{profile.accountName ?? "–"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-32">Bank Account</span>
            <span className="font-mono">{profile.bankAccount ? `****${profile.bankAccount.slice(-4)}` : "–"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-32">IFSC</span>
            <span className="font-mono">{profile.ifscCode ?? "–"}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Shop Name</label>
          <Input {...register("shopName")} placeholder="Your shop name" error={errors.shopName?.message} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Describe your store..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30 resize-none"
          />
        </div>

        <Button type="submit" variant="brand" loading={updateMutation.isPending}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
