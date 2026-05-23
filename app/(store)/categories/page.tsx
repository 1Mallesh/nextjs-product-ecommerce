"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { categoryService } from "@/services/category.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      const payload = data.data as any;
      return Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? []);
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Categories</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data?.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={cat.slug ? `/categories/${cat.slug}` : "/categories"}
                className="flex flex-col items-center justify-center gap-3 h-36 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border hover:border-brand hover:shadow-md transition-all group">
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-10 w-10 object-contain" />
                  ) : "🛍️"}
                </span>
                <div className="text-center">
                  <p className="font-semibold text-sm">{cat.name}</p>
                  {cat.productCount !== undefined && (
                    <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
