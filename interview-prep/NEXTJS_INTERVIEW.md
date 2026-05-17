# Next.js 15 Interview Questions — App Router · SSR · Middleware

---

## 1. App Router Architecture

```
app/
├── layout.tsx          ← Root layout (persistent across navigations)
├── page.tsx            ← Home page
├── (store)/            ← Route group (doesn't affect URL)
│   ├── products/
│   │   └── [id]/page.tsx
│   └── checkout/page.tsx
├── (auth)/             ← Another route group
│   └── auth/login/page.tsx
├── dashboard/
│   ├── admin/layout.tsx ← Nested layout (wraps admin pages only)
│   └── admin/page.tsx
└── api/
    └── v1/orders/route.ts ← API Route Handler
```

**Key difference from Pages Router**:
- Server Components by default (no client-side JS unless `"use client"`)
- Layouts don't re-render on navigation — only page segment updates
- Nested layouts composable at any level
- `loading.tsx` and `error.tsx` colocated with pages

---

## 2. Server Components vs Client Components

```tsx
// Server Component (default) — renders on server, no JS sent to client
// Can: fetch directly, access database, use secrets
// Cannot: useState, useEffect, event handlers, browser APIs

async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  return <ProductDetails product={product} />;
}

// Client Component — "use client" at top
// Can: useState, useEffect, event handlers, browser APIs, hooks
// Cannot: direct database access
"use client";
function AddToCart({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);
  return <button onClick={() => { addToCart(productId); setAdded(true); }}>
    {added ? "Added!" : "Add to Cart"}
  </button>;
}
```

---

## 3. Data Fetching Patterns

```tsx
// 1. Server Component — async/await directly
async function OrdersPage() {
  const orders = await orderService.getAll(); // runs on server
  return <OrderList orders={orders} />;
}

// 2. fetch with caching
const data = await fetch('https://api.example.com/products', {
  next: { revalidate: 60 }, // ISR — revalidate every 60 seconds
  cache: 'no-store',         // SSR — always fresh
  cache: 'force-cache',      // SSG — cache permanently
});

// 3. Parallel fetching — avoid waterfall
async function Dashboard() {
  const [user, orders, analytics] = await Promise.all([
    getUser(),
    getOrders(),
    getAnalytics(),
  ]);
  return <DashboardUI user={user} orders={orders} analytics={analytics} />;
}
```

---

## 4. Middleware

```typescript
// middleware.ts — runs at Edge before every request
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  // Protect routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/auth/login?redirect=${pathname}`, req.url));
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const role = payload.role as string;

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout", "/orders/:path*"],
};
```

---

## 5. Route Handlers (API Routes)

```typescript
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const orders = await db.order.findMany({ skip: (page - 1) * 10, take: 10 });
  return NextResponse.json({ data: orders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const order = await db.order.create({ data: body });
  return NextResponse.json({ data: order }, { status: 201 });
}

// Dynamic route: app/api/orders/[id]/route.ts
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await db.order.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ data: updated });
}
```

---

## 6. Next.js Image & Font Optimization

```tsx
// next/image — automatic WebP conversion, lazy loading, size optimization
<Image
  src={product.imageUrl}
  alt={product.name}
  width={600}
  height={400}
  priority // for above-fold images — disables lazy loading
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// next/font — eliminates layout shift, self-hosted
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Zero layout shift because font loads inline in CSS

// next.config.ts — allow external image domains
images: {
  remotePatterns: [
    { protocol: "https", hostname: "**.supabase.co" },
    { protocol: "https", hostname: "placehold.co" },
  ],
}
```

---

## 7. Static vs Dynamic Rendering Decision Tree

```
Is the data the same for every user?
├── Yes → Can it wait until build time?
│         ├── Yes + data rarely changes → SSG (cache: force-cache)
│         └── Yes + data changes periodically → ISR (next: { revalidate: N })
└── No / user-specific / real-time
          ├── Must be fresh every request → SSR (cache: no-store)
          └── Heavy interactivity (dashboard) → CSR with React Query
```

**TOKOMORT decisions**:
- Product listing page → ISR (revalidate: 300)
- Product detail page → ISR (revalidate: 60)
- Dashboard pages → CSR (`"use client"` + React Query)
- Checkout → SSR + Client Component hybrid

---

## 8. Error Handling

```tsx
// error.tsx — error boundary for a segment
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong: {error.message}</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// not-found.tsx
export default function NotFound() {
  return <h2>404 — Page not found</h2>;
}

// loading.tsx — automatic Suspense boundary
export default function Loading() {
  return <div className="animate-spin" />;
}
```

---

## 9. Performance Optimization Checklist

- `next/image` for all images — auto WebP, lazy load, size optimization
- `next/font` — eliminate FOUT (Flash of Unstyled Text)
- Dynamic import with `lazy()` for heavy components
- `Suspense` boundaries to stream UI progressively
- Minimize `"use client"` boundaries — push them to the leaves
- `unstable_cache` or `React.cache` for server-side data deduplication
- Route Groups `(group)` to share layouts without affecting URL

---

## 10. Common Interview Questions

**Q: Difference between `generateStaticParams` and `getStaticPaths`?**
- `getStaticPaths` was Pages Router. `generateStaticParams` is App Router — runs at build time to pre-render dynamic routes.

**Q: How does Suspense work with Server Components?**
- Server sends HTML in chunks. Suspense shows fallback until the async segment resolves, then streams the actual content. No client-side spinner needed.

**Q: What is the `use server` directive?**
- Marks Server Actions — functions that run on the server, called directly from Client Components without an API route. Used for form submissions, mutations.
