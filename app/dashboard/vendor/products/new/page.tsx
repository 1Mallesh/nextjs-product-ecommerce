"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, ArrowLeft } from "lucide-react";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProductForm {
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  categoryId: string;
  sku: string;
  stock: number;
  weight?: number;
  variants: Array<{ name: string; value: string; price: number; comparePrice: number; stock: number; sku: string }>;
}

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      return data.data;
    },
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ProductForm>({
    defaultValues: { variants: [] },
  });

  const { fields: variants, append: addVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit = async (data: ProductForm) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        shortDescription: data.description.substring(0, 100),
        categoryId: data.categoryId,
        sku: data.sku,
        price: Number(data.price),
        comparePrice: Number(data.comparePrice),
        costPrice: Number(data.comparePrice) * 0.8,
        stock: Number(data.stock),
        weight: Number(data.weight || 0),
        images: ["https://placehold.co/600x600/png"], // Converted to URL array temporarily
        tags: ["new"],
      };

      await productService.create(payload);
      queryClient.invalidateQueries({ queryKey: ["vendor-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product submitted for review! Admin will approve it shortly.");
      router.push("/dashboard/vendor/products");
    } catch {
      toast.error("Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/vendor/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-xl font-bold">Add New Product</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Product Name *</label>
              <Input {...register("name", { required: true })} placeholder="Product name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description *</label>
              <textarea {...register("description", { required: true })} rows={4}
                placeholder="Detailed product description..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category *</label>
              <Select onValueChange={(v) => setValue("categoryId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.filter((cat: any) => cat.id && cat.id !== "").map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Selling Price (₹) *</label>
                <Input {...register("price", { required: true, valueAsNumber: true })} type="number" placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">MRP (₹) *</label>
                <Input {...register("comparePrice", { required: true, valueAsNumber: true })} type="number" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">SKU *</label>
                <Input {...register("sku", { required: true })} placeholder="SKU-001" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stock *</label>
                <Input {...register("stock", { required: true, valueAsNumber: true })} type="number" placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight (g)</label>
                <Input {...register("weight", { valueAsNumber: true })} type="number" placeholder="500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Upload product images (max 8)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImages(files.slice(0, 8));
                }}
                className="hidden"
                id="product-images"
              />
              <label htmlFor="product-images" className="cursor-pointer">
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

        {/* Variants */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Variants (Optional)</CardTitle>
              <Button type="button" variant="outline" size="sm"
                onClick={() => addVariant({ name: "Size", value: "", price: 0, comparePrice: 0, stock: 0, sku: "" })}>
                <Plus className="h-4 w-4 mr-1" /> Add Variant
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No variants added. Click &quot;Add Variant&quot; to add sizes, colors, etc.
              </p>
            ) : (
              variants.map((field, i) => (
                <div key={field.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Variant {i + 1}</p>
                    <button type="button" onClick={() => removeVariant(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input {...register(`variants.${i}.name`)} placeholder="Variant name (e.g. Size)" />
                    <Input {...register(`variants.${i}.value`)} placeholder="Value (e.g. XL)" />
                    <Input {...register(`variants.${i}.price`, { valueAsNumber: true })} type="number" placeholder="Price (₹)" />
                    <Input {...register(`variants.${i}.comparePrice`, { valueAsNumber: true })} type="number" placeholder="MRP (₹)" />
                    <Input {...register(`variants.${i}.stock`, { valueAsNumber: true })} type="number" placeholder="Stock" />
                    <Input {...register(`variants.${i}.sku`)} placeholder="SKU" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" asChild>
            <Link href="/dashboard/vendor/products">Cancel</Link>
          </Button>
          <Button type="submit" variant="brand" className="flex-1" loading={submitting}>
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
