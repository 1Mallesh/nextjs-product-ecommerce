"use client";

import { useQuery } from "@tanstack/react-query";
import { Shield, Truck, Users, Star } from "lucide-react";
import { contentService } from "@/services/content.service";
import { Skeleton } from "@/components/ui/skeleton";

const FEATURES = [
  { icon: Shield, title: "Safe & Secure", desc: "All transactions are encrypted and secure" },
  { icon: Truck, title: "Fast Delivery", desc: "Delivery to 500+ cities across India" },
  { icon: Users, title: "Verified Sellers", desc: "KYC-verified vendors for your safety" },
  { icon: Star, title: "Quality First", desc: "Curated products with buyer protection" },
];

export default function AboutPage() {
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["about-stats"],
    queryFn: async () => {
      const { data } = await contentService.getAboutStats();
      return data.data ?? [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-4xl font-black mb-4">
          About <span className="text-brand">TOKO</span>MORT
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          India&apos;s fastest growing multi-vendor marketplace, connecting millions of buyers with thousands of quality sellers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            TOKOMORT was founded with a simple mission: to empower Indian small businesses and bring them online while giving customers access to the best products at unbeatable prices.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We believe in a marketplace that&apos;s fair, transparent, and built for India — with features like COD, local delivery, and vernacular language support.
          </p>
        </div>
        <div className="bg-gradient-to-br from-brand to-orange-600 rounded-2xl p-6 sm:p-8 text-white">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-20 mx-auto bg-white/20" />
                  <Skeleton className="h-4 w-16 mx-auto bg-white/20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center p-6 border rounded-2xl">
            <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-3">
              <Icon className="h-6 w-6 text-brand" />
            </div>
            <h3 className="font-bold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
