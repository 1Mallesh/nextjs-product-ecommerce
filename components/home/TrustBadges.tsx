"use client";

import { useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrustBadges() {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["trust-badges"],
    queryFn: async () => {
      const { data } = await contentService.getTrustBadges();
      return data.data ?? [];
    },
  });

  if (isLoading) {
    return (
      <section className="border rounded-2xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </section>
    );
  }

  if (!badges.length) return null;

  return (
    <section className="border rounded-2xl p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center text-center gap-2 group">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
              <span className="text-xl">{badge.icon}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
