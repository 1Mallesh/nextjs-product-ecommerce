import Logo from "@/components/shared/Logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand to-orange-700 flex-col justify-between p-12 text-white">
        <Logo size="lg" className="text-white" />
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            India&apos;s fastest growing<br />multi-vendor marketplace
          </h2>
          <p className="text-white/70 mt-4 text-lg">
            Shop from thousands of vendors, get the best deals, and experience seamless delivery.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Vendors", value: "10,000+" },
              { label: "Products", value: "5 Lakh+" },
              { label: "Happy Customers", value: "25 Lakh+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/50 text-sm">© 2025 TOKOMORT. All rights reserved.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-muted-foreground hover:text-brand">
            ← Back to shop
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
