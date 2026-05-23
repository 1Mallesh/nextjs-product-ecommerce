import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://tokomort.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products/", "/categories/", "/about", "/faq", "/blog", "/offers", "/contact"],
        disallow: [
          "/dashboard/",
          "/auth/",
          "/api/",
          "/checkout",
          "/cart",
          "/orders/",
          "/vendor/",
          "/delivery/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
