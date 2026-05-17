"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface ProductForm {
  name: string;
  description: string;
  price: number;
  mrp: number;
  categoryId: string;
  sku: string;
  stock: number;
  weight?: number;
  deliveryTime?: string;
}

export default function ProductEditClient({ id }: { id: string }) {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-edit", id],
    queryFn: async () => {
      const { data } = await productService.getById(id);
      return data.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      return data.data;
    },
  });

  const { register, handleSubmit, setValue } = useForm<ProductForm>({
    values: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      mrp: product?.mrp ?? 0,
      categoryId: product?.category?.id ?? "",
      sku: product?.sku ?? "",
      stock: product?.stock ?? 0,
      weight: product?.weight,
      deliveryTime: product?.deliveryTime,
    },
  });

  const onSubmit = async (data: ProductForm) => {
    setSubmitting(true);
    try {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== "") form.append(k, String(v));
      });
      images.forEach((img) => form.append("images", img));
      await productService.update(id, form);
      toast.success("Product updated!");
      router.push("/dashboard/vendor/products");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/vendor/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-xl font-bold">Edit Product</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product Name *</label>
              <Input {...register("name", { required: true })} placeholder="Product name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description *</label>
              <textarea
                {...register("description", { required: true })}
                rows={4}
                placeholder="Detailed description..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category *</label>
              <Select
                defaultValue={product?.category?.id}
                onValueChange={(v) => setValue("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Price (₹) *</label>
                <Input {...register("price", { required: true, valueAsNumber: true })} type="number" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">MRP (₹) *</label>
                <Input {...register("mrp", { required: true, valueAsNumber: true })} type="number" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">SKU</label>
                <Input {...register("sku")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stock</label>
                <Input {...register("stock", { valueAsNumber: true })} type="number" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight (g)</label>
                <Input {...register("weight", { valueAsNumber: true })} type="number" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Delivery Time</label>
              <Input {...register("deliveryTime")} placeholder="e.g. 3-5 business days" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Update Images (Optional)</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Upload new images to replace existing ones</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 8))}
                className="hidden"
                id="edit-product-images"
              />
              <label htmlFor="edit-product-images">
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>Choose Images</span>
                </Button>
              </label>
              {images.length > 0 && (
                <p className="text-xs text-green-600 mt-2">{images.length} image(s) selected</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link href="/dashboard/vendor/products">Cancel</Link>
          </Button>
          <Button type="submit" variant="brand" className="flex-1" loading={submitting}>
            Update Product
          </Button>
        </div>
      </form>
    </div>
  );
}
