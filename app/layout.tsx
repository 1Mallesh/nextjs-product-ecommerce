import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "TOKOMORT – India's Multi-Vendor Marketplace",
    template: "%s | TOKOMORT",
  },
  description:
    "Shop from thousands of vendors. Best prices on electronics, fashion, groceries and more. Free delivery above ₹499.",
  keywords: ["e-commerce", "online shopping", "India", "marketplace", "multi-vendor"],
  authors: [{ name: "TOKOMORT" }],
  creator: "TOKOMORT",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://tokomort.com",
    title: "TOKOMORT – India's Multi-Vendor Marketplace",
    description: "Shop from thousands of vendors at the best prices.",
    siteName: "TOKOMORT",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOKOMORT",
    description: "India's fastest growing multi-vendor marketplace",
    creator: "@tokomort",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
