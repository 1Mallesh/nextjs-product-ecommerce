import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
  ],
  customer: [
    { label: "My Account", href: "/dashboard/customer" },
    { label: "Track Order", href: "/orders" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
  ],
  seller: [
    { label: "Sell on TOKOMORT", href: "/vendor/onboarding" },
    { label: "Delivery Partner", href: "/delivery/onboarding" },
    { label: "Advertise", href: "/advertise" },
    { label: "Admin", href: "/auth/login?role=admin" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Refund Policy", href: "/refunds" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-16 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="lg" className="mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              India&apos;s fastest growing multi-vendor marketplace. Quality products, great prices.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-brand hover:border-brand hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([key, links]) => (
            <div key={key}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-foreground">
                {key === "customer" ? "Customer" : key === "seller" ? "Partner" : key === "legal" ? "Legal" : "Company"}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Contact & Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <a href="mailto:support@tokomort.com" className="flex items-center gap-2 hover:text-brand">
              <Mail className="h-4 w-4" />
              support@tokomort.com
            </a>
            <a href="tel:+918000000000" className="flex items-center gap-2 hover:text-brand">
              <Phone className="h-4 w-4" />
              +91 80000 00000
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Mumbai, India
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 TOKOMORT. All rights reserved. Made with ❤️ in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
