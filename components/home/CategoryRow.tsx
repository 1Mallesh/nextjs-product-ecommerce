"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryService } from "@/services/category.service";
import { cn } from "@/lib/utils";

export default function CategoryRow() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      const payload = data.data as any;
      return Array.isArray(payload) ? payload : (payload?.categories ?? payload?.data ?? []) as import("@/types").Category[];
    },
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Shop by Category</h2>
        <Link href="/categories" className="text-sm text-brand hover:underline">
          See all
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))
          : data?.slice(0, 12).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={cat.slug ? `/categories/${cat.slug}` : "/categories"}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 group-hover:scale-110 group-hover:shadow-md",
                    "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20"
                  )}>
                    {cat.image
                      ? <img src={cat.image} alt={cat.name} className="h-8 w-8 object-contain" />
                      : "🛍️"}
                  </div>
                  <span className="text-xs font-medium text-center max-w-[60px] leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
