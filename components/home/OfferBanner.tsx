"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function OfferBanner() {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["offers-banner"],
    queryFn: async () => {
      const { data } = await contentService.getOffers();
      return data.data ?? [];
    },
  });

  if (isLoading) {
    return (
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </section>
    );
  }

  if (!offers.length) return null;

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <Link
            key={offer.id}
            href={offer.href ?? "/offers"}
            className={`rounded-xl bg-gradient-to-r ${offer.bg ?? "from-orange-400 to-red-500"} p-5 text-white hover:shadow-lg transition-shadow group`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform inline-block">
                {offer.emoji}
              </span>
              <div>
                <h3 className="font-bold text-base">{offer.title}</h3>
                <p className="text-white/80 text-sm">{offer.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
