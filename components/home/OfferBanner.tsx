import Link from "next/link";

const OFFERS = [
  {
    title: "Flash Sale",
    desc: "Extra 20% off with FLASH20",
    bg: "from-orange-400 to-red-500",
    emoji: "⚡",
    href: "/offers",
  },
  {
    title: "New User Offer",
    desc: "50% off your first order",
    bg: "from-purple-500 to-indigo-600",
    emoji: "🎁",
    href: "/auth/register",
  },
  {
    title: "Free Delivery",
    desc: "On orders above ₹499",
    bg: "from-teal-500 to-green-600",
    emoji: "🚚",
    href: "/products",
  },
];

export default function OfferBanner() {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {OFFERS.map((offer) => (
          <Link
            key={offer.title}
            href={offer.href}
            className={`rounded-xl bg-gradient-to-r ${offer.bg} p-5 text-white hover:shadow-lg transition-shadow group`}
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
