import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tokomort.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "TOKOMORT – India's Multi-Vendor Marketplace",
    template: "%s | TOKOMORT",
  },
  description:
    "Shop from thousands of verified vendors. Best prices on electronics, fashion, groceries & more. Free delivery above ₹499. COD available.",
  keywords: [
    "online shopping India", "multi-vendor marketplace", "buy electronics online",
    "fashion online India", "grocery delivery", "COD available", "free delivery India",
    "TOKOMORT", "best prices online",
  ],
  authors: [{ name: "TOKOMORT", url: BASE_URL }],
  creator: "TOKOMORT",
  publisher: "TOKOMORT",
  category: "e-commerce",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    title: "TOKOMORT – India's Multi-Vendor Marketplace",
    description: "Shop from thousands of verified vendors at the best prices.",
    siteName: "TOKOMORT",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TOKOMORT Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TOKOMORT – India's Multi-Vendor Marketplace",
    description: "India's fastest growing multi-vendor marketplace",
    creator: "@tokomort",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  manifest: "/manifest.json",
  alternates: { canonical: BASE_URL },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)",  color: "#1a1a1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL ?? ""} />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
