import type { Metadata } from "next";
import { Shield, Truck, Users, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about TOKOMORT — India's fastest growing multi-vendor marketplace",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">
          About <span className="text-brand">TOKO</span>MORT
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
        <div className="bg-gradient-to-br from-brand to-orange-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Vendors", value: "10,000+" },
              { label: "Products", value: "5 Lakh+" },
              { label: "Customers", value: "25 Lakh+" },
              { label: "Cities", value: "500+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Shield, title: "Safe & Secure", desc: "All transactions are encrypted and secure" },
          { icon: Truck, title: "Fast Delivery", desc: "Delivery to 500+ cities across India" },
          { icon: Users, title: "Verified Sellers", desc: "KYC-verified vendors for your safety" },
          { icon: Star, title: "Quality First", desc: "Curated products with buyer protection" },
        ].map(({ icon: Icon, title, desc }) => (
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
