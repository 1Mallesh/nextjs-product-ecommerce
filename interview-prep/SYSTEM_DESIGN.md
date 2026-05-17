# System Design — Ecommerce · Payments · Realtime · Delivery

---

## 1. TOKOMORT High-Level Architecture

```
                    ┌─────────────────────────────────────────┐
                    │               CLIENTS                    │
                    │  Browser (Next.js) · Mobile (React)      │
                    └──────────────────┬──────────────────────┘
                                       │ HTTPS / WSS
                    ┌──────────────────▼──────────────────────┐
                    │             Nginx Reverse Proxy           │
                    │       SSL Termination · Rate Limit        │
                    └───────┬──────────────────────────────────┘
                            │
          ┌─────────────────┼──────────────────┐
          ▼                 ▼                  ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
   │  Next.js    │  │  NestJS API  │  │  Socket.IO   │
   │  (SSR/SSG)  │  │  (REST)      │  │  Gateway     │
   │  Port 3001  │  │  Port 3000   │  │  /tracking   │
   └─────────────┘  └──────┬───────┘  └──────┬───────┘
                           │                  │
              ┌────────────┼──────────────────┘
              ▼            ▼
    ┌──────────────┐  ┌──────────────┐
    │  PostgreSQL  │  │    Redis     │
    │  (Prisma)    │  │  Cache/Queue │
    └──────────────┘  └──────────────┘
              │
    ┌──────────────┐
    │  BullMQ      │
    │  (Emails,    │
    │  Webhooks)   │
    └──────────────┘
```

---

## 2. Order Flow — From Checkout to Delivery

```
CUSTOMER places order
        │
        ▼
1. POST /orders → Create order in DB (status: PENDING)
        │
        ▼
2. POST /payments/create-order → Call Razorpay API → Get razorpay_order_id
        │
        ▼
3. Frontend opens Razorpay modal
        │
    ┌───┴──────────────────────┐
    │ SUCCESS                  │ DISMISS/FAIL
    ▼                          ▼
4. POST /payments/verify   Customer redirected to /failed
   → HMAC signature check      → Can retry payment
   → DB transaction:
     - payment.status = SUCCESS
     - order.status = CONFIRMED
     - vendor_wallet += earnings
     - delivery_wallet += payout
   → Socket.IO emit to:
     - vendor room: "order.created"
     - admin room: "payment.success"
        │
        ▼
5. Vendor sees new order → marks PACKED
        │
        ▼
6. Admin assigns delivery boy (or auto-assign by proximity)
        │
        ▼
7. Delivery boy sees assignment → PICKED_UP
        │
        ▼
8. GPS tracking starts → emit "location-update" every 5s
   Customer sees live map
        │
        ▼
9. OUT_FOR_DELIVERY → Customer gets OTP
        │
        ▼
10. Delivery boy enters OTP → DELIVERED
    → Proof photo uploaded
    → Order complete
```

---

## 3. Razorpay Payment Architecture

```
┌─────────────┐     1. Create order       ┌─────────────┐
│  Frontend   │ ─────────────────────────▶ │   Backend   │
│             │ ◀─────────────────────────  │  (NestJS)   │
│             │     razorpayOrderId         │             │
│             │                             │   Calls     │
│  Opens      │                             │ Razorpay    │
│  Razorpay   │                             │   API       │
│  Checkout   │                             └─────────────┘
│  Modal      │
│             │  2. User pays
│             │ ─────────────▶ Razorpay Bank
│             │ ◀─────────────
│  Gets       │  payment_id +
│  callback   │  signature
│             │
│             │  3. Send to backend        ┌─────────────┐
│             │ ─────────────────────────▶ │   Backend   │
│             │                             │ HMAC verify │
│             │                             │ Settle DB   │
└─────────────┘                             └─────────────┘

NEVER: amount on frontend, key_secret on frontend
ALWAYS: verify signature on backend, create amount server-side
```

---

## 4. Realtime Architecture — Socket.IO

```
Server Rooms (namespaces/channels):
├── user:{userId}    ← personal notifications
├── order:{orderId}  ← GPS updates, status changes
├── vendor:{vendorId} ← new order alerts
├── admin            ← all admin events
└── delivery:{boyId} ← delivery assignments

Event Flow:
  order.created → vendor:{vendorId}, admin
  payment.success → admin, vendor:{vendorId}
  order-status-update → order:{orderId}, user:{customerId}
  location-update → order:{orderId}  (customer sees delivery map)
  delivery.assigned → delivery:{boyId}

Scaling Socket.IO horizontally:
  - Use @socket.io/redis-adapter
  - All NestJS instances share same room via Redis pub/sub
  - Sticky sessions on Nginx (ip_hash) OR use polling fallback
```

---

## 5. Database Design — Key Relations

```
User ─────┬─── Orders (1:N)
          ├─── Addresses (1:N)
          └─── VendorProfile (1:1) / DeliveryProfile (1:1)

Order ────┬─── OrderItems (1:N) ─── Product (N:1)
          ├─── Address (N:1)
          ├─── Payment (1:1)
          └─── Delivery (1:1) ─── DeliveryBoy (N:1)

Product ──┬─── Variants (1:N)
          ├─── Category (N:1)
          └─── Vendor (N:1)

Payment ──── Order (1:1)
VendorWallet ── Vendor (1:1)
DeliveryWallet ── DeliveryBoy (1:1)
```

---

## 6. Caching Strategy

| Data | Cache? | TTL | Strategy |
|---|---|---|---|
| Product listings | Yes | 5 min | Cache-aside (Redis) |
| Product detail | Yes | 1 min | Cache-aside |
| User session | Yes | 15 min | Redis session store |
| Order status | No | — | Always DB |
| Analytics | Yes | 30 sec | Cache + socket invalidation |
| Delivery GPS | No | — | Real-time only |

---

## 7. Security Architecture

```
Authentication:
  - JWT access token (15 min) in Authorization header
  - Refresh token (7 days) in httpOnly cookie
  - Token rotation on refresh
  - Middleware: decode role → protect routes at edge (Next.js)
  - Guard: verify role → protect endpoints at API level (NestJS)

Payment Security:
  - Razorpay key_secret ONLY on backend
  - HMAC-SHA256 signature verification on every payment
  - Idempotency key on payment creation
  - Redis distributed lock — prevent double-pay
  - Webhook signature verification

API Security:
  - Rate limiting (Redis) — 100 req/min per IP
  - Input validation (class-validator) — whitelist DTO fields
  - SQL injection — prevented by Prisma parameterized queries
  - XSS — React escapes JSX output by default
  - CORS — explicit allowlist
  - Helmet.js — security headers
```

---

## 8. Delivery GPS Tracking — Scalability

**Problem**: 100 delivery boys broadcasting GPS every 5s = 20 updates/second

**Solution**:
1. Delivery boy emits to Socket.IO (in-memory, no DB write)
2. Socket.IO fans out to customer's order room
3. Backend writes to DB every 30s (throttled, not every emit)
4. Redis stores last known location for non-realtime queries

**At scale** (10,000 delivery boys):
- Use Redis pub/sub for cross-instance Socket.IO
- Separate `tracking` service to handle GPS load
- Write to TimescaleDB (time-series Postgres extension) for location history
- Use Redis GEOADD for proximity queries (find nearest delivery boy)
