# TOKOMORT — Production Multi-Vendor E-Commerce Platform

> **Complete Full-Stack Analysis · Server vs Client Architecture · End-to-End Flow**
>
> Next.js 15 · NestJS · PostgreSQL · Prisma · Socket.IO · Razorpay · Redis · TypeScript

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Complete Tech Stack — 40+ Technologies](#2-complete-tech-stack--40-technologies)
3. [Project Structure — Every File Explained](#3-project-structure--every-file-explained)
4. [Server-Side vs Client-Side — Every Page Analyzed](#4-server-side-vs-client-side--every-page-analyzed)
5. [Role System & Access Control](#5-role-system--access-control)
6. [End-to-End Flow — Customer Journey](#6-end-to-end-flow--customer-journey)
7. [End-to-End Flow — Vendor Journey](#7-end-to-end-flow--vendor-journey)
8. [End-to-End Flow — Delivery Boy Journey](#8-end-to-end-flow--delivery-boy-journey)
9. [End-to-End Flow — Admin Journey](#9-end-to-end-flow--admin-journey)
10. [Payment Architecture — Razorpay](#10-payment-architecture--razorpay)
11. [Realtime Architecture — Socket.IO](#11-realtime-architecture--socketio)
12. [GPS Tracking System](#12-gps-tracking-system)
13. [Financial Settlement Model](#13-financial-settlement-model)
14. [State Management Architecture](#14-state-management-architecture)
15. [API Service Layer](#15-api-service-layer)
16. [Data Flow — Frontend to Backend](#16-data-flow--frontend-to-backend)
17. [Security Architecture](#17-security-architecture)
18. [Database Relations](#18-database-relations)
19. [Environment Configuration](#19-environment-configuration)
20. [Local Setup & Running](#20-local-setup--running)

---

## 1. Project Overview

TOKOMORT is a **production-grade multi-vendor e-commerce platform** — comparable to Amazon, Flipkart, and Swiggy in architectural complexity. It is built as a frontend-only Next.js repository that connects to a separate NestJS backend.

### What Makes It Production-Grade

| Feature | Implementation |
|---|---|
| 4 separate user roles | CUSTOMER · VENDOR · ADMIN · DELIVERY\_BOY |
| 2-layer route protection | Next.js Edge Middleware + React RoleGuard |
| Live payment processing | Razorpay with HMAC-SHA256 verification |
| Real-time GPS tracking | Socket.IO · 5-second GPS broadcast · Leaflet maps |
| Financial settlement | Per-order commission, GST, payout accounting |
| KYC onboarding | 4-step document upload with admin approval gate |
| OTP delivery verification | 4-digit OTP customer → delivery boy confirmation |
| Proof photo upload | Delivery boys upload photo evidence on completion |
| Type-safe entire app | TypeScript end-to-end with Zod runtime validation |
| PWA support | next-pwa · offline capability · installable |
| Adapter pattern | All backend field mismatches normalized in one place |

---

## 2. Complete Tech Stack — 40+ Technologies

### Frontend Core
| # | Technology | Version | What It Does |
|---|---|---|---|
| 1 | **Next.js** | 15.1.3 | App Router, SSR, SSG, ISR, Middleware, API routes |
| 2 | **React** | 19.0.0 | UI framework — Server + Client components |
| 3 | **TypeScript** | 5.7.2 | Full static type safety |
| 4 | **Tailwind CSS** | 3.4.17 | Utility-first styling |
| 5 | **Framer Motion** | 11.15.0 | Animations — page transitions, timeline, confetti |

### State Management
| # | Technology | Version | What It Does |
|---|---|---|---|
| 6 | **Redux Toolkit** | 2.5.0 | Global state: auth, cart, wishlist, UI |
| 7 | **React Redux** | 9.2.0 | React bindings for Redux |
| 8 | **React Query (TanStack)** | 5.62.7 | Server state — fetching, caching, mutations |

### Forms & Validation
| # | Technology | Version | What It Does |
|---|---|---|---|
| 9 | **React Hook Form** | 7.54.2 | Form state management |
| 10 | **Zod** | 3.24.1 | Schema validation (address, auth, delivery KYC) |
| 11 | **@hookform/resolvers** | 3.9.1 | Connects Zod schemas to React Hook Form |

### HTTP & Realtime
| # | Technology | Version | What It Does |
|---|---|---|---|
| 12 | **Axios** | 1.7.9 | HTTP client with interceptors — token injection, refresh |
| 13 | **Socket.IO Client** | 4.8.1 | Real-time bidirectional events — orders, GPS, payments |

### UI Component Libraries
| # | Technology | Version | What It Does |
|---|---|---|---|
| 14 | **shadcn/ui** | — | Component system built on Radix UI |
| 15 | **@radix-ui** | various | Headless accessible primitives (dialog, dropdown, tabs…) |
| 16 | **Lucide React** | 0.468.0 | Icon library — 468 icons |
| 17 | **class-variance-authority** | 0.7.1 | Variant-based component styling |
| 18 | **clsx + tailwind-merge** | 2.1.1 / 2.5.5 | Dynamic className merging |

### Data Visualization & Maps
| # | Technology | Version | What It Does |
|---|---|---|---|
| 19 | **Recharts** | 2.15.0 | Revenue charts, analytics graphs |
| 20 | **Leaflet.js** | 1.9.4 (CDN) | Interactive GPS tracking map |
| 21 | **CartoDB tiles** | — | Clean light map tiles for delivery tracking |

### Payments
| # | Technology | Version | What It Does |
|---|---|---|---|
| 22 | **Razorpay Checkout** | (CDN) | Payment modal — cards, UPI, wallets, netbanking |

### UX Enhancements
| # | Technology | Version | What It Does |
|---|---|---|---|
| 23 | **Swiper** | 11.1.15 | Product image carousels, category sliders |
| 24 | **canvas-confetti** | 1.9.4 | Celebration animation on order success |
| 25 | **react-hot-toast** | 2.4.1 | Toast notifications |
| 26 | **next-themes** | 0.4.4 | Dark / light mode with system preference |
| 27 | **date-fns** | 4.1.0 | Date formatting |

### PWA
| # | Technology | Version | What It Does |
|---|---|---|---|
| 28 | **next-pwa** | 5.6.0 | Service worker, offline support, installable |

### Backend (NestJS — separate repo, this frontend connects to it)
| # | Technology | Purpose |
|---|---|---|
| 29 | **NestJS** | REST API + WebSocket Gateway |
| 30 | **Prisma ORM** | Type-safe DB queries |
| 31 | **PostgreSQL** | Primary database |
| 32 | **Redis** | Cache, rate limiting, distributed locks |
| 33 | **BullMQ** | Background jobs (emails, webhooks) |
| 34 | **Passport + JWT** | Authentication |
| 35 | **class-validator** | DTO validation |
| 36 | **Razorpay Node SDK** | Server-side order creation |
| 37 | **crypto (HMAC)** | Payment signature verification |

### DevOps / Tooling
| # | Technology | Purpose |
|---|---|---|
| 38 | **Docker** | Containerization |
| 39 | **Nginx** | Reverse proxy, SSL, WebSocket passthrough |
| 40 | **PM2** | Process management, cluster mode |
| 41 | **GitHub Actions** | CI/CD pipeline |
| 42 | **ESLint + TypeScript ESLint** | Code quality |
| 43 | **Autoprefixer + PostCSS** | CSS processing |

---

## 3. Project Structure — Every File Explained

```
nextjs-product-ecommerce/
│
├── app/                              ← Next.js 15 App Router root
│   │
│   ├── (auth)/                       ← Auth route group (URL: /auth/...)
│   │   ├── layout.tsx                ← Centered card layout for auth pages
│   │   └── auth/
│   │       ├── login/
│   │       │   ├── page.tsx          ← Server shell → Suspense wrapper
│   │       │   └── LoginPageClient.tsx ← "use client" — login form + role redirect
│   │       ├── register/
│   │       │   ├── page.tsx          ← Server shell
│   │       │   └── RegisterPageClient.tsx ← "use client" — registration + OTP
│   │       └── forgot-password/
│   │           ├── page.tsx          ← Server shell
│   │           └── ForgotPasswordClient.tsx ← "use client" — reset flow
│   │
│   ├── (store)/                      ← Public storefront route group
│   │   ├── layout.tsx                ← Store layout: Header + Footer + CartDrawer
│   │   ├── page.tsx                  ← Home page (SSG): HeroBanner, FeaturedProducts
│   │   ├── products/
│   │   │   ├── page.tsx              ← Product listing shell
│   │   │   ├── ProductsPageClient.tsx ← "use client" — filter/sort/paginate
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          ← Product detail (ISR)
│   │   │       └── ProductDetailClient.tsx ← "use client" — add to cart, variants
│   │   ├── categories/
│   │   │   ├── page.tsx              ← All categories (SSG)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          ← Category page shell
│   │   │       └── CategoryPageClient.tsx ← "use client" — filtered products
│   │   ├── cart/page.tsx             ← "use client" — cart items + totals
│   │   ├── checkout/page.tsx         ← "use client" — address + payment + Razorpay
│   │   ├── wishlist/page.tsx         ← "use client" — wishlist items
│   │   ├── offers/
│   │   │   ├── page.tsx              ← Offers shell
│   │   │   └── OffersClient.tsx      ← "use client" — deals list
│   │   ├── orders/
│   │   │   ├── page.tsx              ← "use client" — order history list
│   │   │   └── [id]/
│   │   │       ├── success/
│   │   │       │   ├── page.tsx      ← Server shell (Suspense)
│   │   │       │   └── OrderSuccessClient.tsx ← confetti + order summary
│   │   │       ├── failed/
│   │   │       │   ├── page.tsx      ← Server shell (Suspense)
│   │   │       │   └── PaymentFailedClient.tsx ← retry payment flow
│   │   │       └── tracking/
│   │   │           ├── page.tsx      ← Server shell (Suspense)
│   │   │           └── OrderTrackingClient.tsx ← Leaflet map + live status timeline
│   │   ├── about/page.tsx            ← Static page (SSG)
│   │   ├── blog/page.tsx             ← Static page
│   │   ├── careers/page.tsx          ← Static page
│   │   ├── contact/page.tsx          ← Contact form
│   │   ├── faq/page.tsx              ← FAQ accordion
│   │   ├── privacy/page.tsx          ← Privacy policy (SSG)
│   │   └── terms/page.tsx            ← Terms (SSG)
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                ← Shared dashboard shell + sidebar navigation
│   │   │
│   │   ├── admin/                    ← ADMIN role only
│   │   │   ├── layout.tsx            ← RoleGuard(["ADMIN"]) wrapper
│   │   │   ├── page.tsx              ← Overview: live counters, charts, recent orders
│   │   │   ├── analytics/page.tsx    ← Financial analytics: commission, GST, payouts
│   │   │   ├── orders/page.tsx       ← All platform orders: filter + status override
│   │   │   ├── vendors/page.tsx      ← Vendor approval: KYC review, approve/reject
│   │   │   ├── products/page.tsx     ← Product approval queue
│   │   │   ├── delivery/page.tsx     ← Delivery boy management: KYC, approve/reject/suspend
│   │   │   ├── categories/page.tsx   ← Category management
│   │   │   ├── users/page.tsx        ← User list + management
│   │   │   ├── refunds/page.tsx      ← Refund request handling
│   │   │   ├── reports/page.tsx      ← Downloadable reports
│   │   │   └── notifications/page.tsx← Admin notification feed
│   │   │
│   │   ├── vendor/                   ← VENDOR role only
│   │   │   ├── layout.tsx            ← RoleGuard(["VENDOR"]) wrapper
│   │   │   ├── page.tsx              ← Revenue stats, recent orders, quick actions
│   │   │   ├── orders/page.tsx       ← Order table: CONFIRMED→PROCESSING→PACKED→SHIPPED
│   │   │   ├── products/page.tsx     ← Product list + approval status
│   │   │   ├── products/new/page.tsx ← Add product form (images, variants, pricing)
│   │   │   ├── products/[id]/edit/   ← Edit product
│   │   │   ├── earnings/page.tsx     ← Per-order earnings breakdown, payout history
│   │   │   ├── analytics/page.tsx    ← Sales charts, top products
│   │   │   ├── stock/page.tsx        ← Inventory management
│   │   │   ├── store/page.tsx        ← Store profile settings
│   │   │   ├── offers/page.tsx       ← Discount management
│   │   │   └── notifications/page.tsx← Vendor notifications
│   │   │
│   │   ├── delivery/                 ← DELIVERY_BOY role only
│   │   │   ├── layout.tsx            ← RoleGuard(["DELIVERY_BOY"]) wrapper
│   │   │   ├── page.tsx              ← Approval gate + overview + availability toggle
│   │   │   ├── orders/page.tsx       ← Accept/reject, OTP modal, proof upload, navigate
│   │   │   ├── tracking/page.tsx     ← Live GPS broadcast via Socket.IO every 5s
│   │   │   ├── earnings/page.tsx     ← Per-delivery payout: 60% of delivery fee
│   │   │   └── history/page.tsx      ← Past deliveries
│   │   │
│   │   └── customer/                 ← CUSTOMER role (post-login account)
│   │       ├── layout.tsx            ← Customer account layout
│   │       ├── page.tsx              ← Account overview
│   │       ├── orders/page.tsx       ← Order history with status filters
│   │       ├── addresses/page.tsx    ← Address book: add/edit/default
│   │       ├── wishlist/page.tsx     ← Saved products
│   │       ├── profile/page.tsx      ← Profile edit
│   │       └── notifications/page.tsx← Customer notifications
│   │
│   ├── vendor/onboarding/page.tsx    ← 4-step Vendor KYC registration
│   ├── delivery/onboarding/page.tsx  ← 4-step Delivery Boy KYC registration
│   ├── unauthorized/page.tsx         ← 403 — wrong role attempted access
│   ├── globals.css                   ← Global CSS + Tailwind directives
│   └── layout.tsx                    ← Root layout: all Providers + fonts + PWA
│
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx            ← Quick login modal overlay (from Header)
│   │   └── RoleGuard.tsx             ← Client-side RBAC second layer
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx       ← Sidebar + mobile nav for all dashboards
│   │   └── StatCard.tsx              ← Reusable metric card (title, value, icon, trend)
│   ├── home/
│   │   ├── HeroBanner.tsx            ← Hero slider (Swiper)
│   │   ├── FeaturedProducts.tsx      ← Featured products grid
│   │   ├── CategoryRow.tsx           ← Horizontal category scroll
│   │   ├── Below50Section.tsx        ← Products under ₹50 section
│   │   ├── OfferBanner.tsx           ← Promotional banners
│   │   └── TrustBadges.tsx           ← Free delivery, returns, secure payment badges
│   ├── product/
│   │   ├── ProductCard.tsx           ← Product card: image, price, rating, add to cart
│   │   ├── ProductCardSkeleton.tsx   ← Loading placeholder
│   │   ├── ProductGrid.tsx           ← Responsive grid wrapper
│   │   └── StarRating.tsx            ← Star rating display (0–5 with decimals)
│   ├── shared/
│   │   ├── Header.tsx                ← Nav: logo, search, cart, role-based user menu
│   │   ├── Footer.tsx                ← Site footer: links, social, copyright
│   │   ├── CartDrawer.tsx            ← Slide-in cart panel (Sheet component)
│   │   ├── SearchBar.tsx             ← Debounced search input
│   │   ├── MobileBottomNav.tsx       ← Mobile: Home/Categories/Cart/Account
│   │   ├── Logo.tsx                  ← TOKOMORT logo SVG
│   │   └── ThemeToggle.tsx           ← Dark/light mode switch
│   └── ui/                           ← shadcn/ui component library
│       ├── button.tsx                ← Variants: brand, outline, ghost, destructive
│       ├── badge.tsx                 ← Status badges: success, warning, etc.
│       ├── card.tsx, dialog.tsx, input.tsx, select.tsx
│       ├── skeleton.tsx              ← Loading shimmer
│       ├── sheet.tsx                 ← Slide panel (used for CartDrawer)
│       ├── tabs.tsx, separator.tsx, avatar.tsx
│       └── dropdown-menu.tsx         ← User menu dropdown
│
├── services/                         ← Axios API service layer (one file per domain)
│   ├── axios.ts                      ← Instance + Bearer interceptor + refresh queue
│   ├── auth.service.ts               ← login, register, logout, refreshToken, verifyOTP
│   ├── user.service.ts               ← getProfile, updateProfile
│   ├── product.service.ts            ← getAll, getBySlug, search, create, update
│   ├── category.service.ts           ← getAll, getBySlug
│   ├── cart.service.ts               ← getCart, addItem, removeItem, clearCart
│   ├── order.service.ts              ← create, getAll, getById, cancel, trackOrder
│   │                                    vendorGetAll, vendorUpdateStatus
│   │                                    adminGetAll, adminUpdateStatus
│   ├── payment.service.ts            ← createOrder, verify, getStatus, refund
│   ├── address.service.ts            ← getAll, create, update, setDefault, delete
│   ├── vendor.service.ts             ← onboard, getProfile, getDashboard
│   │                                    adminGetAll, adminApprove, adminReject
│   ├── delivery.service.ts           ← onboard, getProfile, getDashboard
│   │                                    getAssigned, updateDeliveryStatus
│   │                                    updateLocation, adminGetAll, adminApprove
│   ├── admin.service.ts              ← getAnalytics, getFinancialAnalytics
│   │                                    getOrders, getUsers, getRefunds
│   ├── wishlist.service.ts           ← getAll, add, remove, toggle
│   ├── review.service.ts             ← getByProduct, create, markHelpful
│   ├── notification.service.ts       ← getAll, markRead, markAllRead
│   └── upload.service.ts             ← uploadImage (multipart)
│
├── hooks/                            ← Reusable custom hooks
│   ├── useRazorpay.ts                ← Load Razorpay script once + openCheckout()
│   ├── useFinancialAnalytics.ts      ← Admin financial data + socket invalidation
│   │                                    computeOrderBreakdown() utility
│   ├── useAuth.ts                    ← Auth state helpers
│   ├── useCart.ts                    ← Cart operations wrapper
│   ├── useWishlist.ts                ← Wishlist operations wrapper
│   └── useRoleRedirect.ts            ← Redirect based on role after login
│
├── store/                            ← Redux Toolkit store
│   ├── index.ts                      ← Store configuration + RootState/AppDispatch types
│   ├── hooks.ts                      ← Typed useAppSelector / useAppDispatch
│   └── slices/
│       ├── authSlice.ts              ← user, tokens, isAuthenticated + async thunks:
│       │                                login, register, loadUser, logoutUser
│       ├── cartSlice.ts              ← items, total, subtotal, deliveryFee
│       │                                addItem, removeItem, updateQty, clearCart
│       ├── uiSlice.ts                ← cartOpen, searchOpen, theme
│       └── wishlistSlice.ts          ← wishlist items + async thunks
│
├── providers/                        ← React context providers (wrapped in app/layout.tsx)
│   ├── index.tsx                     ← Combines all providers in correct order
│   ├── ReduxProvider.tsx             ← <Provider store={store}>
│   ├── QueryProvider.tsx             ← <QueryClientProvider> + DevTools
│   ├── SocketProvider.tsx            ← Socket.IO connection + useSocket() hook
│   │                                    Connects to /tracking namespace with JWT
│   ├── AuthProvider.tsx              ← Loads user on mount via loadUser thunk
│   └── StorageProvider.tsx           ← Persists cart/wishlist to localStorage
│
├── schemas/                          ← Zod validation schemas
│   ├── address.schema.ts             ← label, fullName, phone, addressLine1, city, etc.
│   ├── auth.schema.ts                ← login, register validation
│   ├── delivery.schema.ts            ← 4-step delivery KYC schemas
│   └── vendor.schema.ts              ← Vendor onboarding schemas
│
├── types/
│   └── index.ts                      ← All TypeScript interfaces:
│                                        User, Product, Order, Payment, Cart, Address,
│                                        Vendor, DeliveryBoy, Category, Review,
│                                        Notification, PaginatedResponse, ApiResponse,
│                                        RazorpayOrder, FinancialSummary, etc.
│
├── lib/
│   ├── utils.ts                      ← formatPrice(₹), formatDate(), cn() className merger
│   ├── adapters.ts                   ← adaptUser, adaptProduct, adaptOrder, adaptAddress,
│   │                                    adaptVendor, adaptDeliveryBoy, adaptPaginated
│   │                                    normalizePaginated() — handles all backend key variants
│   └── server-api.ts                 ← Server-side fetch helpers for Server Components
│
├── constants/
│   └── index.ts                      ← ROUTES{}, ORDER_STATUS_LABELS{},
│                                        ORDER_STATUS_COLORS{}, DELIVERY_SLOTS[],
│                                        INDIAN_STATES[], PAYMENT_METHODS[]
│
├── config/
│   └── index.ts                      ← Environment variable config object
│                                        (apiUrl, socketUrl, razorpayKeyId, appName)
│
├── middleware.ts                     ← Next.js Edge Middleware — RBAC route protection
│                                        Runs before every request at CDN edge
│
├── next.config.ts                    ← Image remotePatterns, PWA config
├── tailwind.config.ts                ← Theme: brand colors, custom animations
├── tsconfig.json                     ← Strict TypeScript, path aliases (@/*)
├── components.json                   ← shadcn/ui configuration
├── public/manifest.json              ← PWA manifest
│
├── interview-prep/                   ← Complete interview preparation repository
│   ├── README.md                     ← Profile overview + TOKOMORT architecture
│   ├── JAVASCRIPT_INTERVIEW.md       ← Closures to advanced patterns
│   ├── REACT_INTERVIEW.md            ← Hooks, Redux, React Query
│   ├── NEXTJS_INTERVIEW.md           ← App Router deep dive
│   ├── NODEJS_INTERVIEW.md           ← Node.js + Express
│   ├── NESTJS_INTERVIEW.md           ← NestJS architecture + Prisma
│   ├── DEVOPS_INTERVIEW.md           ← Docker, Nginx, CI/CD, AWS
│   ├── SYSTEM_DESIGN.md              ← Full system diagrams + scaling
│   ├── CODING_QUESTIONS.md           ← DSA + JS logical questions
│   ├── TOKOMORT_PROJECT_EXPLANATION.md ← Senior-level interview answers
│   └── CHEATSHEETS.md               ← Git, Linux, Docker, Prisma commands
│
└── docs/
    └── backend-razorpay-reference.md ← NestJS payment service reference code
```

---

## 4. Server-Side vs Client-Side — Every Page Analyzed

### Rendering Strategy Explained

```
SERVER COMPONENT (default in Next.js 15 App Router)
  ✓ Renders on server — HTML sent to browser
  ✓ No JavaScript hydration for component itself
  ✓ Can: fetch data directly, access env secrets, use DB
  ✗ Cannot: useState, useEffect, event handlers, browser APIs

CLIENT COMPONENT ("use client" at top of file)
  ✓ Renders in browser — full interactivity
  ✓ Can: useState, useEffect, useRef, event handlers, Socket.IO
  ✗ Cannot: direct DB access, access server-only env vars
  ✗ Adds JavaScript to the bundle

HYBRID (Server shell + Client component inside)
  ✓ Server renders the page shell + passes params as props
  ✓ Client component handles interactivity
  ✓ Pattern: page.tsx (server) wraps Component.tsx (client)
```

### Page-by-Page Analysis

| Page / Route | Type | Why | Fetching |
|---|---|---|---|
| `/` (Home) | **SSG** — Static | Same for all users, SEO critical | Build-time |
| `/products` | **Server + Client** | Shell server, filters client-side | React Query |
| `/products/[slug]` | **ISR** | SEO critical, revalidate 60s | Incremental |
| `/categories` | **SSG** | Same for all users | Build-time |
| `/categories/[slug]` | **Server + Client** | Shell server, products client | React Query |
| `/cart` | **Client** | Cart = Redux state, no SSR needed | Redux |
| `/checkout` | **Client** | Auth required, address + payment | React Query + Razorpay |
| `/orders` | **Client** | User-specific | React Query |
| `/orders/[id]/success` | **Server + Client** | Shell server, confetti client | React Query |
| `/orders/[id]/failed` | **Server + Client** | Shell server, retry client | React Query |
| `/orders/[id]/tracking` | **Server + Client** | Shell server, map + socket client | Socket.IO + React Query |
| `/wishlist` | **Client** | User-specific, Redux | Redux |
| `/offers` | **Server + Client** | Shell server, deals client | React Query |
| `/about`, `/blog`, `/faq` | **SSG** | Static content | Build-time |
| `/privacy`, `/terms` | **SSG** | Static content | Build-time |
| `/auth/login` | **Server + Client** | Shell server, form client | Mutation |
| `/auth/register` | **Server + Client** | Shell server, form + OTP client | Mutation |
| `/auth/forgot-password` | **Server + Client** | Shell server, form client | Mutation |
| `/vendor/onboarding` | **Client** | Multi-step form, file upload | Mutation |
| `/delivery/onboarding` | **Client** | Multi-step form, file upload | Mutation |
| `/unauthorized` | **Server** | Simple static error page | None |
| `/dashboard/admin` | **Client** | Real-time data, charts, socket | React Query + Socket |
| `/dashboard/admin/analytics` | **Client** | Live financial analytics | React Query + Socket |
| `/dashboard/admin/orders` | **Client** | Paginated, filters | React Query |
| `/dashboard/admin/vendors` | **Client** | KYC review, modals | React Query |
| `/dashboard/admin/delivery` | **Client** | Document viewer, actions | React Query |
| `/dashboard/admin/products` | **Client** | Approval queue | React Query |
| `/dashboard/admin/users` | **Client** | User list | React Query |
| `/dashboard/admin/refunds` | **Client** | Refund management | React Query |
| `/dashboard/vendor` | **Client** | Live stats, new order alerts | React Query + Socket |
| `/dashboard/vendor/orders` | **Client** | Status progression table | React Query + Socket |
| `/dashboard/vendor/products` | **Client** | Product CRUD | React Query |
| `/dashboard/vendor/earnings` | **Client** | Per-order breakdown table | React Query + Socket |
| `/dashboard/vendor/analytics` | **Client** | Revenue charts | React Query |
| `/dashboard/delivery` | **Client** | Approval gate, availability toggle | React Query + Socket |
| `/dashboard/delivery/orders` | **Client** | OTP modal, proof upload, GPS | React Query + Socket |
| `/dashboard/delivery/tracking` | **Client** | GPS broadcast, geolocation API | Socket.IO |
| `/dashboard/delivery/earnings` | **Client** | Per-delivery payout breakdown | React Query + Socket |
| `/dashboard/customer/orders` | **Client** | Order history | React Query |
| `/dashboard/customer/addresses` | **Client** | Address CRUD | React Query |
| `/dashboard/customer/profile` | **Client** | Profile form | React Query |

### Integration Pattern (Hybrid Pages)

```typescript
// SERVER component — page.tsx
// Receives URL params from Next.js, passes to client
export default function ProductPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetailClient slug={params.slug} />  {/* → client */}
    </Suspense>
  );
}

// CLIENT component — ProductDetailClient.tsx
"use client";
export default function ProductDetailClient({ slug }: { slug: string }) {
  const { data } = useQuery({ queryKey: ["product", slug], queryFn: () => productService.getBySlug(slug) });
  const dispatch = useAppDispatch();
  // Full interactivity: add to cart, variants, wishlist toggle
}
```

---

## 5. Role System & Access Control

### 4 Roles — Completely Separated Experiences

```
CUSTOMER
  ├─ Registration: email + OTP
  ├─ Store: Full access (/products, /checkout, /orders/*)
  ├─ Dashboard: /dashboard/customer/* (orders, addresses, profile)
  └─ After login → / (home)

VENDOR
  ├─ Registration: KYC 4-step → Admin approval required
  ├─ Store: Read-only (can browse, not buy)
  ├─ Dashboard: /dashboard/vendor/* (orders, products, earnings)
  └─ After register → /vendor/onboarding

DELIVERY_BOY
  ├─ Registration: KYC 4-step → Admin approval required
  ├─ Dashboard: /dashboard/delivery/* (deliveries, GPS, earnings)
  ├─ Approval gate: PENDING/REJECTED screen before accessing dashboard
  └─ After register → /delivery/onboarding

ADMIN
  ├─ No public registration — seeded in backend
  ├─ Dashboard: /dashboard/admin/* (full platform control)
  └─ After login → /dashboard/admin
```

### Three-Layer Protection

```
LAYER 1: Next.js Middleware (Edge Runtime)
  Location: middleware.ts
  Runs: At CDN edge before any page render
  How: Reads JWT cookie "tokomort_access_token" → decodes base64 payload
  Actions:
    - No token → redirect to /auth/login?redirect=<current_path>
    - CUSTOMER on /dashboard/admin|vendor|delivery → /unauthorized
    - VENDOR on /dashboard/admin|delivery → /unauthorized
    - Token invalid → redirect to login

LAYER 2: RoleGuard React Component (Client Runtime)
  Location: components/auth/RoleGuard.tsx
  Runs: After React hydration, reads Redux auth state
  How: useAppSelector → checks user.role against allowedRoles[]
  Actions:
    - Not authenticated → router.replace("/auth/login")
    - Wrong role → router.replace("/unauthorized")
    - Shows spinner while isLoading

LAYER 3: NestJS Guards (Backend Runtime)
  Location: Backend (separate repo)
  How: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles("ADMIN")
  Actions: 401/403 response for invalid token or wrong role
```

### Axios Auto-Refresh (Silent Token Renewal)

```typescript
// services/axios.ts
// When access token expires (401), interceptor:
// 1. Queues all in-flight requests
// 2. Calls /auth/refresh with refresh token (httpOnly cookie)
// 3. Gets new access token
// 4. Replays all queued requests with new token
// 5. If refresh fails → logout + redirect to login
```

---

## 6. End-to-End Flow — Customer Journey

```
1. LANDING
   → GET / (SSG, served from CDN cache)
   → Hero banner, featured products, categories load
   → Header: Search, Cart icon, Login button

2. BROWSE PRODUCTS
   → GET /products (React Query → GET /api/v1/products?page=1&limit=20)
   → Filter: category, price range, rating, in-stock
   → Sort: newest, popular, price asc/desc
   → ProductCard: image, name, price, MRP, discount %, rating, add to cart

3. PRODUCT DETAIL
   → GET /products/[slug] (ISR — revalidated every 60s)
   → ProductDetailClient: variant selector, quantity, add to cart
   → React Query: reviews, related products
   → Images: Swiper carousel

4. CART
   → CartDrawer slides in (Redux state — no API call needed)
   → Add/remove/update quantity
   → Subtotal, delivery fee, total calculated in Redux
   → Proceed to Checkout button

5. CHECKOUT (requires authentication)
   → Middleware: checks "tokomort_access_token" cookie
   → Step A: Load saved addresses → GET /api/v1/users/addresses
   → Step B: Add new address → POST /api/v1/users/addresses
             Body: { label, fullName, phone, addressLine1, city, state, pincode }
   → Step C: Select delivery slot (STANDARD/EXPRESS/SAME_DAY/NEXT_DAY)
   → Step D: Select payment method (RAZORPAY or COD)
   → Step E: Click "Place Order"

6. ORDER CREATION
   → POST /api/v1/orders
   → Body: {
       addressId: "...",
       paymentMethod: "RAZORPAY",
       items: [{ productId, variantId?, quantity }],
       deliveryType: "NEXT_DAY"
     }
   → Response: { data: { id, orderNumber, total, status: "PENDING" } }

7. PAYMENT — RAZORPAY
   → POST /api/v1/payments/create-order { orderId }
   → Backend creates Razorpay order → returns { razorpayOrderId, amount (paise) }
   → useRazorpay hook: loads checkout.js (once), opens modal
   → Customer pays → Razorpay returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   → POST /api/v1/payments/verify (HMAC verification on backend)
   → dispatch(clearCart()) → router.push(`/orders/${id}/success`)

8. ORDER SUCCESS
   → canvas-confetti fires 🎉
   → GET /api/v1/orders/:id (order details)
   → Shows: items, total paid, delivery address, payment status

9. ORDER TRACKING
   → GET /api/v1/orders/:id/tracking (polling every 15s)
   → socket.emit("join-order-room", { orderId })
   → Timeline: PENDING → CONFIRMED → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
   → When OUT_FOR_DELIVERY:
     - Leaflet map loads (CDN)
     - socket.on("location-update") → updates delivery marker on map
     - Customer OTP displayed (ask delivery boy to verify this)
   → When DELIVERED: timeline completes

10. PAYMENT FAILED
    → /orders/[id]/failed?code=PAYMENT_CANCELLED
    → "No money deducted" message
    → "Retry Payment" → POST /api/v1/orders/:id/retry-payment → new Razorpay modal
```

---

## 7. End-to-End Flow — Vendor Journey

```
1. REGISTRATION
   → /auth/register → select VENDOR role
   → POST /api/v1/auth/register → receives OTP

2. KYC ONBOARDING (4 steps)
   → /vendor/onboarding
   → Step 1: Business details (shopName, description, GST number)
   → Step 2: KYC text (Aadhaar, PAN, bank account, IFSC)
   → Step 3: Document uploads (shop logo, GST certificate, PAN card)
   → Step 4: Store settings → POST /api/v1/vendor/onboard (FormData)
   → Status: PENDING_APPROVAL

3. APPROVAL WAIT
   → Dashboard shows "Under Review" until admin approves
   → Admin reviews KYC → PATCH /api/v1/admin/vendors/:id/approve
   → Socket.IO: "vendor.approved" event → notification to vendor

4. PRODUCT CREATION
   → /dashboard/vendor/products/new
   → Form: name, slug, description, price, MRP, category, stock
   → Image upload: POST /api/v1/upload → S3 / local storage
   → POST /api/v1/vendor/products → status: PENDING (admin must approve)
   → Admin approves → product goes live

5. ORDER RECEIVES
   → Socket.IO: "order.created" event fires
   → Toast: "🛍️ New Order Received! #ORD-XXXX" + notification sound
   → React Query invalidates vendor-orders cache → table refreshes
   → /dashboard/vendor/orders shows new order

6. ORDER FULFILLMENT
   → Click "→ Processing" → PUT /api/v1/vendor/orders/:id/status { status: "PROCESSING" }
   → Click "→ Packed" → pack the items
   → Click "→ Shipped" → hand to delivery
   → Each status emits socket event → customer tracking page updates

7. EARNINGS
   → /dashboard/vendor/earnings
   → Per-order: gross amount, commission (10% deducted), net earnings
   → Wallet credited automatically on payment verification
   → Payouts processed weekly
```

---

## 8. End-to-End Flow — Delivery Boy Journey

```
1. REGISTRATION + KYC (4 steps)
   → Step 1: Personal info (name, phone, email, home address)
   → Step 2: KYC text (Aadhaar #, PAN #, DL #, permanent address)
   → Step 3: Documents (profile photo, Aadhaar front+back, PAN, Driving License)
   → Step 4: Vehicle type + vehicle number + current GPS location
   → POST /api/v1/delivery/onboard (FormData with files)

2. APPROVAL GATE
   → Dashboard shows "Application Under Review" if PENDING
   → Admin approves → full dashboard access unlocked
   → Socket.IO: "delivery.registered.approved" → notification

3. GO ONLINE
   → /dashboard/delivery
   → Toggle "Go Online" switch
   → POST /api/v1/delivery/toggle-availability
   → Now eligible to receive delivery assignments

4. RECEIVE ASSIGNMENT
   → Socket.IO: "delivery.assigned" → toast: "New delivery assigned!"
   → /dashboard/delivery/orders shows new order with ASSIGNED status

5. ACCEPT DELIVERY
   → Click "Accept & Pick Up" → PUT /api/v1/delivery/deliveries/:id/status { status: "PICKED_UP" }
   → OR Click "Reject" → POST /api/v1/delivery/deliveries/:id/reject

6. GPS TRACKING
   → /dashboard/delivery/tracking
   → Click "Start Tracking"
   → navigator.geolocation.watchPosition() → continuous GPS
   → setInterval(5000) → socket.emit("location-update", { lat, lng, orderId })
   → Customer sees delivery marker moving on Leaflet map in real-time
   → Also: deliveryService.updateLocation() → persists to DB every 5s

7. STATUS PROGRESSION
   → PICKED_UP → click "Mark In Transit" → IN_TRANSIT
   → IN_TRANSIT → click "Out for Delivery" → OUT_FOR_DELIVERY
   → Customer receives OTP in their tracking page

8. OTP VERIFICATION
   → Ask customer: "Please share your delivery OTP"
   → Click "Verify OTP & Deliver" → OTP modal opens
   → Enter 4-digit OTP → POST /api/v1/delivery/deliveries/:id/verify-otp { otp: "1234" }
   → Backend verifies → order marked DELIVERED

9. PROOF UPLOAD
   → "Upload Proof" button appears after delivery
   → Camera capture or gallery select
   → POST /api/v1/delivery/deliveries/:id/proof (multipart/form-data)
   → Stored as delivery.proofImageUrl

10. EARNINGS
    → 60% of delivery fee credited to delivery wallet
    → /dashboard/delivery/earnings shows per-delivery breakdown
    → Payout weekly to registered bank account
```

---

## 9. End-to-End Flow — Admin Journey

```
1. LOGIN
   → /auth/login → email + password (no OTP for admin)
   → JWT contains role: "ADMIN"
   → Middleware: allows /dashboard/admin
   → Redirect → /dashboard/admin

2. LIVE DASHBOARD
   → GET /api/v1/admin/dashboard (analytics summary)
   → Socket.IO events auto-refresh:
     - "order.created" → order counter +1
     - "payment.success" → revenue counter updates
     - "product.pending" → toast: new product to review
   → Area chart: revenue over time (Recharts)
   → Recent orders table

3. VENDOR MANAGEMENT
   → GET /api/v1/admin/vendors?status=PENDING
   → Review KYC documents: shop logo, GST certificate, PAN card
   → PATCH /api/v1/admin/vendors/:id/approve { approved: true }
   → OR: reject with reason → PATCH { approved: false, reason: "Invalid GST" }
   → Socket.IO emits "vendor.approved/rejected" → vendor notified

4. PRODUCT APPROVAL
   → GET /api/v1/admin/products?approvalStatus=PENDING
   → Review product: images, price, category, description
   → PATCH /api/v1/admin/products/:id/approve
   → Product goes live in store
   → Socket.IO: "product.approved" → vendor notified

5. DELIVERY BOY MANAGEMENT
   → GET /api/v1/admin/delivery-boys
   → Tabs: ALL / PENDING / APPROVED / REJECTED / SUSPENDED
   → View KYC documents in image viewer panel
   → Reject with reason modal
   → Suspend with reason: PATCH /api/v1/admin/delivery-boys/:id/suspend

6. ORDER MANAGEMENT
   → GET /api/v1/admin/orders?page=1&status=...
   → Search by order number
   → Manual status override: PATCH /api/v1/admin/orders/:id/status
   → Assign delivery boy to order

7. FINANCIAL ANALYTICS
   → GET /api/v1/admin/analytics/financial?range=month
   → Displays per-order:
     - Gross Revenue
     - Platform Commission (10% of product subtotal)
     - GST (18% on commission)
     - Vendor Earnings (subtotal - commission)
     - Delivery Payout (60% of delivery fee)
     - Razorpay Fee (2% of total for RAZORPAY orders)
     - Net Platform Profit
   → Charts: revenue trend, top vendors, payment method breakdown

8. REFUNDS
   → GET /api/v1/admin/refunds
   → Review refund requests
   → Initiate via Razorpay Refund API: POST /api/v1/payments/refund
```

---

## 10. Payment Architecture — Razorpay

```
SECURITY RULE: key_secret ONLY on backend. key_id only is safe in frontend.

FLOW:
┌──────────────────────────────────────────────────────────────────────┐
│ 1. Customer clicks "Place Order"                                      │
│    Frontend → POST /api/v1/orders → creates DB order (status:PENDING)│
│                                                                       │
│ 2. Frontend → POST /api/v1/payments/create-order { orderId }         │
│    Backend → Razorpay.orders.create({ amount: totalPaise, ... })     │
│    Returns: { razorpayOrderId: "order_xxx", amount: 100000 }         │
│                                                                       │
│ 3. useRazorpay.openCheckout({                                         │
│      key: NEXT_PUBLIC_RAZORPAY_KEY_ID,  ← public key only           │
│      order_id: razorpayOrderId,                                       │
│      amount, currency: "INR",                                         │
│      prefill: { name, email, contact },                               │
│      handler: onSuccess,                                              │
│      modal: { ondismiss: onDismiss }                                  │
│    })                                                                 │
│                                                                       │
│ 4. Customer completes payment in Razorpay modal                       │
│    Receives: { razorpay_order_id, razorpay_payment_id, signature }   │
│                                                                       │
│ 5. Frontend → POST /api/v1/payments/verify {                         │
│      orderId, razorpay_order_id, razorpay_payment_id, signature      │
│    }                                                                  │
│                                                                       │
│ 6. Backend:                                                           │
│    expected = HMAC-SHA256(order_id + "|" + payment_id, key_secret)   │
│    if expected !== signature → throw 400 "Invalid payment signature" │
│                                                                       │
│ 7. Prisma $transaction([                                              │
│      payment.create({ status: "SUCCESS", vendorEarnings, ... }),     │
│      order.update({ paymentStatus: "PAID", status: "CONFIRMED" }),   │
│      vendorWallet.upsert({ balance += vendorEarnings }),             │
│      deliveryWallet.upsert({ balance += deliveryEarnings }),        │
│    ])                                                                 │
│                                                                       │
│ 8. socket.to("admin").emit("payment.success", { amount, ... })       │
│    socket.to(`vendor:${vendorId}`).emit("order.created", { ... })    │
│                                                                       │
│ 9. Frontend: clearCart() → router.push(`/orders/${id}/success`)      │
└──────────────────────────────────────────────────────────────────────┘
```

### Webhook Handler (Backup Verification)
```
POST /webhooks/razorpay
  → Verify X-Razorpay-Signature header
  → Handle "payment.captured" → update order if not already settled
  → Handle "payment.failed" → update paymentStatus: "FAILED"
  → Emit socket events for any state changes
```

---

## 11. Realtime Architecture — Socket.IO

### Connection Setup
```typescript
// providers/SocketProvider.tsx
const socket = io(`${SOCKET_URL}/tracking`, {
  auth: { token: getToken() },  // JWT for auth on connection
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
});
socket.on("connect", () => socket.emit("join-user-room")); // personal room
```

### Room Architecture
```
Server Rooms (Socket.IO):
  user:{userId}           ← Personal notifications for any user
  order:{orderId}         ← GPS + status updates for one order
  vendor:{vendorId}       ← New order alerts for vendor
  admin                   ← All platform events
  delivery:{boyId}        ← Assignment notifications
```

### Complete Event Catalog
```
CLIENT → SERVER Events:
  join-order-room   { orderId }                  Customer starts tracking
  leave-order-room  { orderId }                  Customer leaves tracking
  join-user-room    {}                            Join personal room on connect
  location-update   { lat, lng, orderId }        Delivery boy GPS broadcast

SERVER → CLIENT Events:
  order.created           New order placed → vendor room, admin
  payment.success         Payment verified → admin, vendor room
  order-status-update     Status changed → order room (customer sees)
  location-update         GPS coords → order room (customer map updates)
  delivery.assigned       New delivery → delivery boy room
  order.delivered         Completed → customer, admin, vendor
  notification            Generic → user personal room
  product.pending         New product → admin
  refund.created          Refund request → admin
  vendor.approved         Vendor approval → vendor room
```

### Frontend Pattern (used across all dashboards)
```typescript
useEffect(() => {
  if (!socket) return;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["..."] });
  const events = ["order.created", "payment.success", "order-status-update"];
  events.forEach(ev => socket.on(ev, invalidate));
  return () => events.forEach(ev => socket.off(ev, invalidate));
}, [socket, queryClient]);
```

---

## 12. GPS Tracking System

```
DELIVERY BOY DEVICE                SOCKET.IO SERVER              CUSTOMER BROWSER
       │                                  │                              │
       │  watchPosition()                 │                              │
       │  ─────────────▶ GPS coords       │                              │
       │                                  │                              │
       │  setInterval(5000ms)             │                              │
       │  emit("location-update",         │                              │
       │   { lat, lng, orderId })──────── │ to `order:${orderId}` ──────▶│
       │                                  │  emit("location-update")     │
       │                                  │                              │ socket.on("location-update")
       │  Also: updateLocation() API ───▶ │  DB write (every 5s)        │ L.marker.setLatLng([lat,lng])
       │                                  │                              │ Map updates live!
       │                                  │                              │
```

### Map Display
- **Library**: Leaflet.js loaded via CDN (dynamic, no SSR issues)
- **Tiles**: CartoDB Light (`https://{s}.basemaps.cartocdn.com/light_all/...`)
- **Markers**: Custom HTML div icons — green pulsing truck (driver), orange home (customer)
- **Route**: Dashed polyline connecting driver → destination
- **Bounds**: Auto-fits to show both markers with padding
- **Fallback**: Shows only destination if driver not yet active

---

## 13. Financial Settlement Model

```
Per-Order Settlement (happens atomically in Prisma $transaction):

INPUTS:
  subtotal       = sum of (item.price × item.quantity)
  deliveryFee    = based on delivery type + distance
  paymentMethod  = RAZORPAY | COD

CALCULATIONS:
  platformCommission = subtotal × 10%       → Platform keeps
  gstOnCommission    = commission × 18%     → Tax collected
  vendorEarnings     = subtotal - commission → Vendor wallet credited
  deliveryPayout     = deliveryFee × 60%    → Delivery wallet credited
  razorpayFee        = (subtotal + deliveryFee) × 2%  → Only if RAZORPAY
  netPlatformProfit  = commission - deliveryPayout - razorpayFee

EXAMPLE (₹1,000 product, ₹50 delivery, Razorpay):
  Platform commission:  ₹100
  GST on commission:    ₹18
  Vendor gets:          ₹900  (credited to vendor wallet)
  Delivery boy gets:    ₹30   (credited to delivery wallet)
  Razorpay fee:         ₹21
  Net platform profit:  ₹100 - ₹30 - ₹21 = ₹49
```

### Where These Numbers Show Up
- **Admin Analytics** — `useFinancialAnalytics` hook → `computeOrderBreakdown()`
- **Vendor Earnings Page** — per-order table with commission deducted
- **Delivery Earnings Page** — per-delivery 60% calculation
- **Payment Record** — all figures stored in DB `Payment` model per transaction

---

## 14. State Management Architecture

```
REDUX TOOLKIT (Global / Persistent State)
  authSlice:
    - user: { id, name, email, role, ... }
    - accessToken, refreshToken
    - isAuthenticated, isLoading
    - Thunks: login(), register(), loadUser(), logoutUser()

  cartSlice:
    - items: CartItem[]  (product + variant + quantity)
    - total, subtotal, deliveryFee
    - Actions: addItem, removeItem, updateQty, clearCart
    - Persisted to localStorage via StorageProvider

  wishlistSlice:
    - items: Product[]
    - Persisted to localStorage

  uiSlice:
    - cartOpen: boolean  (CartDrawer slide)
    - searchOpen: boolean

REACT QUERY (Server State / Cache)
  - Dashboard queries: staleTime: 0, refetchInterval: 30000
  - Product queries: staleTime: 5 minutes
  - User queries: staleTime: 1 minute
  - Socket events trigger queryClient.invalidateQueries() → re-fetch
  - Mutations: onSuccess → invalidate related queries

WHEN TO USE WHICH:
  Redux:  auth tokens, cart (user-owned, persisted), UI toggles
  React Query:  anything fetched from API (orders, products, analytics)
  Local useState:  modal open/close, form step, loading states
```

---

## 15. API Service Layer

### Axios Instance (services/axios.ts)
```
Features:
  ✓ Base URL from NEXT_PUBLIC_API_URL
  ✓ Request interceptor: inject Authorization: Bearer <token>
  ✓ Response interceptor:
    - 401 → attempt silent token refresh
    - Queue all requests during refresh
    - Replay queued requests with new token
    - If refresh fails → clearTokens() + redirect to login
```

### Services Map
```
auth.service.ts      → /auth/*          (login, register, refresh, logout, verifyOTP)
user.service.ts      → /users/*         (profile, update)
product.service.ts   → /products/*      (list, detail, search, vendor CRUD)
category.service.ts  → /categories/*   (list, by slug)
order.service.ts     → /orders/* + /vendor/orders/* + /admin/orders/*
payment.service.ts   → /payments/*     (createOrder, verify, refund)
address.service.ts   → /users/addresses/* (CRUD + setDefault)
vendor.service.ts    → /vendor/* + /admin/vendors/*
delivery.service.ts  → /delivery/* + /admin/delivery-boys/*
admin.service.ts     → /admin/*        (analytics, financial, users)
cart.service.ts      → /cart/*         (sync cart with backend)
wishlist.service.ts  → /users/wishlist/*
review.service.ts    → /products/:id/reviews/*
notification.service.ts → /notifications/*
upload.service.ts    → /upload          (multipart file upload)
```

---

## 16. Data Flow — Frontend to Backend

```
USER ACTION
    │
    ▼
React Component
    │ dispatch(action) or mutation.mutate()
    ▼
Redux Thunk / React Query Mutation
    │ calls service function
    ▼
service.ts (e.g. orderService.create())
    │ axios.post('/orders', payload)
    ▼
Axios Interceptor
    │ adds Authorization: Bearer <token>
    ▼
Nginx Reverse Proxy
    │ proxies /api/* to NestJS on port 3000
    ▼
NestJS Controller
    │ @Post() @UseGuards(JwtAuthGuard, RolesGuard)
    ▼
NestJS Service
    │ business logic, Prisma queries
    ▼
PostgreSQL
    │ query result
    ▼
NestJS Service
    │ transforms + emits Socket.IO events
    ▼
NestJS Controller
    │ returns ApiResponse<T>
    ▼
Axios Response
    │ data.data → backend response body
    ▼
Adapter (lib/adapters.ts)
    │ normalizes field name differences
    ▼
React Query Cache / Redux State
    │ triggers re-render
    ▼
Component Updates UI
```

---

## 17. Security Architecture

### Authentication Flow
```
Login → JWT access token (15 min) + refresh token (7 days, httpOnly cookie)
     → Access token stored in memory (axios instance) + cookie
     → On 401: silent refresh → queue → replay
     → On refresh fail: logout + redirect
```

### Route Security
```
Public routes:   /, /products/*, /categories/*, /auth/*
Protected routes: Middleware checks cookie JWT
Role routes:      Middleware + RoleGuard + NestJS guard (3 layers)
```

### Payment Security
```
RAZORPAY_KEY_SECRET  → ONLY in NestJS .env (never frontend)
NEXT_PUBLIC_KEY_ID   → Safe to expose (read-only key)
HMAC verification    → Every payment checked before DB write
Idempotency          → Redis lock prevents double-processing
```

### Input Security
```
Frontend:  Zod schema validation before API call
Backend:   ValidationPipe({ whitelist: true }) strips unknown fields
Database:  Prisma parameterized queries (SQL injection impossible)
XSS:       React escapes JSX output by default
CORS:      Explicit origin allowlist
```

---

## 18. Database Relations

```
User ─────────────────────────────┐
  ├─ orders[]           (1:N)      │
  ├─ addresses[]        (1:N)      │
  ├─ vendorProfile      (1:1)      │
  └─ deliveryProfile    (1:1)      │
                                   │
Order ─────────────────────────────┘
  ├─ items[]            (1:N) ─── Product (N:1)
  │                               └── Variants[] (1:N)
  ├─ address            (N:1)
  ├─ payment            (1:1)
  ├─ delivery           (1:1) ─── DeliveryBoy (N:1)
  └─ customer           (N:1) ─── User

Product ──────────────────────────────
  ├─ category           (N:1)
  ├─ vendor             (N:1)
  ├─ variants[]         (1:N)
  └─ reviews[]          (1:N)

Payment ── Order (1:1)
VendorWallet ── Vendor (1:1)
DeliveryWallet ── DeliveryBoy (1:1)
Notification ── User (N:1)
```

---

## 19. Environment Configuration

### Frontend — `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_public_key_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=TOKOMORT
```

### Backend — `.env` (NestJS — never commit)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/tokomort
REDIS_URL=redis://localhost:6379
JWT_SECRET=minimum_32_character_secret
REFRESH_SECRET=minimum_32_character_refresh_secret
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_secret_NEVER_in_frontend
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:3001
PORT=3000
NODE_ENV=development
```

> **Critical Security**: `RAZORPAY_KEY_SECRET` must never appear in any `NEXT_PUBLIC_` variable or any frontend file.

---

## 20. Local Setup & Running

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Frontend (this repository)
```bash
# 1. Clone and install
git clone https://github.com/1Mallesh/nextjs-product-ecommerce.git
cd nextjs-product-ecommerce
npm install

# 2. Environment
cp .env.example .env.local
# Edit .env.local — set API_URL, SOCKET_URL, RAZORPAY_KEY_ID

# 3. Run
npm run dev        # → http://localhost:3001

# 4. Build
npm run build
npm run start
```

### Backend (NestJS)
```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env
# Edit: DATABASE_URL, REDIS_URL, JWT_SECRET, RAZORPAY credentials

# 3. Database
npx prisma migrate deploy
npx prisma generate
npx prisma db seed   # seed admin user + categories

# 4. Run
npm run start:dev    # → http://localhost:3000
```

### Docker (Full Stack)
```bash
docker-compose up -d
# → frontend: http://localhost:3001
# → api: http://localhost:3000
# → postgres: port 5432
# → redis: port 6379
```

### Quick Test Accounts (after seeding)
```
Admin:        admin@tokomort.com / Admin@123
Vendor:       Register at /auth/register → select VENDOR → complete KYC
Customer:     Register at /auth/register → select CUSTOMER
Delivery Boy: Register at /auth/register → select DELIVERY_BOY → complete KYC
```

---

## Project Statistics

| Metric | Count |
|---|---|
| Total pages / routes | 45+ |
| React components | 60+ |
| API service methods | 80+ |
| TypeScript interfaces | 40+ |
| Socket.IO events | 12 |
| Zod validation schemas | 8 |
| Redux slices | 4 |
| Custom hooks | 6 |
| Tech stack items | 43 |
| User roles | 4 |
| Rendering strategies used | 5 (SSG, ISR, SSR, CSR, Hybrid) |
| Financial metrics tracked | 8 per order |

---

*Built with ❤️ by [Mallesh N](https://github.com/1Mallesh) — Full Stack Developer*
*5+ Years · Next.js · NestJS · PostgreSQL · Socket.IO · Razorpay*
