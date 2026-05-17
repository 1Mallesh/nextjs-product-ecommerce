import { ShieldCheck, RotateCcw, Headphones, Truck, CreditCard, Star } from "lucide-react";

const BADGES = [
  { icon: Truck, title: "Fast Delivery", desc: "Delivered in 2-7 days" },
  { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "100% safe & encrypted" },
  { icon: CreditCard, title: "COD Available", desc: "Pay on delivery" },
  { icon: Star, title: "Quality Products", desc: "Verified sellers only" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

export default function TrustBadges() {
  return (
    <section className="border rounded-2xl p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {BADGES.map((badge) => (
          <div key={badge.title} className="flex flex-col items-center text-center gap-2 group">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
              <badge.icon className="h-5 w-5 text-brand" />
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
