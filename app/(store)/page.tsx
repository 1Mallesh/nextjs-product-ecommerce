import type { Metadata } from "next";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryRow from "@/components/home/CategoryRow";
import OfferBanner from "@/components/home/OfferBanner";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Below50Section from "@/components/home/Below50Section";
import TrustBadges from "@/components/home/TrustBadges";

export const metadata: Metadata = {
  title: "TOKOMORT – India's Multi-Vendor Marketplace",
  description: "Shop the best products from top vendors. Free delivery above ₹499.",
};

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <div className="container mx-auto px-4 space-y-12 py-8">
        <CategoryRow />
        <OfferBanner />
        <FeaturedProducts />
        <Below50Section />
        <TrustBadges />
      </div>
    </>
  );
}
