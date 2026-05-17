# TOKOMORT — Senior Developer Interview Explanation

> How to explain this project confidently at senior-level interviews

---

## 1. One-Line Pitch

> "TOKOMORT is a production multi-vendor e-commerce platform — think Amazon/Flipkart architecture — with 4 user roles, real-time GPS delivery tracking, Razorpay live payments, Socket.IO notifications, and a full financial settlement system."

---

## 2. Architecture Explanation (2 minutes)

**"Let me walk you through the architecture..."**

*Frontend*: Built with Next.js 15 App Router. I use Server Components for SEO-critical pages like product listings, and Client Components for interactive dashboards. Redux Toolkit handles auth and cart state globally. React Query manages server state with real-time invalidation via Socket.IO events.

*Backend*: NestJS with a clean modular structure — separate modules for Auth, Orders, Payments, Vendor, Delivery, Admin. Each module has its own Controller (routing), Service (business logic), and DTO validation.

*Database*: PostgreSQL via Prisma ORM. I designed the schema with proper relations — orders have items, items reference products and variants, orders have a payment record, and there are separate wallet tables for vendor and delivery payouts.

*Realtime*: Socket.IO gateway on a `/tracking` namespace. Clients join rooms (user:{id}, order:{id}) on connect. Events like order status changes, payment confirmations, and GPS coordinates are emitted to specific rooms — not broadcast to everyone.

*Payments*: Razorpay with full security — backend creates the order (server-side amount), frontend opens the modal, on success frontend sends the payment IDs to backend for HMAC-SHA256 signature verification. The key secret never touches the frontend.

---

## 3. Most Challenging Part

**"What was the hardest technical challenge?"**

> "The financial settlement system. When a payment is verified, I need to atomically: update the order status, create the payment transaction record, credit the vendor's wallet, credit the delivery boy's wallet if assigned, and emit real-time events to multiple parties. All of this must happen in a single Prisma transaction — if any step fails, nothing should commit. Getting the math right — 10% platform commission, 18% GST, 60% delivery share, 2% Razorpay fee — and making it consistent between frontend analytics display and actual backend calculation required careful coordination."

---

## 4. Security Decisions

**"How did you handle security?"**

- **Two-layer auth**: Next.js middleware (Edge) decodes JWT from cookie and redirects wrong roles. React's `RoleGuard` component provides a second client-side layer after Redux hydrates.
- **Payment security**: Razorpay `key_secret` only in backend `.env`. Frontend has only `NEXT_PUBLIC_RAZORPAY_KEY_ID`. Every payment verified with HMAC before any DB write.
- **API security**: NestJS `ValidationPipe` with `whitelist: true` strips any unknown fields from requests — prevents mass assignment attacks. Prisma parameterized queries prevent SQL injection.
- **OTP delivery verification**: 4-digit OTP shown to customer, delivery boy must enter it to mark delivered — prevents false delivery confirmations.

---

## 5. Realtime GPS Tracking

**"How does the live delivery tracking work?"**

> "The delivery boy's browser uses the Geolocation API's `watchPosition` to continuously monitor GPS. Every 5 seconds, an interval emits the coordinates to the Socket.IO `/tracking` namespace. The customer tracking their order has joined a room for that specific order — `order:{orderId}`. When the server receives `location-update` from the delivery boy, it fans it out to that room. The customer's Leaflet map updates the delivery marker without any polling. The backend also writes to the database every 30 seconds (throttled) for non-realtime consumers like the admin panel."

---

## 6. Role-Based Access Control

**"How does the RBAC work?"**

> "Three layers. First, the JWT payload contains the user's role. Next.js middleware runs at the Edge — before any page renders — and checks the role against the requested path. CUSTOMER trying to access `/dashboard/admin` gets redirected to `/unauthorized`. Second layer: NestJS guards on every API endpoint use `@Roles('ADMIN')` decorator with a `RolesGuard` that reads the JWT. Third layer: React's `RoleGuard` client component checks the Redux auth state after hydration — covers edge cases where middleware might be bypassed."

---

## 7. Performance Optimizations

- **React Query caching**: Dashboard queries use `staleTime: 0` with `refetchInterval: 30s` — always fresh but not hammering the server
- **Socket invalidation**: Rather than polling, socket events trigger `queryClient.invalidateQueries()` — instant updates only when data actually changes
- **Selective re-renders**: `React.memo` on expensive list components, `useCallback` on handlers passed as props
- **Image optimization**: `next/image` with `remotePatterns` config — automatic WebP conversion, lazy loading
- **Code splitting**: Heavy dashboard components use `dynamic(() => import(...))` to reduce initial bundle

---

## 8. Database Design Decisions

**"Why PostgreSQL over MongoDB?"**

> "TOKOMORT has highly relational data — orders reference products, products belong to vendors, payments belong to orders, wallets belong to users. Relational integrity is critical — I can't have a payment record pointing to a non-existent order. PostgreSQL gives me foreign key constraints, transactions, and complex joins. Prisma adds type safety — my TypeScript knows the exact shape of every query result at compile time. I use MongoDB-style document stores for logs and analytics aggregations at scale, but for transactional data PostgreSQL is the right choice."

---

## 9. What I Would Improve at Scale

1. **Separate the tracking service** — socket.io + GPS handling into a dedicated microservice to handle 10,000+ concurrent delivery boys
2. **Redis adapter for Socket.IO** — currently single-instance; add `@socket.io/redis-adapter` for horizontal scaling
3. **Event sourcing for orders** — instead of mutating order status, append events to an order_events table for full audit trail
4. **Add queue for emails** — currently synchronous; move to BullMQ worker to avoid blocking the API
5. **CDN for product images** — move from local storage to S3 + CloudFront

---

## 10. Numbers to Mention

| Metric | Value |
|---|---|
| Total pages/routes | 40+ |
| API endpoints | 60+ |
| Database tables | 15+ |
| Socket.IO events | 12 |
| Role types | 4 (CUSTOMER, VENDOR, ADMIN, DELIVERY_BOY) |
| Payment flow steps | 10 (create → verify → settle → notify → track) |
| GPS emit interval | 5 seconds |
| Financial accuracy | Per-order to the rupee |
